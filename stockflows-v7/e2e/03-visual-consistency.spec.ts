/**
 * Playwright E2E Tests: Visual Consistency
 *
 * Comprehensive visual regression tests for StockFlows app
 * Ensures visual consistency across desktop and mobile viewports,
 * validates element positions, styles, and layouts.
 */
import { test, expect } from "@playwright/test";

const MARKETING_BASE_URL = "https://stockflows.app";
const APP_BASE_URL = "https://stockflows.fly.dev";

async function captureViewport(page: any, name: string, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(1000);
  return await page.screenshot({ fullPage: true, type: "png" });
}

test.describe("Visual Consistency - Comprehensive Analysis", () => {
  test("Desktop viewport visual consistency - main navigation", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    
    // Verify sidebar navigation structure
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();
    
    // Verify all navigation items are present
    const navItems = ["Dashboard", "Inventory", "Purchasing", "Forecasting", "Reports", "Settings"];
    for (const item of navItems) {
      const navLink = sidebar.locator(`text="${item}"`);
      await expect(navLink).toBeVisible();
    }
    
    // Verify sidebar logo
    const logo = page.locator(".logo");
    await expect(logo).toBeVisible();
    
    // Verify main content area
    const content = page.locator(".content");
    await expect(content).toBeVisible();
  });

  test("Mobile viewport visual consistency - stack layout", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`, { waitUntil: "networkidle" });
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    
    // Verify mobile layout adaptations
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();
    
    // On mobile, navigation might be collapsible or scrollable
    const navLinks = page.locator(".sidebar nav a");
    const navCount = await navLinks.count();
    expect(navCount).toBeGreaterThanOrEqual(4); // At least 4 visible nav items
    
    // Verify content reflow for mobile
    const content = page.locator(".content");
    await expect(content).toBeVisible();
  });

  test("Visual regression - settings page desktop", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    
    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);
    
    // Capture desktop screenshot for visual comparison
    await expect(page).toHaveScreenshot("settings-desktop-1280.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("Visual regression - settings page mobile", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`, { waitUntil: "networkidle" });
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    
    // Navigate to settings
    await page.locator('.sidebar nav a[data-page="settings"]').click();
    await page.waitForTimeout(500);
    
    // Capture mobile screenshot for visual comparison
    await expect(page).toHaveScreenshot("settings-mobile-375.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test("Visual element presence and structure on explore.html", async ({ page }) => {
    await page.goto(`${MARKETING_BASE_URL}/explore.html`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    
    // Validate critical visual elements
    const visualElements = [
      { selector: ".sidebar", name: "Sidebar navigation" },
      { selector: ".logo", name: "StockFlows logo" },
      { selector: ".content", name: "Main content area" },
      { selector: "#modal", name: "Modal overlay" },
      { selector: "#toast", name: "Toast notification" },
    ];
    
    for (const element of visualElements) {
      const el = page.locator(element.selector);
      await expect(el).toBeAttached();
    }
    
    // Validate navigation count and structure
    const navLinks = page.locator(".sidebar nav a");
    const navCount = await navLinks.count();
    expect(navCount).toBe(6); // Dashboard, Inventory, Purchasing, Forecasting, Reports, Settings
    
    // Validate logo content
    const logoText = await page.locator(".logo").textContent();
    expect(logoText).toContain("StockFlows");
  });
});