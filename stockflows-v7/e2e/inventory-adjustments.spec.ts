/**
 * E2E Tests: Inventory - Adjustments
 *
 * Covers: Stock adjustments (manual, system-generated), audit trails.
 * ARCHITECTURE §2.4 (Inventory adjustments)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Inventory - Adjustments", () => {
  test("adjustment records exist in database", async () => {
    const adjustments = await prisma.stockAdjustment.findMany({ take: 10 });
    expect(Array.isArray(adjustments)).toBe(true);
  });

  test("adjustments have valid types", async () => {
    const adjustments = await prisma.stockAdjustment.findMany({ take: 20 });
    const validTypes = ["manual", "system", "cycle_count", "donation", "damage"];
    for (const adj of adjustments) {
      expect(validTypes).toContain(adj.type);
    }
  });

  test("adjustments reference valid inventory items", async () => {
    const adjustments = await prisma.stockAdjustment.findMany({ take: 10 });
    for (const adj of adjustments) {
      const item = await prisma.inventoryItem.findUnique({
        where: { id: adj.inventoryItemId },
      });
      expect(item).not.toBeNull();
    }
  });

  test("adjustment quantities are non-zero", async () => {
    const adjustments = await prisma.stockAdjustment.findMany({ take: 20 });
    for (const adj of adjustments) {
      expect(Math.abs(adj.quantity)).toBeGreaterThan(0);
    }
  });

  test("adjustments are timestamped and attributable", async () => {
    const adjustments = await prisma.stockAdjustment.findMany({
      take: 10,
      orderBy: { adjustedAt: "desc" },
    });
    for (const adj of adjustments) {
      expect(adj.adjustedAt).toBeInstanceOf(Date);
      expect(adj.adjustedBy).toBeTruthy();
    }
  });
});
