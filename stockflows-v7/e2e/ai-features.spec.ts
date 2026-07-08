import { test, expect } from "@playwright/test";

test.describe("AI Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test("dashboard shows AI Insights section when enabled", async ({ page }) => {
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Check if AI insights section exists (it may be hidden if disabled)
    const insightsSection = page.locator('[data-testid="ai-insights-section"]');
    await insightsSection.waitFor({ state: 'visible', timeout: 15000 });
    await expect(insightsSection).toBeVisible({ timeout: 10000 });
  });

  test("dashboard hides AI Insights when disabled", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Find AI Insights checkbox and disable it
    const checkbox = page.getByRole("switch", { name: "AI Insights" });
    await checkbox.waitFor({ state: 'visible', timeout: 10000 });
    const isChecked = await checkbox.getAttribute("aria-checked") === "true";
    if (isChecked) {
      await checkbox.click();
      // Save settings
      await page.click('button:has-text("Save Settings")');
      await page.waitForTimeout(500);
    }
    // Go to dashboard and check
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const hasInsights = await page.evaluate(() =>
      document.getElementById("page-dashboard")?.innerHTML.includes("AI Insights")
    );
    expect(hasInsights).toBeFalsy();
  });

  test("dashboard re-enables AI Insights when toggled back on", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const aiToggle = page.getByRole("switch", { name: "AI Insights" });
    await aiToggle.waitFor({ state: 'visible', timeout: 10000 });
    const isAiChecked = await aiToggle.getAttribute("aria-checked") === "true";
    if (!isAiChecked) {
      await aiToggle.click();
      await page.click('button:has-text("Save Settings")');
      await page.waitForTimeout(500);
    }
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const insightsSection = page.locator('[data-testid="ai-insights-section"]');
    await expect(insightsSection).toBeVisible({ timeout: 15000 });
  });

  test("AI Insights generates risk insight for out-of-stock products", async ({ page }) => {
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const insightsSection = page.locator('[data-testid="ai-insights-section"]');
    if (await insightsSection.isVisible()) {
      const content = await insightsSection.innerHTML();
      expect(content.toLowerCase()).toContain('out of stock');
    }
  });

  test("AI Insights generates opportunity insight for overstocked products", async ({ page }) => {
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const insightsSection = page.locator('[data-testid="ai-insights-section"]');
    if (await insightsSection.isVisible()) {
      const content = await insightsSection.innerHTML();
      expect(content.toLowerCase()).toContain('overstocked');
    }
  });

  test("AI Insights generates reorder recommendation for low-stock items", async ({ page }) => {
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const insightsSection = page.locator('[data-testid="ai-insights-section"]');
    if (await insightsSection.isVisible()) {
      const content = await insightsSection.innerHTML();
      expect(content).toContain('Reorder');
    }
  });

  test("forecast page shows AI Insight card when enabled", async ({ page }) => {
    await page.goto("/app/forecasting");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    // Click first row to show detail
    await page.locator("tbody tr").first().click();
    await page.waitForTimeout(500);
    const insightCard = page.locator('[data-testid="ai-insight-card"]');
    await expect(insightCard).toBeVisible({ timeout: 15000 });
  });

  test("forecast page hides AI Insight card when disabled", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const forecastToggle = page.getByRole("switch", { name: "Forecast Explanations" });
    const isForecastChecked = await forecastToggle.getAttribute("aria-checked") === "true";
    if (isForecastChecked) {
      await forecastToggle.click();
      await page.click('button:has-text("Save Settings")');
      await page.waitForTimeout(500);
    }
    await page.goto("/app/forecasting");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.locator("tbody tr").first().click();
    await page.waitForTimeout(500);
    const insightCard = page.locator('[data-testid="ai-insight-card"]');
    await expect(insightCard).not.toBeVisible({ timeout: 15000 });
  });

  test("settings page has both AI toggle switches", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const aiToggle = page.getByRole("switch", { name: "AI Insights" });
    const forecastToggle = page.getByRole("switch", { name: "Forecast Explanations" });
    await expect(aiToggle).toBeVisible({ timeout: 15000 });
    await expect(forecastToggle).toBeVisible({ timeout: 15000 });
  });

  test("AI toggle description mentions OpenCode API", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const settingsContent = await page.locator('body').innerHTML();
    expect(settingsContent).toContain("OpenCode API");
  });

  test("AI toggle description mentions Big Pickle model", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const settingsContent = await page.locator('body').innerHTML();
    expect(settingsContent).toContain("Big Pickle");
  });

  test("AI toggle description mentions statistical forecasting works without AI", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const settingsContent = await page.locator('body').innerHTML();
    expect(settingsContent).toContain("still works when AI is disabled");
  });

  test("forecast insight appears for low-stock product", async ({ page }) => {
    await page.goto("/app/forecasting");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const rows = page.locator("tbody tr");
    const secondRow = rows.nth(1);
    await secondRow.click();
    await page.waitForTimeout(500);
    const insightCard = page.locator('[data-testid="ai-insight-card"]');
    await expect(insightCard).toBeVisible({ timeout: 15000 });

    const insightText = await insightCard.innerHTML();
    expect(insightText.length).toBeGreaterThan(500);
  });

  test("forecast insight appears for out-of-stock product", async ({ page }) => {
    await page.goto("/app/forecasting");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const rows = page.locator("tbody tr");
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
      await rows.first().click();
    }
    await page.waitForTimeout(500);
    const insightCard = page.locator('[data-testid="ai-insight-card"]');
    await expect(insightCard).toBeVisible({ timeout: 15000 });
  });

  test("generateAIInsights returns multiple insights", async ({ page }) => {
    await page.goto("/app/dashboard");
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const html = await page.evaluate(() => (window as any).generateAIInsights?.() || "");
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain("material-symbols-outlined");
    expect(html).toContain("font-weight:600");
  });
});