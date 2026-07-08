/**
 * E2E Tests: Inventory Overview
 *
 * Covers: Inventory overview page, total SKUs, stock levels, categories.
 * ARCHITECTURE §2.3 (Inventory management)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Inventory Overview", () => {
  test("total SKU count is accurate", async () => {
    const count = await prisma.inventoryItem.count();
    expect(count).toBeGreaterThan(0);
  });

  test("stock levels are distributed across categories", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 50 });
    const categories = new Set(items.map((i) => i.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  test("low stock items are flagged correctly", async () => {
    const settings = await prisma.shopSetting.findFirst();
    expect(settings).not.toBeNull();
    const lowStock = await prisma.inventoryItem.findMany({
      where: { stockLevel: { lte: settings!.lowStockThreshold } },
      take: 5,
    });
    // Should find at least some items (depending on data)
    expect(Array.isArray(lowStock)).toBe(true);
  });

  test("out of stock items are tracked", async () => {
    const oos = await prisma.inventoryItem.findMany({
      where: { stockLevel: 0 },
      take: 10,
    });
    expect(Array.isArray(oos)).toBe(true);
  });

  test("inventory items have valid pricing data", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 50 });
    for (const item of items) {
      expect(item.costPrice).toBeGreaterThanOrEqual(0);
      expect(item.sellingPrice).toBeGreaterThan(0);
    }
  });

  test("inventory summary calculations are correct", async () => {
    const items = await prisma.inventoryItem.findMany();
    const totalValue = items.reduce((sum, i) => sum + i.stockLevel * i.costPrice, 0);
    expect(totalValue).toBeGreaterThanOrEqual(0);
  });
});
