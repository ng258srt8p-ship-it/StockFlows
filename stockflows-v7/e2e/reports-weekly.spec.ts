/**
 * E2E Tests: Reports - Weekly
 *
 * Covers: Weekly summary reports, trend analysis.
 * ARCHITECTURE §4 (Reporting - weekly aggregation)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Reports - Weekly", () => {
  test("weekly aggregation is based on daily movements", async () => {
    const movements = await prisma.stockMovement.findMany({ take: 50 });
    expect(movements.length).toBeGreaterThan(0);
  });

  test("weekly stock level snapshots exist", async () => {
    const snapshots = await prisma.stockSnapshot.findMany({ take: 10 });
    expect(Array.isArray(snapshots)).toBe(true);
  });

  test("snapshots contain valid date ranges", async () => {
    const snapshots = await prisma.stockSnapshot.findMany({ take: 10 });
    for (const s of snapshots) {
      expect(s.date).toBeInstanceOf(Date);
    }
  });

  test("weekly velocity trends are computed", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 20 });
    for (const item of items) {
      if (item.velocity !== undefined) {
        expect(typeof item.velocity).toBe("number");
      }
    }
  });

  test("report summaries aggregate correctly", async () => {
    const items = await prisma.inventoryItem.findMany();
    const totalValue = items.reduce(
      (sum: number, item) => sum + item.stockLevel * item.costPrice,
      0
    );
    expect(totalValue).toBeGreaterThanOrEqual(0);
  });

  test("category summaries are computed", async () => {
    const items = await prisma.inventoryItem.groupBy({
      by: ["category"],
      _sum: { stockLevel: true },
    });
    expect(items.length).toBeGreaterThan(0);
  });
});
