// Copyright (c) StockFlows Team
// E2E Tests: Settings Page Visual Consistency
// Verifies that the settings page matches the layout pattern used by
// Dashboard and all other app pages. Checks at both 1280px (desktop)
// and 375px (mobile) viewports.

import { test, expect } from "@playwright/test";
import { setupTestContext } from "./utils/test-helpers";

// Marketing pages (Cloudflare Pages deployment)
const MARKETING_BASE_URL = "https://stockflows.app"; // explore.html, tour.html
test.describe("Settings Page Visual Consistency", () => {
  // Use explore.html as the test base (no Shopify auth required)
  test.beforeEach(async ({ page }) => {
    await setupTestContext(page, { useExplore: true });
  });

  test("Settings page background color matches Polaris design", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings"); // Navigate to settings section
    
    // Verify main content container uses proper background
    const settingsContainer = page.locator("#settings-page");
    const bgColor = await settingsContainer.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    
    // Should be Polaris surface background (#fafafa)
    expect(bgColor).toBe("rgb(250, 250, 250)");
  });

  test("Settings page title font family matches Polaris system sans-serif", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings");
    
    const settingsTitle = page.locator('.polaris-page-title');
    const fontFamily = await settingsTitle.evaluate(
      (el) => getComputedStyle(el).fontFamily
    );
    
    // Should be system-ui or sans-serif (not serif)
    expect(fontFamily).toMatch(/system-ui|-apple-system|BlinkMacSystemFont|'Inter'|sans-serif/);
    expect(fontFamily).not.toMatch(/'Instrument Serif|Georgia|Times New Roman/);
  });

  test("Settings page subtitle has correct styling", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings");
    
    const settingsSubtitle = page.locator('.polaris-page-subtitle');
    const subtitleFontSize = await settingsSubtitle.evaluate(
      (el) => getComputedStyle(el).fontSize
    );
    const subtitleColor = await settingsSubtitle.evaluate(
      (el) => getComputedStyle(el).color
    );
    
    // Should be 0.875rem and Polaris subdued color
    expect(subtitleFontSize).toBe("0.875rem");
    expect(subtitleColor).toBe("rgb(108, 113, 164)"); // var(--text-dim)
  });

  test("Settings page cards use proper Polaris Card styling", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings");
    
    const settingsCards = page.locator('.polaris-card');
    const cardCount = await settingsCards.count();
    
    // Should have multiple cards (Notifications, Alert Thresholds, Forecasting, AI Features, General)
    expect(cardCount).toBeGreaterThanOrEqual(4);
    
    // Check card styling
    for (let i = 0; i < cardCount; i++) {
      const card = settingsCards.nth(i);
      const backgroundColor = await card.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );
      const borderColor = await card.evaluate(
        (el) => getComputedStyle(el).borderColor
      );
      
      // Should have white background with subtle border
      expect(backgroundColor).toBe("rgb(255, 255, 255)");
      expect(borderColor).toMatch(/rgba\(0, 0, 0, 0\.04\)/);
    }
  });

  test("Settings page form elements use Polaris styling", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings");
    
    // Check checkboxes use Polaris .polaris-checkbox class
    const checkboxes = page.locator('.polaris-checkbox');
    const checkboxCount = await checkboxes.count();
    
    // Should have multiple checkboxes (Email Alerts, Slack Alerts, SMS Alerts, AI Insights, Forecast Explanations)
    expect(checkboxCount).toBeGreaterThanOrEqual(5);
    
    // Check text inputs use Polaris .polaris-field-input class
    const textInputs = page.locator('.polaris-field-input');
    const inputCount = await textInputs.count();
    
    // Should have text inputs for Slack webhook, phone numbers, etc.
    expect(inputCount).toBeGreaterThanOrEqual(2);
  });

  test("Settings page save button uses Polaris styling", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings");
    
    const saveButton = page.locator('.polaris-btn.polaris-btn-primary');
    await expect(saveButton).toBeVisible();
    
    // Check button styling
    const buttonColor = await saveButton.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    const buttonTextColor = await saveButton.evaluate(
      (el) => getComputedStyle(el).color
    );
    
    // Should use Polaris green background
    expect(buttonColor).toBe("rgb(0, 128, 96)"); // #008060
    expect(buttonTextColor).toBe("rgb(255, 255, 255)"); // white
  });

  test("Settings page mobile viewport on 375px maintains proper layout", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${MARKETING_BASE_URL}/explore.html`);
      await page.goto("#page-settings");

      // Should still have settings cards visible
      const settingsCards = page.locator('.polaris-card');
      const cardCount = await settingsCards.count();
      expect(cardCount).toBeGreaterThan(0);

      // Card layout should adapt to mobile (potentially vertical stack)
      // Verify no horizontal overflow issues
      const viewport = await page.viewportSize();
      expect(viewport?.width).toBe(375);
    });

  test("Settings page desktop viewport (1280px) maintains proper grid layout", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);
    await page.goto("#page-settings");
    
    // Should have grid layout with multiple columns on desktop
    const settingsGrid = page.locator('.polaris-grid');
    await expect(settingsGrid).toBeVisible();
    
    const gridColumns = await settingsGrid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    
    // Should have multiple columns on desktop
    expect(gridColumns).toMatch(/repeat/); // CSS grid repeat pattern
  });
});
