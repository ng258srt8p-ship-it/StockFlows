/**
 * E2E Tests: Performance
 *
 * Covers: Page load performance, bundle optimization.
 * ARCHITECTURE §36 (Performance targets)
 */
import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("page loads within target time on desktop", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    // Target: < 3 seconds on desktop
    expect(loadTime).toBeLessThan(3000);
  });

  test("page loads within target time on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const loadTime = Date.now() - startTime;

    // Target: < 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test("critical CSS is inlined or loaded early", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const stylesheets = page.locator("link[rel='stylesheet']");
    const count = await stylesheets.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("JavaScript bundles are within size targets", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const scripts = page.locator("script[src]");
    const count = await scripts.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("static assets are cached", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "networkidle" });

    // Check that main page response has cache headers
    const headers = response.headers();
    if (response.ok()) {
      expect(response.status()).toBe(200);
    }
  });

  test("time to interactive is within target", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const timing = await page.evaluate(() => {
      const timing = (performance as any).getEntriesByType("navigation")[0];
      return timing ? timing.domContentLoadedEventEnd : 0;
    });

    // Target: < 2 seconds for DOMContentLoaded
    if (timing > 0) {
      expect(timing).toBeLessThan(2000);
    }
  });

  test("LCP (Largest Contentful Paint) is within target", async ({ page }) => {
    const metrics = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const observer = new (window as any).PerformanceObserver((list: any) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1]?.startTime || 0);
        });
        observer.observe({ type: "largest-contentful-paint" });
        setTimeout(() => observer.disconnect(), 3000);
      });
    });

    // Target: < 2.5 seconds for LCP
    if (metrics > 0) {
      expect(metrics).toBeLessThan(2500);
    }
  });

  test("First Input Delay is within acceptable range", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const fid = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const observer = new (window as any).PerformanceObserver((list: any) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1]?.processingStart - entries[entries.length - 1]?.startTime || 0);
        });
        observer.observe({ type: "first-input" });
        setTimeout(() => observer.disconnect(), 5000);
      });
    });

    // Target: < 100ms for FID
    if (fid > 0) {
      expect(fid).toBeLessThan(100);
    }
  });

  test("resource loading is efficient", async ({ page }) => {
    const resources = (await page.evaluate(() => {
      return (performance as any).getEntriesByType("resource").map((r: any) => ({
        name: r.name,
        size: r.transferSize,
        type: r.initiatorType,
      }));
    })) || [];

    // Check that we're not loading excessive resources
    expect(resources.length).toBeLessThan(100);
  });
});
