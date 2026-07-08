/**
 * Visual Regression Tests for StockFlows
 *
 * Screenshots all 6 app pages and compares them to baseline screenshots.
 * Uses Playwright's toHaveScreenshot() for pixel-level comparison.
 *
 * Run: npx playwright test e2e/visual-regression.spec.ts --config=playwright.app.config.ts
 *
 * First run:  generates baselines in screenshots/baseline/
 * Subsequent: compares against baselines and fails on drift
 * Update:     npx playwright test --config=playwright.app.config.ts --update-snapshots
 */
import { test, expect } from "@playwright/test";

const BASE_URL = "https://stockflows.fly.dev";

const PAGES = [
  { path: "/app", name: "dashboard", heading: "StockFlows Dashboard" },
  { path: "/app/inventory", name: "inventory", heading: "Inventory" },
  { path: "/app/purchasing", name: "purchasing", heading: "Purchase Orders" },
  { path: "/app/forecasting", name: "forecasting", heading: "Forecasting" },
  { path: "/app/reports", name: "reports", heading: "Reports" },
  { path: "/app/settings", name: "settings", heading: "Settings" },
];

test.describe("Visual Regression — All Pages", () => {
  for (const page of PAGES) {
    test(`${page.name} page matches baseline`, async ({ page: p }) => {
      await p.goto(`${BASE_URL}${page.path}`, {
        waitUntil: "networkidle",
        timeout: 15_000,
      });

      // Wait for the page heading to confirm content has rendered
      await expect(
        p.getByRole("heading", { name: page.heading })
      ).toBeVisible({ timeout: 10_000 });

      // Small delay to let any animations/transitions settle
      await p.waitForTimeout(500);

      // Full-page screenshot compared against baseline
      await expect(p).toHaveScreenshot(`${page.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    });
  }
});
