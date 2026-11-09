import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/*/src/**/*.test.ts",
      "packages/*/scripts/**/*.test.ts",
      "packages/*/rules/**/*.test.ts",
      "apps/*/src/**/*.test.ts",
      "scripts/**/*.test.ts",
    ],
    environment: "node",
    // deployBatch.test.ts drives real git processes in temporary repositories, slow on Windows.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
