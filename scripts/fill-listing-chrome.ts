import { chromium } from 'playwright';

const LISTING_URL = 'https://partners.shopify.com/5004034/apps/388020928513/distribution';

async function main() {
  console.log('Launching Chrome with user profile...');
  
  // Use the actual Chrome user data directory for session cookies
  const context = await chromium.launchPersistentContext(
    process.env.HOME + '/Library/Application Support/Google/Chrome/Profile 1',
    {
      headless: false,
      channel: 'chrome',
      args: [
        '--no-first-run',
        '--no-default-browser-check', 
        '--disable-blink-features=AutomationControlled',
      ],
    }
  );
  
  const page = context.pages()[0] || await context.newPage();
  
  console.log('Navigating to Store Listing...');
  await page.goto(LISTING_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'screenshots/chrome-state.png', fullPage: false });
  console.log('Screenshot: screenshots/chrome-state.png');
  
  const content = await page.textContent('body');
  const hasChallenge = content?.toLowerCase().includes('challenge') || content?.toLowerCase().includes('captcha');
  
  if (hasChallenge) {
    console.log('CAPTCHA detected.');
  } else {
    console.log('No CAPTCHA! Proceeding...');
  }
  
  await context.close();
}

main().catch(console.error);
