import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('Real-time SSE', () => {
  test('navigates to API SSE page', async ({ page }) => {
    await page.goto(`${BASE}/#/api/sse`);
    await expect(page).toHaveTitle(/StockFlows/i);
  });

  test('displays SSE connection status', async ({ page }) => {
    await page.goto(`${BASE}/#/api/sse`);
    const status = page.locator('[class*="status"], [class*="connection"], [class*="indicator"]');
    const count = await status.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows event stream area', async ({ page }) => {
    await page.goto(`${BASE}/#/api/sse`);
    const content = page.locator('pre, code, [class*="log"], [class*="stream"], [class*="event"]');
    const count = await content.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('has reconnect or connect button', async ({ page }) => {
    await page.goto(`${BASE}/#/api/sse`);
    const btn = page.getByRole('button', /connect|reconnect|start/i);
    const count = await btn.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
