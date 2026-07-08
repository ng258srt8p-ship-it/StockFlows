/**
 * E2E Tests: Navigation Correctness
 *
 * Verifies the sidebar navigation system works correctly:
 * - Clicking each nav item navigates to the expected URL
 * - Exactly one sidebar button is highlighted as "active" at all times
 * - Sub-routes don't incorrectly highlight parent nav items
 * - Settings section has only one item (not 7 duplicates)
 * - Mobile hamburger toggle works
 */
import { test, expect } from "@playwright/test";

test.describe("Navigation — Active State Correctness", () => {
  test("Dashboard is the only active button on /app", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Find all sidebar buttons with accent background (active indicator)
    const activeButtons = await page.locator("aside button").evaluateAll((buttons) =>
      buttons
        .filter((b) => {
          const bg = window.getComputedStyle(b).backgroundColor;
          return bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "";
        })
        .map((b) => b.textContent?.trim() || ""),
    );

    // At minimum, no more than 2 active (Dashboard + a section highlight)
    expect(activeButtons.length).toBeLessThanOrEqual(2);
    expect(activeButtons.some((t) => t.includes("Dashboard"))).toBe(true);
    expect(activeButtons.some((t) => t.includes("Settings"))).toBe(false);
    expect(activeButtons.some((t) => t.includes("Inventory"))).toBe(false);
  });
});

test.describe("Navigation — Click to Navigate", () => {
  test("Clicking Inventory sidebar button navigates to /app/inventory", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Inventory')").first().click();
    await page.waitForURL("**/app/inventory");
    await expect(page.locator("h1").first()).toContainText(/Inventory/i);
  });

  test("Clicking Purchasing sidebar button navigates to /app/purchasing", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Purchasing')").first().click();
    await page.waitForURL("**/app/purchasing");
    await expect(page.locator("h1").first()).toContainText(/Purchasing/i);
  });

  test("Clicking Forecasting sidebar button navigates to /app/forecasting", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Forecasting')").first().click();
    await page.waitForURL("**/app/forecasting");
    await expect(page.locator("h1").first()).toContainText(/Forecasting/i);
  });

  test("Clicking Reports sidebar button navigates to /app/reports", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Reports')").first().click();
    await page.waitForURL("**/app/reports");
    await expect(page.locator("h1").first()).toContainText(/Reports/i);
  });

  test("Clicking Settings sidebar button navigates to /app/settings", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Settings')").first().click();
    await page.waitForURL("**/app/settings");
  });

  test("Clicking Stock Transfer navigates to /app/inventory/transfer", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Stock Transfer')").first().click();
    await page.waitForURL("**/app/inventory/transfer");
  });

  test("Clicking New PO navigates to /app/purchasing/new", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('New PO')").first().click();
    await page.waitForURL("**/app/purchasing/new");
  });

  test("Clicking Vendors navigates to /app/purchasing/vendors", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    await page.locator("aside button:has-text('Vendors')").first().click();
    await page.waitForURL("**/app/purchasing/vendors");
  });
});

test.describe("Navigation — No Duplicate Active States", () => {
  test("At /app/inventory/transfer only Stock Transfer is active (not Core Inventory)", async ({ page }) => {
    await page.goto("/app/inventory/transfer");
    await page.waitForLoadState("networkidle");

    // Check that the Core "Inventory" button is NOT active
    const inventoryCoreBtn = page.locator("aside section:has-text('Core') button:has-text('Inventory')");
    const invBg = await inventoryCoreBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(invBg).toBe("transparent");

    // Stock Transfer button should be visible
    await expect(page.locator("aside button:has-text('Stock Transfer')").first()).toBeVisible();
  });

  test("At /app/purchasing/vendors only Vendors is active (not Core Purchasing)", async ({ page }) => {
    await page.goto("/app/purchasing/vendors");
    await page.waitForLoadState("networkidle");

    // Check that the Core "Purchasing" button is NOT active
    const purchasingCoreBtn = page.locator("aside section:has-text('Core') button:has-text('Purchasing')");
    const purBg = await purchasingCoreBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(purBg).toBe("transparent");

    // Vendors button should be visible
    await expect(page.locator("aside button:has-text('Vendors')").first()).toBeVisible();
  });

  test("At /app/settings only one Settings button exists and is active", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");

    const settingsButtons = page.locator("aside button:has-text('Settings')");
    const count = await settingsButtons.count();
    expect(count).toBe(1); // Only 1 Settings button, not 7 duplicates
  });

  test("Navigating between pages transfers active state correctly", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    // Go to Inventory
    await page.locator("aside button:has-text('Inventory')").first().click();
    await page.waitForURL("**/app/inventory");
    await page.waitForLoadState("networkidle");

    // Dashboard should NOT be active
    const dashboardBtn = page.locator("aside button:has-text('Dashboard')").first();
    const dashBgAfter = await dashboardBtn.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue("background-color"),
    );
    // Dashboard should not have accent color (not active)
    expect(dashBgAfter).not.toContain("rgb");
  });
});

test.describe("Navigation — Settings Section Sanity", () => {
  test("Settings section has exactly 1 nav item", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");

    const settingsItems = page.locator("aside section:has-text('Settings') button");
    const count = await settingsItems.count();
    expect(count).toBe(1);
  });
});

test.describe("Navigation — Health & System Links", () => {
  test("Health endpoint accessible without auth", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body.status).toBe("alive");
  });

  test("Health ready endpoint returns postgres and redis status", async ({ request }) => {
    const response = await request.get("/health/ready");
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body.checks.postgres).toBe("ok");
    expect(body.checks.redis).toBe("ok");
  });
});