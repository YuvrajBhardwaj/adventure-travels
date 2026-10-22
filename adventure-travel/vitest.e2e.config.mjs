import { defineConfig } from "vitest/config";

// Browser checks (Puppeteer). Kept apart from `npm test` because they need the site running.
export default defineConfig({
  test: {
    environment: "node",
    include: ["e2e/**/*.e2e.test.mjs"],
    testTimeout: 120000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
