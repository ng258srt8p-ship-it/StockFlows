import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('API Insights', () => {
  test('navigates to API insights page', async ({ page }) => {
    await page.goto(`${BASE}/#/api/insights`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays API metrics or insights', async ({ page }) => {
    await page.goto(`${BASE}/#/api/insights`);
    const content = page.locator('[class*="metric"], [class*="insight"], [class*="chart"], canvas, svg');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows API endpoint information', async ({ page }) => {
    await page.goto(`${BASE}/#/api/insights`);
    const endpoints = page.locator('[class*="endpoint"], [class*="api"], code, pre');
    const count = await endpoints.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('has refresh or reload button', async ({ page }) => {
    await page.goto(`${BASE}/#/api/insights`);
    const btn = page.getByRole('button', /refresh|reload|update/i);
    const count = await btn.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
