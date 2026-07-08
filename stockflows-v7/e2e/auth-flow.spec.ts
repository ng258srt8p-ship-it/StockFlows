import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Auth Flow', () => {
  test('navigates to login page', async ({ page }) => {
    await page.goto(`${BASE}/#/auth/login`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays login form elements', async ({ page }) => {
    await page.goto(`${BASE}/#/auth/login`);
    const form = page.locator('form, [class*="form"], input, button');
    const count = await form.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('has email or username input', async ({ page }) => {
    await page.goto(`${BASE}/#/auth/login`);
    const input = page.getByRole('textbox', /email|username/i);
    const count = await input.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('has password input', async ({ page }) => {
    await page.goto(`${BASE}/#/auth/login`);
    const input = page.getByRole('textbox', /password/i);
    const count = await input.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('has submit or login button', async ({ page }) => {
    await page.goto(`${BASE}/#/auth/login`);
    const btn = page.getByRole('button', /log in|sign in|submit/i);
    await expect(btn.first()).toBeVisible();
  });
});
