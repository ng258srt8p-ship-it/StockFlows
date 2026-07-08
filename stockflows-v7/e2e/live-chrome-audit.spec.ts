/**
 * StockFlows Live Chrome Audit
 * 
 * Connects to existing Chrome session on port 9222 (authenticated Shopify admin)
 * and performs comprehensive UI/UX audit of the embedded app.
 * 
 * Usage:
 *   npx playwright test e2e/live-chrome-audit.spec.ts --config=playwright.live-chrome.config.ts
 */
import { test, expect, chromium, BrowserContext, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SHOPIFY_ADMIN = "https://admin.shopify.com/store/stockflows2/apps/stockflows-app";
const SCREENSHOT_DIR = path.join(__dirname, "..", "screenshots", "audit");

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
  // Connect to existing Chrome session
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  context = browser.contexts()[0];
  page = context.pages()[0] || await context.newPage();
  
  // Navigate to the app
  await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000); // Wait for embedded app to load
});

test.afterAll(async () => {
  // Don't close - we're using the user's browser
});

test.describe("1. Dashboard Audit", () => {
  test("Dashboard loads and shows stat cards", async () => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Dashboard");
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "01-dashboard.png"), 
      fullPage: true 
    });
    
    // Check stat cards exist
    const statCards = page.locator(".Polaris-Card");
    const count = await statCards.count();
    console.log(`Found ${count} cards on Dashboard`);
    
    // Check for stat labels
    const pageContent = await page.textContent("body");
    const expectedLabels = ["Total SKUs", "Low Stock", "Out of Stock", "Inventory Value"];
    for (const label of expectedLabels) {
      const found = pageContent?.includes(label) ?? false;
      console.log(`  ${label}: ${found ? "✅" : "❌ MISSING"}`);
    }
  });

  test("Dashboard stat cards have proper spacing", async () => {
    const cards = page.locator(".Polaris-Card");
    const count = await cards.count();
    
    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = cards.nth(i);
      const box = await card.boundingBox();
      if (box) {
        console.log(`Card ${i}: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
      }
    }
    
    // Check for overlapping cards
    if (count >= 2) {
      const box1 = await cards.nth(0).boundingBox();
      const box2 = await cards.nth(1).boundingBox();
      if (box1 && box2) {
        const overlap = box1.x + box1.width > box2.x && 
                       box1.y + box1.height > box2.y &&
                       box2.y + box2.height > box1.y;
        console.log(`Cards overlap: ${overlap ? "❌ YES" : "✅ NO"}`);
      }
    }
  });

  test("Dashboard alerts section renders", async () => {
    const alertsSection = page.getByText("Active Alerts");
    await expect(alertsSection).toBeVisible();
    
    const activitySection = page.getByText("Recent Activity");
    await expect(activitySection).toBeVisible();
  });
});

test.describe("2. Navigation Audit", () => {
  const navItems = ["Dashboard", "Inventory", "Purchasing", "Forecasting", "Reports", "Settings"];
  
  for (const item of navItems) {
    test(`Nav item "${item}" is clickable and loads`, async () => {
      const navLink = page.getByRole("link", { name: item });
      
      // Check if nav item exists
      const exists = await navLink.count() > 0;
      console.log(`Nav "${item}" exists: ${exists ? "✅" : "❌"}`);
      
      if (exists) {
        // Check visibility
        const visible = await navLink.isVisible();
        console.log(`Nav "${item}" visible: ${visible ? "✅" : "❌"}`);
        
        if (visible) {
          await navLink.click();
          await page.waitForTimeout(2000);
          
          // Take screenshot of each page
          await page.screenshot({ 
            path: path.join(SCREENSHOT_DIR, `02-nav-${item.toLowerCase()}.png`), 
            fullPage: true 
          });
          
          // Check page loaded (should have a heading)
          const heading = page.locator("h1");
          const headingText = await heading.textContent();
          console.log(`  Page heading: "${headingText}"`);
        }
      }
    });
  }
});

test.describe("3. Inventory Page Audit", () => {
  test("Inventory page loads with data table", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/inventory`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "03-inventory.png"), 
      fullPage: true 
    });
    
    // Check for table or empty state
    const table = page.locator("table");
    const tableExists = await table.count() > 0;
    console.log(`Inventory table exists: ${tableExists ? "✅" : "❌"}`);
    
    if (tableExists) {
      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();
      console.log(`Inventory rows: ${rowCount}`);
    }
    
    // Check for empty state
    const emptyState = page.getByText("No inventory items");
    const hasEmptyState = await emptyState.count() > 0;
    console.log(`Empty state shown: ${hasEmptyState ? "⚠️ YES" : "✅ NO"}`);
  });

  test("Inventory item detail page", async () => {
    // Try to click first inventory item
    const firstRow = page.locator("table tbody tr").first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, "04-inventory-detail.png"), 
        fullPage: true 
      });
    }
  });
});

