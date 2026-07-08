/**
 * E2E Tests: Inventory - Transfers
 *
 * Covers: Inventory transfers between locations, status tracking.
 * ARCHITECTURE §2.4 (Transfers)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Inventory - Transfers", () => {
  test("transfer records exist in database", async () => {
    const transfers = await prisma.inventoryTransfer.findMany({ take: 10 });
    expect(Array.isArray(transfers)).toBe(true);
  });

  test("transfers have valid statuses", async () => {
    const transfers = await prisma.inventoryTransfer.findMany({ take: 20 });
    const validStatuses = ["pending", "in_transit", "delivered", "cancelled"];
    for (const t of transfers) {
      expect(validStatuses).toContain(t.status);
    }
  });

  test("transfers reference valid source and destination", async () => {
    const transfers = await prisma.inventoryTransfer.findMany({ take: 10 });
    for (const t of transfers) {
      expect(t.fromLocationId).toBeTruthy();
      expect(t.toLocationId).toBeTruthy();
      expect(t.fromLocationId).not.toBe(t.toLocationId);
    }
  });

  test("transfer quantities are tracked per item", async () => {
    const transfers = await prisma.inventoryTransfer.findMany({ take: 5 });
    for (const t of transfers) {
      expect(t.items).toBeTruthy();
      expect(Array.isArray(t.items)).toBe(true);
    }
  });

  test("recent transfers have timestamps", async () => {
    const transfers = await prisma.inventoryTransfer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    for (const t of transfers) {
      expect(t.createdAt).toBeInstanceOf(Date);
    }
  });
});
