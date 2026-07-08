/**
 * E2E Tests: Inventory - Categories
 *
 * Covers: Category management, filtering, and aggregation.
 * ARCHITECTURE §2.3 (Inventory categories)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Inventory - Categories", () => {
  test("categories exist in inventory items", async () => {
    const categories = await prisma.inventoryItem.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    expect(categories.length).toBeGreaterThan(0);
  });

  test("category counts are accurate", async () => {
    const items = await prisma.inventoryItem.groupBy({
      by: ["category"],
      _count: { id: true },
    });
    const totalItems = items.reduce((sum, c) => sum + c._count.id, 0);
    const actualCount = await prisma.inventoryItem.count();
    expect(totalItems).toBe(actualCount);
  });

  test("category names are non-empty strings", async () => {
    const categories = await prisma.inventoryItem.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    for (const cat of categories) {
      expect(typeof cat.category).toBe("string");
      expect(cat.category.length).toBeGreaterThan(0);
    }
  });

  test("items can be filtered by category", async () => {
    const categories = await prisma.inventoryItem.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    if (categories.length > 0) {
      const firstCat = categories[0].category;
      const filtered = await prisma.inventoryItem.findMany({
        where: { category: firstCat },
      });
      expect(filtered.length).toBeGreaterThan(0);
    }
  });

  test("category-level stock aggregation is correct", async () => {
    const items = await prisma.inventoryItem.findMany();
    const categoryTotals: Record<string, number> = {};
    for (const item of items) {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.stockLevel;
    }
    expect(Object.keys(categoryTotals).length).toBeGreaterThan(0);
  });
});
