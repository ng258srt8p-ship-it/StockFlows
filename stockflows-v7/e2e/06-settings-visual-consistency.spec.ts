// Copyright (c) StockFlows Team
// E2E Tests: Settings Page Visual Consistency
// Verifies that the settings page matches the layout pattern used by
// Dashboard and all other app pages in the static explore.html demo.
import { test, expect } from "@playwright/test";

// Marketing pages (Cloudflare Pages deployment)
const MARKETING_BASE_URL = "https://stockflows.app";

test.describe("Settings Page Visual Consistency", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");
    // Navigate to settings via sidebar
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);
  });

  test("Settings page renders with correct title", async ({ page }) => {
    const settingsTitle = page.locator("#page-settings .polaris-page-title");
    await expect(settingsTitle).toHaveText("Settings");
  });

  test("Settings page title font family matches Polaris system sans-serif", async ({ page }) => {
    const settingsTitle = page.locator("#page-settings .polaris-page-title");
    const fontFamily = await settingsTitle.evaluate(
      (el) => getComputedStyle(el).fontFamily
    );
    // Should be system-ui or sans-serif (not serif)
    expect(fontFamily).toMatch(/system-ui|-apple-system|BlinkMacSystemFont|sans-serif/);
    expect(fontFamily).not.toMatch(/'Instrument Serif'|Georgia|Times New Roman/);
  });

  test("Settings page subtitle has correct text", async ({ page }) => {
    const settingsSubtitle = page.locator("#page-settings .polaris-page-subtitle");
    await expect(settingsSubtitle).toContainText("Manage alerts, thresholds, and preferences");
  });

  test("Settings page has multiple card sections", async ({ page }) => {
    const settingsCards = page.locator("#page-settings .polaris-card");
    const cardCount = await settingsCards.count();
    // Should have multiple cards (Notifications, Alert Thresholds, Forecasting, AI Features, General)
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });

  test("Settings page has checkboxes for toggle options", async ({ page }) => {
    const checkboxes = page.locator("#page-settings .polaris-checkbox");
    const checkboxCount = await checkboxes.count();
    // Should have toggles for Email, Slack, SMS, AI Insights, Forecast Explanations
    expect(checkboxCount).toBeGreaterThanOrEqual(5);
  });

  test("Settings page has text inputs for configuration", async ({ page }) => {
    const textInputs = page.locator("#page-settings .polaris-field-input");
    const inputCount = await textInputs.count();
    // Should have inputs for Slack webhook, phone numbers, thresholds, etc.
    expect(inputCount).toBeGreaterThanOrEqual(3);
  });

  test("Settings page save button is visible", async ({ page }) => {
    const saveButton = page.locator("#page-settings .polaris-btn-primary");
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toContainText("Save Settings");
  });

  test("Settings page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.waitForLoadState("networkidle");
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);

    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("Failed to load resource")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
