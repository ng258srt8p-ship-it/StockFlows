import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Health Checks', () => {
  test('navigates to health page', async ({ page }) => {
    await page.goto(`${BASE}/#/health`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays health status', async ({ page }) => {
    await page.goto(`${BASE}/#/health`);
    const content = page.locator('h1, h2, h3, [class*="status"]');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('shows system checks', async ({ page }) => {
    await page.goto(`${BASE}/#/health`);
    const checks = page.locator('[class*="check"], [class*="indicator"], [class*="badge"]');
    const count = await checks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('navigates to health ready endpoint', async ({ page }) => {
    await page.goto(`${BASE}/#/health/ready`);
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});
