import { test, expect } from "@playwright/test";

const DEMO_URL = "https://stockflows.app/demo";

test.describe("StockFlows Interactive Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
  });

  test("Demo page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/StockFlows.*Demo/);
  });

  test("Dashboard shows stats matching Shopify app", async ({ page }) => {
    await expect(page.locator("#page-dashboard")).toBeVisible();
    await expect(page.locator(".demo-stat-card")).toHaveCount(4);
    // Match exact stats from Shopify app
    await expect(page.locator(".demo-stat-value").nth(0)).toContainText("26");
    await expect(page.locator(".demo-stat-value").nth(1)).toContainText("9");
    await expect(page.locator(".demo-stat-value").nth(2)).toContainText("6");
    await expect(page.locator(".demo-stat-value").nth(3)).toContainText("$0");
  });

  test("Navigation switches pages", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator("#page-inventory")).toBeVisible();
    await expect(page.locator("#page-dashboard")).not.toBeVisible();
  });

  test("Inventory table shows all products", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator("#inventory-tbody tr")).toHaveCount(30);
  });

  test("Inventory search filters products", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await page.fill("#inventory-search", "tent");
    const visibleRows = await page.locator("#inventory-tbody tr:visible").count();
    expect(visibleRows).toBeGreaterThan(0);
    expect(visibleRows).toBeLessThan(30);
  });

  test("Purchasing page shows POs", async ({ page }) => {
    await page.click('[data-page="purchasing"]');
    await expect(page.locator("#po-tbody tr")).toHaveCount(4);
  });

  test("Forecasting shows forecast cards", async ({ page }) => {
    await page.click('[data-page="forecasting"]');
    await expect(page.locator(".demo-forecast-card")).toHaveCount(5);
  });

  test("Reports show valuation with $0 total", async ({ page }) => {
    await page.click('[data-page="reports"]');
    await expect(page.locator("#valuation-report")).toContainText("Total Inventory Value");
    await expect(page.locator("#valuation-report")).toContainText("$0");
  });

  test("Settings page loads with form elements", async ({ page }) => {
    await page.click('[data-page="settings"]');
    await expect(page.locator("#page-settings h1")).toContainText("Settings");
    await expect(page.locator(".demo-setting-row")).toHaveCount(12);
  });

  test("All pages have correct header", async ({ page }) => {
    const pages = ["dashboard", "inventory", "purchasing", "forecasting", "reports", "settings"];
    for (const p of pages) {
      await page.click(`[data-page="${p}"]`);
      await expect(page.locator(`#page-${p} h1`)).toBeVisible();
    }
  });

  test("Dashboard shows empty state for alerts", async ({ page }) => {
    await expect(page.locator("#low-stock-alerts")).toContainText("No active alerts");
    await expect(page.locator("#low-stock-alerts")).toContainText("All stock levels are above their reorder points");
  });
});
