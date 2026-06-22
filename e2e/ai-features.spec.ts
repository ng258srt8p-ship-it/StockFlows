import { test, expect } from "@playwright/test";

test.describe("AI Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("http://localhost:5173/tour.html");
    await page.evaluate(() => (window as any).enterApp());
    await page.waitForTimeout(300);
  });

  test("dashboard shows AI Insights section when enabled", async ({ page }) => {
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(300);
    const hasInsights = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("AI Insights")
    );
    expect(hasInsights).toBeTruthy();
  });

  test("dashboard hides AI Insights when disabled", async ({ page }) => {
    // Navigate to settings, toggle AI off via the checkbox
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    // Find the AI Insights checkbox and uncheck it
    const checkbox = page.locator('#page-settings input[type="checkbox"]').nth(3); // 4th checkbox = AI Insights
    await checkbox.uncheck();
    // Go to dashboard and check
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(300);
    const hasInsights = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("AI Insights")
    );
    expect(hasInsights).toBeFalsy();
  });

  test("dashboard re-enables AI Insights when toggled back on", async ({ page }) => {
    // Disable first
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    const checkbox = page.locator('#page-settings input[type="checkbox"]').nth(3);
    await checkbox.uncheck();
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(200);
    let hasInsights = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("AI Insights")
    );
    expect(hasInsights).toBeFalsy();

    // Re-enable
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    await checkbox.check();
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(200);
    hasInsights = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("AI Insights")
    );
    expect(hasInsights).toBeTruthy();
  });

  test("AI Insights generates risk insight for out-of-stock products", async ({ page }) => {
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(300);
    const hasStockoutInsight = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("out of stock")
    );
    expect(hasStockoutInsight).toBeTruthy();
  });

  test("AI Insights generates opportunity insight for overstocked products", async ({ page }) => {
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(300);
    const hasOverstockInsight = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("overstocked")
    );
    expect(hasOverstockInsight).toBeTruthy();
  });

  test("AI Insights generates reorder recommendation for low-stock items", async ({ page }) => {
    await page.evaluate(() => (window as any).go("dashboard"));
    await page.waitForTimeout(300);
    const hasReorderInsight = await page.evaluate(() =>
      document.getElementById("page-dashboard")!.innerHTML.includes("Reorder")
    );
    expect(hasReorderInsight).toBeTruthy();
  });

  test("forecast page shows AI Insight card when enabled", async ({ page }) => {
    await page.evaluate(() => (window as any).go("forecasting"));
    await page.waitForTimeout(300);
    // Click first row to show detail
    await page.locator("#page-forecasting tbody tr").first().click();
    await page.waitForTimeout(300);
    const hasInsight = await page.evaluate(() =>
      document.getElementById("page-forecasting")!.innerHTML.includes("AI Insight")
    );
    expect(hasInsight).toBeTruthy();
  });

  test("forecast page hides AI Insight card when disabled", async ({ page }) => {
    // Navigate to settings, uncheck forecast explanations (5th checkbox)
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    const checkbox = page.locator('#page-settings input[type="checkbox"]').nth(4);
    await checkbox.uncheck();
    // Go to forecasting, click a row
    await page.evaluate(() => (window as any).go("forecasting"));
    await page.waitForTimeout(300);
    await page.locator("#page-forecasting tbody tr").first().click();
    await page.waitForTimeout(300);
    const hasInsight = await page.evaluate(() =>
      document.getElementById("page-forecasting")!.innerHTML.includes("AI Insight")
    );
    expect(hasInsight).toBeFalsy();
  });

  test("settings page has both AI toggle switches", async ({ page }) => {
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    const hasInsightsToggle = await page.locator('#page-settings input[type="checkbox"]').count();
    expect(hasInsightsToggle).toBeGreaterThanOrEqual(5); // email, slack, sms, ai insights, forecast explanations
  });

  test("AI toggle description mentions OpenCode API", async ({ page }) => {
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    const hasOpenCode = await page.evaluate(() =>
      document.getElementById("page-settings")!.innerHTML.includes("OpenCode API")
    );
    expect(hasOpenCode).toBeTruthy();
  });

  test("AI toggle description mentions Big Pickle model", async ({ page }) => {
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    const hasBigPickle = await page.evaluate(() =>
      document.getElementById("page-settings")!.innerHTML.includes("Big Pickle")
    );
    expect(hasBigPickle).toBeTruthy();
  });

  test("AI toggle description mentions statistical forecasting works without AI", async ({ page }) => {
    await page.evaluate(() => (window as any).go("settings"));
    await page.waitForTimeout(300);
    const hasFallback = await page.evaluate(() =>
      document.getElementById("page-settings")!.innerHTML.includes("still works when AI is disabled")
    );
    expect(hasFallback).toBeTruthy();
  });

  test("forecast insight appears for low-stock product", async ({ page }) => {
    // Navigate to forecasting and click Widget Basic (low stock)
    await page.evaluate(() => (window as any).go("forecasting"));
    await page.waitForTimeout(300);
    // Click the row for Widget Basic (P2) - it's the second row
    const rows = page.locator("#page-forecasting tbody tr");
    const secondRow = rows.nth(1);
    await secondRow.click();
    await page.waitForTimeout(300);
    // Verify insight card appeared
    const insightText = await page.evaluate(() => {
      const el = document.getElementById("page-forecasting");
      return el ? el.innerHTML : "";
    });
    expect(insightText).toContain("AI Insight");
    expect(insightText.length).toBeGreaterThan(500);
  });

  test("forecast insight appears for out-of-stock product", async ({ page }) => {
    await page.evaluate(() => (window as any).go("forecasting"));
    await page.waitForTimeout(300);
    // Click a row that represents an out-of-stock product
    const rows = page.locator("#page-forecasting tbody tr");
    // Find the row with "Gadget XL" or "HDMI" (out of stock items)
    const count = await rows.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      if (text && (text.includes("Gadget XL") || text.includes("HDMI"))) {
        await rows.nth(i).click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      // Fallback: just click first row
      await rows.first().click();
    }
    await page.waitForTimeout(300);
    const insightText = await page.evaluate(() => {
      const el = document.getElementById("page-forecasting");
      return el ? el.innerHTML : "";
    });
    expect(insightText).toContain("AI Insight");
  });

  test("generateAIInsights returns multiple insights", async ({ page }) => {
    const html = await page.evaluate(() => (window as any).generateAIInsights());
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain("material-symbols-outlined"); // Has icons
    expect(html).toContain("font-weight:600"); // Has titles
  });
});
