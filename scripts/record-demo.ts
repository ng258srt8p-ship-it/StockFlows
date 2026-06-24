// @ts-nocheck — dev script, dynamic globals from eval'd code
/**
 * StockFlows High-End Demo Video Production Pipeline
 *
 * Produces a polished App Store demo video with:
 * - Title/section slides rendered via Playwright (matching editorial brutalism)
 * - Screen recordings of the interactive tour.html
 * - Crossfade transitions between scenes
 * - Lo-fi background music
 * - Final output: 1600×900 H.264 MP4, 3-5 minutes
 *
 * Usage:
 *   cd "stockflows"
 *   npx tsx scripts/record-demo.ts
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, existsSync, statSync, readdirSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WIDTH = 1600;
const HEIGHT = 900;
const TOUR_URL = `file://${path.resolve(__dirname, "../public/tour.html")}`;
const SLIDES_URL = `file://${path.resolve(__dirname, "../public/video-slides.html")}`;
const MUSIC_PATH = path.resolve(__dirname, "../public/music/lofi-background.mp3");
const OUTPUT_DIR = path.resolve(__dirname, "../screenshots");
const TMP_DIR = path.resolve(__dirname, "../.video-tmp");

// ── Helpers ──────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function run(cmd: string) {
  return execSync(cmd, { stdio: "pipe" }).toString().trim();
}

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

// ── Scene definitions ────────────────────────────────────

interface SlideScene {
  type: "slide";
  name: string;
  slideId: string;
  durationSec: number;
}

interface RecordScene {
  type: "record";
  name: string;
  durationSec: number;
  actions: (page: Page) => Promise<void>;
}

type Scene = SlideScene | RecordScene;

const CROSSFADE_DURATION = 0.4; // seconds

const scenes: Scene[] = [
  // ═══ ACT 1: OPENING ═══
  {
    type: "slide", name: "01-title", slideId: "slide-open-title", durationSec: 6,
  },
  {
    type: "slide", name: "02-problem", slideId: "slide-problem", durationSec: 7,
  },
  {
    type: "slide", name: "03-solution", slideId: "slide-solution", durationSec: 7,
  },

  // ═══ ACT 2: DASHBOARD ═══
  {
    type: "slide", name: "04-section-dashboard", slideId: "slide-section-dashboard", durationSec: 5,
  },
  {
    type: "record", name: "05-dashboard", durationSec: 20,
    actions: async (page) => {
      await initAppPage(page);
      await delay(1500);
      // Scroll down to bar chart
      await smoothScroll(page, 200, 1500);
      await delay(1500);
      // Scroll to alerts
      await smoothScroll(page, 250, 1200);
      await delay(1500);
      // Scroll to AI insights
      await smoothScrollToBottom(page, 1500);
      await delay(1000);
    },
  },

  // ═══ ACT 3: INVENTORY ═══
  {
    type: "slide", name: "06-section-inventory", slideId: "slide-section-inventory", durationSec: 5,
  },
  {
    type: "record", name: "07-inventory", durationSec: 28,
    actions: async (page) => {
      await initAppPage(page);
      // Navigate to inventory via sidebar link
      await page.click('[data-page="inventory"]');
      await page.waitForTimeout(800);
      await scrollToTop(page);
      await delay(1500);
      // Switch to low stock tab
      await page.evaluate(() => { invTab = "low"; render(); });
      await page.waitForTimeout(600);
      await delay(1500);
      // Back to all
      await page.evaluate(() => { invTab = "all"; render(); });
      await page.waitForTimeout(600);
      await delay(1500);
      // Open adjust modal
      await page.evaluate(() => openAdjust(PRODUCTS[0].id));
      await page.waitForTimeout(800);
      await delay(1500);
      // Close, open transfer
      await page.evaluate(() => { closeModal(); openTransfer(); });
      await page.waitForTimeout(800);
      await delay(1500);
      // Close, open barcode scanner
      await page.evaluate(() => { closeModal(); openBarcodeScan(); });
      await page.waitForTimeout(800);
      await delay(1500);
      await page.evaluate(() => closeModal());
      await delay(500);
    },
  },

  // ═══ ACT 4: PURCHASING ═══
  {
    type: "slide", name: "08-section-purchasing", slideId: "slide-section-purchasing", durationSec: 5,
  },
  {
    type: "record", name: "09-purchasing", durationSec: 26,
    actions: async (page) => {
      await initAppPage(page);
      // Navigate to purchasing via sidebar
      await page.click('[data-page="purchasing"]');
      await page.waitForTimeout(800);
      await scrollToTop(page);
      await delay(1500);
      // Switch to vendors tab
      await page.evaluate(() => { purchTab = "vendors"; poView = "list"; render(); });
      await page.waitForTimeout(600);
      await delay(1500);
      // Open vendor detail
      await page.evaluate(() => openVendorDetail("V1"));
      await page.waitForTimeout(800);
      await delay(1500);
      await page.evaluate(() => closeModal());
      await delay(500);
      // Create PO
      await page.evaluate(() => createPO());
      await page.waitForTimeout(800);
      await delay(1500);
      await page.evaluate(() => closeModal());
      await delay(500);
      // View PO detail
      await page.evaluate(() => { purchTab = "pos"; poView = POS[0].id; render(); });
      await page.waitForTimeout(800);
      await delay(1500);
    },
  },

  // ═══ ACT 5: FORECASTING ═══
  {
    type: "slide", name: "10-section-forecasting", slideId: "slide-section-forecasting", durationSec: 5,
  },
  {
    type: "record", name: "11-forecasting", durationSec: 24,
    actions: async (page) => {
      await initAppPage(page);
      // Navigate to forecasting via sidebar
      await page.click('[data-page="forecasting"]');
      await page.waitForTimeout(800);
      await scrollToTop(page);
      await delay(1500);
      // Click first row for detail
      await page.evaluate(() => { fcastSel = PRODUCTS[0].id; render(); });
      await page.waitForTimeout(800);
      await delay(1500);
      // Scroll to chart
      await smoothScroll(page, 250, 1000);
      await delay(1500);
      // Scroll to AI insight
      await smoothScroll(page, 250, 1000);
      await delay(1500);
      // Show another product
      await page.evaluate(() => { fcastSel = PRODUCTS[1].id; render(); });
      await page.waitForTimeout(800);
      await scrollToTop(page);
      await delay(500);
      await smoothScroll(page, 250, 1000);
      await delay(1500);
    },
  },

  // ═══ ACT 6: REPORTS ═══
  {
    type: "slide", name: "12-section-reports", slideId: "slide-section-reports", durationSec: 5,
  },
  {
    type: "record", name: "13-reports", durationSec: 18,
    actions: async (page) => {
      await initAppPage(page);
      // Navigate to reports via sidebar
      await page.click('[data-page="reports"]');
      await page.waitForTimeout(800);
      await scrollToTop(page);
      await delay(1500);
      // Scroll to donut chart
      await smoothScroll(page, 250, 1000);
      await delay(1500);
      // Scroll to valuation table
      await smoothScroll(page, 300, 1000);
      await delay(1500);
      await smoothScrollToBottom(page, 1000);
      await delay(1000);
    },
  },

  // ═══ ACT 7: FEATURES ═══
  {
    type: "slide", name: "14-feature-alerts", slideId: "slide-feature-alerts", durationSec: 8,
  },
  {
    type: "slide", name: "15-feature-ai", slideId: "slide-feature-ai", durationSec: 8,
  },

  // ═══ ACT 8: CLOSING ═══
  {
    type: "slide", name: "16-closing", slideId: "slide-closing", durationSec: 10,
  },
];

// ── Common clip initializer ──────────────────────────────

/** Load tour.html, click Explore, and wait for the dashboard to settle */
async function initAppPage(page: Page): Promise<void> {
  await page.goto(TOUR_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.click(".btn");
  await page.waitForTimeout(1000);
  await delay(1500); // let bar chart animate
}

// ── Scroll helpers ───────────────────────────────────────

async function smoothScroll(page: Page, pixels: number, durationMs: number) {
  const steps = 40;
  const stepSize = pixels / steps;
  const stepDelay = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((s: number) => window.scrollBy({ top: s, behavior: "auto" }), stepSize);
    await page.waitForTimeout(stepDelay);
  }
}

