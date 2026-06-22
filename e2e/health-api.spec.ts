/**
 * E2E Tests: Health Check & System Status
 *
 * Covers: Health check endpoints, database connectivity, Redis connectivity
 * Research.md §50, Architecture §7
 */
import { test, expect } from "@playwright/test";

test.describe("Health Endpoints", () => {
  test("GET /health returns alive status", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("alive");
    expect(body.timestamp).toBeTruthy();

    // Timestamp should be recent (within last 60 seconds)
    const ts = new Date(body.timestamp).getTime();
    expect(Date.now() - ts).toBeLessThan(60_000);
  });

  test("GET /health/ready returns ready with DB + Redis OK", async ({ request }) => {
    const response = await request.get("/health/ready");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ready");
    expect(body.checks.postgres).toBe("ok");
    expect(body.checks.redis).toBe("ok");
    expect(body.timestamp).toBeTruthy();
  });

  test("GET /health/ready returns proper content type", async ({ request }) => {
    const response = await request.get("/health/ready");
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });
});
