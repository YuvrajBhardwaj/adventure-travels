import { defineConfig } from "vitest/config";

// Unit tests cover only the server's money/notification logic in api/_lib
// (specs/001-persistent-backend, research R13). The site itself is checked by tsc + eslint.
export default defineConfig({
  test: {
    environment: "node",
    include: ["api/_lib/__tests__/**/*.test.js"],
  },
});
