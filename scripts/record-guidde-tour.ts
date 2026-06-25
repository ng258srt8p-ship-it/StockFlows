/**
 * StockFlows — Fully Autonomous Demo Video Producer
 *
 * Launches Playwright, walks through every section of the explore.html
 * demo, and outputs a polished MP4 video ready for the Shopify App Store.
 *
 * Usage:
 *   cd "stockflows"
 *   npx tsx scripts/record-guidde-tour.ts
 *
 * Requirements:
 *   - ffmpeg installed (brew install ffmpeg)
 *   - playwright browsers installed (npx playwright install chromium)
 *
 * Output: screenshots/stockflows-tour.mp4
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, existsSync, statSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Config ──────────────────────────────────────────────

const WIDTH = 1440;
const HEIGHT = 900;
/** Load locally so it works offline and is fast */
const EXPLORE_URL = `file://${path.resolve(__dirname, "../public/explore.html")}`;
const OUTPUT_DIR = path.resolve(__dirname, "../screenshots");
const TMP_DIR = path.resolve(__dirname, "../.video-tmp");
const TARGET_DURATION_SEC = 4 * 60 + 0; // ~4 minutes (240s)

// Per-action pauses (ms) — tuned to be readable without being slow
const PAUSE = { step: 2200, quick: 1000, hero: 3200, scroll: 1400 };

// ── Helpers ─────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function run(cmd: string) {
  return execSync(cmd, { stdio: "pipe" }).toString().trim();
}

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

/** Smooth-scroll the `.content` frame (the explore app scrolls there) */
async function contentScroll(page: Page, pixels: number, durationMs = PAUSE.scroll) {
  const steps = 20;
  const stepSize = pixels / steps;
  const stepDelay = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((s: number) => {
      const el = document.querySelector(".content");
      if (el) el.scrollTop += s;
      else window.scrollBy(0, s);
    }, stepSize);
    await page.waitForTimeout(stepDelay);
  }
}

async function contentScrollToTop(page: Page) {
  await page.evaluate(() => {
    const el = document.querySelector(".content");
    if (el) el.scrollTop = 0;
    else window.scrollTo(0, 0);
  });
  await page.waitForTimeout(200);
}

async function contentScrollToBottom(page: Page, durationMs = PAUSE.scroll) {
  const total = await page.evaluate(() => {
    const el = document.querySelector(".content");
    if (el) return el.scrollHeight - el.clientHeight;
    return document.documentElement.scrollHeight - window.innerHeight;
  });
  if (total > 0) await contentScroll(page, total, durationMs);
}

/** Invoke a function on the page (accessing demo globals) */
async function pEv<T>(page: Page, fn: (...args: unknown[]) => T, ...args: unknown[]) {
  return page.evaluate(fn, ...args);
}

/** Navigate to a sidebar page */
async function go(page: Page, pageName: string) {
  await page.click(`[data-page="${pageName}"]`);
  await delay(PAUSE.quick);
  await contentScrollToTop(page);
}

// ── Sections ────────────────────────────────────────────

// Each section returns the number of seconds it consumed

async function section_Dashboard(page: Page): Promise<number> {
  console.log("  📊 Dashboard");
  const t0 = Date.now();
  await go(page, "dashboard");

  // Hero — top of dashboard with stats cards
  await delay(PAUSE.hero);
  // Scroll to bar chart
  await contentScroll(page, 180);
  await delay(PAUSE.step);
  // Scroll to alerts table
  await contentScroll(page, 220);
  await delay(PAUSE.step);
  // Scroll to AI insights
  await contentScrollToBottom(page);
  await delay(PAUSE.step);
  return (Date.now() - t0) / 1000;
}

