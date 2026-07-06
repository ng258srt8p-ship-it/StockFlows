/**
 * StockFlows Live Chrome Audit Script
 * 
 * Connects to existing Chrome on port 9222 and audits the Shopify embedded app.
 * Run: node e2e/run-audit.mjs
 */
import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "..", "screenshots", "audit");
const SHOPIFY_ADMIN = "https://admin.shopify.com/store/stockflows2/apps/stockflows-app";

// Ensure screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = {
  dashboard: { issues: [], passed: [] },
  navigation: { issues: [], passed: [] },
  inventory: { issues: [], passed: [] },
  purchasing: { issues: [], passed: [] },
  forecasting: { issues: [], passed: [] },
  reports: { issues: [], passed: [] },
  settings: { issues: [], passed: [] },
  mobile: { issues: [], passed: [] },
  typography: { issues: [], passed: [] },
  css: { issues: [], passed: [] },
  console: { issues: [], passed: [] },
  accessibility: { issues: [], passed: [] },
  performance: { issues: [], passed: [] },
};

function log(section, type, msg) {
  const icon = type === "pass" ? "✅" : type === "fail" ? "❌" : "⚠️";
  console.log(`  ${icon} ${msg}`);
  if (type === "pass") results[section].passed.push(msg);
  else results[section].issues.push(msg);
}

