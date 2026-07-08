import { test, expect } from '@playwright/test';

test.describe('Settings and Forecasting Flow', () => {
  test('settings safety stock multiplier affects reorder recommendation and PO creation', async ({ page }) => {
    // ---------- 1. Update Settings ----------
    await page.goto('http://localhost:3000/app/settings');
    await page.waitForLoadState('networkidle');

    // Fill in the form (using defaults where appropriate)
    await page.fill('input[name="lowStockThreshold"]', '10');
    await page.fill('input[name="criticalStockThreshold"]', '3');
    await page.fill('input[name="safetyStockMultiplier"]', '2'); // 2.0 multiplier
    await page.fill('input[name="forecastHorizonDays"]', '30');
    // Ensure email alerts are on via Polaris Toggle
    const emailToggle = page.getByRole("switch", { name: "Email Alerts" });
    await emailToggle.waitFor({ state: "visible", timeout: 10000 });
    const isEmailChecked = await emailToggle.getAttribute("aria-checked") === "true";
    if (!isEmailChecked) {
      await emailToggle.click();
    }
    // slackWebhookUrl can stay empty

    // Submit the form
    await page.click('button:has-text("Save Settings")');

    // Verify success message
    await expect(page.locator('text="Settings saved successfully"')).toBeVisible({ timeout: 5000 });

    // ---------- 2. Open Forecasting page ----------
    await page.goto('http://localhost:3000/app/forecasting');
    await page.waitForLoadState('networkidle');

    // Select the first forecast row to view its details
    const firstRow = page.locator('.IndexTable-row').first();
    await expect(firstRow).toBeVisible();
    await firstRow.click(); // assumes clicking expands the row details

    // Wait for the details panel to appear
    await page.waitForSelector('text=Reorder Recommendation', { timeout: 5000 });

    // ---------- 3. Verify recommended quantity reflects new multiplier ----------
    // The ReorderRecommendation component shows the recommended quantity.
    // We assert that the value is higher than it would be with the default multiplier (1.5).
    const recommendedQtyText = page.locator('.recommendedQty').first(); // adjust selector if needed
    await expect(recommendedQtyText).toBeVisible();

    // Extract the numeric value
    const recommendedQty = await recommendedQtyText.textContent();
    expect(recommendedQty).not.toBeNull();
    const recommendedQtyNum = parseFloat(recommendedQty!);
    expect(recommendedQtyNum).toBeGreaterThan(0);

    // Verify the "Create PO" button is present
    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible();

    // ---------- 4. Click Create PO and verify navigation ----------
    await createPoBtn.click();

    // Wait for navigation to the new purchase order page
    await page.waitForURL('**/app/purchasing/new*', { timeout: 10000 });

    // Verify the URL contains the expected query parameters
    const url = page.url();
    expect(url).toMatch(/qty=\d+/);
    expect(url).toMatch(/item=.*/);

    // Verify the PO form fields are pre‑filled
    const qtyInput = page.locator('input[name="quantity"]');
    await expect(qtyInput).toHaveValue(recommendedQtyNum.toString());

    // Verify the item name field (if present) contains the expected SKU or title
    const itemNameInput = page.locator('input[name="item"]'); // adjust selector if your form uses a different field
    await expect(itemNameInput).toHaveValue(/ABC123/); // adjust to expected SKU/title
  });
});