test.describe("4. Purchasing Page Audit", () => {
  test("Purchasing page loads", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/purchasing`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "05-purchasing.png"), 
      fullPage: true 
    });
    
    const heading = page.locator("h1");
    const headingText = await heading.textContent();
    console.log(`Purchasing heading: "${headingText}"`);
  });

  test("Create purchase order page", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/purchasing/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "06-purchasing-new.png"), 
      fullPage: true 
    });
  });

  test("Vendors page", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/purchasing/vendors`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "07-purchasing-vendors.png"), 
      fullPage: true 
    });
  });
});

test.describe("5. Forecasting Page Audit", () => {
  test("Forecasting page loads", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/forecasting`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "08-forecasting.png"), 
      fullPage: true 
    });
    
    const heading = page.locator("h1");
    const headingText = await heading.textContent();
    console.log(`Forecasting heading: "${headingText}"`);
  });
});

test.describe("6. Reports Page Audit", () => {
  test("Reports page loads", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/reports`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "09-reports.png"), 
      fullPage: true 
    });
  });

  test("Reports export CSV", async () => {
    const exportBtn = page.getByRole("button", { name: /export/i });
    if (await exportBtn.count() > 0) {
      console.log("Export button found: ✅");
    } else {
      console.log("Export button found: ❌ MISSING");
    }
  });
});

test.describe("7. Settings Page Audit", () => {
  test("Settings page loads with all sections", async () => {
    await page.goto(`${SHOPIFY_ADMIN}/settings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOT_DIR, "10-settings.png"), 
      fullPage: true 
    });
    
    // Check for settings sections
    const sections = ["General", "Notifications", "Reorder Points", "Safety Stock"];
    const content = await page.textContent("body");
    for (const section of sections) {
      const found = content?.includes(section) ?? false;
      console.log(`Settings section "${section}": ${found ? "✅" : "❌"}`);
    }
  });

  test("Settings form fields are interactive", async () => {
    // Check for input fields
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    console.log(`Settings input fields: ${inputCount}`);
    
    // Check for select fields
    const selects = page.locator("select");
    const selectCount = await selects.count();
    console.log(`Settings select fields: ${selectCount}`);
    
    // Check for buttons
    const buttons = page.getByRole("button");
    const buttonCount = await buttons.count();
    console.log(`Settings buttons: ${buttonCount}`);
  });
});

test.describe("8. Mobile Responsive Audit", () => {
  const mobileViewports = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 14", width: 390, height: 844 },
    { name: "iPad Mini", width: 768, height: 1024 },
  ];

  for (const viewport of mobileViewports) {
    test(`Mobile layout at ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle" });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: path.join(SCREENSHOT_DIR, `11-mobile-${viewport.name.replace(/\s/g, "-").toLowerCase()}.png`), 
        fullPage: true 
      });
      
      // Check if navigation is accessible
      const hamburger = page.locator("[aria-label*='Menu']").first();
      const hamburgerVisible = await hamburger.count() > 0 && await hamburger.isVisible();
      console.log(`${viewport.name} hamburger menu: ${hamburgerVisible ? "✅" : "❌"}`);
      
      // Check if content is visible
      const mainContent = page.locator("main, [role='main']").first();
      const contentVisible = await mainContent.count() > 0 && await mainContent.isVisible();
      console.log(`${viewport.name} main content visible: ${contentVisible ? "✅" : "❌"}`);
      
      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      const hasOverflow = bodyWidth > viewportWidth;
      console.log(`${viewport.name} horizontal overflow: ${hasOverflow ? "❌ YES (${bodyWidth} > ${viewportWidth})" : "✅ NO"}`);
    });
  }
});

test.describe("9. Typography & Spacing Audit", () => {
  test("Font consistency across pages", async () => {
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    
    for (const pagePath of pages) {
      const url = pagePath ? `${SHOPIFY_ADMIN}/${pagePath}` : SHOPIFY_ADMIN;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      
      const fontFamily = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        return h1 ? getComputedStyle(h1).fontFamily : "N/A";
      });
      
      console.log(`${pagePath || "dashboard"} font: ${fontFamily}`);
    }
  });

  test("Card spacing consistency", async () => {
    await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    const cards = page.locator(".Polaris-Card");
    const count = await cards.count();
    
    const paddings: number[] = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const padding = await cards.nth(i).evaluate((el) => {
        return parseFloat(getComputedStyle(el).padding);
      });
      paddings.push(padding);
    }
    
    console.log(`Card paddings: ${JSON.stringify(paddings)}`);
    const unique = [...new Set(paddings)];
    console.log(`Unique paddings: ${unique.length === 1 ? "✅ Consistent" : "❌ Inconsistent: " + unique.join(", ")}`);
  });
});

