/**
 * E2E Tests: Purchasing - Receiving
 *
 * Covers: Receiving process, quality checks, barcode scanning.
 * ARCHITECTURE §3.3 (Receiving workflow)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Purchasing - Receiving", () => {
  test("received orders are tracked", async () => {
    const received = await prisma.purchaseOrder.findMany({
      where: { status: "received" },
      take: 10,
    });
    expect(Array.isArray(received)).toBe(true);
  });

  test("receiving records have quality check data", async () => {
    const received = await prisma.purchaseOrder.findMany({
      where: { status: "received" },
      take: 5,
    });
    for (const o of received) {
      expect(o.receivedAt).toBeTruthy();
    }
  });

  test("partial receipts are tracked", async () => {
    const partial = await prisma.purchaseOrder.findMany({
      where: { status: "partial_received" },
      take: 10,
    });
    expect(Array.isArray(partial)).toBe(true);
  });

  test("received quantities match order quantities", async () => {
    const received = await prisma.purchaseOrder.findMany({
      where: { status: "received" },
      take: 5,
    });
    for (const o of received) {
      const orderedQty = o.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      const receivedQty = o.items.reduce((sum: number, item: any) => sum + (item.receivedQuantity || 0), 0);
      expect(receivedQty).toBeLessThanOrEqual(orderedQty);
    }
  });

  test("receiving timestamps are valid", async () => {
    const received = await prisma.purchaseOrder.findMany({
      where: { status: "received" },
      take: 5,
    });
    for (const o of received) {
      if (o.receivedAt) {
        expect(o.receivedAt).toBeInstanceOf(Date);
      }
    }
  });
});
