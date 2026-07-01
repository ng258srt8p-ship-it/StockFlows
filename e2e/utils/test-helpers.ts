// StockFlows E2E Tests
// Comprehensive test suite for Settings page validation

import { test, expect } from "@playwright/test";

// Marketing pages (Cloudflare Pages deployment)
const MARKETING_BASE_URL = "https://stockflows.app"; // explore.html, tour.html

/**
 * Setup test context for StockFlows E2E tests
 * @param page - Playwright page object
 * @param options - Test configuration options
 */
export async function setupTestContext(page: any, options?: { useExplore?: boolean }) {
  const isExplorePage = options?.useExplore || false;

  // Navigate to the appropriate page based on test requirements
  if (isExplorePage) {
    // Use explore.html which doesn't require Shopify auth
    await page.goto(`${MARKETING_BASE_URL}/explore.html`);

    // Wait for the page to fully load and initialize
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#page-settings", { timeout: 10000 });
  } else {
    // For app routes, we'll rely on the test to handle auth requirements
    await page.goto("https://stockflows.app");
  }
}

/**
 * Get CSS variable value from element
 */
export async function getCSSVariable(element: any, variable: string): Promise<string> {
  return await element.evaluate((el: any, varName: string) => {
    return getComputedStyle(el).getPropertyValue(varName);
  }, variable);
}
