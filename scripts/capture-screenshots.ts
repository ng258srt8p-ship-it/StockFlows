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
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1840, height: 900 } });
  const page = await context.newPage();

  await page.goto(`file://${TOUR_PATH}`);
  await page.waitForTimeout(1500);

  // Click "Explore" to enter the app
  await page.click('.btn');
  await page.waitForTimeout(1500);

  // First, force scroll the document body and content to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;
  });
  await page.waitForTimeout(500);

  for (const p of pages) {
    if (p.click) {
      await page.click(p.click);
      await page.waitForTimeout(1000);
    }

    // Scroll both document body and content to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const content = document.querySelector('.content');
      if (content) content.scrollTop = 0;
    });
    await page.waitForTimeout(300);

    const screenshotPath = path.join(SCREENSHOTS_DIR, `${p.id}.png`);

    // Use Playwright's element-level screenshot — captures ONLY the element
    // regardless of its position on the page
    const contentEl = page.locator('.content');
    await contentEl.screenshot({ path: screenshotPath });

    console.log(`Saved: ${screenshotPath}`);
  }

  await browser.close();
}

main().catch(console.error);
