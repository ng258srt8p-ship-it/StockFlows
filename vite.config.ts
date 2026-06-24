import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      // These packages are dynamically imported inside try/catch blocks
      // (e.g. twilio in sms.ts, googleapis in google-sheets.ts). Externalizing
      // them prevents Vite from failing the build when they're not installed.
      external: ["twilio", "googleapis"],
    },
  },
});
