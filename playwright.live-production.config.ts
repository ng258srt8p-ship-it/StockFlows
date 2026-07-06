import { defineConfig } from "@playwright/test";
import liveConfig from "./playwright.live.config";

export default defineConfig({
  ...liveConfig,
  use: {
    ...liveConfig.use,
    baseURL: "https://stockflows.fly.dev",
  },
});