async function section_Inventory(page: Page): Promise<number> {
  console.log("  📦 Inventory");
  const t0 = Date.now();
  await go(page, "inventory");

  // Show the list
  await delay(PAUSE.hero);
  // Search
  await page.fill('input[placeholder="Search products..."]', "Widget");
  await delay(PAUSE.step);
  // Clear search
  await page.fill('input[placeholder="Search products..."]', "");
  await delay(PAUSE.quick);
  // Location filter
  await page.evaluate(() => {
    const sel = document.querySelector("select") as HTMLSelectElement;
    if (sel) sel.value = "L1";
  });
  await pEv(page, () => {
    (window as any).invLoc = "L1";
    (window as any).render();
  });
  await delay(PAUSE.step);
  // Reset filter
  await pEv(page, () => {
    (window as any).invLoc = "";
    (window as any).render();
  });
  await delay(PAUSE.quick);
  // Low stock tab
  await pEv(page, () => {
    (window as any).invTab = "low";
    (window as any).render();
  });
  await delay(PAUSE.step);
  // All tab
  await pEv(page, () => {
    (window as any).invTab = "all";
    (window as any).render();
  });
  await delay(PAUSE.quick);
  // Open stock adjustment
  await pEv(page, () => (window as any).openAdjust("P2"));
  await delay(PAUSE.hero);
  // Close and open transfer
  await pEv(page, () => (window as any).closeModal());
  await delay(PAUSE.quick);
  await pEv(page, () => (window as any).openTransfer());
  await delay(PAUSE.step);
  // Close and open barcode scanner
  await pEv(page, () => (window as any).closeModal());
  await delay(PAUSE.quick);
  await pEv(page, () => (window as any).openBarcodeScan());
  await delay(PAUSE.step);
  // Simulate barcode entry
  await page.fill("#barcode-input", "5901234123457");
  await delay(PAUSE.step);
  await pEv(page, () => (window as any).closeModal());
  await delay(PAUSE.quick);
  return (Date.now() - t0) / 1000;
}

async function section_Purchasing(page: Page): Promise<number> {
  console.log("  🛒 Purchasing");
  const t0 = Date.now();
  await go(page, "purchasing");

  // PO list
  await delay(PAUSE.hero);
  // Create PO
  await pEv(page, () => (window as any).createPO());
  await delay(PAUSE.hero);
  await pEv(page, () => (window as any).closeModal());
  await delay(PAUSE.quick);
  // PO detail
  await pEv(page, () => {
    (window as any).purchTab = "pos";
    (window as any).poView = "PO1";
    (window as any).render();
  });
  await delay(PAUSE.hero);
  // Switch to vendors tab
  await pEv(page, () => {
    (window as any).purchTab = "vendors";
    (window as any).poView = "list";
    (window as any).render();
  });
  await delay(PAUSE.step);
  // Vendor detail
  await pEv(page, () => (window as any).openVendorDetail("V1"));
  await delay(PAUSE.step);
  await pEv(page, () => (window as any).closeModal());
  await delay(PAUSE.quick);
  return (Date.now() - t0) / 1000;
}

async function section_Forecasting(page: Page): Promise<number> {
  console.log("  📈 Forecasting");
  const t0 = Date.now();
  await go(page, "forecasting");

  // Forecast table
  await delay(PAUSE.hero);
  // Select first product for detail
  await pEv(page, () => {
    (window as any).fcastSel = "P1";
    (window as any).render();
  });
  await delay(PAUSE.hero);
  // Scroll to chart
  await contentScroll(page, 200);
  await delay(PAUSE.step);
  // Scroll to AI insight
  await contentScroll(page, 250);
  await delay(PAUSE.step);
  // Switch to out-of-stock product
  await pEv(page, () => {
    (window as any).fcastSel = "P3";
    (window as any).render();
  });
  await delay(PAUSE.step);
  await contentScroll(page, 200);
  await delay(PAUSE.step);
  return (Date.now() - t0) / 1000;
}

async function section_Reports(page: Page): Promise<number> {
  console.log("  📋 Reports");
  const t0 = Date.now();
  await go(page, "reports");

  await delay(PAUSE.hero);
  // Scroll to donut chart + location breakdown
  await contentScroll(page, 220);
  await delay(PAUSE.step);
  // Scroll to valuation table
  await contentScroll(page, 280);
  await delay(PAUSE.step);
  await contentScrollToBottom(page);
  await delay(PAUSE.step);
  return (Date.now() - t0) / 1000;
}

async function section_Settings(page: Page): Promise<number> {
  console.log("  ⚙️ Settings");
  const t0 = Date.now();
  await go(page, "settings");

  // Top of settings (stock thresholds)
  await delay(PAUSE.hero);
  // Scroll to notifications
  await contentScroll(page, 280);
  await delay(PAUSE.step);
  // Scroll to AI features + migration
  await contentScrollToBottom(page);
  await delay(PAUSE.hero);
  return (Date.now() - t0) / 1000;
}

