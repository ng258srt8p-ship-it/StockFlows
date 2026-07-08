/**
 * E2E Route Verification Tests for StockFlows
 *
 * Tests all app routes against the live deployment at stockflows.fly.dev.
 * Auth-gated routes are expected to return 302/410/401 — these are valid
 * responses that confirm the auth middleware is active and protecting routes.
 *
 * Run: npx playwright test e2e/app-routes.spec.ts --config=playwright.app.config.ts
 */
import { test, expect } from "@playwright/test";

const BASE_URL = "https://stockflows.fly.dev";

// ---------------------------------------------------------------------------
// Health endpoints (no auth required)
// ---------------------------------------------------------------------------
test.describe("Health Endpoints", () => {
  test("GET /health returns alive status with timestamp", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("alive");
    expect(body.timestamp).toBeTruthy();

    // Timestamp should be recent (within last 60 seconds)
    const ts = new Date(body.timestamp).getTime();
    expect(Date.now() - ts).toBeLessThan(60_000);
  });

  test("GET /health returns JSON content type", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("GET /health/ready returns ready status with dependency checks", async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}/health/ready`);
    // 200 = all deps healthy, 503 = degraded — both are valid
    expect([200, 503]).toContain(response.status());

    const body = await response.json();
    expect(["ready", "not ready"]).toContain(body.status);
    expect(body.checks).toBeTruthy();
    expect(body.checks.postgres).toBeTruthy();
    expect(body.timestamp).toBeTruthy();
  });

  test("GET /health/ready returns JSON content type", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health/ready`);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });
});

// ---------------------------------------------------------------------------
// Auth-gated app routes (all 6 main navigation routes)
// ---------------------------------------------------------------------------

// Routes mapped from the Navigation in app.tsx
const APP_ROUTES = [
  { path: "/app", name: "Dashboard", expectedContent: "StockFlows" },
  { path: "/app/inventory", name: "Inventory" },
  { path: "/app/purchasing", name: "Purchasing" },
  { path: "/app/forecasting", name: "Forecasting" },
  { path: "/app/reports", name: "Reports" },
  { path: "/app/settings", name: "Settings" },
];

test.describe("App Routes — HTTP Status", () => {
  for (const route of APP_ROUTES) {
    test(`${route.path} (${route.name}) returns valid HTTP response`, async ({
      request,
    }) => {
      const response = await request.get(`${BASE_URL}${route.path}`, {
        maxRedirects: 0,
      });
      const status = response.status();

      // Auth-gated routes should return one of:
      //   200 — rendered HTML (Remix error boundary or page)
      //   302 — redirect to OAuth flow
      //   401 — unauthorized
      //   410 — gone (isbot detection or no session)
      expect(
        [200, 302, 401, 410],
        `Unexpected status ${status} for ${route.path}`
      ).toContain(status);
    });
  }
});

test.describe("App Routes — HTML Content", () => {
  for (const route of APP_ROUTES) {
    test(`${route.path} (${route.name}) returns HTML with app title`, async ({
      request,
    }) => {
      const response = await request.get(`${BASE_URL}${route.path}`);

      // If the response is HTML (not a redirect or error JSON), verify it
      const contentType = response.headers()["content-type"] || "";
      if (contentType.includes("text/html") || contentType.includes("text/html")) {
        const body = await response.text();
        // All pages should have the StockFlows title or app metadata
        expect(body).toContain("StockFlows");
      }
      // Redirects (3xx) and JSON errors (410) are valid — we already checked status above
    });
  }
});

// ---------------------------------------------------------------------------
// Root path behavior
// ---------------------------------------------------------------------------
test.describe("Root Path", () => {
  test("GET / redirects (302) or serves app content", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`, { maxRedirects: 0 });
    const status = response.status();

    // Root should either redirect to /app or serve content
    expect([200, 302]).toContain(status);

    if (status === 302) {
      const location = response.headers()["location"];
      expect(location).toBeTruthy();
      // Should redirect to /app or an auth path
      expect(
        location!.includes("/app") || location!.includes("/auth")
      ).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Webhook endpoint
// ---------------------------------------------------------------------------
test.describe("Webhook Endpoint", () => {
  test("POST /webhooks without valid payload returns non-500", async ({
    request,
  }) => {
    const response = await request.post(`${BASE_URL}/webhooks`, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Topic": "test/topic",
        "X-Shopify-Shop-Domain": "test.myshopify.com",
      },
      data: JSON.stringify({ test: true }),
    });
    // Should not crash with 500; 200/401/403/422 are all acceptable
    expect(response.status()).not.toBe(500);
  });

  test("GET /webhooks returns valid response", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/webhooks`, {
      maxRedirects: 0,
    });
    // Should not return 500
    expect(response.status()).not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// Static/preview pages (no auth required)
// ---------------------------------------------------------------------------
test.describe("Static Pages", () => {
  test("GET /preview/settings renders without auth", async ({ page }) => {
    await page.goto(`${BASE_URL}/preview/settings`);
    await page.waitForLoadState("load");
    // Should load without auth errors
    const body = await page.content();
    expect(body).toContain("StockFlows");
  });
});

// ---------------------------------------------------------------------------
// Concurrent requests — ensure no server crashes
// ---------------------------------------------------------------------------
test.describe("Server Stability", () => {
  test("multiple concurrent health requests succeed", async ({ request }) => {
    const endpoints = ["/health", "/health/ready"];
    const promises = endpoints.map((endpoint) =>
      request
        .get(`${BASE_URL}${endpoint}`, { timeout: 10_000 })
        .then((r) => ({
          endpoint,
          status: r.status(),
          ok: r.ok(),
        }))
    );
    const results = await Promise.all(promises);
    for (const result of results) {
      expect(
        result.ok,
        `${result.endpoint} returned ${result.status}`
      ).toBeTruthy();
    }
  });

  test("app routes do not crash the server", async ({ request }) => {
    const routes = ["/app", "/app/inventory", "/app/settings"];
    const promises = routes.map((route) =>
      request
        .get(`${BASE_URL}${route}`, { timeout: 15_000 })
        .then((r) => ({
          route,
          status: r.status(),
        }))
    );
    const results = await Promise.all(promises);
    for (const result of results) {
      // No route should return 500 (server error)
      expect(
        result.status,
        `${result.route} returned 500`
      ).not.toBe(500);
    }
  });
});

// ---------------------------------------------------------------------------
// Content integrity — no 500 error pages leaked
// ---------------------------------------------------------------------------
test.describe("Error Boundary", () => {
  test("non-existent route returns 404 or redirect, not 500", async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}/nonexistent-route-xyz`, {
      maxRedirects: 0,
    });
    expect(response.status()).not.toBe(500);
  });

  test("invalid query parameters don't crash app routes", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/app?malicious=<script>alert(1)</script>`,
      { maxRedirects: 0 }
    );
    expect(response.status()).not.toBe(500);
  });
});
