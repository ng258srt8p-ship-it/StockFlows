import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const forecastData = [
  // A-class (High Priority)
  { title: "Premium Snowboard Boots", sku: "PSB-001", model: "ETS", confidence: 0.94, predicted: 420, current: 120, trend: "up" },
  { title: "Performance Ski Goggles", sku: "PSG-002", model: "Ensemble", confidence: 0.91, predicted: 350, current: 95, trend: "up" },
  { title: "Heated Ski Gloves", sku: "HSG-003", model: "Linear", confidence: 0.87, predicted: 380, current: 65, trend: "up" },
  { title: "All-Mountain Ski Boots", sku: "AMS-004", model: "ETS", confidence: 0.89, predicted: 290, current: 205, trend: "stable" },
  // B-class (Medium Priority)
  { title: "Carbon Fiber Ski Poles", sku: "CFP-005", model: "Linear", confidence: 0.82, predicted: 240, current: 85, trend: "up" },
  { title: "Insulated Ski Jacket", sku: "ISJ-006", model: "Ensemble", confidence: 0.76, predicted: 110, current: 145, trend: "down" },
  { title: "Helmet Visor Anti-Fog", sku: "HVA-007", model: "ETS", confidence: 0.80, predicted: 160, current: 130, trend: "stable" },
  // C-class (Low Priority)
  { title: "Merino Wool Socks (3-pack)", sku: "MWS-008", model: "Linear", confidence: 0.74, predicted: 180, current: 220, trend: "up" },
  { title: "Snowboard Wax Kit", sku: "SWK-009", model: "Ensemble", confidence: 0.68, predicted: 75, current: 90, trend: "down" },
  { title: "Ski Helmet Strap Lock", sku: "SHS-010", model: "ETS", confidence: 0.65, predicted: 90, current: 180, trend: "stable" },
];

async function seedForecasts() {
  console.log("Seeding forecast data...");
  
  // Get or create a default shop
  const shop = await prisma.shop.findFirst();
  if (!shop) {
    console.error("No shop found. Please run the main seed first.");
    return;
  }

  // Get default location
  const location = await prisma.location.findFirst({ where: { shopId: shop.id } });
  if (!location) {
    console.error("No location found. Please run the main seed first.");
    return;
  }

  // Create inventory items and forecasts
  for (const item of forecastData) {
    // Create inventory item if it doesn't exist
    const inventoryItem = await prisma.inventoryItem.upsert({
      where: { 
        shopifyVariantId_locationId: { 
          shopifyVariantId: `variant-${item.sku}`, 
          locationId: location.id 
        } 
      },
      update: {},
      create: {
        shopId: shop.id,
        locationId: location.id,
        shopifyProductId: `gid://shopify/Product/${item.sku}`,
        shopifyVariantId: `variant-${item.sku}`,
        title: item.title,
        sku: item.sku,
        quantity: item.current,
        costPerUnit: Math.random() * 50 + 10,
        reorderPoint: Math.floor(item.current * 0.3),
      },
    });

    // Create forecast result
    await prisma.forecastResult.create({
      data: {
        inventoryItemId: inventoryItem.id,
        locationId: location.id,
        forecastDate: new Date(),
        modelUsed: item.model,
        modelVersion: "1.0",
        confidence: item.confidence,
        totalPredicted: item.predicted,
        predictedDaily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split("T")[0],
          yhat: Math.round(item.predicted / 30 * (0.8 + Math.random() * 0.4)),
          lower: Math.round(item.predicted / 30 * 0.6),
          upper: Math.round(item.predicted / 30 * 1.4),
        })),
      },
    });
  }

  console.log(`Seeded ${forecastData.length} forecasts`);
}

seedForecasts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
