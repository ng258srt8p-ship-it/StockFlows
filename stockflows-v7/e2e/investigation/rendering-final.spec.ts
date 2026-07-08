import { test, expect } from '@playwright/test';

test('verify demo app renders correctly - desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5175');
  await page.waitForLoadState('networkidle');
  
  // Screenshot
  await page.screenshot({ path: 'e2e/investigation/demo-desktop-final.png', fullPage: true });
  
  // Verify layout
  const sidebar = await page.locator('aside').first().boundingBox();
  const mainContent = await page.locator('main').first().boundingBox();
  
  console.log('=== FINAL DESKTOP MEASUREMENTS ===');
  console.log('Sidebar:', JSON.stringify(sidebar));
  console.log('Main Content:', JSON.stringify(mainContent));
  
  // Verify sidebar is on the left
  expect(sidebar?.x).toBe(0);
  expect(sidebar?.width).toBe(240);
  
  // Verify main content is to the right
  expect(mainContent?.x).toBe(240);
  expect(mainContent?.width).toBe(1040);
  
  console.log('=== DESKTOP VERIFICATION PASSED ===');
});

test('verify demo app renders correctly - mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5175');
  await page.waitForLoadState('networkidle');
  
  // Screenshot
  await page.screenshot({ path: 'e2e/investigation/demo-mobile-final.png', fullPage: true });
  
  // Verify elements exist
  await expect(page.locator('aside')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('main h1')).toContainText('Dashboard');
  
  console.log('=== MOBILE VERIFICATION PASSED ===');
});
