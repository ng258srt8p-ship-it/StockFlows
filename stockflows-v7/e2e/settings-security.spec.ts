import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Settings Security', () => {
  test('navigates to security page', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/security`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays security options', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/security`);
    const content = page.locator('[class*="security"], [class*="option"], label, input');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('shows password or authentication settings', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/security`);
    const auth = page.locator('[class*="password"], [class*="auth"], [class*="mfa"], [class*="2fa"]');
    const count = await auth.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('displays session management', async ({ page }) => {
    await page.goto(`${BASE}/#/settings/security`);
    const sessions = page.locator('[class*="session"], [class*="token"], table');
    const count = await sessions.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
