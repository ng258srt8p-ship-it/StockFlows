import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for StockFlows Live Production Testing
 * 
 * Connects to existing Chrome instance on port 9222 (with user's Shopify session)
 * Tests run against stockflows.fly.dev and Shopify Admin
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for live testing
  workers: 1,
  reporter: "list",
  timeout: 120_000,

  use: {
    // Connect to existing Chrome via CDP instead of launching new browser
    // @ts-expect-error cdpEndpoint is supported at runtime but missing from Playwright types
    cdpEndpoint: "http://localhost:9222",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 60_000,
  },

  projects: [
    {
      name: "chromium-connected",
      use: {
        browserName: "chromium",
        channel: "chrome",
      },
    },
  ],

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
});