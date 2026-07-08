import { chromium } from "@playwright/test";

async function check() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://stockflows.fly.dev/app", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    const rootBg = getComputedStyle(document.querySelector("#root") || document.body).backgroundColor;
    const appProviderBg = getComputedStyle(document.querySelector('[class*="Polaris"]') || document.body).backgroundColor;
    const htmlClass = document.documentElement.className;
    const colorScheme = getComputedStyle(document.documentElement).colorScheme;

    // Check for any light/dark CSS var values
    const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim();
    const bgSecondary = getComputedStyle(document.documentElement).getPropertyValue("--bg-secondary").trim();

    return { bodyBg, htmlBg, rootBg, appProviderBg, htmlClass, colorScheme, bgPrimary, bgSecondary };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

check().catch(console.error);
