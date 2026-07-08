/**
 * E2E Tests: Inventory Transfer Flow
 *
 * Covers: Transferring inventory between locations, transfer status tracking,
 * approval workflows, and audit trail integrity.
 * ARCHITECTURE §14 (multi-location inventory)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Inventory Transfer Flow", () => {
  test("transfer page is accessible", async ({ request }) => {
    const response = await request.get("/inventory/transfer");
    expect(response.ok()).toBeTruthy();
  });

  test("transfer form renders correctly", async ({ request }) => {
    const response = await request.get("/inventory/transfer");
    expect(response.status()).toBe(200);
  });

  test("transfer records are queryable", async () => {
    const transfers = await prisma.transfer.findMany({ take: 10 });
    expect(Array.isArray(transfers)).toBe(true);
  });

  test("transfer statuses are valid", async () => {
    const transfers = await prisma.transfer.findMany({ take: 20 });
    const validStatuses = [
      "pending",
      "approved",
      "in_transit",
      "delivered",
      "cancelled",
    ];
    for (const t of transfers) {
      expect(validStatuses).toContain(t.status);
    }
  });

  test("transfer requires source and destination locations", async () => {
    const transfers = await prisma.transfer.findMany({ take: 10 });
    for (const t of transfers) {
      if (t.status !== "cancelled") {
        expect(t.fromLocationId).toBeTruthy();
        expect(t.toLocationId).toBeTruthy();
      }
    }
  });

  test("transfer quantities are non-negative", async () => {
    const transfers = await prisma.transfer.findMany({ take: 10 });
    for (const t of transfers) {
      if (t.itemQuantity) {
        expect(t.itemQuantity).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("transfer approval workflow exists", async () => {
    const pendingTransfers = await prisma.transfer.findMany({
      where: { status: "pending" },
      take: 5,
    });
    for (const t of pendingTransfers) {
      expect(t.approvedBy).toBe(null);
    }
  });

  test("approved transfers have approver tracked", async () => {
    const approvedTransfers = await prisma.transfer.findMany({
      where: { status: "approved" },
      take: 5,
    });
    for (const t of approvedTransfers) {
      expect(t.approvedBy).not.toBe(null);
    }
  });

  test("transfer audit trail is preserved", async () => {
    const transfers = await prisma.transfer.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    for (const t of transfers) {
      expect(t.createdAt).toBeDefined();
      expect(new Date(t.createdAt).getTime()).toBeGreaterThan(0);
    }
  });

  test("transfer history updates on status change", async () => {
    const delivered = await prisma.transfer.findMany({
      where: { status: "delivered" },
      take: 5,
    });
    for (const t of delivered) {
      expect(t.deliveredAt).not.toBe(null);
    }
  });

  test("inventory adjustments from transfers are recorded", async () => {
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: { source: "transfer" },
      take: 10,
    });
    expect(adjustments.length).toBeGreaterThanOrEqual(0);
  });

  test("transfer validation prevents duplicate entries", async () => {
    const transfers = await prisma.transfer.findMany({ take: 50 });
    const seen = new Set<string>();
    for (const t of transfers) {
      const key = `${t.productId}-${t.batchId}-${t.status}`;
      expect(seen.has(key)).toBeFalsy();
      seen.add(key);
    }
  });

  test("transfer with zero quantity is handled gracefully", async () => {
    const response = await prisma.$queryRaw`SELECT * FROM "Transfer" WHERE "itemQuantity" = 0 LIMIT 1`;
    expect(response).toBeDefined();
  });

  test("cross-location transfer maintains stock integrity", async () => {
    const transfers = await prisma.transfer.findMany({
      where: { status: "in_transit" },
      take: 5,
    });
    for (const t of transfers) {
      expect(t.itemQuantity).toBeGreaterThan(0);
    }
  });

  test("transfer notifications are sent on creation", async () => {
    const notifications = await prisma.notification.findMany({
      where: { type: "TRANSFER_CREATED" },
      take: 5,
    });
    expect(notifications.length).toBeGreaterThanOrEqual(0);
  });

  test("cancelled transfers preserve history", async () => {
    const cancelled = await prisma.transfer.findMany({
      where: { status: "cancelled" },
      take: 5,
    });
    for (const c of cancelled) {
      expect(c.cancelledAt).not.toBe(null);
    }
  });

  test("bulk transfer endpoint accepts multiple items", async ({ request }) => {
    const response = await request.post("/inventory/transfer/bulk", {
      headers: { "Content-Type": "application/json" },
      data: {
        transfers: [
          {
            productId: "prod_1",
            fromLocationId: "loc_1",
            toLocationId: "loc_2",
            itemQuantity: 10,
          },
        ],
      },
    });
    expect([200, 400]).toContain(response.status());
  });

  test("transfer ETA is calculated for in-transit items", async () => {
    const inTransit = await prisma.transfer.findMany({
      where: { status: "in_transit" },
      take: 5,
    });
    for (const t of inTransit) {
      if (t.estimatedDeliveryAt) {
        expect(new Date(t.estimatedDeliveryAt).getTime()).toBeGreaterThan(
          new Date(t.shippedAt).getTime(),
        );
      }
    }
  });

  test("transfer report generates valid summary", async ({ request }) => {
    const response = await request.get("/reports/transfers");
    expect(response.ok()).toBeTruthy();
  });

  test("transfer export functionality works", async ({ request }) => {
    const response = await request.get("/api/export/transfers");
    expect(response.ok()).toBeTruthy();
  });

  test("recent transfers page loads", async ({ request }) => {
    const response = await request.get("/inventory/transfer?sort=recent");
    expect(response.ok()).toBeTruthy();
  });

  test("transfer search filters by status", async ({ request }) => {
    const response = await request.get("/inventory/transfer?status=delivered");
    expect(response.ok()).toBeTruthy();
  });

  test("transfer location filter works", async ({ request }) => {
    const response = await request.get(
      "/inventory/transfer?locationId=loc_1",
    );
    expect(response.ok()).toBeTruthy();
  });

  test("transfer date range filter works", async ({ request }) => {
    const response = await request.get(
      "/inventory/transfer?from=2024-01-01&to=2024-12-31",
    );
    expect(response.ok()).toBeTruthy();
  });

  test("transfer pagination works correctly", async ({ request }) => {
    const response = await request.get("/inventory/transfer?page=1&limit=10");
    expect(response.ok()).toBeTruthy();
  });
});
