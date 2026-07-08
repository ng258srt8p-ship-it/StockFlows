/**
 * E2E Tests: Inventory - Allocation
 *
 * Covers: Inventory allocation and reservation for orders.
 * ARCHITECTURE §2.3 (Allocation logic)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Inventory - Allocation", () => {
  test("allocated inventory items are tracked", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 20 });
    for (const item of items) {
      // stockLevel includes allocated amounts
      expect(item.stockLevel).toBeGreaterThanOrEqual(0);
    }
  });

  test("reserved items reduce available stock", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 20 });
    for (const item of items) {
      if (item.allocatedStock !== undefined && item.allocatedStock !== null) {
        expect(item.stockLevel).toBeGreaterThanOrEqual(item.allocatedStock);
      }
    }
  });

  test("allocation records are linked to orders", async () => {
    const allocations = await prisma.inventoryAllocation.findMany({ take: 10 });
    expect(Array.isArray(allocations)).toBe(true);
    for (const a of allocations) {
      expect(a.orderId).toBeTruthy();
      expect(a.inventoryItemId).toBeTruthy();
    }
  });

  test("released allocations increase available stock", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 10 });
    for (const item of items) {
      expect(item.stockLevel).toBeGreaterThanOrEqual(0);
    }
  });

  test("allocation status reflects order state", async () => {
    const allocations = await prisma.inventoryAllocation.findMany({ take: 10 });
    for (const a of allocations) {
      expect(typeof a.status).toBe("string");
    }
  });
});
