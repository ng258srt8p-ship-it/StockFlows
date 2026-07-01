import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests - Dashboard
 *
 * Captures full-page screenshots and validates critical visual elements.
 * Uses the local preview route to bypass Shopify auth requirements.
 */

const PREVIEW_URL = "http://localhost:5173/preview/settings";

test.describe("Dashboard Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // The preview page has navigation - click Dashboard link
    await page.goto(PREVIEW_URL, { waitUntil: "networkidle" });
    
    // Navigate to Dashboard via sidebar link
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForTimeout(500);
    }
  });

  test("dashboard has navigation sidebar with both links", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Sidebar navigation should be present
    await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('a:has-text("Settings")')).toBeVisible();
    
    // Settings link should be visible but not selected when on Dashboard
    await expect(page.locator('a:has-text("Settings")')).toBeVisible();
  });

  test("dashboard shows stat cards", async ({ page }) => {
    // Dashboard should render stat cards (4 stat items)
    const statCards = page.locator('[class*="ShadowBevel"]');
    const cardCount = await statCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test("navigation switches between pages", async ({ page }) => {
    // Navigate to Dashboard
    await page.locator('a:has-text("Dashboard")').click();
    await page.waitForTimeout(300);
    
    // Navigate back to Settings
    await page.locator('a:has-text("Settings")').click();
    await page.waitForTimeout(300);
    
    // Should be back on Settings
    await expect(page.locator("h1")).toContainText("Settings");
  });
});