async function audit() {
  console.log("🔌 Connecting to Chrome on port 9222...");
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });

  // ========== 1. DASHBOARD ==========
  console.log("\n📊 1. DASHBOARD AUDIT");
  try {
    await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);

    // Screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-dashboard.png"), fullPage: true });

    // Check heading
    const h1 = page.locator("h1");
    if (await h1.count() > 0) {
      const text = await h1.textContent();
      if (text?.includes("Dashboard")) {
        log("dashboard", "pass", `Dashboard heading found: "${text}"`);
      } else {
        log("dashboard", "fail", `Unexpected heading: "${text}"`);
      }
    } else {
      log("dashboard", "fail", "No H1 heading found");
    }

    // Check stat cards
    const cards = page.locator(".Polaris-Card");
    const cardCount = await cards.count();
    log("dashboard", cardCount >= 4 ? "pass" : "fail", `Found ${cardCount} Polaris cards (expected 4+)`);

    // Check stat labels
    const body = await page.textContent("body");
    for (const label of ["Total SKUs", "Low Stock", "Out of Stock", "Inventory Value"]) {
      log("dashboard", body?.includes(label) ? "pass" : "fail", `Stat label "${label}": ${body?.includes(label) ? "present" : "MISSING"}`);
    }

    // Check alerts section
    log("dashboard", body?.includes("Active Alerts") ? "pass" : "fail", `Active Alerts section: ${body?.includes("Active Alerts") ? "present" : "MISSING"}`);
    log("dashboard", body?.includes("Recent Activity") ? "pass" : "fail", `Recent Activity section: ${body?.includes("Recent Activity") ? "present" : "MISSING"}`);

    // Card spacing
    if (cardCount >= 2) {
      const boxes = [];
      for (let i = 0; i < Math.min(cardCount, 8); i++) {
        const box = await cards.nth(i).boundingBox();
        if (box) boxes.push(box);
      }
      
      // Check for overlapping cards
      let hasOverlap = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], b = boxes[j];
          if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) {
            hasOverlap = true;
            log("dashboard", "fail", `Card ${i} and ${j} overlap`);
          }
        }
      }
      if (!hasOverlap) log("dashboard", "pass", "No card overlaps detected");
    }

    // Empty state check
    if (body?.includes("No recent stock movements")) {
      log("dashboard", "fail", "Dashboard shows empty state (no inventory data)");
    }
  } catch (e) {
    log("dashboard", "fail", `Dashboard audit failed: ${e.message}`);
  }

  // ========== 2. NAVIGATION ==========
  console.log("\n🧭 2. NAVIGATION AUDIT");
  const navItems = [
    { name: "Inventory", path: "inventory" },
    { name: "Purchasing", path: "purchasing" },
    { name: "Forecasting", path: "forecasting" },
    { name: "Reports", path: "reports" },
    { name: "Settings", path: "settings" },
  ];

  for (const nav of navItems) {
    try {
      const navLink = page.getByRole("link", { name: nav.name });
      const exists = await navLink.count() > 0;
      const visible = exists && await navLink.isVisible();
      
      log("navigation", exists ? "pass" : "fail", `Nav "${nav.name}" exists: ${exists}`);
      log("navigation", visible ? "pass" : "fail", `Nav "${nav.name}" visible: ${visible}`);
      
      if (visible) {
        await navLink.click();
        await page.waitForTimeout(3000);
        
        const url = page.url();
        const loaded = url.includes(nav.path);
        log("navigation", loaded ? "pass" : "fail", `Nav "${nav.name}" navigated to: ${url}`);
        
        // Check page has content
        const h1 = page.locator("h1");
        if (await h1.count() > 0) {
          const text = await h1.textContent();
          log("navigation", "pass", `Page heading: "${text}"`);
        }
        
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `02-nav-${nav.name.toLowerCase()}.png`), fullPage: true });
      }
    } catch (e) {
      log("navigation", "fail", `Nav "${nav.name}" error: ${e.message}`);
    }
  }

  // ========== 3. INVENTORY ==========
  console.log("\n📦 3. INVENTORY AUDIT");
  try {
    await page.goto(`${SHOPIFY_ADMIN}/inventory`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-inventory.png"), fullPage: true });

    const table = page.locator("table");
    const tableExists = await table.count() > 0;
    log("inventory", tableExists ? "pass" : "warn", `Inventory table: ${tableExists ? "present" : "not found (may use Polaris IndexTable)"}`);

    const indexTable = page.locator(".Polaris-IndexTable");
    const indexTableExists = await indexTable.count() > 0;
    log("inventory", indexTableExists ? "pass" : "warn", `Polaris IndexTable: ${indexTableExists ? "present" : "not found"}`);

    // Check for empty state
    const body = await page.textContent("body");
    const hasEmpty = body?.includes("No inventory items") || body?.includes("No items");
    log("inventory", hasEmpty ? "warn" : "pass", `Empty state: ${hasEmpty ? "SHOWING (no data)" : "has data or different empty state"}`);

    // Check for action buttons
    const addBtn = page.getByRole("button", { name: /add|create|new/i });
    const hasAddBtn = await addBtn.count() > 0;
    log("inventory", hasAddBtn ? "pass" : "fail", `Add/Create button: ${hasAddBtn ? "present" : "MISSING"}`);

    // Check table rows
    const rows = page.locator("table tbody tr, .Polaris-IndexTable__Row");
    const rowCount = await rows.count();
    log("inventory", rowCount > 0 ? "pass" : "warn", `Inventory rows: ${rowCount}`);

    // Try clicking first item
    if (rowCount > 0) {
      const firstRow = rows.first();
      await firstRow.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-inventory-detail.png"), fullPage: true });
      log("inventory", "pass", "Inventory detail page loaded");
    }
  } catch (e) {
    log("inventory", "fail", `Inventory audit failed: ${e.message}`);
  }

  // ========== 4. PURCHASING ==========
  console.log("\n🛒 4. PURCHASING AUDIT");
  try {
    await page.goto(`${SHOPIFY_ADMIN}/purchasing`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-purchasing.png"), fullPage: true });

    const body = await page.textContent("body");
    log("purchasing", body?.includes("Purchase Orders") ? "pass" : "warn", `Purchase Orders heading: ${body?.includes("Purchase Orders") ? "present" : "check manually"}`);

    // Check sub-routes
    for (const sub of ["new", "vendors"]) {
      const link = page.getByRole("link", { name: new RegExp(sub, "i") });
      const exists = await link.count() > 0;
      log("purchasing", exists ? "pass" : "warn", `Link to /purchasing/${sub}: ${exists ? "present" : "not found"}`);
    }

    // Test create PO page
    await page.goto(`${SHOPIFY_ADMIN}/purchasing/new`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-purchasing-new.png"), fullPage: true });

    // Test vendors page
    await page.goto(`${SHOPIFY_ADMIN}/purchasing/vendors`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-purchasing-vendors.png"), fullPage: true });
  } catch (e) {
    log("purchasing", "fail", `Purchasing audit failed: ${e.message}`);
  }

  // ========== 5. FORECASTING ==========
  console.log("\n📈 5. FORECASTING AUDIT");
  try {
    await page.goto(`${SHOPIFY_ADMIN}/forecasting`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-forecasting.png"), fullPage: true });

    const body = await page.textContent("body");
    log("forecasting", body?.includes("Forecast") ? "pass" : "warn", `Forecasting content: ${body?.includes("Forecast") ? "present" : "check manually"}`);

    // Check for forecast cards or charts
    const cards = page.locator(".Polaris-Card");
    const cardCount = await cards.count();
    log("forecasting", cardCount > 0 ? "pass" : "warn", `Forecast cards: ${cardCount}`);
  } catch (e) {
    log("forecasting", "fail", `Forecasting audit failed: ${e.message}`);
  }

  // ========== 6. REPORTS ==========
  console.log("\n📊 6. REPORTS AUDIT");
  try {
    await page.goto(`${SHOPIFY_ADMIN}/reports`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-reports.png"), fullPage: true });

    const body = await page.textContent("body");
    
    // Check for report sections
    for (const section of ["Inventory Valuation", "Stock Movement", "ABC Analysis", "Turnover"]) {
      log("reports", body?.includes(section) ? "pass" : "warn", `Report section "${section}": ${body?.includes(section) ? "present" : "not found"}`);
    }

    // Check export button
    const exportBtn = page.getByRole("button", { name: /export/i });
    log("reports", await exportBtn.count() > 0 ? "pass" : "fail", `Export button: ${await exportBtn.count() > 0 ? "present" : "MISSING"}`);

    // Check PDF button
    const pdfBtn = page.getByRole("button", { name: /pdf/i });
    log("reports", await pdfBtn.count() > 0 ? "pass" : "warn", `PDF button: ${await pdfBtn.count() > 0 ? "present" : "not found"}`);
  } catch (e) {
    log("reports", "fail", `Reports audit failed: ${e.message}`);
  }

  // ========== 7. SETTINGS ==========
  console.log("\n⚙️ 7. SETTINGS AUDIT");
  try {
    await page.goto(`${SHOPIFY_ADMIN}/settings`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-settings.png"), fullPage: true });

    const body = await page.textContent("body");
    
    // Check settings sections
    for (const section of ["General", "Notifications", "Reorder", "Safety Stock", "Low Stock"]) {
      log("settings", body?.includes(section) ? "pass" : "warn", `Settings section "${section}": ${body?.includes(section) ? "present" : "not found"}`);
    }

    // Check form elements
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    log("settings", inputCount > 0 ? "pass" : "fail", `Input fields: ${inputCount}`);

    const selects = page.locator("select");
    const selectCount = await selects.count();
    log("settings", selectCount > 0 ? "pass" : "warn", `Select fields: ${selectCount}`);

    const buttons = page.getByRole("button");
    const buttonCount = await buttons.count();
    log("settings", buttonCount > 0 ? "pass" : "fail", `Buttons: ${buttonCount}`);

    // Check for Save button
    const saveBtn = page.getByRole("button", { name: /save/i });
    log("settings", await saveBtn.count() > 0 ? "pass" : "fail", `Save button: ${await saveBtn.count() > 0 ? "present" : "MISSING"}`);
  } catch (e) {
    log("settings", "fail", `Settings audit failed: ${e.message}`);
  }

  // ========== 8. MOBILE RESPONSIVE ==========
  console.log("\n📱 8. MOBILE RESPONSIVE AUDIT");
  const mobileViewports = [
    { name: "iPhone-SE", width: 375, height: 667 },
    { name: "iPhone-14", width: 390, height: 844 },
    { name: "iPad-Mini", width: 768, height: 1024 },
  ];

  for (const vp of mobileViewports) {
    try {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `11-mobile-${vp.name}.png`), fullPage: true });

      // Check hamburger menu
      const hamburger = page.locator("[aria-label*='Menu'], [aria-label*='menu'], button:has(svg)").first();
      const hasHamburger = await hamburger.count() > 0 && await hamburger.isVisible();
      log("mobile", hasHamburger ? "pass" : "fail", `${vp.name} hamburger menu: ${hasHamburger ? "visible" : "NOT FOUND"}`);

      // Check horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const vpWidth = await page.evaluate(() => window.innerWidth);
      const hasOverflow = bodyWidth > vpWidth + 5; // 5px tolerance
      log("mobile", hasOverflow ? "fail" : "pass", `${vp.name} horizontal overflow: ${hasOverflow ? `YES (${bodyWidth}px > ${vpWidth}px)` : "none"}`);

      // Check main content visibility
      const main = page.locator("main, [role='main'], .Polaris-Page").first();
      const mainVisible = await main.count() > 0 && await main.isVisible();
      log("mobile", mainVisible ? "pass" : "fail", `${vp.name} main content: ${mainVisible ? "visible" : "NOT VISIBLE"}`);

      // Check if nav items are accessible (hamburger or visible)
      const navLinks = page.locator("nav a, [role='navigation'] a");
      const visibleNavLinks = await navLinks.evaluateAll((els) => 
        els.filter(el => {
          const style = getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }).length
      );
      log("mobile", visibleNavLinks > 0 ? "pass" : "warn", `${vp.name} visible nav links: ${visibleNavLinks}`);
    } catch (e) {
      log("mobile", "fail", `${vp.name} audit failed: ${e.message}`);
    }
  }

  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // ========== 9. TYPOGRAPHY ==========
  console.log("\n🔤 9. TYPOGRAPHY & SPACING AUDIT");
  try {
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    const fonts = {};
    
    for (const p of pages) {
      const url = p ? `${SHOPIFY_ADMIN}/${p}` : SHOPIFY_ADMIN;
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);
      
      const fontFamily = await page.evaluate(() => {
        const h1 = document.querySelector("h1");
        return h1 ? getComputedStyle(h1).fontFamily : "N/A";
      });
      fonts[p || "dashboard"] = fontFamily;
    }
    
    const uniqueFonts = [...new Set(Object.values(fonts))];
    log("typography", uniqueFonts.length === 1 ? "pass" : "warn", `Font consistency: ${uniqueFonts.length === 1 ? "All pages use same font" : "Different fonts found: " + uniqueFonts.join(", ")}`);
    
    for (const [page, font] of Object.entries(fonts)) {
      console.log(`    ${page}: ${font}`);
    }
  } catch (e) {
    log("typography", "fail", `Typography audit failed: ${e.message}`);
  }

  // ========== 10. CSS VARIABLES ==========
  console.log("\n🎨 10. CSS VARIABLES & THEME AUDIT");
  try {
    await page.goto(SHOPIFY_ADMIN, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const vars = {};
      const checks = [
        "--p-color-bg", "--p-color-text", "--p-color-border",
        "--p-font-family", "--p-space-400", "--p-color-bg-surface",
      ];
      for (const v of checks) {
        vars[v] = getComputedStyle(root).getPropertyValue(v).trim() || "NOT SET";
      }
      return vars;
    });

    for (const [varName, value] of Object.entries(cssVars)) {
      log("css", value !== "NOT SET" ? "pass" : "fail", `${varName}: ${value || "NOT SET"}`);
    }

    // Check for inline style overrides
    const overrides = await page.evaluate(() => {
      const issues = [];
      const inlineFont = document.querySelectorAll("[style*='font-family']");
      if (inlineFont.length > 0) issues.push(`${inlineFont.length} elements with inline font-family`);
      const highZ = document.querySelectorAll("[style*='z-index: 999']");
      if (highZ.length > 0) issues.push(`${highZ.length} elements with z-index: 999`);
      return issues;
    });

    log("css", overrides.length === 0 ? "pass" : "warn", `Inline style overrides: ${overrides.length === 0 ? "none" : overrides.join("; ")}`);
  } catch (e) {
    log("css", "fail", `CSS audit failed: ${e.message}`);
  }

  // ========== 11. CONSOLE ERRORS ==========
  console.log("\n🚨 11. CONSOLE ERRORS AUDIT");
  try {
    const errorPages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    const pageErrors = {};
    
    for (const p of errorPages) {
      const url = p ? `${SHOPIFY_ADMIN}/${p}` : SHOPIFY_ADMIN;
      const errors = [];
      
      const handler = (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      };
      const errHandler = (err) => {
        errors.push(err.message);
      };
      
      page.on("console", handler);
      page.on("pageerror", errHandler);
      
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(2000);
      
      page.off("console", handler);
      page.off("pageerror", errHandler);
      
      if (errors.length > 0) {
        pageErrors[p || "dashboard"] = errors;
      }
    }

    const totalErrors = Object.values(pageErrors).flat().length;
    log("console", totalErrors === 0 ? "pass" : "fail", `Total console errors across all pages: ${totalErrors}`);
    
    for (const [page, errors] of Object.entries(pageErrors)) {
      for (const error of errors) {
        log("console", "fail", `[${page}] ${error.substring(0, 120)}`);
      }
    }
  } catch (e) {
    log("console", "fail", `Console audit failed: ${e.message}`);
  }

  // ========== 12. ACCESSIBILITY ==========
  console.log("\n♿ 12. ACCESSIBILITY AUDIT");
  try {
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    
    for (const p of pages) {
      const url = p ? `${SHOPIFY_ADMIN}/${p}` : SHOPIFY_ADMIN;
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);

      const headings = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim().substring(0, 50),
        }));
      });

      const hasH1 = headings.some(h => h.level === 1);
      log("accessibility", hasH1 ? "pass" : "fail", `${p || "dashboard"} has H1: ${hasH1}`);

      // Check heading hierarchy
      let prevLevel = 0;
      let hierarchyOk = true;
      for (const h of headings) {
        if (h.level > prevLevel + 1 && prevLevel > 0) {
          hierarchyOk = false;
        }
        prevLevel = h.level;
      }
      log("accessibility", hierarchyOk ? "pass" : "warn", `${p || "dashboard"} heading hierarchy: ${hierarchyOk ? "OK" : "SKIPPED LEVELS"}`);

      // Check images
      const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("img")).map(img => ({
          src: img.src.substring(0, 60),
          alt: img.alt,
        }));
      });
      const missingAlt = images.filter(i => !i.alt);
      log("accessibility", missingAlt.length === 0 ? "pass" : "warn", `${p || "dashboard"} images missing alt: ${missingAlt.length}`);
    }
  } catch (e) {
    log("accessibility", "fail", `Accessibility audit failed: ${e.message}`);
  }

  // ========== 13. PERFORMANCE ==========
  console.log("\n⚡ 13. PERFORMANCE AUDIT");
  try {
    const pages = ["", "inventory", "purchasing", "forecasting", "reports", "settings"];
    
    for (const p of pages) {
      const url = p ? `${SHOPIFY_ADMIN}/${p}` : SHOPIFY_ADMIN;
      const start = Date.now();
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      const loadTime = Date.now() - start;
      
      log("performance", loadTime < 5000 ? "pass" : "warn", `${p || "dashboard"}: ${loadTime}ms ${loadTime > 5000 ? "(SLOW)" : ""}`);
    }
  } catch (e) {
    log("performance", "fail", `Performance audit failed: ${e.message}`);
  }

  // ========== SUMMARY ==========
  console.log("\n" + "=".repeat(60));
  console.log("📋 AUDIT SUMMARY");
  console.log("=".repeat(60));
  
  let totalPass = 0;
  let totalIssues = 0;
  
  for (const [section, data] of Object.entries(results)) {
    const pass = data.passed.length;
    const fail = data.issues.length;
    totalPass += pass;
    totalIssues += fail;
    const icon = fail === 0 ? "✅" : fail > 2 ? "❌" : "⚠️";
    console.log(`${icon} ${section}: ${pass} passed, ${fail} issues`);
  }
  
  console.log(`\nTotal: ${totalPass} passed, ${totalIssues} issues`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
  
  // Write detailed report
  const reportPath = path.join(SCREENSHOT_DIR, "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Detailed report: ${reportPath}`);
}

audit().catch(console.error);
