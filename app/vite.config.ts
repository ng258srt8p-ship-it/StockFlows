import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname),
    },
  },
  plugins: [
    tailwindcss(),
    remix({
      appDirectory: ".",
      ignoredRouteFiles: ["**/*.css"],
    }),
  ],
});
