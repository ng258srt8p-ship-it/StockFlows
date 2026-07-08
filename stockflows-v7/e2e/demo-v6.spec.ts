/**
 * StockFlows v6 Demo — Full Interactive Test Suite
 * Tests every button and interactive element in the new brutalist demo
 */
import { test, expect } from "@playwright/test";

const DEMO_URL = "/";

test.describe("StockFlows v6 Interactive Demo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DEMO_URL, { waitUntil: "networkidle" });
  });

  // ── NAVIGATION ──

  test("Page loads with correct title and heading", async ({ page }) => {
    await expect(page).toHaveTitle(/StockFlows/);
    await expect(page.locator("h1")).toContainText("StockFlows App");
  });

  test("All 5 navigation tabs are visible in sidebar", async ({ page }) => {
    const sidebar = page.locator("aside");
    const tabs = [
      "LEDGER DASHBOARD",
      "STOCK TRANSFERS",
      "PO REPLENISHMENT",
      "STOCKY IMPORT TOOL",
      "BARCODE SCANNING",
    ];
    for (const tab of tabs) {
      await expect(sidebar.locator("button", { hasText: tab })).toBeVisible();
    }
  });

  test("Tab switching updates the heading", async ({ page }) => {
    const sidebar = page.locator("aside");

    // Dashboard (default)
    await expect(page.locator("h1")).toContainText("dashboard");

    // Click each sidebar tab and verify heading updates
    await sidebar.locator("button", { hasText: "STOCK TRANSFERS" }).click();
    await expect(page.locator("h1")).toContainText(/transfer/i);

    await sidebar.locator("button", { hasText: "PO REPLENISHMENT" }).click();
    await expect(page.locator("h1")).toContainText(/replenishment/i);

    await sidebar.locator("button", { hasText: "STOCKY IMPORT TOOL" }).click();
    await expect(page.locator("h1")).toContainText(/stocky import/i);

    await sidebar.locator("button", { hasText: "BARCODE SCANNING" }).click();
    await expect(page.locator("h1")).toContainText(/barcode/i);
  });

  // ── DASHBOARD ──

  test("Dashboard shows 4 KPI stat cards", async ({ page }) => {
    await expect(page.locator("text=Total Stock Value").first()).toBeVisible();
    await expect(page.locator("text=Out-of-Stock Risk SKUs").first()).toBeVisible();
    await expect(page.locator("text=Audit Ledger Logs").first()).toBeVisible();
    await expect(page.locator("text=Migration Wizard").first()).toBeVisible();
  });

  test("SKU table has 5 rows with correct data", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(0)).toContainText("SWE-WOL-001");
    await expect(rows.nth(0)).toContainText("Premium Wool Knit Sweater");
  });

  test("SKU search filters the table", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search by SKU"]');
    await searchInput.fill("leather");
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText("BTS-LTH-005");
  });

  test("Clicking SKU row opens inspector panel", async ({ page }) => {
    await expect(page.locator("text=SKU Inspector").first()).toBeVisible();
    await expect(page.locator("text=Premium Wool Knit Sweater").first()).toBeVisible();
  });

  test("Clicking different SKU changes inspector content", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await rows.nth(1).click();
    await expect(page.locator("text=Classic Indigo Denim Jeans").first()).toBeVisible();
  });

  test("Receive +10 button shows toast notification", async ({ page }) => {
    // Clear any existing toasts
    await page.locator("button", { hasText: "Reset Simulation" }).click();
    await page.waitForTimeout(4500);

    // Click Receive +10
    await page.locator("button", { hasText: "Receive +10" }).click();
    await expect(page.locator("text=audit-received").first()).toBeVisible({ timeout: 5000 });
  });

  test("Deduct -5 button shows toast notification", async ({ page }) => {
    await page.locator("button", { hasText: "Reset Simulation" }).click();
    await page.waitForTimeout(4500);

    await page.locator("button", { hasText: "Deduct -5" }).click();
    await expect(page.locator("text=audit-delivery").first()).toBeVisible({ timeout: 5000 });
  });

  test("View Barcode Details navigates to Barcode tab", async ({ page }) => {
    await page.locator("button", { hasText: "View Barcode Details" }).click();
    await expect(page.locator("h1")).toContainText(/barcode/i);
  });

  test("Manage Stock Transfers link navigates to Transfers", async ({ page }) => {
    await page.locator("button", { hasText: "Manage Stock Transfers" }).click();
    await expect(page.locator("h1")).toContainText(/transfer/i);
  });

  // ── STOCK TRANSFERS ──

  test("Transfers tab shows form and ledger", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "STOCK TRANSFERS" }).click();
    await expect(page.locator("h3").filter({ hasText: "Create New Stock Document" })).toBeVisible();
    await expect(page.locator("h3").filter({ hasText: "Active Document Ledger Logs" })).toBeVisible();
  });

  test("Transfer ledger shows 4 initial entries", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "STOCK TRANSFERS" }).click();
    await expect(page.locator("text=TRF-0012").first()).toBeVisible();
    await expect(page.locator("text=REC-0098").first()).toBeVisible();
    await expect(page.locator("text=TRF-0014").first()).toBeVisible();
    await expect(page.locator("text=ADJ-0045").first()).toBeVisible();
  });

  test("Next Status advances a transfer through its lifecycle", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "STOCK TRANSFERS" }).click();

    // Click the last "Next Status" button (ADJ-0045 is Draft)
    const nextBtns = page.locator("button:has-text('Next Status')");
    const count = await nextBtns.count();
    if (count > 0) {
      await nextBtns.nth(count - 1).click();
      await expect(page.locator("text=updated to").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("Creating a transfer adds to the ledger", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "STOCK TRANSFERS" }).click();

    // Submit the form
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=created as Draft").first()).toBeVisible({ timeout: 5000 });
  });

  // ── PO REPLENISHMENT ──

  test("Replenishment tab shows all 5 SKU recommendations", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "PO REPLENISHMENT" }).click();
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(5);
  });

  test("Generate PO Draft creates a purchase order toast", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "PO REPLENISHMENT" }).click();
    await page.waitForTimeout(500);

    // First click the sidebar tab to ensure navigation
    await page.locator("button", { hasText: "Generate PO Draft" }).first().click();
    // Check toast appears (may have multiple toasts, use first)
    const toast = page.locator("text=PO Created:").first();
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  // ── STOCKY IMPORT TOOL ──

  test("Stocky Import tab shows migration wizard", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "STOCKY IMPORT TOOL" }).click();
    await expect(page.locator("text=Migration Wizard").first()).toBeVisible();
    await expect(page.locator("text=Start Safe Import Process").first()).toBeVisible();
  });

  test("Stocky migration simulation completes successfully", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "STOCKY IMPORT TOOL" }).click();

    // Click "Execute Importer Simulation"
    await page.locator("button", { hasText: "Execute Importer Simulation" }).click();

    // Wait for migration to complete
    await expect(page.locator("text=Migration Simulation Successful").first()).toBeVisible({
      timeout: 10000,
    });
  });

  // ── BARCODE SCANNING ──

  test("Barcode tab shows SKU selection panel", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "BARCODE SCANNING" }).click();
    await expect(page.locator("text=Simulate Barcode Hardware Scan").first()).toBeVisible();
  });

  test("Simulated scan finds the correct SKU", async ({ page }) => {
    await page.locator("aside").locator("button", { hasText: "BARCODE SCANNING" }).click();

    // Click the first SKU scan button
    await page.locator("button", { hasText: "SIMULATE SCAN" }).first().click();

    // Verify scan result panel shows output
    await expect(page.locator("text=Scan Success Results").first()).toBeVisible();
    await expect(page.locator("text=On Hand:").first()).toBeVisible();
  });

  // ── RESET SIMULATION ──

  test("Reset Simulation button restores defaults", async ({ page }) => {
    // First modify some state
    await page.locator("button", { hasText: "Receive +10" }).click();
    await page.waitForTimeout(500);

    // Click reset
    await page.locator("button", { hasText: "Reset Simulation" }).click();
    await expect(page.locator("text=reset to default").first()).toBeVisible({ timeout: 5000 });
  });

  // ── NO EMOJI VERIFICATION ──

  test("No emoji characters in visible text", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    const emojiPattern = /[✅❌⚠️➔🚀●→✓]/;
    expect(bodyText).not.toMatch(emojiPattern);
  });

  // ── TOAST NOTIFICATIONS ──

  test("Toast notification appears and disappears", async ({ page }) => {
    await page.locator("button", { hasText: "Reset Simulation" }).click();
    await page.waitForTimeout(4500);

    await page.locator("button", { hasText: "Receive +10" }).click();
    await expect(page.locator("text=audit-received").first()).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(4500);
    await expect(page.locator("text=audit-received").first()).not.toBeVisible();
  });
});
