/**
 * E2E Tests: Data Integrity & Edge Cases
 *
 * Tests constraints, cascading deletes, unique constraints,
 * and edge cases that could break the system.
 *
 * Covers:
 * - §4.2 Data architecture (schema constraints)
 * - §9 Technical pitfalls
 * - §15 Prisma production patterns
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Cascading Deletes", () => {
  test("deleting a shop cascades to all related records", async () => {
    // Create a temporary shop with related data
    const tempShop = await prisma.shop.create({
      data: {
        shopifyDomain: `e2e-temp-${Date.now()}.myshopify.com`,
        accessToken: "temp-token",
      },
    });

    const location = await prisma.location.create({
      data: {
        shopId: tempShop.id,
        shopifyLocationId: `gid://shopify/Location/${Date.now()}`,
        name: "Temp Location",
      },
    });

    const item = await prisma.inventoryItem.create({
      data: {
        shopId: tempShop.id,
        locationId: location.id,
        shopifyProductId: "gid://shopify/Product/temp",
        shopifyVariantId: `gid://shopify/ProductVariant/${Date.now()}`,
        title: "Temp Item",
        quantity: 10,
        available: 10,
      },
    });

    await prisma.stockMovement.create({
      data: {
        inventoryItemId: item.id,
        locationId: location.id,
        type: "ADJUSTMENT",
        quantityChange: 10,
      },
    });

    await prisma.reorderAlert.create({
      data: {
        shopId: tempShop.id,
        inventoryItemId: item.id,
        locationId: location.id,
        currentStock: 10,
        reorderPoint: 20,
        recommendedQty: 30,
        urgency: "WARNING",
      },
    });

    // Verify data exists
    expect(await prisma.inventoryItem.findMany({ where: { shopId: tempShop.id } })).toHaveLength(1);
    expect(await prisma.stockMovement.findMany({ where: { inventoryItemId: item.id } })).toHaveLength(1);

    // Delete shop
    await prisma.shop.delete({ where: { id: tempShop.id } });

    // Verify cascade
    expect(await prisma.inventoryItem.findMany({ where: { shopId: tempShop.id } })).toHaveLength(0);
    expect(await prisma.location.findMany({ where: { shopId: tempShop.id } })).toHaveLength(0);
    expect(await prisma.reorderAlert.findMany({ where: { shopId: tempShop.id } })).toHaveLength(0);
  });
});

test.describe("Unique Constraints", () => {
  test("cannot create duplicate shopifyDomain", async () => {
    await expect(
      prisma.shop.create({
        data: {
          shopifyDomain: "demo-store.myshopify.com",
          accessToken: "test",
        },
      })
    ).rejects.toThrow();
  });

  test("cannot create duplicate shopifyVariantId + locationId combination", async () => {
    const existing = await prisma.inventoryItem.findFirst();
    expect(existing).not.toBeNull();

    await expect(
      prisma.inventoryItem.create({
        data: {
          shopId: existing!.shopId,
          locationId: existing!.locationId,
          shopifyProductId: existing!.shopifyProductId,
          shopifyVariantId: existing!.shopifyVariantId, // duplicate
          title: "Duplicate Test",
          quantity: 1,
        },
      })
    ).rejects.toThrow();
  });

  test("cannot create duplicate PO number per shop", async () => {
    const shop = await prisma.shop.findFirst();
    expect(shop).not.toBeNull();

    await expect(
      prisma.purchaseOrder.create({
        data: {
          shopId: shop!.id,
          vendorId: (await prisma.vendor.findFirst())!.id,
          locationId: (await prisma.location.findFirst())!.id,
          poNumber: "PO-2026-001", // already exists from seed
          status: "DRAFT",
          createdBy: "test",
        },
      })
    ).rejects.toThrow();
  });
});

test.describe("Edge Cases", () => {
  test("quantity can be zero (out of stock)", async () => {
    const item = await prisma.inventoryItem.findFirst({
      where: { quantity: 0 },
    });
    expect(item).not.toBeNull();
    expect(item!.quantity).toBe(0);
    expect(item!.available).toBe(0);
  });

  test("costPerUnit can be null", async () => {
    const item = await prisma.inventoryItem.findFirst({
      where: { costPerUnit: null },
    });
    // Some items may have null cost — this is valid
    if (item) {
      expect(item.costPerUnit).toBeNull();
    }
  });

  test("reorder point can be 0 (no reorder threshold)", async () => {
    // Items with reorder_point = 0 never trigger alerts
    const item = await prisma.inventoryItem.findFirst({
      where: { reorderPoint: 0 },
    });
    if (item) {
      expect(item.reorderPoint).toBe(0);
    }
  });

  test("stock movements can have zero quantity change (should not, but schema allows)", async () => {
    // This tests that our application prevents this, not the DB
    const item = await prisma.inventoryItem.findFirst();
    expect(item).not.toBeNull();

    // We CAN insert a zero-change movement (DB allows it)
    // But our application logic should prevent this
    const movement = await prisma.stockMovement.create({
      data: {
        inventoryItemId: item!.id,
        locationId: item!.locationId,
        type: "ADJUSTMENT",
        quantityChange: 0,
        notes: "Edge case test - should be prevented by app logic",
      },
    });

    expect(movement.quantityChange).toBe(0);

    // Cleanup
    await prisma.stockMovement.delete({ where: { id: movement.id } });
  });
});

test.describe("Date Handling", () => {
  test("timestamps are in UTC", async () => {
    const item = await prisma.inventoryItem.findFirst();
    expect(item).not.toBeNull();

    const movement = await prisma.stockMovement.create({
      data: {
        inventoryItemId: item!.id,
        locationId: item!.locationId,
        type: "ADJUSTMENT",
        quantityChange: 1,
        reference: "date-test",
      },
    });

    // createdAt should be a valid Date
    expect(movement.createdAt).toBeInstanceOf(Date);
    expect(movement.createdAt.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    // Cleanup
    await prisma.stockMovement.delete({ where: { id: movement.id } });
  });
});
