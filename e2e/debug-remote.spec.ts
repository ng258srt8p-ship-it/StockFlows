import { test, expect } from '@playwright/test';

test('check live site health', async ({ page }) => {
  console.log('Visiting live URL...');
  const response = await page.goto('https://stockflows.fly.dev/app/inventory');
  console.log('Status:', response?.status());
  expect(response?.status()).toBe(200);
});
