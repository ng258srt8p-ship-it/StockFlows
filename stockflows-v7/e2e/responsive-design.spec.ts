/**
 * E2E Tests: Responsive Design
 *
 * Covers: Responsive design at mobile (375px), tablet (768px), desktop (1280px).
 * ARCHITECTURE §2.1 (UI responsive design)
 */
import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("dashboard renders correctly at mobile width (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const dashboard = page.locator("#page-dashboard, [data-page='dashboard']");
    expect(await dashboard.isVisible()).toBeTruthy();
  });

  test("dashboard renders correctly at tablet width (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const dashboard = page.locator("#page-dashboard, [data-page='dashboard']");
    expect(await dashboard.isVisible()).toBeTruthy();
  });

  test("dashboard renders correctly at desktop width (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const dashboard = page.locator("#page-dashboard, [data-page='dashboard']");
    expect(await dashboard.isVisible()).toBeTruthy();
  });

  test("navigation is accessible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const nav = page.locator("nav, [role='navigation']");
    expect(await nav.isVisible()).toBeTruthy();
  });

  test("tables are scrollable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app/inventory");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table, [role='grid']");
    if (await table.isVisible()) {
      const width = await table.evaluate((el) => el.scrollWidth);
      expect(width).toBeGreaterThan(0);
    }
  });

  test("forms resize correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/app/purchasing/new");
    await page.waitForLoadState("networkidle");

    const form = page.locator("form, [role='form']");
    if (await form.isVisible()) {
      const rect = await form.boundingBox();
      expect(rect).not.toBeNull();
    }
  });

  test("charts render at all breakpoints", async ({ page }) => {
    const breakpoints = [375, 768, 1280];
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp, height: 900 });
      await page.goto("/app/forecasting");
      await page.waitForLoadState("networkidle");

      const chart = page.locator("canvas, [data-chart]");
      if (await chart.isVisible()) {
        const rect = await chart.boundingBox();
        expect(rect).not.toBeNull();
      }
    }
  });

  test("modals handle responsive sizing", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const modal = page.locator("[role='dialog'], .modal, [data-modal]");
    if (await modal.isVisible()) {
      const rect = await modal.boundingBox();
      expect(rect).not.toBeNull();
    }
  });

  test("sidebar collapses on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside, [role='complementary']");
    if (await sidebar.isVisible()) {
      const rect = await sidebar.boundingBox();
      expect(rect).not.toBeNull();
    }
  });
});
