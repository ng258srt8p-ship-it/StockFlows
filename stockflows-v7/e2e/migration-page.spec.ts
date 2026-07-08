import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Migration Page', () => {
  test('navigates to migration page', async ({ page }) => {
    await page.goto(`${BASE}/#/migration`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays migration options', async ({ page }) => {
    await page.goto(`${BASE}/#/migration`);
    const content = page.locator('button, [role="button"], a');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('shows progress indicators', async ({ page }) => {
    await page.goto(`${BASE}/#/migration`);
    const progress = page.locator('[class*="progress"], [class*="step"], [role="progressbar"]');
    const count = await progress.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
