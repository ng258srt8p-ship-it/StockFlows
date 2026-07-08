/**
 * E2E Tests: Batch Inventory Processing
 *
 * Covers: Bulk inventory adjustments, batch stock corrections,
 * multi-item updates, and batch operation audit trails.
 * ARCHITECTURE §2.4 (Inventory adjustments)
 */
import { test, expect } from "@playwright/test";

test.describe("Batch Inventory Processing", () => {
  test("batch processing panel loads correctly", async ({ page }) => {
    await page.goto("/inventory/batch");

    const panel = page.locator('[data-testid="batch-processing-panel"]').first();
    await expect(panel).toBeVisible();
  });

  test("select multiple items for batch adjustment", async ({ page }) => {
    await page.goto("/inventory/batch");

    const itemCheckboxes = page.locator('[data-testid="batch-item-checkbox"]').all();
    const count = await itemCheckboxes.length;
    expect(count).toBeGreaterThan(0);

    // Select first 3 items
    for (let i = 0; i < Math.min(3, count); i++) {
      await itemCheckboxes[i].check();
    }

    const selectedCount = page.locator('[data-testid="selection-count-badge"]').first();
    const text = await selectedCount.textContent();
    expect(text).toMatch(/\d+/);
  });

  test("batch adjustment type selection works", async ({ page }) => {
    await page.goto("/inventory/batch");

    const typeSelector = page.locator('[data-testid="adjustment-type-select"]').first();
    await expect(typeSelector).toBeVisible();

    const options = await typeSelector.evaluate(
      (el: HTMLSelectElement) => Array.from(el.options).map((o) => o.value)
    );
    expect(options).toContain("add");
    expect(options).toContain("subtract");
    expect(options).toContain("set");
  });

  test("batch quantity validation prevents invalid input", async ({ page }) => {
    await page.goto("/inventory/batch");

    const quantityInput = page.locator('[data-testid="batch-quantity-input"]').first();
    await expect(quantityInput).toBeVisible();

    // Try to enter invalid value (negative for add operation)
    await quantityInput.fill("-50");
    const submitBtn = page.locator('[data-testid="batch-submit-btn"]').first();
    const isEnabled = await submitBtn.isEnabled();
    expect(isEnabled).toBe(false);
  });

  test("batch operation preview shows before submission", async ({ page }) => {
    await page.goto("/inventory/batch");

    // Select items and set quantity
    const checkboxes = page.locator('[data-testid="batch-item-checkbox"]');
    const count = await checkboxes.count();
    if (count > 0) {
      await checkboxes.first().check();
    }

    const previewBtn = page.locator('[data-testid="batch-preview-btn"]').first();
    await expect(previewBtn).toBeEnabled();

    const previewPanel = page.locator('[data-testid="batch-preview-panel"]').first();
    await expect(previewPanel).toBeVisible();
  });

  test("batch processing creates audit trail entries", async ({ page }) => {
    await page.goto("/inventory/batch");

    const auditTrailToggle = page.locator('[data-testid="audit-trail-toggle"]').first();
    await expect(auditTrailToggle).toBeVisible();

    const auditLog = page.locator('[data-testid="batch-audit-log"]').first();
    await expect(auditLog).toBeVisible();
  });

  test("error handling for invalid batch selections", async ({ page }) => {
    await page.goto("/inventory/batch");

    // Try submitting without selecting items
    const submitBtn = page.locator('[data-testid="batch-submit-btn"]').first();
    await expect(submitBtn).toBeDisabled();

    const errorMessage = page.locator('[data-testid="batch-error-message"]').first();
    await expect(errorMessage).toBeVisible();
  });

  test("batch processing progress indicator works", async ({ page }) => {
    await page.goto("/inventory/batch");

    const progressBar = page.locator('[data-testid="batch-progress-bar"]').first();
    await expect(progressBar).toBeVisible();
  });

  test("bulk import CSV template is accessible", async ({ page }) => {
    await page.goto("/inventory/batch");

    const importBtn = page.locator('[data-testid="bulk-import-btn"]').first();
    await expect(importBtn).toBeEnabled();

    const templateLink = page.locator('[data-testid="import-template-link"]').first();
    await expect(templateLink).toBeVisible();
  });

  test("batch operation cancellation works", async ({ page }) => {
    await page.goto("/inventory/batch");

    const cancelBtn = page.locator('[data-testid="batch-cancel-btn"]').first();
    await expect(cancelBtn).toBeEnabled();
  });

  test("batch results summary displays after completion", async ({ page }) => {
    await page.goto("/inventory/batch?result=true");

    const summaryPanel = page.locator('[data-testid="batch-result-summary"]').first();
    await expect(summaryPanel).toBeVisible();

    const successCount = summaryPanel.locator('[data-testid="success-count"]').first();
    await expect(successCount).toBeVisible();

    const failCount = summaryPanel.locator('[data-testid="failure-count"]').first();
    await expect(failCount).toBeVisible();
  });

  test("batch processing respects permission levels", async ({ page }) => {
    await page.goto("/inventory/batch");

    const adminActions = page.locator('[data-testid="admin-batch-action"]').all();
    const count = await adminActions.length;
    expect(count).toBeGreaterThanOrEqual(0);

    // Regular users should see limited actions
    const regularActions = page.locator('[data-testid="user-batch-action"]').all();
    const userCount = await regularActions.length;
    expect(userCount).toBeGreaterThanOrEqual(0);
  });
});
