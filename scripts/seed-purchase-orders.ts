// @ts-nocheck — dev seed script, relies on dynamic Prisma types
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding purchase orders...");

  // Find the demo shop
  const shop = await prisma.shop.findUnique({
    where: { shopifyDomain: "demo-store.myshopify.com" },
  });

  if (!shop) {
    console.error("❌ Demo shop not found. Run scripts/seed.ts first.");
    process.exit(1);
  }

  // Find existing vendors and locations
  const vendors = await prisma.vendor.findMany({ where: { shopId: shop.id } });
  const locations = await prisma.location.findMany({ where: { shopId: shop.id } });
  const inventoryItems = await prisma.inventoryItem.findMany({ where: { shopId: shop.id } });

  if (vendors.length === 0 || locations.length === 0 || inventoryItems.length === 0) {
    console.error("❌ No vendors, locations, or inventory items found. Run scripts/seed.ts first.");
    process.exit(1);
  }

  const vendor1 = vendors[0];
  const vendor2 = vendors[1] || vendors[0];
  const warehouse = locations.find((l) => l.type === "WAREHOUSE") || locations[0];
  const store = locations.find((l) => l.type === "RETAIL_STORE") || locations[1] || locations[0];

  // Delete existing POs to avoid duplicates
  await prisma.pOLineItem.deleteMany({ where: { purchaseOrder: { shopId: shop.id } } });
  await prisma.purchaseOrder.deleteMany({ where: { shopId: shop.id } });
  console.log("🗑️  Cleared existing purchase orders");

  // Helper to get random inventory items
  const getRandomItems = (count: number) => {
    const shuffled = [...inventoryItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // PO 1: RECEIVED status (completed order)
  const items1 = getRandomItems(4);
  const po1 = await prisma.purchaseOrder.create({
    data: {
      shopId: shop.id,
      vendorId: vendor1.id,
      locationId: warehouse.id,
      poNumber: "PO-2026-010",
      status: "RECEIVED",
      expectedDate: new Date(Date.now() - 14 * 86400000), // 2 weeks ago
      receivedDate: new Date(Date.now() - 12 * 86400000), // 12 days ago
      shippingCost: 45.00,
      customsDuties: 0,
      otherCosts: 5.00,
      notes: "Q2 restock - all items received in good condition",
      createdBy: "demo-user-1",
    },
  });

  await prisma.pOLineItem.createMany({
    data: items1.map((item, i) => ({
      poId: po1.id,
      inventoryItemId: item.id,
      quantity: (i + 1) * 50,
      receivedQty: (i + 1) * 50, // fully received
      unitCost: item.costPerUnit || 5.00,
      landedCost: item.costPerUnit ? item.costPerUnit * 1.05 : 5.25,
    })),
  });
  console.log(`✅ PO-2026-010 (RECEIVED) — ${items1.length} line items`);

  // PO 2: SENT status (outstanding order)
  const items2 = getRandomItems(3);
  const po2 = await prisma.purchaseOrder.create({
    data: {
      shopId: shop.id,
      vendorId: vendor2.id,
      locationId: warehouse.id,
      poNumber: "PO-2026-011",
      status: "SENT",
      expectedDate: new Date(Date.now() + 7 * 86400000), // 1 week from now
      shippingCost: 32.50,
      customsDuties: 12.00,
      otherCosts: 0,
      notes: "Urgent reorder for low-stock items",
      createdBy: "demo-user-1",
    },
  });

  await prisma.pOLineItem.createMany({
    data: items2.map((item) => ({
      poId: po2.id,
      inventoryItemId: item.id,
      quantity: item.reorderQuantity || 100,
      receivedQty: 0,
      unitCost: item.costPerUnit || 5.00,
    })),
  });
  console.log(`✅ PO-2026-011 (SENT) — ${items2.length} line items`);

  // PO 3: DRAFT status (being prepared)
  const items3 = getRandomItems(5);
  const po3 = await prisma.purchaseOrder.create({
    data: {
      shopId: shop.id,
      vendorId: vendor1.id,
      locationId: store.id,
      poNumber: "PO-2026-012",
      status: "DRAFT",
      expectedDate: new Date(Date.now() + 21 * 86400000), // 3 weeks from now
      shippingCost: 0,
      customsDuties: 0,
      otherCosts: 0,
      notes: "Monthly restock - pending manager approval",
      createdBy: "demo-user-1",
    },
  });

  await prisma.pOLineItem.createMany({
    data: items3.map((item) => ({
      poId: po3.id,
      inventoryItemId: item.id,
      quantity: item.reorderQuantity || 75,
      receivedQty: 0,
      unitCost: item.costPerUnit || 5.00,
    })),
  });
  console.log(`✅ PO-2026-012 (DRAFT) — ${items3.length} line items`);

  console.log(`\n🎉 Seeded 3 purchase orders with ${items1.length + items2.length + items3.length} total line items`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
