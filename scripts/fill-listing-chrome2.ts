import { chromium } from 'playwright';

const LISTING_URL = 'https://partners.shopify.com/5004034/apps/388020928513/distribution';

async function main() {
  console.log('Launching Chrome (fresh profile)...');
  
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
  });
  
  const page = await browser.newPage();
  
  // Remove webdriver flag
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  
  console.log('Navigating to Store Listing...');
  await page.goto(LISTING_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);
  
  await page.screenshot({ path: 'screenshots/chrome2-state.png', fullPage: false });
  console.log('Screenshot saved');
  
  const content = await page.textContent('body');
  if (content?.toLowerCase().includes('challenge') || content?.toLowerCase().includes('captcha')) {
    console.log('CAPTCHA detected.');
  } else {
    console.log('No CAPTCHA!');
    // List all visible inputs
    const inputs = await page.locator('input:visible, textarea:visible').all();
    console.log(`Found ${inputs.length} visible inputs`);
    for (let i = 0; i < Math.min(inputs.length, 20); i++) {
      const ph = await inputs[i].getAttribute('placeholder') || '';
      const lab = await inputs[i].getAttribute('aria-label') || '';
      const tag = await inputs[i].evaluate(e => e.tagName);
      console.log(`  [${i}] ${tag} placeholder="${ph}" label="${lab}"`);
    }
  }
  
  await browser.close();
}

main().catch(console.error);
