import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: true,
    include: ["src/**/*.test.{ts,tsx}", "functions/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*", "functions/**/*"],
      exclude: ["**/*.test.*", "**/*.config.*", "**/*.d.ts"],
    },
  },
});
