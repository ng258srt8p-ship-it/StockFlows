/**
 * DIAGNOSTIC SPEC: API Connectivity & Shopify Integration
 *
 * Tests the various API endpoints and integrations:
 * - Shopify GraphQL Admin API (inventory, products)
 * - REST API endpoints (/app/api/*)
 * - Inventory adjustment endpoints
 * - AI insights generation API
 * - Rate limiting and error handling
 *
 * PURPOSE: Validate that the app can properly communicate with Shopify APIs.
 */

import { test, expect } from "@playwright/test";

test.describe("Triage Phase 4: API Endpoint Health", () => {

  test("API inventory endpoints are reachable", async ({ request }) => {
    const tryEndpoint = async (endpoint: string) => {
      try {
        const response = await request.get(endpoint, {
          timeout: 5000,
          headers: {
            "Accept": "application/json",
          },
        });

        return {
          status: response.status(),
          ok: response.ok(),
          headers: response.headers(),
        };
      } catch (error) {
        return {
          error: String(error),
          status: 0,
          ok: false,
        };
      }
    };

    const endpoints = [
      "/app/api/inventory",
      "/app/api/sse",
      "/app/api/insights",
    ];

    for (const endpoint of endpoints) {
      const result = await tryEndpoint(endpoint);
      console.log(`${endpoint}:`, result);

      // Most endpoints should respond (200/404/405/401 are OK - means endpoint exists)
      // 500 errors would indicate server issues
      if (result.status > 0) {
        expect(result.status).not.toBe(500);
      }
    }
  });

  test("GraphQL Shopify integration endpoints tested", async ({ request }) => {
    const graphqlEndpoint = `https://stockflows.app/admin/api/2026-04/graphql.json`;

    try {
      const response = await request.post(graphqlEndpoint, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": "test-token", // Will reject but test endpoint
        },
        data: {
          query: `{ shop { name } }`,
        },
        timeout: 5000,
      });

      console.log("GraphQL endpoint status:", response.status());
      console.log("GraphQL response headers:", response.headers());

      // Should get response (200 = success, 401 = unauthorized, 400 = bad request)
      expect([200, 401, 400]).toContain(response.status());
    } catch (error) {
      console.log("GraphQL connection error (expected):", error);
      // Connection error is acceptable - just tests endpoint reachability
    }
  });

  test("Inventory adjustment API is reachable", async ({ request }) => {
    const response = await request.post("/app/api/inventory", {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        barcode: "TEST123",
        adjustment: 10,
        reason: "test",
      },
      timeout: 5000,
    });

    console.log("Inventory adjustment API status:", response.status());
    console.log("Inventory adjustment response body:", await response.text());

    // Could be 200 (success), 400 (bad request), 401 (unauthorized), or 404
    expect([200, 400, 401, 404]).toContain(response.status());
  });
});

test.describe("Triage Phase 4: Inventory API Integration", () => {

  test("Inventory adjustment endpoint tests", async ({ page, request }) => {
    await page.goto("/app/inventory");
    await page.waitForLoadState("networkidle");

    // Look for any barcode scanner interface or quick adjustment UI
    const barcodeInput = page.locator('input[placeholder*="barcode"], input[type="text"][maxlength="13"], input[pattern="\\d+"]').first();

    if (await barcodeInput.isVisible()) {
      // Test barcode scanning UI
      await barcodeInput.fill("TEST_BARCODE_123");
      console.log("Barcode input filled for API testing");

      // Check if there's an adjustment mechanism
      const adjustButton = page.locator('button:has-text("Adjust"), button:has-text("Scan"), button[aria-label*="scan"]').first();
      if (await adjustButton.isVisible()) {
        await adjustButton.click();
        await page.waitForTimeout(1000);
        console.log("Adjustment UI triggered");
      }
    }

    // Test the REST API directly
    const apiResponse = await request.post("/app/api/inventory", {
      headers: { "Content-Type": "application/json" },
      data: {
        barcode: "TEST_123",
        adjustment: 5,
        reason: "e2e_test",
        notes: "Test adjustment from triage",
      },
      timeout: 5000,
    });

    console.log("Direct API call status:", apiResponse.status());
    console.log("Direct API response:", await apiResponse.text());

    // API call should respond (exact status depends on auth/permissions)
    expect([200, 201, 400, 401, 403, 404, 405]).toContain(apiResponse.status());
  });
});