test.describe("10. CSS Variables & Theme Audit", () => {
  test("Polaris CSS variables are loaded", async () => {
    await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const vars: Record<string, string> = {};
      
      // Check key Polaris variables
      const checks = [
        "--p-color-bg",
        "--p-color-text",
        "--p-color-border",
        "--p-font-family",
        "--p-font-size-300",
        "--p-space-400",
      ];
      
      for (const v of checks) {
        vars[v] = getComputedStyle(root).getPropertyValue(v) || "NOT SET";
      }
      
      return vars;
    });
    
    for (const [varName, value] of Object.entries(cssVars)) {
      console.log(`${varName}: ${value || "❌ NOT SET"}`);
    }
  });

  test("No custom CSS overrides breaking Polaris", async () => {
    await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    const overrides = await page.evaluate(() => {
      const issues: string[] = [];
      
      // Check for body background override
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      if (bodyBg === "rgba(0, 0, 0, 0)" || bodyBg === "transparent") {
        issues.push("body background is transparent (Polaris default - may be ok for embedded)");
      }
      
      // Check for z-index conflicts
      const highZ = document.querySelectorAll("[style*='z-index: 999'], [style*='z-index:999']");
      if (highZ.length > 0) {
        issues.push(`${highZ.length} elements with z-index: 999`);
      }
      
      // Check for inline styles overriding Polaris
      const inlineStyles = document.querySelectorAll("[style*='font-family']");
      if (inlineStyles.length > 0) {
        issues.push(`${inlineStyles.length} elements with inline font-family`);
      }
      
      return issues;
    });
    
    if (overrides.length === 0) {
      console.log("No CSS override issues found: ✅");
    } else {
      for (const issue of overrides) {
        console.log(`⚠️ ${issue}`);
      }
    }
  });
});

test.describe("11. Console Errors Audit", () => {
  test("No JavaScript errors on any page", async () => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    page.on("pageerror", (error) => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });
    
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    
    for (const pagePath of pages) {
      const url = pagePath ? `${SHOPIFY_ADMIN}/${pagePath}` : SHOPIFY_ADMIN;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
    }
    
    if (errors.length === 0) {
      console.log("No console errors found: ✅");
    } else {
      console.log(`Found ${errors.length} console errors:`);
      for (const error of errors) {
        console.log(`  ❌ ${error}`);
      }
    }
  });
});

test.describe("12. Accessibility Audit", () => {
  test("All pages have proper heading hierarchy", async () => {
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    
    for (const pagePath of pages) {
      const url = pagePath ? `${SHOPIFY_ADMIN}/${pagePath}` : SHOPIFY_ADMIN;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      
      const headings = await page.evaluate(() => {
        const hs = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        return Array.from(hs).map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim().substring(0, 50),
        }));
      });
      
      console.log(`${pagePath || "dashboard"} headings: ${headings.map(h => `H${h.level}:"${h.text}"`).join(", ")}`);
      
      // Check for h1
      const hasH1 = headings.some(h => h.level === 1);
      console.log(`  Has H1: ${hasH1 ? "✅" : "❌"}`);
    }
  });

  test("All images have alt text", async () => {
    await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      return Array.from(imgs).map(img => ({
        src: img.src.substring(0, 80),
        alt: img.alt || "MISSING",
      }));
    });
    
    const missingAlt = images.filter(i => i.alt === "MISSING");
    console.log(`Images: ${images.length} total, ${missingAlt.length} missing alt text`);
    if (missingAlt.length > 0) {
      for (const img of missingAlt) {
        console.log(`  ❌ Missing alt: ${img.src}`);
      }
    }
  });
});

test.describe("13. Performance Audit", () => {
  test("Page load times", async () => {
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    
    for (const pagePath of pages) {
      const url = pagePath ? `${SHOPIFY_ADMIN}/${pagePath}` : SHOPIFY_ADMIN;
      
      const start = Date.now();
      await page.goto(url, { waitUntil: "networkidle" });
      const loadTime = Date.now() - start;
      
      console.log(`${pagePath || "dashboard"}: ${loadTime}ms ${loadTime > 5000 ? "❌ SLOW" : "✅"}`);
    }
  });
});
