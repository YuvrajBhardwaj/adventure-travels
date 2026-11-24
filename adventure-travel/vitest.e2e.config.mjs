import { defineConfig } from "vitest/config";

// Browser checks (Puppeteer). Kept apart from `npm test` because they need the site running.
export default defineConfig({
  test: {
    environment: "node",
    include: ["e2e/**/*.e2e.test.mjs"],
    // The page-width check loads every main page at 4 widths: ~135 s on the dev server by 25 Nov.
    testTimeout: 300000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
