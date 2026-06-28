import { test, expect } from "@playwright/test";

test.describe("Settings Page — Polaris Design System", () => {
  /* ── Desktop (1280px) ── */

  test("Desktop: all sections visible with Polaris components", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Page title rendered by Polaris Page component
    const header = page.locator("h1");
    await expect(header).toContainText("Settings");

    // All 5 section cards present (Polaris Card renders as article or div)
    await expect(page.locator("text=Notifications").first()).toBeVisible();
    await expect(page.locator("text=Alert Thresholds").first()).toBeVisible();
    await expect(page.locator("text=Forecasting").first()).toBeVisible();
    await expect(page.locator("text=AI Features").first()).toBeVisible();
    await expect(page.locator("text=General").first()).toBeVisible();

    // Save button present
    const saveBtn = page.locator('button:has-text("Save Settings")');
    await expect(saveBtn).toBeVisible();
  });

  test("Desktop: Polaris Toggle renders as switch role", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Polaris Toggle renders a button with role="switch"
    const emailToggle = page.getByRole("switch", { name: "Email Alerts" });
    await expect(emailToggle).toBeVisible({ timeout: 10000 });
  });

  test("Desktop: number inputs accept values and form submits", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const lowStockInput = page.locator('input[name="lowStockThreshold"]');
    await lowStockInput.fill("25");

    const saveBtn = page.locator('button:has-text("Save Settings")');
    await saveBtn.click();

    // Success banner appears
    const banner = page.locator(".Polaris-Banner");
    await expect(banner).toContainText("Settings saved successfully", { timeout: 10000 });
  });

  /* ── Mobile (375px) ── */

  test("Mobile: responsive layout renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const header = page.locator("h1");
    await expect(header).toContainText("Settings");

    // Cards stack vertically on mobile
    await expect(page.locator("text=Notifications").first()).toBeVisible();

    // Save button visible
    const saveBtn = page.locator('button:has-text("Save Settings")');
    await expect(saveBtn).toBeVisible();
  });

  test("Mobile: form submission works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const saveBtn = page.locator('button:has-text("Save Settings")');
    await saveBtn.click();

    const banner = page.locator(".Polaris-Banner");
    await expect(banner).toContainText("Settings saved successfully", { timeout: 10000 });
  });
});
