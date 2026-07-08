import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLY_APP = "https://stockflows.fly.dev";
const DEMO = "https://stockflows.app/demo";
const OUTPUT_DIR = path.join(__dirname, "screenshots");

const pages = [
  { name: "dashboard", path: "" },
  { name: "inventory", path: "/inventory" },
  { name: "purchasing", path: "/purchasing" },
  { name: "forecasting", path: "/forecasting" },
  { name: "reports", path: "/reports" },
  { name: "settings", path: "/settings" },
];

async function takeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const p of pages) {
    // Screenshot Fly.io app
    const flyPage = await context.newPage();
    try {
      await flyPage.goto(`${FLY_APP}/app${p.path}`, { waitUntil: "networkidle", timeout: 15000 });
      await flyPage.waitForTimeout(1000);
      await flyPage.screenshot({ path: `${OUTPUT_DIR}/fly-${p.name}.png`, fullPage: false });
      console.log(`✓ fly-${p.name}.png`);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`✗ fly-${p.name}.png: ${errMsg}`);
    } finally {
      await flyPage.close();
    }

    // Screenshot Demo
    const demoPage = await context.newPage();
    try {
      await demoPage.goto(`${DEMO}${p.path}`, { waitUntil: "networkidle", timeout: 15000 });
      await demoPage.waitForTimeout(1000);
      await demoPage.screenshot({ path: `${OUTPUT_DIR}/demo-${p.name}.png`, fullPage: false });
      console.log(`✓ demo-${p.name}.png`);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error(`✗ demo-${p.name}.png: ${errMsg}`);
    } finally {
      await demoPage.close();
    }
  }

  await browser.close();
  console.log("Done!");
}

takeScreenshots().catch(console.error);
