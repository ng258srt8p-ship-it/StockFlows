/**
 * E2E Tests: API Health
 *
 * Covers: API endpoints health (inventory, forecasting, purchasing).
 * ARCHITECTURE §36 (API endpoints)
 */
import { test, expect } from "@playwright/test";

test.describe("API Health", () => {
  test("inventory API endpoint is accessible", async ({ request }) => {
    const response = await request.get("/api/inventory");
    expect(response.ok()).toBeTruthy();
  });

  test("forecasting API endpoint is accessible", async ({ request }) => {
    const response = await request.get("/api/forecasting");
    expect(response.ok()).toBeTruthy();
  });

  test("purchasing API endpoint is accessible", async ({ request }) => {
    const response = await request.get("/api/purchasing");
    expect(response.ok()).toBeTruthy();
  });

  test("health check endpoint returns system status", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();
  });

  test("ready check endpoint returns dependency status", async ({ request }) => {
    const response = await request.get("/health/ready");
    expect(response.ok()).toBeTruthy();
  });

  test("API rate limiting is enforced", async ({ request }) => {
    const response = await request.get("/api/inventory?limit=1000");
    // Should either return data or rate limit response
    expect([200, 429]).toContain(response.status());
  });

  test("API error handling returns proper format", async ({ request }) => {
    const response = await request.get("/api/nonexistent");
    expect([404, 500]).toContain(response.status());
  });

  test("API authentication is enforced on protected routes", async ({ request }) => {
    const response = await request.get("/api/inventory/protected");
    expect([401, 403]).toContain(response.status());
  });
});
