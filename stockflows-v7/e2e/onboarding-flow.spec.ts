import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Onboarding Flow', () => {
  test('navigates to onboarding page', async ({ page }) => {
    await page.goto(`${BASE}/#/onboarding`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays onboarding hero section', async ({ page }) => {
    await page.goto(`${BASE}/#/onboarding`);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('shows setup steps or checklist', async ({ page }) => {
    await page.goto(`${BASE}/#/onboarding`);
    const steps = page.locator('[class*="step"], [class*="check"], li, [role="listitem"]');
    const count = await steps.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('has a get started or continue button', async ({ page }) => {
    await page.goto(`${BASE}/#/onboarding`);
    const btn = page.getByRole('button', /get started|continue|next|begin/i);
    await expect(btn.first()).toBeVisible();
  });

  test('navigates from onboarding to dashboard', async ({ page }) => {
    await page.goto(`${BASE}/#/onboarding`);
    const link = page.getByRole('link', { name: /dashboard/i });
    if (await link.count() > 0) {
      await link.first().click();
      await expect(page).toHaveURL(/dashboard/);
    }
  });
});
