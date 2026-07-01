import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for StockFlows Triage Tests
 *
 * This configuration is specifically designed for testing real-time data flow
 * between Shopify and StockFlows during integration troubleshooting.
 * Tests run against the Shopify Dev environment with specific focus on:
 * - Webhook delivery and database synchronization
 * - Real-time inventory updates (Shopify → DB → UI)
 * - Server-Sent Events (SSE) functionality
 * - API endpoint connectivity and error handling
 *
 * NOTES:
 * - Tests target stockflows.app (Shopify Dev environment), NOT localhost
 * - Sequential execution to avoid DB contention during webhook testing
 * - 30-second timeouts for complex real-time operations
 * - Network idle waits for webhook processing completion
 * - Visual comparison to detect display issues from data inconsistencies
 */
export default defineConfig({
  // E2E tests run from ./e2e (functional/integration tests)
  testDir: "./e2e",
  fullyParallel: false, // Sequential to avoid DB contention during webhook processing
  forbidOnly: !!process.env.CI,
  retries: 2, // Retry webhook tests once for transient network issues
  workers: 1, // Single worker to maintain database state integrity
  reporter: "list",
  timeout: 40_000, // Increased timeout for webhook processing and real-time sync

  use: {
    baseURL: "https://stockflows.app", // Testing against Shopify Dev environment
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Increased navigation timeout for large data loads
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],

  // Visual regression: expect settings for detecting display inconsistencies
  // This helps identify UI issues from data synchronization problems
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },

  // No local webServer - tests run against stockflows.app (Shopify Dev environment)
  // Authenticated sessions are managed via .auth/ state in Playwright
});