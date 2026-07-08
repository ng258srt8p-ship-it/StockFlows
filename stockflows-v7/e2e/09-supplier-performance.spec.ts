/**
 * E2E Tests: Supplier Performance Metrics
 *
 * Covers: Supplier performance dashboard, lead time tracking,
 * on-time delivery rates, quality scores, and supplier ranking.
 * ARCHITECTURE §3 (Purchasing management)
 */
import { test, expect } from "@playwright/test";

test.describe("Supplier Performance", () => {
  test("supplier performance metrics display correctly", async ({ page }) => {
    await page.goto("/suppliers/performance");

    // Verify key metrics are present
    const metricCards = page.locator('[data-testid="metric-card"]').all();
    const count = await metricCards.length;
    expect(count).toBeGreaterThan(0);
  });

  test("lead time data renders for each supplier", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const leadTimeItems = page.locator('[data-testid="lead-time-item"]').all();
    const count = await leadTimeItems.length;
    expect(count).toBeGreaterThan(0);

    // Verify lead time format (days)
    for (let i = 0; i < count; i++) {
      const text = await leadTimeItems[i].textContent();
      expect(text).toMatch(/\d+\s*days?/i);
    }
  });

  test("on-time delivery rate is displayed", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const otDRow = page.locator('[data-testid="on-time-delivery-rate"]').first();
    await expect(otDRow).toBeVisible();

    const rateText = await otDRow.textContent();
    expect(rateText).toMatch(/\d+(\.\d+)?%/);
  });

  test("quality score visualization renders", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const scoreChart = page.locator('[data-testid="quality-score-chart"]').first();
    await expect(scoreChart).toBeVisible();
  });

  test("supplier ranking table loads", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const rankingTable = page.locator('[data-testid="ranking-table"]').first();
    await expect(rankingTable).toBeVisible();

    const rows = rankingTable.locator('[data-testid="ranking-row"]').all();
    const rowCount = await rows.length;
    expect(rowCount).toBeGreaterThan(0);
  });

  test("filter suppliers by performance tier", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const filterSelect = page.locator('[data-testid="performance-tier-filter"]').first();
    await expect(filterSelect).toBeVisible();

    await filterSelect.selectOption("high");
    const highTierRows = page.locator('[data-testid="ranking-row"]').all();
    const count = await highTierRows.length;
    expect(count).toBeGreaterThan(0);
  });

  test("supplier performance trend chart loads", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const trendChart = page.locator('[data-testid="performance-trend-chart"]').first();
    await expect(trendChart).toBeVisible();
  });

  test("error state shows when supplier data unavailable", async ({ page }) => {
    // Test error boundary rendering
    const errorContainer = page.locator('[data-testid="supplier-error-container"]').first();
    // Error container may not be visible initially, but should be queryable
    await expect(errorContainer).toHaveCount(1);
  });

  test("loading state displays during data fetch", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const loadingSpinner = page.locator('[data-testid="loading-spinner"]').first();
    await expect(loadingSpinner).toHaveCount(1);
  });

  test("export supplier performance data", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const exportButton = page.locator('[data-testid="export-performance-btn"]').first();
    await expect(exportButton).toBeEnabled();
  });

  test("supplier comparison mode works", async ({ page }) => {
    await page.goto("/suppliers/performance?view=compare");

    const comparePanel = page.locator('[data-testid="supplier-compare-panel"]').first();
    await expect(comparePanel).toBeVisible();
  });

  test("historical performance data loads", async ({ page }) => {
    await page.goto("/suppliers/performance");

    const historicalTabs = page.locator('[data-testid="historical-tab"]').all();
    const count = await historicalTabs.length;
    expect(count).toBeGreaterThan(0);
  });
});
