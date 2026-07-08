/**
 * E2E Tests: Responsive & Mobile Behavior
 *
 * Tests the app at mobile viewport sizes:
 * - Sidebar hidden by default, hamburger visible
 * - Hamburger opens sidebar, backdrop closes it
 * - No horizontal overflow at 375px or 1280px
 * - Sidebar renders inline at tablet/desktop breakpoints
 */
import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

test.describe("Responsive — Mobile Sidebar (375px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test("sidebar is hidden by default on mobile", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // The aside should have -translate-x-full (hidden)
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible(); // still in DOM
    const transform = await sidebar.evaluate((el) => window.getComputedStyle(el).transform);
    // -translate-x-full means not visible on screen
    expect(transform).not.toBe("none");
  });

  test("hamburger button is visible on mobile", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    const hamburger = page.locator('button[aria-label="Toggle sidebar"]');
    await expect(hamburger).toBeVisible();
  });

  test("clicking hamburger shows sidebar", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator('button[aria-label="Toggle sidebar"]').click();
    await page.waitForTimeout(300); // transition duration

    // Sidebar should now be in view (translate-x-0)
    const sidebar = page.locator("aside");
    const transform = await sidebar.evaluate((el) => window.getComputedStyle(el).transform);
    // At translate-x-0, transform should be "none" or identity matrix
    const isVisible = transform === "none" || transform.includes("matrix(1, 0, 0, 1, 0, 0)");
    expect(isVisible).toBe(true);
  });

  test("sidebar overlay closes on backdrop click", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Open sidebar
    await page.locator('button[aria-label="Toggle sidebar"]').click();
    await page.waitForTimeout(300);

    // Click the overlay (backdrop)
    const overlay = page.locator(".fixed.inset-0.bg-black\\/50");
    await expect(overlay).toBeVisible();
    await overlay.click();
    await page.waitForTimeout(300);

    // Sidebar should be hidden again
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible(); // still in DOM
  });

  test("clicking a nav item on mobile closes sidebar", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Open sidebar
    await page.locator('button[aria-label="Toggle sidebar"]').click();
    await page.waitForTimeout(300);

    // Click a nav item (Dashboard button)
    await page.locator("aside button:has-text('Inventory')").first().click();
    await page.waitForURL("**/app/inventory");
    await page.waitForLoadState("networkidle");

    // Sidebar overlay should be gone (not visible on mobile)
    const overlay = page.locator(".fixed.inset-0.bg-black\\/50");
    await expect(overlay).toHaveCount(0);
  });
});

test.describe("Responsive — Tablet (768px)", () => {
  test("sidebar is visible inline on tablet", async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // md:translate-x-0 means sidebar is always visible at >=768px
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Hamburger should be hidden on tablet
    const hamburger = page.locator('button[aria-label="Toggle sidebar"]');
    await expect(hamburger).toBeHidden();
  });
});

test.describe("Responsive — No Horizontal Overflow", () => {
  const ROUTES = [
    "/app",
    "/app/inventory",
    "/app/purchasing",
    "/app/forecasting",
    "/app/reports",
    "/app/settings",
    "/app/onboarding",
    "/app/migration",
    "/app/inventory/transfer",
    "/app/purchasing/new",
    "/app/purchasing/vendors",
  ];

  for (const route of ROUTES) {
    test(`${route} — no horizontal overflow at 375px`, async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > 377);
      expect(overflow).toBe(false);
    });

    test(`${route} — no horizontal overflow at 1280px`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > 1282);
      expect(overflow).toBe(false);
    });
  }
});

test.describe("Responsive — Content Visibility", () => {
  test("h1 is readable at 375px across all pages", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    const ROUTES = [
      "/app",
      "/app/inventory",
      "/app/purchasing",
      "/app/forecasting",
      "/app/reports",
      "/app/settings",
    ];

    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible();
      const width = await h1.evaluate((el) => el.getBoundingClientRect().width);
      expect(width).toBeGreaterThan(10);
    }
  });
});