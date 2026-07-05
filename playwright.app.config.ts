import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for testing against the live StockFlows deployment.
 * Run with: npx playwright test e2e/app-routes.spec.ts --config=playwright.app.config.ts
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "app-routes.spec.ts",
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: "list",
  timeout: 30_000,

  use: {
    baseURL: "https://stockflows.fly.dev",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 15_000,
    // Use a real browser User-Agent to avoid isbot detection (returns 410 for bots)
    extraHTTPHeaders: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
