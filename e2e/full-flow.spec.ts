import { test, expect } from '@playwright/test';

test.describe('Full Settings → Forecast → Purchase Order flow', () => {
  test('updating safety stock multiplier propagates to reorder recommendation and PO creation', async ({ page }) => {
    // 1️⃣ Open Settings page and change the safety‑stock multiplier
    await page.goto('http://localhost:5173/app/settings');
    await page.waitForLoadState('networkidle');

    // Adjust the multiplier to a higher value (default is 1.5)
    await page.fill('input[name="safetyStockMultiplier"]', '2');
    await page.click('button:has-text("Save Settings")');
    await expect(page.locator('text="Settings saved successfully"')).toBeVisible({ timeout: 5000 });

    // 2️⃣ Navigate to Forecasting and open the first forecast detail
    await page.goto('http://localhost:5173/app/forecasting');
    await page.waitForLoadState('networkidle');

    // Select the first row in the forecasts table
    const firstRow = page.locator('.IndexTable-row').first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });
    await firstRow.click();

    // Wait for the Reorder Recommendation component to appear
    await page.waitForSelector('text=Reorder Recommendation', { timeout: 10000 });

    // Extract the recommended quantity from the component
    const recommendedQtyText = page.locator('.recommendedQty');
    await expect(recommendedQtyText).toBeVisible({ timeout: 5000 });
    const qtyString = await recommendedQtyText.textContent();
    const recommendedQty = parseFloat(qtyString.trim());

    // The recommended quantity must be > 0
    expect(recommendedQty).toBeGreaterThan(0);

    // 3️⃣ Click the "Create PO" button inside the recommendation
    const createPoBtn = page.locator('button:has-text("Create PO")');
    await expect(createPoBtn).toBeVisible({ timeout: 5000 });
    await createPoBtn.click();

    // 4️⃣ Verify navigation to the new Purchase Order page
    await page.waitForURL(/\/app\/purchasing\/new.*/, { timeout: 10000 });
    const currentUrl = page.url();

    // The URL should contain the pre‑filled quantity parameter
    expect(currentUrl).toMatch(`qty=${Math.round(recommendedQty)}`);

    // The quantity input in the PO form should be pre‑filled with that value
    const qtyInput = page.locator('input[name="quantity"]');
    await expect(qtyInput).toHaveValue(recommendedQty.toString());
  });
});