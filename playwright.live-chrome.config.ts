import { defineConfig } from "@playwright/test";

/**
 * Playwright config for Chrome-connected audit tests
 * Connects to existing Chrome session on port 9222
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "live-chrome-audit.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: "list",
  timeout: 120_000,

  use: {
    // Connect to existing Chrome instance
    // @ts-ignore - custom config for CDP connection
    _connectOverCDP: "http://localhost:9222",
    
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium-cdp",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
