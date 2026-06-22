import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create shop
  const shop = await prisma.shop.upsert({
    where: { shopifyDomain: "demo-store.myshopify.com" },
    update: {},
    create: {
      shopifyDomain: "demo-store.myshopify.com",
      accessToken: "demo-token-for-local-testing",
    },
  });
  console.log(`✅ Shop: ${shop.name || shop.shopifyDomain}`);

  // Create user (owner)
  await prisma.user.upsert({
    where: { shopId_shopifyUserId: { shopId: shop.id, shopifyUserId: "demo-user-1" } },
    update: {},
    create: {
      shopId: shop.id,
      shopifyUserId: "demo-user-1",
      email: "admin@demo-store.com",
      role: "OWNER",
    },
  });

  // Create locations
  const warehouse = await prisma.location.create({
    data: { shopId: shop.id, shopifyLocationId: "gid://shopify/Location/1001", name: "Main Warehouse", type: "WAREHOUSE" },
  });
  const store = await prisma.location.create({
    data: { shopId: shop.id, shopifyLocationId: "gid://shopify/Location/1002", name: "Retail Store", type: "RETAIL_STORE" },
  });

  // Create vendors
  const vendor1 = await prisma.vendor.create({
    data: { shopId: shop.id, name: "Acme Supplies Co.", email: "orders@acme.com", leadTimeDays: 7, reliabilityScore: 0.95 },
  });
  const vendor2 = await prisma.vendor.create({
    data: { shopId: shop.id, name: "GlobalParts Ltd.", email: "sales@globalparts.com", leadTimeDays: 14, reliabilityScore: 0.85 },
  });

  // Create inventory items
  const items = [
    { sku: "WDG-001", title: "Widget Pro", qty: 150, reorderPt: 30, reorderQty: 100, cost: 5.99, vendor: vendor1, location: warehouse },
    { sku: "WDG-002", title: "Widget Basic", qty: 8, reorderPt: 20, reorderQty: 50, cost: 2.49, vendor: vendor1, location: warehouse },
    { sku: "GAD-001", title: "Gadget XL", qty: 0, reorderPt: 15, reorderQty: 75, cost: 12.99, vendor: vendor2, location: warehouse },
    { sku: "GAD-002", title: "Gadget Mini", qty: 45, reorderPt: 10, reorderQty: 30, cost: 7.50, vendor: vendor2, location: store },
    { sku: "ACC-001", title: "Accessory Pack A", qty: 200, reorderPt: 50, reorderQty: 100, cost: 1.25, vendor: vendor1, location: warehouse },
    { sku: "ACC-002", title: "Accessory Pack B", qty: 3, reorderPt: 25, reorderQty: 80, cost: 3.75, vendor: vendor1, location: store },
    { sku: "CBL-001", title: "USB-C Cable 2m", qty: 320, reorderPt: 100, reorderQty: 200, cost: 0.89, vendor: vendor2, location: warehouse },
    { sku: "CBL-002", title: "HDMI Cable 3m", qty: 0, reorderPt: 40, reorderQty: 100, cost: 1.45, vendor: vendor2, location: warehouse },
    { sku: "PKG-001", title: "Shipping Box Medium", qty: 500, reorderPt: 100, reorderQty: 200, cost: 0.35, vendor: vendor1, location: warehouse },
    { sku: "PKG-002", title: "Bubble Wrap Roll", qty: 25, reorderPt: 10, reorderQty: 20, cost: 4.99, vendor: vendor1, location: warehouse },
  ];

  for (const item of items) {
    const created = await prisma.inventoryItem.create({
      data: {
        shopId: shop.id,
        shopifyProductId: `gid://shopify/Product/${Math.floor(Math.random() * 10000)}`,
        shopifyVariantId: `gid://shopify/ProductVariant/${Math.floor(Math.random() * 10000)}`,
        locationId: item.location.id,
        sku: item.sku,
        barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        title: item.title,
        quantity: item.qty,
        available: item.qty,
        reorderPoint: item.reorderPt,
        reorderQuantity: item.reorderQty,
        costPerUnit: item.cost,
      },
    });

    // Generate some stock movement history
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dailySales = Math.floor(Math.random() * 8) + 1;

      if (dailySales > 0) {
        await prisma.stockMovement.create({
          data: {
            inventoryItemId: created.id,
            locationId: item.location.id,
            type: "SALE",
            quantityChange: -dailySales,
            reference: `order-${1000 + i}`,
            createdAt: date,
          },
        });
      }
    }
  }

  // Create a sample PO
  const po = await prisma.purchaseOrder.create({
    data: {
      shopId: shop.id,
      vendorId: vendor1.id,
      locationId: warehouse.id,
      poNumber: "PO-2026-001",
      status: "SENT",
      expectedDate: new Date(Date.now() + 7 * 86400000),
      notes: "Test PO for demo",
      createdBy: "demo-user-1",
    },
  });

  // Add line items to PO
  const wdgs = await prisma.inventoryItem.findFirst({ where: { shopId: shop.id, sku: "WDG-001" } });
  const accs = await prisma.inventoryItem.findFirst({ where: { shopId: shop.id, sku: "ACC-001" } });

  if (wdgs && accs) {
    await prisma.pOLineItem.createMany({
      data: [
        { poId: po.id, inventoryItemId: wdgs.id, quantity: 100, unitCost: 5.99 },
        { poId: po.id, inventoryItemId: accs.id, quantity: 200, unitCost: 1.25 },
      ],
    });
  }

  // Create settings
  await prisma.shopSetting.upsert({
    where: { shopId: shop.id },
    update: {},
    create: { shopId: shop.id, lowStockThreshold: 10, criticalStockThreshold: 3 },
  });

  // Create some alerts
  const lowItems = await prisma.inventoryItem.findMany({
    where: { shopId: shop.id, quantity: { lte: 20 } },
  });

  for (const item of lowItems) {
    await prisma.reorderAlert.create({
      data: {
        shopId: shop.id,
        inventoryItemId: item.id,
        locationId: item.locationId,
        currentStock: item.quantity,
        reorderPoint: item.reorderPoint,
        recommendedQty: item.reorderQuantity,
        urgency: item.quantity === 0 ? "CRITICAL" : item.quantity <= 5 ? "WARNING" : "INFO",
      },
    });
  }

  // Create session
  await prisma.session.create({
    data: {
      shopId: shop.id,
      shopifyDomain: shop.shopifyDomain,
      accessToken: "demo-token-for-local-testing",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Created ${items.length} inventory items with 31 days of sales history`);
  console.log(`✅ Created ${lowItems.length} reorder alerts`);
  console.log(`✅ Created 1 purchase order (PO-2026-001)`);
  console.log(`✅ Created 2 vendors`);
  console.log(`✅ Created 2 locations`);
  console.log(`\n🎉 Seed complete!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
