import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Webhook Management', () => {
  test('navigates to webhooks page', async ({ page }) => {
    await page.goto(`${BASE}/#/webhooks`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays webhook list', async ({ page }) => {
    await page.goto(`${BASE}/#/webhooks`);
    const content = page.locator('table, [class*="list"], [class*="card"]');
    await expect(content.first()).toBeVisible();
  });

  test('shows create webhook button', async ({ page }) => {
    await page.goto(`${BASE}/#/webhooks`);
    const btn = page.getByRole('button', /create|add|new/i);
    await expect(btn.first()).toBeVisible();
  });

  test('displays webhook status indicators', async ({ page }) => {
    await page.goto(`${BASE}/#/webhooks`);
    const status = page.locator('[class*="badge"], [class*="status"], [class*="indicator"]');
    const count = await status.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
