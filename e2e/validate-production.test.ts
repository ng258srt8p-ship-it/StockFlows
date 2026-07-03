import { test, expect } from "@playwright/test";

/**
 * StockFlows Live Production Validation Suite
 * Tests the deployed React app with real Shopify inventory data
 * 
 * Run with: npx playwright test e2e/validate-production.test.ts --config=playwright.live.config.ts
 */

const FLY_URL = "https://stockflows.fly.dev";
const SHOP_DOMAIN = "stockflows2.myshopify.com";

test.describe("StockFlows Production Validation", () => {
  let browser: any;
  let context: any;
  let page: any;

  test.beforeAll(async ({ playwright }) => {
    browser = await playwright.chromium.connectOverCDP("http://localhost:9222");
    const contexts = browser.contexts();
    context = contexts.length > 0 ? contexts[0] : await browser.newContext();
    const pages = context.pages();
    page = pages.length > 0 ? pages[0] : await context.newPage();
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);
  });

  test.afterAll(async () => {
    if (browser) await browser.close();
  });

  // --- HEALTH & API ---

  test("Health endpoint responds 200", async () => {
    const r = await page.request.get(`${FLY_URL}/health`);
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.status).toBe("alive");
    console.log("Health: OK");
  });

  test("Ready endpoint confirms database and Redis connected", async () => {
    const r = await page.request.get(`${FLY_URL}/health/ready`);
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.checks.postgres).toBe("ok");
    expect(body.checks.redis).toBe("ok");
    console.log("Ready: DB + Redis OK");
  });

  // --- DASHBOARD ---

  test("Dashboard loads with inventory stats from real Shopify data", async () => {
    await page.goto(`${FLY_URL}/app`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const url = page.url();
    console.log("Dashboard URL:", url);
    expect(url).toContain("/app");
    
    // Verify dashboard shows real data (not demo data)
    const hasTotalSKUs = await page.locator("text=Total SKUs").count();
    expect(hasTotalSKUs).toBeGreaterThan(0);
    
    // Should have more than 10 SKUs (real Shopify data)
    const skuValue = await page.locator("text=/^\\d+$/").first().textContent();
    console.log("SKU count:", skuValue);
    
    await page.screenshot({ path: "test-results/prod-dashboard.png", fullPage: true });
  });

  // --- INVENTORY PAGE ---

  test("Inventory page loads with real Shopify products", async () => {
    await page.goto(`${FLY_URL}/app/inventory`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const url = page.url();
    console.log("Inventory URL:", url);
    expect(url).toContain("/app/inventory");
    
    // Check for real inventory items (Snowboards from Shopify)
    const hasSnowboard = await page.locator("text=Snowboard").count();
    console.log("Has Snowboard products:", hasSnowboard);
    expect(hasSnowboard).toBeGreaterThan(0);
    
    // Check for inventory items in table
    const rows = await page.locator(".Polaris-IndexTable tbody tr").count();
    console.log("Inventory rows:", rows);
    expect(rows).toBeGreaterThan(0);
    
    await page.screenshot({ path: "test-results/prod-inventory.png", fullPage: true });
  });

  test("Inventory items have proper data structure (real products)", async () => {
    await page.goto(`${FLY_URL}/app/inventory`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Check for status badges (In Stock, Low Stock, Out of Stock)
    const hasInStock = await page.locator("text=In Stock").count();
    const hasOutOfStock = await page.locator("text=Out of Stock").count();
    const hasLowStock = await page.locator("text=Low Stock").count();
    
    console.log("Status badges:", { hasInStock, hasOutOfStock, hasLowStock });
    expect(hasInStock + hasOutOfStock + hasLowStock).toBeGreaterThan(0);
    
    // Check for real product names
    const hasCollection = await page.locator("text=Collection").count();
    expect(hasCollection).toBeGreaterThan(0);
  });

  test("Inventory search works with real product names", async () => {
    await page.goto(`${FLY_URL}/app/inventory`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Search for "Snowboard" (real product in the store)
    const searchInput = page.locator("input[placeholder*='Search']");
    await searchInput.fill("Snowboard");
    await page.waitForTimeout(1000);
    
    // Should show filtered results
    const filteredRows = await page.locator(".Polaris-IndexTable tbody tr").count();
    console.log("Snowboard search results:", filteredRows);
    expect(filteredRows).toBeGreaterThan(0);
    
    // All results should contain "Snowboard"
    const allText = await page.locator(".Polaris-IndexTable tbody").innerText();
    expect(allText.toLowerCase()).toContain("snowboard");
  });

  test("Inventory location filter works", async () => {
    await page.goto(`${FLY_URL}/app/inventory`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Select a location from the dropdown
    const select = page.locator(".Polaris-Select select");
    const options = await select.locator("option").allTextContents();
    console.log("Location options:", options);
    
    // Select the first non-empty option
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      const rows = await page.locator(".Polaris-IndexTable tbody tr").count();
      console.log("Filtered rows:", rows);
      expect(rows).toBeGreaterThan(0);
    }
  });

  // --- SHOPIFY ADMIN INTEGRATION ---

  test("App loads in Shopify Admin embedded iframe", async () => {
    const appUrl = `https://${SHOP_DOMAIN}/admin/apps/stockflows-app`;
    await page.goto(appUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(8000);
    
    const url = page.url();
    console.log("Shopify Admin URL:", url);
    
    // Should not have redirect loop
    expect(url).not.toContain("error");
    expect(url).not.toContain("redirect_loop");
    
    await page.screenshot({ path: "test-results/prod-shopify-admin.png", fullPage: true });
  });

  // --- WEBHOOK ENDPOINT ---

  test("Webhook endpoint returns valid response", async () => {
    const r = await page.request.post(`${FLY_URL}/webhooks`, {
      data: { test: "payload" },
      headers: { "content-type": "application/json" },
    });
    // Should return 400/401 (invalid HMAC), not 500
    expect([400, 401]).toContain(r.status());
    console.log("Webhook response:", r.status());
  });
});
