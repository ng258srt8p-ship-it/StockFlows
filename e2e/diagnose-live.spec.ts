import { test } from "@playwright/test";

test("diagnose live settings page", async ({ page }) => {
  await page.goto("https://stockflows.app/explore.html", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('a[data-page="settings"]');
  await page.waitForTimeout(1000);

  // Check body class
  const bodyClass = await page.evaluate(() => document.body.className);
  console.log('body class:', JSON.stringify(bodyClass));

  // Check content container computed styles
  const content = await page.evaluate(() => {
    const el = document.querySelector('.content');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      padding: cs.padding,
      bg: cs.backgroundColor,
      overflow: cs.overflow,
      display: cs.display,
      width: cs.width,
    };
  });
  console.log('.content computed:', JSON.stringify(content));

  // Check ios-settings computed
  const iosSettings = await page.evaluate(() => {
    const el = document.querySelector('.ios-settings');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      bg: cs.backgroundColor,
      padding: cs.padding,
      width: cs.width,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    };
  });
  console.log('.ios-settings computed:', JSON.stringify(iosSettings));

  // Check if the page-settings-active selector actually overrides content padding
  const overrideWorks = await page.evaluate(() => {
    const content = document.querySelector('.content');
    const hasBodyClass = document.body.classList.contains('page-settings-active');
    // Create a temporary element to test the selector
    const testDiv = document.createElement('div');
    document.body.appendChild(testDiv);
    document.body.classList.add('page-settings-active');
    const cs = getComputedStyle(content!);
    const paddingAfter = cs.padding;
    document.body.classList.remove('page-settings-active');
    document.body.removeChild(testDiv);
    return { hasBodyClass, paddingAfter };
  });
  console.log('override test:', JSON.stringify(overrideWorks));

  // Check the iOS section styling
  const iosSection = await page.evaluate(() => {
    const el = document.querySelector('.ios-section');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      bg: cs.backgroundColor,
      borderRadius: cs.borderRadius,
      margin: cs.margin,
      boxShadow: cs.boxShadow,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    };
  });
  console.log('.ios-section computed:', JSON.stringify(iosSection));

  // Check if ios-toggle-track is green (should be when checked)
  const iosTrack = await page.evaluate(() => {
    const tracks = document.querySelectorAll('.ios-toggle-track');
    return Array.from(tracks).map((el) => {
      const cs = getComputedStyle(el);
      return cs.backgroundColor;
    });
  });
  console.log('ios-toggle-track colors:', JSON.stringify(iosTrack));

  // Screenshot at 1440px
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "test-results/diagnose-live.png", fullPage: true });
});
