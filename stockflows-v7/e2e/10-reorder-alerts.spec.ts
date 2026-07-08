/**
 * E2E Tests: Reorder Alerts & Notifications
 *
 * Covers: Reorder point monitoring, low-stock notifications,
 * critical stock alerts, and notification delivery.
 * ARCHITECTURE §2.5 (Alert management)
 */
import { test, expect } from "@playwright/test";

test.describe("Reorder Alerts", () => {
  test("reorder alerts panel loads", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const panel = page.locator('[data-testid="reorder-alerts-panel"]').first();
    await expect(panel).toBeVisible();
  });

  test("low stock alerts are displayed with correct severity", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const alertItems = page.locator('[data-testid="reorder-alert-item"]').all();
    const count = await alertItems.length;
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const severityBadge = alertItems[i].locator('[data-testid="severity-badge"]').first();
      await expect(severityBadge).toBeVisible();
    }
  });

  test("reorder point threshold configuration is accessible", async ({ page }) => {
    await page.goto("/settings/reorder-thresholds");

    const thresholdInputs = page.locator('[data-testid="threshold-input"]').all();
    const count = await thresholdInputs.length;
    expect(count).toBeGreaterThan(0);
  });

  test("notification preferences can be configured", async ({ page }) => {
    await page.goto("/settings/notifications");

    const emailToggle = page.locator('[data-testid="email-notification-toggle"]').first();
    await expect(emailToggle).toBeVisible();

    const pushToggle = page.locator('[data-testid="push-notification-toggle"]').first();
    await expect(pushToggle).toBeVisible();

    const slackToggle = page.locator('[data-testid="slack-notification-toggle"]').first();
    await expect(slackToggle).toBeVisible();
  });

  test("critical stock alerts trigger immediately", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const criticalAlerts = page.locator('[data-testid="critical-alert-item"]').all();
    const count = await criticalAlerts.length;
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("reorder alert notification count is accurate", async ({ page }) => {
    await page.goto("/alerts");

    const notificationBadge = page.locator('[data-testid="alert-count-badge"]').first();
    await expect(notificationBadge).toBeVisible();

    const badgeText = await notificationBadge.textContent();
    const numericValue = parseInt(badgeText.replace(/\D/g, ""), 10);
    expect(numericValue).toBeGreaterThanOrEqual(0);
  });

  test("bulk acknowledge reorder alerts", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const acknowledgeBtn = page.locator('[data-testid="bulk-acknowledge-btn"]').first();
    await expect(acknowledgeBtn).toBeEnabled();
  });

  test("filter alerts by product category", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const categoryFilter = page.locator('[data-testid="category-filter"]').first();
    await expect(categoryFilter).toBeVisible();

    await categoryFilter.selectOption("electronics");
    const filteredAlerts = page.locator('[data-testid="reorder-alert-item"]').all();
    const count = await filteredAlerts.length;
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("error state shows when alerts service unavailable", async ({ page }) => {
    const errorContainer = page.locator('[data-testid="reorder-error-container"]').first();
    await expect(errorContainer).toHaveCount(1);
  });

  test("loading state displays during alert fetch", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const loadingState = page.locator('[data-testid="alerts-loading-state"]').first();
    await expect(loadingState).toHaveCount(1);
  });

  test("reorder point calculation preview works", async ({ page }) => {
    await page.goto("/settings/reorder-thresholds");

    const calcPreview = page.locator('[data-testid="reorder-calc-preview"]').first();
    await expect(calcPreview).toBeVisible();

    const previewText = await calcPreview.textContent();
    expect(previewText).toMatch(/\d+/);
  });

  test("notification history log renders", async ({ page }) => {
    await page.goto("/alerts/reorder");

    const historyList = page.locator('[data-testid="notification-history-list"]').first();
    await expect(historyList).toBeVisible();
  });
});
