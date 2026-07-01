/**
 * Authentication Setup for Remote Triage Tests
 *
 * Run this script to generate .auth/user.json from your browser session.
 * This allows subsequent triage tests to authenticate without login flow.
 *
 * Usage:
 *   npx playwright test e2e/setup-auth.spec.ts --headed
 *
 * Steps:
 *   1. Browser opens stockflows.app
 *   2. Complete login if prompted
 *   3. Auth state automatically saved to .auth/user.json
 *   4. Close browser manually when done
 */

import { test, expect } from "@playwright/test";

test("Generate auth state from existing session", async ({ page }) => {
  console.log("🔐 Authentication Setup - Please log in if prompted");
  console.log("   Browser will open stockflows.app...");
  console.log("   After logging in, close the browser to save auth state.\n");

  // Navigate to the app
  await page.goto("https://stockflows.app/app");
  await page.waitForLoadState("networkidle");

  // Check if we're already authenticated
  const currentUrl = page.url();
  console.log("📍 Current URL:", currentUrl);

  // Check for login indicators
  const hasLoginForm = await page.locator('input[type="password"], input[name="password"], input[placeholder*="password"]').count() > 0;
  const hasShopifyLogin = await page.locator('button:has-text("Sign in"), a:has-text("Sign in"), button:has-text("Login")').count() > 0;

  if (hasLoginForm || hasShopifyLogin) {
    console.log("⚠️  Login required - please complete the login flow");
    console.log("   After logging in, click 'Save auth state' below\n");
  } else {
    console.log("✅ Already authenticated!");
    console.log("   Saving auth state...\n");
  }

  // Wait for user to complete login or confirm saved state
  await page.waitForTimeout(5000);

  // Save the auth state (cookies, localStorage, etc.)
  await page.context().storageState({ path: ".auth/user.json" });
  console.log("✅ Auth state saved to .auth/user.json");

  // Take a screenshot for verification
  await page.screenshot({ path: "test-results/auth-state-saved.png" });
  console.log("📸 Screenshot saved: test-results/auth-state-saved.png");

  console.log("\n✅ AUTH SETUP COMPLETE");
  console.log("   You can now run: npx playwright test e2e/triage-runner.spec.ts");
});