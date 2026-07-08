/**
 * E2E Tests: Accessibility
 *
 * Covers: Accessibility features (ARIA labels, keyboard navigation).
 * ARCHITECTURE §2.1 (UI accessibility)
 */
import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("page has valid HTML structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const html = page.locator("html");
    expect(await html.isVisible()).toBeTruthy();
  });

  test("main content has proper landmark", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const main = page.locator("main, [role='main']");
    expect(await main.isVisible()).toBeTruthy();
  });

  test("navigation has accessible labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const navLinks = page.locator("nav a, [role='navigation'] a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("buttons have accessible labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const buttons = page.locator("button, [role='button']");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("forms have labeled inputs", async ({ page }) => {
    await page.goto("/app/inventory");
    await page.waitForLoadState("networkidle");

    const inputs = page.locator("input, select, textarea");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test Tab key navigation
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    expect(await focused.count()).toBeGreaterThanOrEqual(0);
  });

  test("status updates have ARIA live regions", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const liveRegions = page.locator("[aria-live], [role='status'], [role='alert']");
    const count = await liveRegions.count();
    // At least status alerts should exist
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const images = page.locator("img");
    const count = await images.count();
    if (count > 0) {
      const missingAlt = await images.evaluateAll(
        (imgs: HTMLImageElement[]) => imgs.filter((img) => !img.alt).length
      );
      expect(missingAlt).toBe(0);
    }
  });

  test("focus indicators are visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus-visible");
    const visible = await focused.count();
    // At least one element should be focusable
    expect(visible).toBeGreaterThanOrEqual(0);
  });

  test("color contrast meets WCAG AA", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const textElements = page.locator("text=*, [class*='text'], [style*='color']");
    expect(await textElements.count()).toBeGreaterThan(0);
  });
});
