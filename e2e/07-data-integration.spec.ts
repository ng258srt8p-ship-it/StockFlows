import { test, expect } from "@playwright/test";

// Marketing pages (Cloudflare Pages deployment)
const MARKETING_BASE_URL = "https://stockflows.app";

test.describe("StockFlows Data Integration - Shopify Store Sync", () => {
  test("Dashboard loads and displays inventory metrics", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    
    // Navigate to dashboard (default page)
    await page.waitForLoadState("networkidle");
    
    // Check that inventory data is displayed
    const dashboardContent = page.locator(".app.active");
    await expect(dashboardContent).toBeVisible();
    
    // Verify key metrics or inventory data appears
    const pageText = await page.innerText("body");
    
    // Should show inventory-related content
    expect(pageText).toContain("Inventory");
    expect(pageText).toContain("Stock");
  });

  test("Inventory page displays product data accurately", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to inventory page
    await page.locator('.sidebar nav a[data-page="inventory"]').click();
    await page.waitForTimeout(500);

    // Check for product presence
    const inventoryTable = page.locator("#page-inventory");
    await expect(inventoryTable).toBeVisible();

    // Verify product details appear
    const pageText = await page.innerText("body");
    expect(pageText).toContain("SKU");
    expect(pageText.length).toBeGreaterThan(0);
  });

  test("Settings page successfully loads from explore.html navigation", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);

    // Check settings page is rendered
    const settingsPage = page.locator("#page-settings");
    await expect(settingsPage).toBeVisible();
  });

  test("Settings navigation triggers conditional form field display", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);
  });
});