async function smoothScrollToBottom(page: Page, durationMs: number) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  if (total > 0) await smoothScroll(page, total, durationMs);
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const content = document.querySelector(".content");
    if (content) content.scrollTop = 0;
  });
  await page.waitForTimeout(200);
}

// ── Step 1: Render slide PNGs ────────────────────────────

async function renderSlides(browser: ReturnType<typeof chromium extends (...a: any) => infer R ? () => R : never>): Promise<void> {
  console.log("🎨 Rendering title/callout slides...");

  const slideIds = scenes
    .filter((s): s is SlideScene => s.type === "slide")
    .map((s) => s.slideId);

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(SLIDES_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
  // Wait for Google Fonts to load
  await page.waitForTimeout(2000);

  for (const slideId of slideIds) {
    // Show only this slide
    await page.evaluate((id: string) => {
      document.querySelectorAll(".slide").forEach((s) => s.classList.remove("active"));
      const target = document.getElementById(id);
      if (target) target.classList.add("active");
    }, slideId);

    await page.waitForTimeout(300);

    const outPath = path.join(TMP_DIR, `slides/${slideId}.png`);
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    console.log(`  ✅ ${slideId}.png`);
  }

  await context.close();
}

// ── Step 2: Record screen clips (single continuous recording) ────────

async function recordClips(browser: ReturnType<typeof chromium extends (...a: any) => infer R ? () => R : never>): Promise<string> {
  console.log("\n🎬 Recording all screen clips (continuous)...");

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
  page.on("console", () => {});

  const recordScenes = scenes.filter((s): s is RecordScene => s.type === "record");

  // Track timestamps for later splitting
  const timestamps: Array<{ name: string; start: number; duration: number }> = [];
  let totalElapsed = 0;

  for (const scene of recordScenes) {
    const sceneStart = totalElapsed;
    console.log(`  📹 ${scene.name}...`);

    const startTime = Date.now();
    try {
      await scene.actions(page);
    } catch (err) {
      console.log(`    ⚠️  Action error: ${err}`);
    }

    const actionTime = Date.now() - startTime;
    // Hold until target duration
    const remaining = Math.max(0, scene.durationSec * 1000 - actionTime);
    if (remaining > 0) await delay(remaining);

    totalElapsed += scene.durationSec;
    timestamps.push({ name: scene.name, start: sceneStart, duration: scene.durationSec });
  }

  const videoPath = await page.video()?.path();
  await context.close();

  // Save timestamps for splitting
  const { writeFileSync } = await import("fs");
  writeFileSync(path.join(TMP_DIR, "timestamps.json"), JSON.stringify(timestamps, null, 2));

  console.log(`  ✅ Continuous recording: ${totalElapsed}s`);
  return videoPath || "";
}

// ── Step 3: Convert all inputs to uniform MP4 clips ──────

async function convertClips(continuousWebm: string): Promise<void> {
  console.log("\n🔄 Converting clips to MP4...");

  const slideDir = path.join(TMP_DIR, "slides");
  const convertedDir = path.join(TMP_DIR, "converted");
  ensureDir(convertedDir);

  // Convert slide PNGs to video clips
  for (const scene of scenes) {
    if (scene.type === "slide") {
      const pngPath = path.join(slideDir, `${scene.slideId}.png`);
      const mp4Path = path.join(convertedDir, `${scene.name}.mp4`);

      if (!existsSync(pngPath)) {
        console.log(`  ⚠️  Missing slide: ${scene.slideId}.png, skipping`);
        continue;
      }

      // Create a video clip from the static image with slight zoom (Ken Burns)
      const zoomDuration = scene.durationSec;
      const zoomFrames = Math.ceil(zoomDuration * 30);
      run(
        `ffmpeg -y -loop 1 -i "${pngPath}" ` +
          `-vf "scale=1700:956:force_original_aspect_ratio=decrease,` +
          `pad=1700:956:(ow-iw)/2:(oh-ih)/2:color=black,` +
          `zoompan=z='min(zoom+0.0003,1.04)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${zoomFrames}:s=${WIDTH}x${HEIGHT}:fps=30" ` +
          `-t ${zoomDuration} -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p ` +
          `"${mp4Path}"`
      );
      console.log(`  ✅ ${scene.name}.mp4 (slide, ${zoomDuration}s)`);
    }
  }

  // Split the continuous recording into individual clips using timestamps
  if (continuousWebm && existsSync(continuousWebm)) {
    const { readFileSync } = await import("fs");
    const timestamps: Array<{ name: string; start: number; duration: number }> =
      JSON.parse(readFileSync(path.join(TMP_DIR, "timestamps.json"), "utf-8"));

    for (const ts of timestamps) {
      const mp4Path = path.join(convertedDir, `${ts.name}.mp4`);
      run(
        `ffmpeg -y -ss ${ts.start} -i "${continuousWebm}" ` +
          `-t ${ts.duration} ` +
          `-vf "scale=${WIDTH}:${HEIGHT},fps=30" ` +
          `-c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p ` +
          `-an ` +
          `"${mp4Path}"`
      );
      console.log(`  ✅ ${ts.name}.mp4 (clip, ${ts.duration}s)`);
    }
  }
}

// ── Step 4: Assemble with crossfades ─────────────────────

function assembleVideo(): string {
  console.log("\n🎬 Assembling final video with crossfades...");

  const convertedDir = path.join(TMP_DIR, "converted");
  const finalPath = path.join(OUTPUT_DIR, "stockflows-demo.mp4");

  // Get list of converted clips in order
  const clipPaths: string[] = [];
  for (const scene of scenes) {
    const mp4Path = path.join(convertedDir, `${scene.name}.mp4`);
    if (existsSync(mp4Path)) {
      clipPaths.push(mp4Path);
    }
  }

  if (clipPaths.length === 0) {
    throw new Error("No clips to assemble");
  }

  if (clipPaths.length === 1) {
    // Just copy the single clip
    run(`cp "${clipPaths[0]}" "${finalPath}"`);
    return finalPath;
  }

  // Build ffmpeg xfade filter chain
  // Strategy: pair-wise crossfade using the xfade filter
  // For N clips, we need N-1 xfade operations

  const inputs = clipPaths.map((p) => `-i "${p}"`).join(" ");
  const filterParts: string[] = [];
  let lastLabel = "[0:v]";

  // Get durations of each clip
  const durations = clipPaths.map((p) => {
    const durStr = run(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${p}"`
    );
    return parseFloat(durStr);
  });

  let accumulatedOffset = 0;

  for (let i = 0; i < clipPaths.length - 1; i++) {
    const currentDuration = durations[i];
    const xfadeOffset = Math.max(0, accumulatedOffset + currentDuration - CROSSFADE_DURATION);
    const nextLabel = i < clipPaths.length - 2 ? `[v${i}]` : "[vout]";

    filterParts.push(
      `${lastLabel}[${i + 1}:v]xfade=transition=fade:duration=${CROSSFADE_DURATION}:offset=${xfadeOffset.toFixed(2)}${nextLabel}`
    );

    lastLabel = nextLabel;
    accumulatedOffset = xfadeOffset;
  }

  const filterComplex = filterParts.join(";");

  run(
    `ffmpeg -y ${inputs} ` +
      `-filter_complex "${filterComplex}" ` +
      `-map "[vout]" ` +
      `-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p ` +
      `-movflags +faststart ` +
      `"${finalPath}"`
  );

  console.log(`  ✅ Video assembled: ${finalPath}`);
  return finalPath;
}

// ── Step 5: Add background music ─────────────────────────

function addMusic(videoPath: string): string {
  if (!existsSync(MUSIC_PATH)) {
    console.log("  ⚠️  No music file found, skipping audio");
    return videoPath;
  }

  console.log("\n🎵 Adding background music...");

  const withAudioPath = path.join(OUTPUT_DIR, "stockflows-demo-final.mp4");

  // Get video duration
  const durStr = run(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`);
  const videoDuration = parseFloat(durStr);
  const fadeOutStart = Math.max(0, videoDuration - 3);

  run(
    `ffmpeg -y -i "${videoPath}" -i "${MUSIC_PATH}" ` +
      `-filter_complex "[1:a]volume=0.15,afade=t=in:st=0:d=2,afade=t=out:st=${fadeOutStart.toFixed(1)}:d=3[music]" ` +
      `-map "0:v" -map "[music]" ` +
      `-c:v copy -c:a aac -b:a 128k ` +
      `-shortest ` +
      `-movflags +faststart ` +
      `"${withAudioPath}"`
  );

  // Replace the no-audio version
  run(`mv "${withAudioPath}" "${videoPath}"`);

  console.log(`  ✅ Music added (${videoDuration.toFixed(1)}s)`);
  return videoPath;
}

// ── Main pipeline ────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  StockFlows High-End Demo Video Producer        ║");
  console.log("║  Resolution: 1600×900 | 30fps | H.264          ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Setup
  ensureDir(TMP_DIR);
  ensureDir(path.join(TMP_DIR, "slides"));
  ensureDir(path.join(TMP_DIR, "clips"));
  ensureDir(path.join(TMP_DIR, "converted"));
  ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({ headless: true });

  try {
    // Step 1: Render slides
    await renderSlides(browser as any);

    // Step 2: Record screen clips
    const continuousWebm = await recordClips(browser as any);

    // Close browser before ffmpeg work
    await browser.close();

    // Step 3: Convert all to uniform MP4
    await convertClips(continuousWebm);

    // Step 4: Assemble with crossfades
    const videoPath = assembleVideo();

    // Step 5: Add music
    addMusic(videoPath);

    // Print final stats
    const stats = statSync(videoPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    const durStr = run(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`);
    const duration = parseFloat(durStr);

    console.log("\n" + "═".repeat(50));
    console.log("✅ VIDEO COMPLETE");
    console.log("═".repeat(50));
    console.log(`📁 Path: ${videoPath}`);
    console.log(`📦 Size: ${sizeMB} MB`);
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s (${(duration / 60).toFixed(1)} min)`);
    console.log(`🎬 Resolution: ${WIDTH}×${HEIGHT}`);
    console.log(`🎞️  FPS: 30`);
    console.log(`🎵 Audio: lo-fi background`);
    console.log("═".repeat(50));

    // Cleanup
    console.log("\n🧹 Cleaning up temp files...");
    // execSync(`rm -rf "${TMP_DIR}"`);
    // console.log("✅ Done!");
  } catch (err) {
    await browser.close();
    throw err;
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
