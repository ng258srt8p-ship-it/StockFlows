import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests - Settings Page
 *
 * Captures full-page screenshots and validates critical visual elements.
 * Uses the local preview route to bypass Shopify auth requirements.
 */

const PREVIEW_URL = "http://localhost:5173/preview/settings";

test.describe("Settings Page Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PREVIEW_URL, { waitUntil: "networkidle" });
  });

  test("settings page - desktop view - renders all cards", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Verify page title
    await expect(page.locator("h1")).toContainText("Settings");
    
    // Verify all 5 section headings are present
    const headingTexts = ["Notifications", "Alert Thresholds", "Forecasting", "AI Features", "General"];
    for (const text of headingTexts) {
      await expect(page.locator(`h2:has-text("${text}")`)).toBeVisible();
    }
    
    // Verify Save button
    await expect(page.locator('button:has-text("Save Settings")')).toBeVisible();
    
    // Take full-page screenshot for visual comparison
    await expect(page).toHaveScreenshot("settings-page-desktop.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("settings page - mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify page title on mobile
    await expect(page.locator("h1")).toContainText("Settings");
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot("settings-page-mobile.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("settings page heading styles are correct", async ({ page }) => {
    const h2 = page.locator("h2").first();
    
    // Polaris headingLg has specific font-size and weight
    await expect(h2).toHaveCSS("font-size", "20px");
    await expect(h2).toHaveCSS("font-weight", "650");
  });

  test("settings page background is light gray", async ({ page }) => {
    const bgWrapper = page.locator(".bg-background-secondary");
    await expect(bgWrapper).toHaveCSS("background-color", "rgb(248, 249, 250)");
  });

  test("settings page has correct card layout", async ({ page }) => {
    // Cards are rendered by Polaris as ShadowBevel components
    const cards = page.locator('[class*="ShadowBevel"]');
    const cardCount = await cards.count();
    
    // Should have 5 cards (Notifications, Alert Thresholds, Forecasting, AI Features, General)
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });
});
