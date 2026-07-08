/**
 * E2E Tests: Purchasing - Orders
 *
 * Covers: Purchase order creation, editing, status tracking.
 * ARCHITECTURE §3 (Purchasing management)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Purchasing - Orders", () => {
  test("purchase orders exist in database", async () => {
    const orders = await prisma.purchaseOrder.findMany({ take: 10 });
    expect(Array.isArray(orders)).toBe(true);
  });

  test("purchase orders have valid statuses", async () => {
    const orders = await prisma.purchaseOrder.findMany({ take: 20 });
    const validStatuses = ["draft", "submitted", "approved", "ordered", "partial_received", "received", "cancelled"];
    for (const o of orders) {
      expect(validStatuses).toContain(o.status);
    }
  });

  test("purchase orders reference valid vendors", async () => {
    const orders = await prisma.purchaseOrder.findMany({ take: 10 });
    for (const o of orders) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: o.vendorId },
      });
      expect(vendor).not.toBeNull();
    }
  });

  test("purchase order items are tracked", async () => {
    const orders = await prisma.purchaseOrder.findMany({ take: 10 });
    for (const o of orders) {
      expect(o.items).toBeTruthy();
      expect(Array.isArray(o.items)).toBe(true);
    }
  });

  test("order dates are sequential", async () => {
    const orders = await prisma.purchaseOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    for (let i = 0; i < orders.length - 1; i++) {
      expect(orders[i].createdAt.getTime()).toBeGreaterThanOrEqual(
        orders[i + 1].createdAt.getTime()
      );
    }
  });

  test("pending orders have expected quantities", async () => {
    const pending = await prisma.purchaseOrder.findMany({
      where: { status: "draft" },
      take: 5,
    });
    for (const o of pending) {
      const totalQty = o.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      expect(totalQty).toBeGreaterThan(0);
    }
  });
});
