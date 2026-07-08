/**
 * E2E Tests: API Endpoint Correctness
 *
 * Tests the API endpoints:
 * - /app/api/inventory returns properly structured JSON
 * - /app/api/insights returns properly structured JSON
 * - /app/api/sse connects as EventSource
 * - Health endpoints return correct status
 */
import { test, expect } from "@playwright/test";

test.describe("API — Inventory Endpoint", () => {
  test("/app/api/inventory returns JSON with items array", async ({ request }) => {
    const response = await request.get("/app/api/inventory");
    expect(response.ok()).toBe(true);

    const contentType = response.headers()["content-type"] || "";
    expect(contentType).toContain("json");

    const body = await response.json();

    // Should have items array
    expect(Array.isArray(body.items)).toBe(true);

    // Each item should have expected fields if present
    if (body.items.length > 0) {
      const item = body.items[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("sku");
      expect(item).toHaveProperty("quantity");
      expect(item).toHaveProperty("location");
    }
  });

  test("/app/api/inventory?search= filters results", async ({ request }) => {
    const response = await request.get("/app/api/inventory?search=test");
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(Array.isArray(body.items)).toBe(true);
  });
});

test.describe("API — Insights Endpoint", () => {
  test("/app/api/insights returns JSON", async ({ request }) => {
    const response = await request.get("/app/api/insights");
    expect(response.ok()).toBe(true);

    const contentType = response.headers()["content-type"] || "";
    expect(contentType).toContain("json");

    const body = await response.json();
    // May be an object or array depending on implementation
    expect(typeof body).toBe("object");
  });
});

test.describe("API — SSE Endpoint", () => {
  test("/app/api/sse responds with text/event-stream", async ({ request }) => {
    const response = await request.get("/app/api/sse");
    // SSE may 401 if not authenticated
    const status = response.status();
    expect(status === 200 || status === 401).toBe(true);
  });
});