async function section_Closing(page: Page): Promise<number> {
  console.log("  ✨ Closing");
  const t0 = Date.now();
  await go(page, "dashboard");
  await delay(PAUSE.hero);
  // Hold on dashboard for a moment
  await contentScroll(page, 180);
  await delay(PAUSE.hero);
  return (Date.now() - t0) / 1000;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  StockFlows — Autonomous Tour Video Producer        ║");
  console.log("║  Resolution: 1440×900 | 30 fps | H.264              ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  ensureDir(TMP_DIR);
  ensureDir(path.join(TMP_DIR, "clips"));
  ensureDir(OUTPUT_DIR);

  // ── Launch browser with video recording ──

  console.log("🚀 Launching Playwright browser...\n");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "America/New_York",
    recordVideo: {
      dir: path.join(TMP_DIR, "clips"),
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();
  page.on("console", () => {}); // suppress

  // ── Load app ──

  console.log("📄 Loading explore.html...");
  await page.goto(EXPLORE_URL, { waitUntil: "networkidle", timeout: 20000 });
  await delay(2000); // let animations settle

  // Verify the app rendered
  const hasApp = await page.evaluate(() => !!document.querySelector(".app"));
  if (!hasApp) throw new Error("App container not found — explore.html may not have loaded correctly");
  console.log("  ✅ App loaded successfully\n");

  // ── Run sections ──

  const totalStart = Date.now();

  const sectionTimes = {
    Dashboard: await section_Dashboard(page),
    Inventory: await section_Inventory(page),
    Purchasing: await section_Purchasing(page),
    Forecasting: await section_Forecasting(page),
    Reports: await section_Reports(page),
    Settings: await section_Settings(page),
    Closing: await section_Closing(page),
  };

  const recordedDuration = (Date.now() - totalStart) / 1000;

  // Hold the final frame a bit longer if under target
  const holdTime = Math.max(0, TARGET_DURATION_SEC - recordedDuration);
  if (holdTime > 1) {
    console.log(`\n⏸️  Holding final frame for ${holdTime.toFixed(0)}s to reach target duration...`);
    await delay(holdTime * 1000);
  }

  // ── Close browser & get video ──

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (!videoPath || !existsSync(videoPath)) {
    throw new Error("No video recorded — check Playwright recordVideo config");
  }

  console.log(`\n🎬 Raw recording: ${videoPath}`);

  // ── Convert to MP4 ──

  const finalPath = path.join(OUTPUT_DIR, "stockflows-tour.mp4");

  console.log("\n🔄 Converting to MP4 (H.264)...");
  run(
    `ffmpeg -y -i "${videoPath}" ` +
      `-vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=black,fps=30" ` +
      `-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p ` +
      `-movflags +faststart ` +
      `"${finalPath}"`
  );
  console.log(`  ✅ Video ready: ${finalPath}`);

  // ── Stats ──

  const stats = statSync(finalPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  const durStr = run(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${finalPath}"`);
  const duration = parseFloat(durStr);

  console.log("\n" + "═".repeat(50));
  console.log("✅ TOUR VIDEO COMPLETE");
  console.log("═".repeat(50));
  console.log(`📁 Path:    ${finalPath}`);
  console.log(`📦 Size:    ${sizeMB} MB`);
  console.log(`⏱️  Total:   ${duration.toFixed(1)}s (${(duration / 60).toFixed(1)} min)`);
  console.log(`🎬 Res:     ${WIDTH}×${HEIGHT} @ 30 fps`);
  console.log("");
  console.log("Section times:");
  for (const [name, secs] of Object.entries(sectionTimes)) {
    console.log(`  ${name.padEnd(12)} ${secs.toFixed(1)}s`);
  }
  console.log("");

  // ➡️ NEXT STEPS
  console.log("📋 Next steps:");
  console.log("  1. Upload stockflows-tour.mp4 to Guidde or direct video host");
  console.log("  2. If using Guidde: add AI voiceover narration");
  console.log("  3. Add chapter markers for each section");
  console.log("  4. Upload to Shopify App Store listing");
  console.log("  5. Embed on stockflows.app marketing page");
  console.log("\n🎉 Done!");
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
