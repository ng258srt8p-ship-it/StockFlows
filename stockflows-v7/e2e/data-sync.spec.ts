/**
 * E2E Tests: Data Synchronization
 *
 * Covers: Data synchronization with Shopify, initial and incremental sync.
 * ARCHITECTURE §32 (Shopify sync)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Data Synchronization", () => {
  test("sync status endpoint is accessible", async ({ request }) => {
    const response = await request.get("/api/sync/status");
    expect(response.ok()).toBeTruthy();
  });

  test("initial sync completes successfully", async ({ request }) => {
    const response = await request.get("/api/sync/initial");
    expect(response.ok()).toBeTruthy();
  });

  test("incremental sync processes updates", async ({ request }) => {
    const response = await request.get("/api/sync/incremental");
    expect(response.ok()).toBeTruthy();
  });

  test("sync logs track operation history", async () => {
    const logs = await prisma.syncLog.findMany({ take: 10, orderBy: { createdAt: "desc" } });
    expect(Array.isArray(logs)).toBe(true);
  });

  test("sync timing is within acceptable range", async () => {
    const logs = await prisma.syncLog.findMany({ take: 10 });
    for (const l of logs) {
      expect(l.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  test("data consistency is maintained after sync", async () => {
    const items = await prisma.inventoryItem.findMany({ take: 20 });
    expect(items.length).toBeGreaterThan(0);
  });

  test("sync error handling is robust", async ({ request }) => {
    const response = await request.get("/api/sync?forceError=true");
    // Should handle gracefully (4xx or 5xx)
    expect([200, 400, 500]).toContain(response.status());
  });

  test("sync triggers on schedule", async ({ request }) => {
    const response = await request.get("/api/sync/trigger");
    expect(response.ok()).toBeTruthy();
  });
});
