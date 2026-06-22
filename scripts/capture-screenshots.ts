import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOUR_PATH = path.join(__dirname, '..', 'public', 'tour.html');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

const pages = [
  { id: 'dashboard', waitFor: '#page-dashboard.active' },
  { id: 'inventory', click: '[data-page="inventory"]', waitFor: '#page-inventory.active' },
  { id: 'purchasing', click: '[data-page="purchasing"]', waitFor: '#page-purchasing.active' },
  { id: 'forecasting', click: '[data-page="forecasting"]', waitFor: '#page-forecasting.active' },
  { id: 'reports', click: '[data-page="reports"]', waitFor: '#page-reports.active' },
];

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1270, height: 760 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`Opening tour page: ${TOUR_PATH}`);
  await page.goto(`file://${TOUR_PATH}`);
  await page.waitForTimeout(1500);

  // Click "Explore" to enter the app
  console.log('Clicking Explore button...');
  await page.click('.btn');
  await page.waitForTimeout(1500);

  // Force scroll to top of content
  await page.evaluate(() => {
    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);

  for (const p of pages) {
    if (p.click) {
      console.log(`Navigating to ${p.id}...`);
      await page.click(p.click);
      await page.waitForTimeout(1200);

      // Force scroll to top
      await page.evaluate(() => {
        const content = document.querySelector('.content');
        if (content) content.scrollTop = 0;
      });
      await page.waitForTimeout(400);
    }

    const screenshotPath = path.join(SCREENSHOTS_DIR, `${p.id}.png`);
    console.log(`Capturing ${p.id}...`);

    // Take a full-page screenshot of just the content area
    const contentEl = await page.$('.content');
    if (contentEl) {
      await contentEl.screenshot({ path: screenshotPath });
    } else {
      // Fallback to full page
      await page.screenshot({ path: screenshotPath, clip: { x: 220, y: 0, width: 1050, height: 760 } });
    }
    console.log(`Saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('Done! All screenshots captured.');
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
