/**
 * Simple Diagnostic Test Suite
 *
 * Basic connectivity and functionality tests for StockFlows triage
 */

import { test, expect } from "@playwright/test";

test.describe("Simple Triage Diagnostics", () => {

  test("Health check endpoint", async ({ request }) => {
    const response = await request.get("/health");
    console.log("Health check status:", response.status());
    expect(response.status()).toBe(200);
  });

  test("Health ready endpoint", async ({ request }) => {
    const response = await request.get("/health/ready");
    console.log("Health ready status:", response.status());
    // 200 = healthy, 503 = unhealthy, 500 = error — validate endpoint is reachable
    expect([200, 503, 500]).toContain(response.status());
  });

  test("Webhooks endpoint POST (no HMAC)", async ({ request }) => {
    const response = await request.post("/webhooks", {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Topic": "test",
      },
      data: { test: "payload" },
      timeout: 5000,
    });
    console.log("Webhooks POST status:", response.status());
    // Should be 400 (bad request / HMAC validation failed) or 401 (unauthorized)
    // The endpoint correctly rejects unsigned webhook POSTs
    expect([400, 401]).toContain(response.status());
  });
});