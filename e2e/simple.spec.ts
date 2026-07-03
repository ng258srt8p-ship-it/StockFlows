import { test, expect } from '@playwright/test';

test('check if playwright is working', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
