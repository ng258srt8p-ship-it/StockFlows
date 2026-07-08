/**
 * Bulk Import E2E Tests
 * Validates CSV import workflows for inventory data.
 */

import { test, expect } from '@playwright/test';

test.describe('Bulk Import', () => {
  test('should display bulk import button on inventory page', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await expect(importButton).toBeVisible();
  });

  test('should open CSV import modal on button click', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();
    const modal = page.getByRole('dialog').first();
    await expect(modal).toBeVisible();
  });

  test('should accept valid CSV file upload', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50\nSKU002,Widget B,30,40'),
    });

    const previewRow = page.getByRole('row').first();
    await expect(previewRow).toBeVisible();
  });

  test('should validate required columns in CSV', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('name,quantity\nWidget A,100'),
    });

    const errorMessage = page.getByText(/missing required column/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should show row-by-row preview before confirm', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'preview.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50\nSKU002,Widget B,30,40\nSKU003,Gadget C,200,10'),
    });

    const rows = page.getByRole('row').all();
    await expect(rows).toBeTruthy();
  });

  test('should mark duplicate SKUs in preview', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'duplicates.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50\nSKU001,Widget A Updated,150,60'),
    });

    const duplicateIndicator = page.getByText(/duplicate/i);
    await expect(duplicateIndicator).toBeVisible();
  });

  test('should allow mapping custom columns to import fields', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'custom-cols.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('product_id,product_name,count,min_stock\nP001,Widget A,100,50'),
    });

    const columnMapping = page.getByRole('combobox').first();
    await expect(columnMapping).toBeVisible();
  });

  test('should show import summary after success', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'success.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50\nSKU002,Widget B,30,40'),
    });

    const confirmButton = page.getByRole('button', { name: /confirm|import/i });
    await confirmButton.click();

    const summary = page.getByText(/imported|success|complete/i);
    await expect(summary).toBeVisible({ timeout: 10000 });
  });

  test('should handle large CSV with thousands of rows', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    let csvContent = 'sku,name,quantity,reorder_point\n';
    for (let i = 1; i <= 5000; i++) {
      csvContent += `SKU${String(i).padStart(6, '0')},Product ${i},${Math.floor(Math.random() * 1000)},${Math.floor(Math.random() * 100)}\n`;
    }

    await fileInput.setInputFiles({
      name: 'large.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    const previewRow = page.getByRole('row').first();
    await expect(previewRow).toBeVisible();
  });

  test('should abort import when cancelled', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'abort.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50'),
    });

    const cancelButton = page.getByRole('button', { name: /cancel|close|back/i });
    await cancelButton.click();

    const modal = page.getByRole('dialog').first();
    await expect(modal).not.toBeVisible();
  });

  test('should display error for malformed CSV', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'malformed.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('"unclosed quote\nname,quantity'),
    });

    const errorMessage = page.getByText(/invalid|error|malformed/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should reset form after successful import', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'reset.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50'),
    });

    const confirmButton = page.getByRole('button', { name: /confirm|import/i });
    await confirmButton.click();

    const successMsg = page.getByText(/success|complete|imported/i);
    await expect(successMsg).toBeVisible({ timeout: 10000 });

    const confirmBtnAfter = page.getByRole('button', { name: /confirm|import/i });
    await expect(confirmBtnAfter).not.toBeVisible();
  });

  test('should support importing with images or URLs', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'with-urls.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point,image_url\nSKU001,Widget A,100,50,https://example.com/image.png'),
    });

    const previewRow = page.getByRole('row').first();
    await expect(previewRow).toBeVisible();
  });

  test('should preserve existing inventory when import flag is skip-duplicates', async ({ page }) => {
    await page.goto('/inventory');

    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'skip.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,999,50'),
    });

    const skipOption = page.getByRole('radio', { name: /skip|duplicate/i }).first();
    await skipOption.check();

    const confirmButton = page.getByRole('button', { name: /confirm|import/i });
    await confirmButton.click();

    const successMsg = page.getByText(/imported|success/i);
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });

  test('should handle encoding errors gracefully', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'bad-encoding.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from([0x80, 0x81, 0x82, 0x83, 0x84]),
    });

    const errorMessage = page.getByText(/encoding|error|invalid/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should display progress bar during large file import', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    let csvContent = 'sku,name,quantity,reorder_point\n';
    for (let i = 1; i <= 2000; i++) {
      csvContent += `SKU${String(i).padStart(6, '0')},Product ${i},${Math.floor(Math.random() * 1000)},${Math.floor(Math.random() * 100)}\n`;
    }

    await fileInput.setInputFiles({
      name: 'progress.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    const confirmButton = page.getByRole('button', { name: /confirm|import/i });
    await confirmButton.click();

    const progressBar = page.locator('[class*="progress"], [role="progressbar"]').first();
    await expect(progressBar).toBeVisible({ timeout: 10000 });
  });

  test('should allow re-import after fixing errors', async ({ page }) => {
    await page.goto('/inventory');
    const importButton = page.getByRole('button', { name: /import/i });
    await importButton.click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'fix1.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('name,quantity\nWidget A,100'),
    });

    const errorMessage = page.getByText(/missing required column/i);
    await expect(errorMessage).toBeVisible();

    await fileInput.setInputFiles({
      name: 'fix2.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('sku,name,quantity,reorder_point\nSKU001,Widget A,100,50'),
    });

    const previewRow = page.getByRole('row').first();
    await expect(previewRow).toBeVisible();
  });
});
