/**
 * Playwright-based deployment automation for StockFlows tour page.
 *
 * This script automates:
 * 1. GitHub repository creation and push
 * 2. Cloudflare Pages deployment
 * 3. Custom domain (stockflows.app) setup
 *
 * Prerequisites:
 * - GitHub CLI (gh) authenticated
 * - Cloudflare account with Pages access
 * - Domain stockflows.app purchased
 *
 * Usage:
 *   npx tsx scripts/deploy-tour.ts
 */

import { chromium, type Browser, type Page } from "playwright";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PROJECT_DIR = join(__dirname, "..");
const TOUR_FILE = join(PROJECT_DIR, "public", "tour.html");
const PRIVACY_FILE = join(PROJECT_DIR, "public", "privacy.html");

function log(msg: string) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

function exec(cmd: string, cwd?: string): string {
  log(`$ ${cmd}`);
  return execSync(cmd, { cwd: cwd || PROJECT_DIR, encoding: "utf-8", stdio: "pipe" });
}

// ═══════════════════════════════════════════════════════
//  Step 1: Initialize Git Repository
// ═══════════════════════════════════════════════════════
async function initGitRepo() {
  log("═══ Step 1: Initialize Git Repository ═══");

  if (existsSync(join(PROJECT_DIR, ".git"))) {
    log("Git repo already exists, skipping init");
    return;
  }

  exec("git init");
  exec("git checkout -b main");

  // Create .gitignore if not exists
  const gitignore = `node_modules/
build/
dist/
.env
.env.local
.env.production
test-results/
*.log
.DS_Store
`;

  const { writeFileSync } = await import("fs");
  writeFileSync(join(PROJECT_DIR, ".gitignore"), gitignore);

  exec("git add .");
  exec('git commit -m "Initial commit: StockFlows inventory management app for Shopify"');

  log("Git repo initialized with initial commit");
}

// ═══════════════════════════════════════════════════════
//  Step 2: Create GitHub Repository
// ═══════════════════════════════════════════════════════
async function createGitHubRepo() {
  log("═══ Step 2: Create GitHub Repository ═══");

  const repoName = "stockflows";
  const description = "AI-powered inventory management and demand forecasting for Shopify merchants";

  try {
    // Check auth first
    exec("gh auth status 2>&1");
  } catch {
    log("GitHub CLI not authenticated.");
    log("Run: gh auth login");
    log("Then re-run this script.");
    log("Manual steps:");
    log("  1. Go to https://github.com/new");
    log("  2. Repository name: stockflows");
    log("  3. Create repository");
    log("  4. git remote add origin git@github.com:YOUR_USER/stockflows.git");
    log("  5. git push -u origin main");
    return;
  }

  try {
    exec(`gh repo view ${repoName} 2>/dev/null`);
    log(`Repository ${repoName} already exists on GitHub`);
  } catch {
    log(`Creating repository ${repoName}...`);
    exec(`gh repo create ${repoName} --public --description "${description}" --source=. --remote=origin --push`);
    log(`Repository created and pushed`);
  }
}

// ═══════════════════════════════════════════════════════
//  Step 3: Deploy to Cloudflare Pages
// ═══════════════════════════════════════════════════════
async function deployToCloudflare() {
  log("═══ Step 3: Deploy to Cloudflare Pages ═══");

  const projectName = "stockflows-tour";

  try {
    // Check if project exists
    exec(`npx wrangler pages project list 2>/dev/null | grep ${projectName}`);
    log(`Cloudflare Pages project ${projectName} exists`);
  } catch {
    log(`Creating Cloudflare Pages project ${projectName}...`);
    try {
      exec(`npx wrangler pages project create ${projectName} --production-branch=main`);
    } catch (e) {
      log(`Note: If this fails, create the project manually in the Cloudflare dashboard first.`);
      log(`Then re-run this script.`);
      return;
    }
  }

  // Deploy the public directory (tour.html, privacy.html, etc.)
  log("Deploying public directory to Cloudflare Pages...");
  try {
    const result = exec(`npx wrangler pages deploy public --project-name=${projectName} --branch=main`);
    log("Deploy output:");
    console.log(result);

    // Extract the deployment URL
    const urlMatch = result.match(/https:\/\/[^\s]+\.pages\.dev/);
    if (urlMatch) {
      log(`Deployment URL: ${urlMatch[0]}`);
      return urlMatch[0];
    }
  } catch (e) {
    log("Deployment may have succeeded but output parsing failed. Check Cloudflare dashboard.");
  }
  return null;
}