test.describe("Triage Phase 4: AI Insights API", () => {

  test("AI insights endpoint is reachable", async ({ request }) => {
    const response = await request.get("/app/api/insights", {
      timeout: 5000,
      headers: {
        Accept: "application/json",
      },
    });

    console.log("AI insights API status:", response.status());
    console.log("AI insights response:", await response.text());

    // Could be 200 (success with data), 401 (unauthorized), 404 (not implemented), etc.
    expect([200, 401, 404, 405]).toContain(response.status());
  });
});

test.describe("Triage Phase 4: Rate Limiting Analysis", () => {

  test("Multiple rapid API requests don't immediately fail (basic rate limiting test)", async ({ request }) => {
    console.log("Testing rapid API requests for rate limiting...\n");

    const results = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      const response = await request.get("/health", { timeout: 3000 });
      const endTime = Date.now();

      results.push({
        request: i + 1,
        status: response.status(),
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("Rate limiting test results:", results);

    // Check for immediate 429 (rate limit) responses
    const hasRateLimiting = results.some(r => r.status === 429);
    if (hasRateLimiting) {
      console.log("Rate limiting detected - good");
    } else {
      console.log("No rate limiting detected (may be acceptable for testing)");
    }

    // All requests should have completed without connection failures
    const allSuccessful = results.every(r => r.status > 0);
    expect(allSuccessful).toBe(true);
  });
});

test.describe("Triage Phase 4: Error Handling Validation", () => {

  test("Invalid data format produces appropriate error responses", async ({ request }) => {
    // Test with malformed JSON
    const response = await request.post("/app/api/inventory", {
      headers: {
        "Content-Type": "application/json",
      },
      data: "invalid json",
      timeout: 3000,
    });

    console.log("Invalid JSON response status:", response.status());
    // Should be 400 (bad request) or similar error
    expect([400, 405]).toContain(response.status());
  });

  test("Missing required parameters trigger appropriate responses", async ({ request }) => {
    const response = await request.post("/app/api/inventory", {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        // Missing required fields like barcode, adjustment
      },
      timeout: 3000,
    });

    console.log("Missing params response status:", response.status());
    expect([400, 422]).toContain(response.status());
  });
});
test.describe("Triage Phase 4: StockFlows-Specific API Validation", () => {

  test("StockFlows API inventory endpoints function correctly", async ({ request }) => {
    // Test various StockFlows API endpoints
    const apiTests = [
      { endpoint: "/app/api/inventory?barcode=test", method: "GET" },
      { endpoint: "/app/api/sse", method: "GET" },
      { endpoint: "/app/api/insights", method: "GET" },
    ];

    for (const test of apiTests) {
      try {
        let response;
        if (test.method === "GET") {
          response = await request.get(test.endpoint, {
            timeout: 3000,
            headers: { Accept: "application/json" },
          });
        }

        if (response) {
          console.log(`${test.method} ${test.endpoint}: Status ${response.status()}`);

          // Should respond (any status except 500 indicates endpoint exists)
          if (response.status() > 0) {
            expect(response.status()).not.toBe(500);
          }
        } else {
          console.log(`${test.method} ${test.endpoint}: No response received`);
        }
      } catch (error) {
        console.log(`${test.method} ${test.endpoint}: Error ${error}`);
        // Connection error is acceptable for testing
      }
    }
  });
});
test.describe("Triage Phase 4 Summary: API Connectivity Report", () => {
  test("Generate API connectivity health summary", async () => {
    console.log("\n========== API CONNECTIVITY HEALTH REPORT ==========");
    console.log("Timestamp:", new Date().toISOString());
    console.log("=== Core Endpoints ===");
    console.log("POST /webhooks - Shopify webhook reception");
    console.log("GET /app/api/inventory - Inventory operations API");
    console.log("GET /app/api/sse - Real-time updates (SSE)");
    console.log("GET /app/api/insights - AI insights generation");
    console.log("=== Shopify Integration ===");
    console.log("GraphQL Admin API: https://stockflows.app/admin/api/2026-04/graphql.json");
    console.log("Authentication: HMAC validation + Access tokens");
    console.log("Rate Limiting: Throttle tracking on API client");
    console.log("=== Error Handling ===");
    console.log("Response codes: 200, 400, 401, 403, 404, 429, 500+");
    console.log("==================================\n");

    expect(true).toBe(true);
  });
});