import { chromium, webkit } from 'playwright';
import { readFileSync } from 'fs';
import path from 'path';

const LISTING_URL = 'https://partners.shopify.com/5004034/apps/388020928513/distribution';

const TAGLINE = 'Inventory tracking, demand forecasting, and purchase order management for Shopify stores.';

const DESCRIPTION = `StockFlows replaces Shopify's discontinued Stocky app with a modern inventory management system. Track stock across multiple locations, predict demand with statistical models, automate purchase orders, and get alerts before stockouts happen.

Key Features:

Multi-Location Inventory — Track stock levels across warehouses, retail stores, and 3PL locations in real time. Dashboard shows alerts, value at risk, and stock health at a glance.

Demand Forecasting — Exponential Smoothing models predict 30-day demand for every SKU. Auto-selects the best model per product and blends top performers for maximum accuracy. See predictions with confidence intervals.

Smart Purchase Orders — Create POs with vendors, track partial receiving, and calculate landed costs (shipping + duties + fees). PO status flows from Draft to Sent to Partially Received to Received automatically.

Barcode Scanning — Receive shipments with USB barcode scanners or your device camera. Scan-to-find instant product lookup. Cycle count sheets for warehouse audits.

Automated Alerts — Email, Slack, and SMS notifications when stock drops below reorder points. Reorder suggestions with quantity recommendations from the forecasting engine.

Reports and Export — One-click CSV downloads, PDF inventory valuations, and printable cycle count sheets. Valuation reports grouped by location with totals.

Stock Transfers — Request, approve, ship, and receive inventory transfers between locations with full audit trail.

Vendor Management — Track vendor lead times, reliability scores, and payment terms. Link vendors to purchase orders automatically.

Always Working — StockFlows runs in the background, syncing inventory hourly, running forecasts nightly, and alerting you before problems become crises.

Why Switch from Stocky:

Shopify discontinued Stocky and it's being removed from the App Store. StockFlows replaces every feature Stocky had and adds statistical forecasting, multi-channel alerts, and modern UX. Migration takes under 5 minutes.

Pricing:

Free plan includes 50 SKUs and 1 location. Paid plans start at $19/mo for growing stores. No credit card required for the free plan. 14-day free trial on all paid plans.`;

const FEATURES = [
  'Multi-Location Inventory',
  'Demand Forecasting',
  'Smart Purchase Orders',
  'Barcode Scanning',
  'Automated Alerts',
  'Reports & Export',
  'Stock Transfers',
  'Vendor Management',
];

const SEARCH_DESCRIPTION = 'Inventory tracking, demand forecasting, and purchase order management for Shopify stores.';

async function main() {
  console.log('Launching WebKit (Safari engine)...');
  const browser = await webkit.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('Navigating to Store Listing...');
  await page.goto(LISTING_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Screenshot to check state
  await page.screenshot({ path: 'screenshots/listing-page.png', fullPage: false });
  console.log('Screenshot: screenshots/listing-page.png');

  // Check if we're on the listing page or a CAPTCHA
  const content = await page.textContent('body');
  if (content?.includes('challenge') || content?.includes('CAPTCHA') || content?.includes('Verify')) {
    console.log('CAPTCHA detected. Waiting 30 seconds for auto-solve...');
    await page.waitForTimeout(30000);
    await page.screenshot({ path: 'screenshots/after-captcha.png', fullPage: false });
  }

  // Try to fill tagline
  console.log('Attempting to fill Tagline...');
  try {
    const taglineInput = await page.locator('input[placeholder*="tagline" i], input[placeholder*="short" i], textarea[placeholder*="tagline" i]').first();
    if (await taglineInput.isVisible({ timeout: 5000 })) {
      await taglineInput.fill(TAGLINE);
      console.log('Tagline filled!');
    } else {
      // Try finding by label
      const byLabel = await page.getByLabel(/tagline/i).first();
      if (await byLabel.isVisible({ timeout: 3000 })) {
        await byLabel.fill(TAGLINE);
        console.log('Tagline filled (by label)!');
      } else {
        console.log('Could not find tagline field');
      }
    }
  } catch (e) {
    console.log('Tagline field not found, trying alternative selectors...');
  }

  await page.screenshot({ path: 'screenshots/after-tagline.png', fullPage: false });

  // Try to fill description
  console.log('Attempting to fill Description...');
  try {
    const descInput = await page.locator('textarea[placeholder*="description" i], textarea[placeholder*="about" i]').first();
    if (await descInput.isVisible({ timeout: 5000 })) {
      await descInput.fill(DESCRIPTION);
      console.log('Description filled!');
    } else {
      const byLabel = await page.getByLabel(/description/i).first();
      if (await byLabel.isVisible({ timeout: 3000 })) {
        await byLabel.fill(DESCRIPTION);
        console.log('Description filled (by label)!');
      } else {
        console.log('Could not find description field');
      }
    }
  } catch (e) {
    console.log('Description field not found');
  }

  await page.screenshot({ path: 'screenshots/after-description.png', fullPage: false });

  // Try to fill search description
  console.log('Attempting to fill Search Description...');
  try {
    const searchInput = await page.locator('input[placeholder*="search" i], textarea[placeholder*="search" i]').first();
    if (await searchInput.isVisible({ timeout: 5000 })) {
      await searchInput.fill(SEARCH_DESCRIPTION);
      console.log('Search description filled!');
    }
  } catch (e) {
    console.log('Search description field not found');
  }

  // Take final screenshot
  await page.screenshot({ path: 'screenshots/after-all-fills.png', fullPage: true });
  console.log('Final screenshot saved');

  await browser.close();
}

main().catch(console.error);
