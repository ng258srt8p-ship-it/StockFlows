import { test, expect } from "@playwright/test";

const FLY_URL = "https://stockflows.fly.dev";

test.describe("Take App Screenshots", () => {
  let browser: any;
  let context: any;
  let page: any;

  test.beforeAll(async ({ playwright }) => {
    browser = await playwright.chromium.connectOverCDP("http://localhost:9222");
    const contexts = browser.contexts();
    context = contexts.length > 0 ? contexts[0] : await browser.newContext();
    const pages = context.pages();
    page = pages.length > 0 ? pages[0] : await context.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
  });

  test.afterAll(async () => { if (browser) await browser.close(); });

  test("Screenshot Dashboard", async () => {
    await page.goto(`${FLY_URL}/app`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: "public/screenshots/dashboard.png", 
      fullPage: true 
    });
    console.log("Dashboard screenshot saved");
  });

  test("Screenshot Inventory", async () => {
    await page.goto(`${FLY_URL}/app/inventory`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: "public/screenshots/inventory.png", 
      fullPage: true 
    });
    console.log("Inventory screenshot saved");
  });

  test("Screenshot Purchasing", async () => {
    await page.goto(`${FLY_URL}/app/purchasing`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: "public/screenshots/purchasing.png", 
      fullPage: true 
    });
    console.log("Purchasing screenshot saved");
  });

  test("Screenshot Forecasting", async () => {
    await page.goto(`${FLY_URL}/app/forecasting`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: "public/screenshots/forecasting.png", 
      fullPage: true 
    });
    console.log("Forecasting screenshot saved");
  });

  test("Screenshot Reports", async () => {
    await page.goto(`${FLY_URL}/app/reports`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: "public/screenshots/reports.png", 
      fullPage: true 
    });
    console.log("Reports screenshot saved");
  });

  test("Screenshot Settings", async () => {
    await page.goto(`${FLY_URL}/app/settings`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: "public/screenshots/settings.png", 
      fullPage: true 
    });
    console.log("Settings screenshot saved");
  });
});
