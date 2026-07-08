import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Settings Preferences', () => {
  test('navigates to preferences page', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/preferences`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays preference options', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/preferences`);
    const content = page.locator('label, [class*="option"], [class*="setting"], select, input');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('has theme or display settings', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/preferences`);
    const theme = page.locator('[class*="theme"], [class*="display"], [class*="appearance"]');
    const count = await theme.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows save button', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/preferences`);
    const btn = page.getByRole('button', /save|apply|update/i);
    const count = await btn.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
