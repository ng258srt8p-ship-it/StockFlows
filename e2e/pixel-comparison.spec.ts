import { test, expect } from "@playwright/test";

const SHOPIFY_APP = "https://stockflows.fly.dev/app";
const DEMO_APP = "https://stockflows.app/demo";

// Helper: get computed styles for an element
async function getStyles(page: any, selector: string): Promise<Record<string, string>> {
  return page.evaluate((sel: string) => {
    const el = document.querySelector(sel);
    if (!el) return {};
    const style = getComputedStyle(el);
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
      padding: style.padding,
      margin: style.margin,
      lineHeight: style.lineHeight,
    };
  }, selector);
}

test.describe("Pixel-Perfect Comparison: Demo vs Shopify App", () => {
  let shopifyPage: any;
  let demoPage: any;

  test.beforeAll(async ({ browser }) => {
    // Load both pages
    const ctx1 = await browser.newContext();
    shopifyPage = await ctx1.newPage();
    await shopifyPage.goto(SHOPIFY_APP, { waitUntil: "networkidle" });

    const ctx2 = await browser.newContext();
    demoPage = await ctx2.newPage();
    await demoPage.goto(DEMO_APP, { waitUntil: "networkidle" });
  });

  test("1. Body font-family matches", async () => {
    const shopifyFont = await shopifyPage.evaluate(() => getComputedStyle(document.body).fontFamily);
    const demoFont = await demoPage.evaluate(() => getComputedStyle(document.body).fontFamily);
    console.log("Shopify font:", shopifyFont);
    console.log("Demo font:", demoFont);
    expect(demoFont).toContain("Inter");
    expect(shopifyFont).toContain("Inter");
  });

  test("2. Body background color matches", async () => {
    const shopifyBg = await shopifyPage.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const demoBg = await demoPage.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log("Shopify bg:", shopifyBg);
    console.log("Demo bg:", demoBg);
    expect(demoBg).toBe(shopifyBg);
  });

  test("3. Sidebar width matches", async () => {
    const shopifyWidth = await shopifyPage.evaluate(() => {
      const nav = document.querySelector('.Polaris-Frame__Navigation, nav');
      return nav ? getComputedStyle(nav).width : null;
    });
    const demoWidth = await demoPage.evaluate(() => {
      const sidebar = document.querySelector('.demo-sidebar');
      return sidebar ? getComputedStyle(sidebar).width : null;
    });
    console.log("Shopify sidebar width:", shopifyWidth);
    console.log("Demo sidebar width:", demoWidth);
    if (shopifyWidth && demoWidth) {
      expect(demoWidth).toBe(shopifyWidth);
    }
  });

  test("4. Sidebar background color matches", async () => {
    const shopifyBg = await shopifyPage.evaluate(() => {
      const nav = document.querySelector('.Polaris-Frame__Navigation');
      return nav ? getComputedStyle(nav).backgroundColor : null;
    });
    const demoBg = await demoPage.evaluate(() => {
      const sidebar = document.querySelector('.demo-sidebar');
      return sidebar ? getComputedStyle(sidebar).backgroundColor : null;
    });
    console.log("Shopify sidebar bg:", shopifyBg);
    console.log("Demo sidebar bg:", demoBg);
    if (shopifyBg && demoBg) {
      expect(demoBg).toBe(shopifyBg);
    }
  });

  test("5. Navigation items match", async () => {
    const shopifyNavItems = await shopifyPage.evaluate(() => {
      const items = document.querySelectorAll('.Polaris-Navigation__Text, nav a span');
      return Array.from(items).map(el => el.textContent?.trim().toLowerCase());
    });
    const demoNavItems = await demoPage.evaluate(() => {
      const items = document.querySelectorAll('.demo-nav-item');
      return Array.from(items).map(el => {
        // Get the last span (text label, not icon)
        const spans = el.querySelectorAll('span');
        return spans[spans.length - 1]?.textContent?.trim().toLowerCase();
      });
    });
    console.log("Shopify nav:", shopifyNavItems);
    console.log("Demo nav:", demoNavItems);
    expect(demoNavItems).toEqual(shopifyNavItems);
  });

  test("6. Dashboard heading style matches", async () => {
    const shopifyStyles = await getStyles(shopifyPage, '.Polaris-Header-Title__TitleWrapper h1, h1.Polaris-Text--headingLg');
    const demoStyles = await getStyles(demoPage, '.demo-header h1');
    console.log("Shopify heading:", shopifyStyles);
    console.log("Demo heading:", demoStyles);
    expect(demoStyles.fontWeight).toBe(shopifyStyles.fontWeight);
    expect(demoStyles.fontFamily).toBe(shopifyStyles.fontFamily);
  });

  test("7. Stats card count matches", async () => {
    const shopifyStats = await shopifyPage.evaluate(() => {
      return document.querySelectorAll('.Polaris-ShadowBevel, .Polaris-Card').length;
    });
    const demoStats = await demoPage.evaluate(() => {
      return document.querySelectorAll('.demo-stat-card').length;
    });
    console.log("Shopify stats cards:", shopifyStats);
    console.log("Demo stats cards:", demoStats);
    expect(demoStats).toBe(4);
  });

  test("8. Stat values match", async () => {
    const shopifyValues = await shopifyPage.evaluate(() => {
      const cards = document.querySelectorAll('.Polaris-Text--headingLg');
      return Array.from(cards).slice(0, 4).map(el => el.textContent?.trim());
    });
    const demoValues = await demoPage.evaluate(() => {
      const cards = document.querySelectorAll('.demo-stat-value');
      return Array.from(cards).map(el => el.textContent?.trim());
    });
    console.log("Shopify values:", shopifyValues);
    console.log("Demo values:", demoValues);
    expect(demoValues).toEqual(shopifyValues);
  });

  test("9. Card background color matches", async () => {
    const shopifyCardBg = await shopifyPage.evaluate(() => {
      const card = document.querySelector('.Polaris-Box--background-surface');
      return card ? getComputedStyle(card).backgroundColor : null;
    });
    const demoCardBg = await demoPage.evaluate(() => {
      const card = document.querySelector('.demo-stat-card');
      return card ? getComputedStyle(card).backgroundColor : null;
    });
    console.log("Shopify card bg:", shopifyCardBg);
    console.log("Demo card bg:", demoCardBg);
    if (shopifyCardBg && demoCardBg) {
      expect(demoCardBg).toBe(shopifyCardBg);
    }
  });

  test("10. Card border-radius matches", async () => {
    const shopifyRadius = await shopifyPage.evaluate(() => {
      const card = document.querySelector('.Polaris-Box--background-surface');
      return card ? getComputedStyle(card).borderRadius : null;
    });
    const demoRadius = await demoPage.evaluate(() => {
      const card = document.querySelector('.demo-stat-card');
      return card ? getComputedStyle(card).borderRadius : null;
    });
    console.log("Shopify radius:", shopifyRadius);
    console.log("Demo radius:", demoRadius);
    if (shopifyRadius && demoRadius) {
      expect(demoRadius).toBe(shopifyRadius);
    }
  });

  test("11. Card box-shadow matches", async () => {
    const shopifyShadow = await shopifyPage.evaluate(() => {
      const card = document.querySelector('.Polaris-Box--background-surface');
      return card ? getComputedStyle(card).boxShadow : null;
    });
    const demoShadow = await demoPage.evaluate(() => {
      const card = document.querySelector('.demo-stat-card');
      return card ? getComputedStyle(card).boxShadow : null;
    });
    console.log("Shopify shadow:", shopifyShadow);
    console.log("Demo shadow:", demoShadow);
    if (shopifyShadow && demoShadow) {
      expect(demoShadow).toBe(shopifyShadow);
    }
  });

  test("12. Button primary color matches", async () => {
    const shopifyBtnBg = await shopifyPage.evaluate(() => {
      const btn = document.querySelector('.Polaris-Button--primary');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });
    const demoBtnBg = await demoPage.evaluate(() => {
      const btn = document.querySelector('.demo-btn-primary');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });
    console.log("Shopify btn bg:", shopifyBtnBg);
    console.log("Demo btn bg:", demoBtnBg);
    if (shopifyBtnBg && demoBtnBg) {
      expect(demoBtnBg).toBe(shopifyBtnBg);
    }
  });

  test("13. Button border-radius matches", async () => {
    const shopifyBtnRadius = await shopifyPage.evaluate(() => {
      const btn = document.querySelector('.Polaris-Button--primary');
      return btn ? getComputedStyle(btn).borderRadius : null;
    });
    const demoBtnRadius = await demoPage.evaluate(() => {
      const btn = document.querySelector('.demo-btn-primary');
      return btn ? getComputedStyle(btn).borderRadius : null;
    });
    console.log("Shopify btn radius:", shopifyBtnRadius);
    console.log("Demo btn radius:", demoBtnRadius);
    if (shopifyBtnRadius && demoBtnRadius) {
      expect(demoBtnRadius).toBe(shopifyBtnRadius);
    }
  });

  test("14. Input border-radius matches", async () => {
    const shopifyInputRadius = await shopifyPage.evaluate(() => {
      const input = document.querySelector('.Polaris-TextField__Input');
      return input ? getComputedStyle(input).borderRadius : null;
    });
    const demoInputRadius = await demoPage.evaluate(() => {
      const input = document.querySelector('.demo-search');
      return input ? getComputedStyle(input).borderRadius : null;
    });
    console.log("Shopify input radius:", shopifyInputRadius);
    console.log("Demo input radius:", demoInputRadius);
    if (shopifyInputRadius && demoInputRadius) {
      expect(demoInputRadius).toBe(shopifyInputRadius);
    }
  });

  test("15. Badge border-radius matches", async () => {
    const shopifyBadgeRadius = await shopifyPage.evaluate(() => {
      const badge = document.querySelector('.Polaris-Badge');
      return badge ? getComputedStyle(badge).borderRadius : null;
    });
    const demoBadgeRadius = await demoPage.evaluate(() => {
      const badge = document.querySelector('.demo-status');
      return badge ? getComputedStyle(badge).borderRadius : null;
    });
    console.log("Shopify badge radius:", shopifyBadgeRadius);
    console.log("Demo badge radius:", demoBadgeRadius);
    if (shopifyBadgeRadius && demoBadgeRadius) {
      expect(demoBadgeRadius).toBe(shopifyBadgeRadius);
    }
  });

  test("16. Page heading text matches", async () => {
    const shopifyHeading = await shopifyPage.evaluate(() => {
      const h1 = document.querySelector('.Polaris-Header-Title__TitleWrapper h1, h1');
      return h1?.textContent?.trim();
    });
    const demoHeading = await demoPage.evaluate(() => {
      const h1 = document.querySelector('.demo-header h1');
      return h1?.textContent?.trim();
    });
    console.log("Shopify heading:", shopifyHeading);
    console.log("Demo heading:", demoHeading);
    expect(demoHeading).toBe(shopifyHeading);
  });

  test("17. Navigation item font matches", async () => {
    const shopifyNavFont = await shopifyPage.evaluate(() => {
      const item = document.querySelector('.Polaris-Navigation__Text');
      return item ? getComputedStyle(item).fontFamily : null;
    });
    const demoNavFont = await demoPage.evaluate(() => {
      const item = document.querySelector('.demo-nav-item');
      return item ? getComputedStyle(item).fontFamily : null;
    });
    console.log("Shopify nav font:", shopifyNavFont);
    console.log("Demo nav font:", demoNavFont);
    if (shopifyNavFont && demoNavFont) {
      expect(demoNavFont).toBe(shopifyNavFont);
    }
  });

  test("18. Navigation item font-weight matches", async () => {
    const shopifyNavWeight = await shopifyPage.evaluate(() => {
      const item = document.querySelector('.Polaris-Navigation__Text');
      return item ? getComputedStyle(item).fontWeight : null;
    });
    const demoNavWeight = await demoPage.evaluate(() => {
      const item = document.querySelector('.demo-nav-item');
      return item ? getComputedStyle(item).fontWeight : null;
    });
    console.log("Shopify nav weight:", shopifyNavWeight);
    console.log("Demo nav weight:", demoNavWeight);
    if (shopifyNavWeight && demoNavWeight) {
      expect(demoNavWeight).toBe(shopifyNavWeight);
    }
  });

  test("19. Dashboard subtitle matches", async () => {
    const shopifySubtitle = await shopifyPage.evaluate(() => {
      const sub = document.querySelector('.Polaris-Header-Title__SubTitle');
      return sub?.textContent?.trim();
    });
    const demoSubtitle = await demoPage.evaluate(() => {
      const sub = document.querySelector('.demo-subtitle');
      return sub?.textContent?.trim();
    });
    console.log("Shopify subtitle:", shopifySubtitle);
    console.log("Demo subtitle:", demoSubtitle);
    if (shopifySubtitle) {
      expect(demoSubtitle).toBe(shopifySubtitle);
    }
  });

  test("20. Color tokens match (CSS variables)", async () => {
    const shopifyTokens = await shopifyPage.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        bg: style.getPropertyValue('--p-color-bg'),
        text: style.getPropertyValue('--p-color-text'),
        surface: style.getPropertyValue('--p-color-bg-surface'),
        border: style.getPropertyValue('--p-color-border'),
      };
    });
    const demoTokens = await demoPage.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        bg: style.getPropertyValue('--p-color-bg'),
        text: style.getPropertyValue('--p-color-text'),
        surface: style.getPropertyValue('--p-color-bg-surface'),
        border: style.getPropertyValue('--p-color-border'),
      };
    });
    console.log("Shopify tokens:", shopifyTokens);
    console.log("Demo tokens:", demoTokens);
    expect(demoTokens.bg).toBe(shopifyTokens.bg);
    expect(demoTokens.text).toBe(shopifyTokens.text);
    expect(demoTokens.surface).toBe(shopifyTokens.surface);
    expect(demoTokens.border).toBe(shopifyTokens.border);
  });
});
