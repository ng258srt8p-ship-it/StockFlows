import { defineConfig, devices } from "@playwright/test";

/**
 * StockFlows v7 — Playwright Configuration
 *
 * Three projects:
 *   app     → Remix Shopify app (localhost:5173)
 *   demo    → Standalone interactive demo (localhost:5175)
 *   website → Marketing website (localhost:5174)
 *
 * Shared settings: Chromium only, screenshots on failure, HTML reporter.
 */
export default defineConfig({
  /* ── Global settings ─────────────────────────────────────────────────── */
  testDir: "e2e",
  fullyParallel: false, // sequential to avoid port conflicts between projects
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",

  /* ── Shared use settings ─────────────────────────────────────────────── */
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* ── Browser ─────────────────────────────────────────────────────────── */
  projects: [
    /* ── App (Remix Shopify embedded app) ─────────────────────────────── */
    {
      name: "app",
      testDir: "e2e/app",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5173",
      },
      webServer: {
        command: "pnpm --filter @stockflows/app dev",
        port: 5173,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },

    /* ── Demo (standalone interactive demo) ────────────────────────────── */
    {
      name: "demo",
      testDir: "e2e/demo",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5175",
      },
      webServer: {
        command: "pnpm --filter @stockflows/demo dev",
        port: 5175,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },

    /* ── Website (marketing / landing pages) ───────────────────────────── */
    {
      name: "website",
      testDir: "e2e/website",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5174",
      },
      webServer: {
        command: "pnpm --filter @stockflows/website dev",
        port: 5174,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    },
  ],
});
