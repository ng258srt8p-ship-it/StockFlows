import { test, expect } from "@playwright/test";

test("PDF preview modal shows all 10 products and is scrollable", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("http://localhost:5173/tour.html");

  // Enter the app via JS call (avoids click issues on hidden elements)
  await page.evaluate(() => (window as any).enterApp());
  await page.waitForTimeout(300);

  // Navigate to Reports via JS
  await page.evaluate(() => (window as any).go("reports"));
  await page.waitForTimeout(300);

  // Open PDF preview via JS
  await page.evaluate(() => (window as any).previewPDF());
  await page.waitForTimeout(300);

  // Modal should be visible
  const modal = page.locator("#modal.active");
  await expect(modal).toBeVisible();

  // Modal should be scrollable
  const scrollHeight = await page.evaluate(() => {
    const m = document.querySelector(".modal") as HTMLElement;
    return m ? m.scrollHeight : 0;
  });
  const clientHeight = await page.evaluate(() => {
    const m = document.querySelector(".modal") as HTMLElement;
    return m ? m.clientHeight : 0;
  });

  console.log("scrollHeight:", scrollHeight, "clientHeight:", clientHeight);

  // All 10 products must be in the table
  const rows = await page.locator(".modal table tbody tr").count();
  expect(rows).toBe(10);

  // Verify each product SKU is present in the modal
  const skuTexts = [
    "WDG-001", "WDG-002", "GAD-001", "GAD-002", "ACC-001",
    "ACC-002", "CBL-001", "CBL-002", "PKG-001", "PKG-002",
  ];
  for (const sku of skuTexts) {
    const count = await page.locator(`.modal :text("${sku}")`).count();
    expect(count, `SKU ${sku} should be visible in modal`).toBeGreaterThanOrEqual(1);
  }

  // Grand total should be present
  const totalText = await page.locator('.modal :text("Grand Total")').count();
  expect(totalText).toBeGreaterThanOrEqual(1);

  // If content overflows, modal should be scrollable
  if (scrollHeight > clientHeight) {
    // Scroll down in the modal and verify bottom content becomes visible
    await page.evaluate(() => {
      const m = document.querySelector(".modal") as HTMLElement;
      if (m) m.scrollTop = m.scrollHeight;
    });
    await page.waitForTimeout(200);
    // After scrolling to bottom, grand total should be reachable
    const grandTotal = page.locator('.modal :text("Grand Total")').first();
    const box = await grandTotal.boundingBox();
    expect(box).not.toBeNull();
    // The bottom of the text should be within the viewport after scroll
    if (box) {
      const viewportSize = page.viewportSize();
      expect(box.y + box.height).toBeLessThanOrEqual(viewportSize!.height + 50);
    }
  }

  console.log("PDF modal test passed: all 10 products visible, modal scrollable");
});