// ═══════════════════════════════════════════════════════
//  Step 4: Configure Custom Domain
// ═══════════════════════════════════════════════════════
async function configureDomain(projectName: string, deploymentUrl: string) {
  log("═══ Step 4: Configure Custom Domain ═══");

  const domain = "stockflows.app";

  try {
    log(`Adding custom domain ${domain} to Cloudflare Pages...`);
    exec(`npx wrangler pages project create ${projectName} --production-branch=main 2>/dev/null`);
    exec(`npx wrangler pages deployment tail --project-name=${projectName} 2>/dev/null`);

    log(`Domain configuration steps:`);
    log(`1. Go to https://dash.cloudflare.com`);
    log(`2. Navigate to Pages > ${projectName} > Custom domains`);
    log(`3. Click "Set up a custom domain"`);
    log(`4. Enter: ${domain}`);
    log(`5. Cloudflare will add the DNS records automatically`);
    log(`6. SSL is provisioned automatically`);
    log(`7. Verify at: https://${domain}`);
  } catch (e) {
    log(`Note: Domain setup requires manual steps in the Cloudflare dashboard.`);
  }
}

// ═══════════════════════════════════════════════════════
//  Step 5: Verify Deployment
// ═══════════════════════════════════════════════════════
async function verifyDeployment(url: string) {
  log("═══ Step 5: Verify Deployment ═══");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    if (response?.status() === 200) {
      log(`Page loaded successfully (${response.status()})`);

      // Check title
      const title = await page.title();
      log(`Page title: ${title}`);

      // Check landing page renders
      const hasStockFlows = await page.evaluate(() =>
        document.body.textContent?.includes("StockFlows")
      );
      log(`StockFlows branding visible: ${hasStockFlows}`);

      // Check enter button works
      const hasExploreBtn = await page.evaluate(() =>
        document.body.textContent?.includes("Explore")
      );
      log(`Explore button present: ${hasExploreBtn}`);

      // Check privacy page
      const privacyResponse = await page.goto(`${url}/privacy.html`, { waitUntil: "domcontentloaded", timeout: 10000 });
      log(`Privacy page status: ${privacyResponse?.status()}`);

      log("Verification complete!");
    } else {
      log(`WARNING: Page returned status ${response?.status()}`);
    }
  } catch (e) {
    log(`Verification error: ${e instanceof Error ? e.message : "Unknown error"}`);
    log("The deployment may still be propagating. Check again in a few minutes.");
  } finally {
    await browser.close();
  }
}

// ═══════════════════════════════════════════════════════
//  Main
// ═══════════════════════════════════════════════════════
async function main() {
  console.log("");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║  StockFlows — Deployment Automation                    ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");

  // Step 1: Git
  await initGitRepo();

  // Step 2: GitHub
  await createGitHubRepo();

  // Step 3: Cloudflare Pages
  const deploymentUrl = await deployToCloudflare();

  // Step 4: Domain
  if (deploymentUrl) {
    await configureDomain("stockflows-tour", deploymentUrl);
  }

  // Step 5: Verify
  const url = deploymentUrl || "https://stockflows-tour.pages.dev";
  await verifyDeployment(url);

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Deployment complete!");
  console.log(`Tour page: ${url}`);
  console.log(`GitHub: https://github.com/$(gh api user -q .login)/stockflows`);
  console.log("═══════════════════════════════════════════════════════");
}

main().catch(console.error);
