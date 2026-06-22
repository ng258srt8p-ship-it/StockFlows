import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOUR_PATH = path.join(__dirname, '..', 'public', 'tour.html');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

const TARGET_W = 1270;
const TARGET_H = 760;

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

  // Use 1x DPR so output is exactly 1270x760 pixels
  const context = await browser.newContext({
    viewport: { width: TARGET_W, height: TARGET_H },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log(`Opening tour page: ${TOUR_PATH}`);
  await page.goto(`file://${TOUR_PATH}`);
  await page.waitForTimeout(1500);

  // Click "Explore" to enter the app
  console.log('Clicking Explore button...');
  await page.click('.btn');
  await page.waitForTimeout(1500);

  // Force scroll content to top
  await page.evaluate(() => {
    document.querySelector('.content')?.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  for (const p of pages) {
    if (p.click) {
      console.log(`Navigating to ${p.id}...`);
      await page.click(p.click);
      await page.waitForTimeout(1200);

      // Force scroll to top
      await page.evaluate(() => {
        document.querySelector('.content')?.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
    }

    const screenshotPath = path.join(SCREENSHOTS_DIR, `${p.id}.png`);
    console.log(`Capturing ${p.id} at ${TARGET_W}x${TARGET_H}...`);

    // Capture exactly the viewport — no clip, no element screenshot
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: TARGET_W, height: TARGET_H },
    });
    console.log(`Saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('Done! All screenshots captured at 1270x760.');
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
