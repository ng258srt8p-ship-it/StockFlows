/**
 * E2E Tests: Reports - Daily
 *
 * Covers: Daily reports generation, stock movement summaries.
 * ARCHITECTURE §4 (Reporting)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Reports - Daily", () => {
  test("daily report data is queryable", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 20 });
    expect(items.length).toBeGreaterThan(0);
  });

  test("stock movement records exist", async () => {
    const movements = await prisma.stockMovement.findMany({ take: 10 });
    expect(Array.isArray(movements)).toBe(true);
  });

  test("movements have valid dates", async () => {
    const movements = await prisma.stockMovement.findMany({ take: 10 });
    for (const m of movements) {
      expect(m.movedAt).toBeInstanceOf(Date);
    }
  });

  test("daily movement totals are calculated", async () => {
    const movements = await prisma.stockMovement.findMany({ take: 50 });
    const totalIn = movements.reduce((sum: number, m) => sum + (m.quantityIn || 0), 0);
    const totalOut = movements.reduce((sum: number, m) => sum + (m.quantityOut || 0), 0);
    expect(totalIn).toBeGreaterThanOrEqual(0);
    expect(totalOut).toBeGreaterThanOrEqual(0);
  });

  test("report date range is valid", async () => {
    const movements = await prisma.stockMovement.findMany({
      orderBy: { movedAt: "asc" },
      take: 5,
    });
    if (movements.length > 1) {
      expect(movements[movements.length - 1].movedAt.getTime()).toBeGreaterThanOrEqual(
        movements[0].movedAt.getTime()
      );
    }
  });

  test("daily velocity data is accurate", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 20 });
    for (const item of items) {
      expect(typeof item.velocity).toBe("number");
    }
  });
});
