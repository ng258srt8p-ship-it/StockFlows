import { test, expect } from '@playwright/test';

test('capture demo app rendering baseline', async ({ page }) => {
  // Desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5175');
  await page.waitForLoadState('networkidle');
  
  // Screenshot
  await page.screenshot({ path: 'e2e/investigation/demo-desktop.png', fullPage: true });
  
  // Measure key elements
  const sidebar = await page.locator('aside').first().boundingBox();
  const mainContent = await page.locator('main').first().boundingBox();
  const dashboard = await page.locator('main h1').first().boundingBox();
  
  console.log('=== DESKTOP MEASUREMENTS ===');
  console.log('Sidebar:', JSON.stringify(sidebar));
  console.log('Main Content:', JSON.stringify(mainContent));
  console.log('Dashboard Heading:', JSON.stringify(dashboard));
  
  // Check computed styles
  const bodyBg = await page.evaluate(() => {
    return getComputedStyle(document.body).backgroundColor;
  });
  console.log('Body background:', bodyBg);
  
  const sidebarBg = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? getComputedStyle(aside).backgroundColor : 'not found';
  });
  console.log('Sidebar background:', sidebarBg);
  
  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5175');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'e2e/investigation/demo-mobile.png', fullPage: true });
  
  // Verify elements exist
  await expect(page.locator('aside')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('main h1')).toContainText('Dashboard');
  
  console.log('=== VERIFICATION PASSED ===');
});
