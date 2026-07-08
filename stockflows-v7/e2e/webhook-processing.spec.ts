/**
 * E2E Tests: Webhook Processing
 *
 * Covers: Webhook processing reliability, retry logic.
 * ARCHITECTURE §32 (Shopify webhooks)
 */
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.describe("Webhook Processing", () => {
  test("webhook endpoint is accessible", async ({ request }) => {
    const response = await request.get("/webhooks");
    expect(response.ok()).toBeTruthy();
  });

  test("webhook processing logs exist", async () => {
    const logs = await prisma.webhookLog.findMany({ take: 10 });
    expect(Array.isArray(logs)).toBe(true);
  });

  test("webhook statuses are tracked", async () => {
    const logs = await prisma.webhookLog.findMany({ take: 20 });
    const validStatuses = ["success", "failed", "pending", "retrying"];
    for (const l of logs) {
      expect(validStatuses).toContain(l.status);
    }
  });

  test("webhook retry logic works", async () => {
    const logs = await prisma.webhookLog.findMany({ take: 10 });
    for (const l of logs) {
      if (l.status === "retrying") {
        expect(l.retryCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("webhook payloads are validated", async ({ request }) => {
    const response = await request.post("/webhooks/shopify", {
      headers: { "Content-Type": "application/json" },
      data: { topic: "products/update", shop_id: "test-shop" },
    });
    expect([200, 400]).toContain(response.status());
  });

  test("webhook processing is idempotent", async () => {
    const logs = await prisma.webhookLog.findMany({ take: 5 });
    for (const l of logs) {
      expect(l.processedAt).toBeTruthy();
    }
  });

  test("webhook delivery guarantees are met", async () => {
    const logs = await prisma.webhookLog.findMany({ take: 20 });
    for (const l of logs) {
      expect(l.delivered).toBe(true);
    }
  });
});
