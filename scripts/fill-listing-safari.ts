import { webkit } from 'playwright';

const LISTING_URL = 'https://partners.shopify.com/5004034/apps/388020928513/distribution';

async function main() {
  console.log('Launching WebKit with persistent context (Safari profile)...');
  
  const context = await webkit.launchPersistentContext(
    process.env.HOME + '/Library/Safari',
    {
      headless: false,
    }
  );
  
  const page = context.pages()[0] || await context.newPage();
  
  console.log('Navigating to Store Listing...');
  await page.goto(LISTING_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'screenshots/safari-state.png', fullPage: false });
  console.log('Screenshot: screenshots/safari-state.png');
  
  const content = await page.textContent('body');
  const hasChallenge = content?.toLowerCase().includes('challenge') || content?.toLowerCase().includes('captcha');
  
  if (hasChallenge) {
    console.log('CAPTCHA detected again.');
  } else {
    console.log('No CAPTCHA! Proceeding to fill fields...');
    
    // Try to find and fill tagline
    const allInputs = await page.locator('input, textarea').all();
    console.log(`Found ${allInputs.length} input elements`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const el = allInputs[i];
      const placeholder = await el.getAttribute('placeholder') || '';
      const ariaLabel = await el.getAttribute('aria-label') || '';
      const type = await el.getAttribute('type') || '';
      const tagName = await el.evaluate(e => e.tagName);
      console.log(`  [${i}] ${tagName} type="${type}" placeholder="${placeholder}" label="${ariaLabel}"`);
    }
  }
  
  await browser.close();
}

main().catch(console.error);
