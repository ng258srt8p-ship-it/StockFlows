import { test, expect } from "@playwright/test";

test("navigate to production", async ({ page }) => {
  await page.goto("https://stockflows.fly.dev");
  console.log("Current URL:", page.url());
  // We just want to see if we can reach it
  expect(page.url()).toContain("stockflows.fly.dev");
});
