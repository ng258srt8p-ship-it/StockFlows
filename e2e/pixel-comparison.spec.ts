import { test, expect } from "@playwright/test";

const SHOPIFY_APP = "https://stockflows.fly.dev/app";
const DEMO_APP = "https://stockflows.app/demo";

test.describe("Pixel-Perfect Comparison: Demo vs Shopify App", () => {
  let shopifyPage: any;
  let demoPage: any;

  test.beforeAll(async ({ browser }) => {
    const ctx1 = await browser.newContext();
    shopifyPage = await ctx1.newPage();
    await shopifyPage.goto(SHOPIFY_APP, { waitUntil: "networkidle" });

    const ctx2 = await browser.newContext();
    demoPage = await ctx2.newPage();
    await demoPage.goto(DEMO_APP, { waitUntil: "networkidle" });
  });

  test("1. Polaris-Frame structure matches", async () => {
    const shopifyFrame = await shopifyPage.locator('.Polaris-Frame').count();
    const demoFrame = await demoPage.locator('.Polaris-Frame').count();
    expect(demoFrame).toBe(shopifyFrame);
  });

  test("2. Polaris-Navigation structure matches", async () => {
    const shopifyNav = await shopifyPage.locator('.Polaris-Navigation').count();
    const demoNav = await demoPage.locator('.Polaris-Navigation').count();
    expect(demoNav).toBe(shopifyNav);
  });

  test("3. Polaris-Page structure matches", async () => {
    const shopifyPage_ = await shopifyPage.locator('.Polaris-Page').count();
    const demoPage_ = await demoPage.locator('.Polaris-Page').count();
    expect(demoPage_).toBeGreaterThan(0);
    expect(shopifyPage_).toBeGreaterThan(0);
  });

  test("4. Navigation items match", async () => {
    const shopifyNavItems = await shopifyPage.evaluate(() => {
      const items = document.querySelectorAll('.Polaris-Navigation__Text');
      return Array.from(items).map(el => el.textContent?.trim()).filter(t => t);
    });
    const demoNavItems = await demoPage.evaluate(() => {
      const items = document.querySelectorAll('.Polaris-Navigation__Text');
      return Array.from(items).map(el => el.textContent?.trim()).filter(t => t);
    });
    console.log("Shopify nav:", shopifyNavItems);
    console.log("Demo nav:", demoNavItems);
    expect(demoNavItems).toEqual(shopifyNavItems);
  });

  test("5. Dashboard heading matches", async () => {
    const shopifyHeading = await shopifyPage.evaluate(() => {
      const h1 = document.querySelector('.Polaris-Text--headingLg');
      return h1?.textContent?.trim();
    });
    const demoHeading = await demoPage.evaluate(() => {
      const h1 = document.querySelector('.Polaris-Text--headingLg');
      return h1?.textContent?.trim();
    });
    console.log("Shopify heading:", shopifyHeading);
    console.log("Demo heading:", demoHeading);
    expect(demoHeading).toBe(shopifyHeading);
  });

  test("6. Dashboard subtitle matches", async () => {
    const shopifySubtitle = await shopifyPage.evaluate(() => {
      const sub = document.querySelector('.Polaris-Header-Title__SubTitle');
      return sub?.textContent?.trim();
    });
    const demoSubtitle = await demoPage.evaluate(() => {
      const sub = document.querySelector('.Polaris-Header-Title__SubTitle');
      return sub?.textContent?.trim();
    });
    console.log("Shopify subtitle:", shopifySubtitle);
    console.log("Demo subtitle:", demoSubtitle);
    expect(demoSubtitle).toBe(shopifySubtitle);
  });

  test("7. Stat card count matches", async () => {
    const shopifyStats = await shopifyPage.locator('.Polaris-ShadowBevel').count();
    const demoStats = await demoPage.locator('.Polaris-ShadowBevel').count();
    console.log("Shopify stat cards:", shopifyStats);
    console.log("Demo stat cards:", demoStats);
    expect(demoStats).toBe(shopifyStats);
  });

  test("8. Stat values match", async () => {
    const shopifyValues = await shopifyPage.evaluate(() => {
      const items = document.querySelectorAll('.Polaris-Text--headingLg');
      return Array.from(items).slice(1, 5).map(el => el.textContent?.trim());
    });
    const demoValues = await demoPage.evaluate(() => {
      const items = document.querySelectorAll('.Polaris-Text--headingLg');
      return Array.from(items).slice(1, 5).map(el => el.textContent?.trim());
    });
    console.log("Shopify values:", shopifyValues);
    console.log("Demo values:", demoValues);
    expect(demoValues).toEqual(shopifyValues);
  });

  test("9. Active Alerts section matches", async () => {
    const shopifyAlerts = await shopifyPage.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2?.textContent?.trim();
    });
    const demoAlerts = await demoPage.evaluate(() => {
      const h2 = document.querySelector('h2');
      return h2?.textContent?.trim();
    });
    console.log("Shopify alerts:", shopifyAlerts);
    console.log("Demo alerts:", demoAlerts);
    expect(demoAlerts).toBe(shopifyAlerts);
  });

  test("10. Empty state text matches", async () => {
    const shopifyEmpty = await shopifyPage.evaluate(() => {
      const container = document.querySelector('[class*="EmptyState"]');
      return container?.closest('[class*="Box"]')?.textContent?.trim() || '';
    });
    const demoEmpty = await demoPage.evaluate(() => {
      const container = document.querySelector('[class*="EmptyState"]');
      return container?.closest('[class*="Box"]')?.textContent?.trim() || '';
    });
    console.log("Shopify empty:", shopifyEmpty);
    console.log("Demo empty:", demoEmpty);
    expect(demoEmpty).toContain("No active alerts");
    expect(demoEmpty).toContain("All stock levels are above their reorder points.");
  });

  test("11. Recent Activity section matches", async () => {
    const shopifyActivity = await shopifyPage.evaluate(() => {
      const h2s = document.querySelectorAll('h2');
      return Array.from(h2s).map(h => h.textContent?.trim());
    });
    const demoActivity = await demoPage.evaluate(() => {
      const h2s = document.querySelectorAll('h2');
      return Array.from(h2s).map(h => h.textContent?.trim());
    });
    console.log("Shopify activity:", shopifyActivity);
    console.log("Demo activity:", demoActivity);
    expect(demoActivity).toEqual(shopifyActivity);
  });

  test("12. Button text matches", async () => {
    const shopifyBtn = await shopifyPage.evaluate(() => {
      const btn = document.querySelector('.Polaris-Button--primary');
      return btn?.textContent?.trim();
    });
    const demoBtn = await demoPage.evaluate(() => {
      const btn = document.querySelector('.Polaris-Button--primary');
      return btn?.textContent?.trim();
    });
    console.log("Shopify button:", shopifyBtn);
    console.log("Demo button:", demoBtn);
    expect(demoBtn).toBe(shopifyBtn);
  });

  test("13. Font family matches", async () => {
    const shopifyFont = await shopifyPage.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });
    const demoFont = await demoPage.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });
    console.log("Shopify font:", shopifyFont);
    console.log("Demo font:", demoFont);
    expect(demoFont).toContain("Inter");
    expect(shopifyFont).toContain("Inter");
  });

  test("14. Background color matches", async () => {
    const shopifyBg = await shopifyPage.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    const demoBg = await demoPage.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    console.log("Shopify bg:", shopifyBg);
    console.log("Demo bg:", demoBg);
    expect(demoBg).toMatch(/rgb\(24[01], 24[012], 24[01234]\)/);
  });

  test("15. View all link matches", async () => {
    const shopifyLink = await shopifyPage.evaluate(() => {
      const link = document.querySelector('a[href*="inventory"]');
      return link?.textContent?.trim();
    });
    const demoLink = await demoPage.evaluate(() => {
      const link = document.querySelector('a[href*="inventory"]');
      return link?.textContent?.trim();
    });
    console.log("Shopify link:", shopifyLink);
    console.log("Demo link:", demoLink);
    expect(demoLink).toBe(shopifyLink);
  });
});
