import { test, expect } from "@playwright/test";

const DEMO_URL = "https://stockflows.app/demo.html";

test.describe("StockFlows Interactive Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
  });

  test("Demo page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/StockFlows.*Demo/);
  });

  test("Dashboard shows all stats", async ({ page }) => {
    await expect(page.locator("#page-dashboard")).toBeVisible();
    await expect(page.locator(".demo-stat-card")).toHaveCount(6);
    await expect(page.locator(".demo-stat-value").first()).toContainText("35");
  });

  test("Navigation switches pages", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator("#page-inventory")).toBeVisible();
    await expect(page.locator("#page-dashboard")).not.toBeVisible();
  });

  test("Inventory table shows all products", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await expect(page.locator("#inventory-tbody tr")).toHaveCount(35);
  });

  test("Inventory search filters products", async ({ page }) => {
    await page.click('[data-page="inventory"]');
    await page.fill("#inventory-search", "tent");
    const visibleRows = await page.locator("#inventory-tbody tr:visible").count();
    expect(visibleRows).toBeGreaterThan(0);
    expect(visibleRows).toBeLessThan(35);
  });

  test("Purchasing page shows POs", async ({ page }) => {
    await page.click('[data-page="purchasing"]');
    await expect(page.locator("#po-tbody tr")).toHaveCount(4);
  });

  test("Forecasting shows forecast cards", async ({ page }) => {
    await page.click('[data-page="forecasting"]');
    await expect(page.locator(".demo-forecast-card")).toHaveCount(5);
  });

  test("Reports show valuation", async ({ page }) => {
    await page.click('[data-page="reports"]');
    await expect(page.locator("#valuation-report")).toContainText("Total Inventory Value");
    await expect(page.locator("#valuation-report")).toContainText("$47,892.50");
  });

  test("All pages have correct header", async ({ page }) => {
    const pages = ["dashboard", "inventory", "purchasing", "forecasting", "reports"];
    for (const p of pages) {
      await page.click(`[data-page="${p}"]`);
      await expect(page.locator(`#page-${p} h1`)).toBeVisible();
    }
  });

  test("Dashboard shows alerts with urgency", async ({ page }) => {
    await expect(page.locator(".demo-alert-item")).toHaveCount(6);
    await expect(page.locator(".demo-alert-dot.critical")).toHaveCount(3);
    await expect(page.locator(".demo-alert-dot.warning")).toHaveCount(3);
  });
});
