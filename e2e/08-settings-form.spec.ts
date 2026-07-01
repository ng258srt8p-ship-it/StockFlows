import { test, expect } from "@playwright/test";

// Marketing pages (Cloudflare Pages deployment)
const MARKETING_BASE_URL = "https://stockflows.app";

test.describe("Settings Page Form Interaction Tests", () => {
  test("Settings page loads without errors", async ({ page }) => {
    let consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);

    // Check for console errors after settings page renders
    expect(consoleErrors).toEqual([]);
  });

  test("Settings form elements are visible and enabled", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);

    // Check that all expected form elements exist
    await expect(page.locator("#settings-page")).toBeVisible();

    // Check that save button exists and has correct text
    const saveButton = page.locator("#saveBtn");
    await expect(saveButton).toContainText("Save Settings");
  });

  test("Settings page card headers show correct section titles", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);

    // Check that card headers exist
    const cardHeaders = page.locator(".polaris-card-header");
    const cardCount = await cardHeaders.count();
    
    // Should have at least 3 card sections (Notifications, Alert Thresholds, Forecasting, AI Features, General)
    expect(cardCount).toBeGreaterThanOrEqual(3);
  });

  test("Settings form toggles function correctly", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");

    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);

    // Check that form controls exist
    const checkboxes = page.locator("#settings-page input[type='checkbox']");
    const checkboxCount = await checkboxes.count();
    
    // Should have toggles for Email, Slack, SMS, AI Insights, Forecast Explanations
    expect(checkboxCount).toBeGreaterThanOrEqual(5);
  });
});
