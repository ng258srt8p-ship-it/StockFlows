import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOUR_PATH = path.join(__dirname, '..', 'public', 'tour.html');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1840, height: 900 } });

  await page.goto(`file://${TOUR_PATH}`);
  await page.waitForTimeout(2000);

  // After entering the app, take a FULL page screenshot to see everything
  await page.click('.btn');
  await page.waitForTimeout(3000);

  // Debug: capture full page
  await page.screenshot({ path: path.join(__dirname, '..', 'screenshots', '_debug_full.png'), fullPage: true });
  console.log('Full page screenshot saved');

  // Debug: check what the content element actually shows
  const info = await page.evaluate(() => {
    const content = document.querySelector('.content');
    if (!content) return { error: 'no .content' };
    const rect = content.getBoundingClientRect();
    const scrollTop = content.scrollTop;
    const html = content.innerHTML.substring(0, 500);
    const visible = document.querySelector('#page-dashboard.active') ? 'dashboard-ACTIVE' : 'dashboard-INACTIVE';
    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height, scrollTop, visible, html };
  });
  console.log('Content info:', JSON.stringify(info, null, 2));

  // Scroll to top and verify
  await page.evaluate(() => {
    const content = document.querySelector('.content');
    if (content) { content.scrollTop = 0; }
  });
  await page.waitForTimeout(500);

  const afterScroll = await page.evaluate(() => {
    const content = document.querySelector('.content');
    return content ? content.scrollTop : -1;
  });
  console.log('After scroll, scrollTop =', afterScroll);

  // Get sidebar width
  const sidebarWidth = await page.evaluate(() => {
    const el = document.querySelector('.sidebar');
    return el ? Math.floor(el.getBoundingClientRect().width) : 220;
  });
  console.log('Sidebar width:', sidebarWidth);

  // Take the actual dashboard screenshot
  await page.screenshot({
    path: path.join(__dirname, '..', 'screenshots', 'dashboard.png'),
    clip: { x: sidebarWidth, y: 0, width: 1600, height: 900 },
  });
  console.log('Dashboard screenshot saved');

  await browser.close();
}
main().catch(console.error);
