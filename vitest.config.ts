/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { resolve } from "node:path";

export default getViteConfig({
  test: {
    environment: "jsdom",
    globals: true,
    typecheck: {
      enabled: true,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "json-summary"],
      include: ["src/**/*", "tools/**/*"],
      exclude: ["**/*.test.*", "**/*.config.*", "**/*.d.ts", "**/*.astro"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
});
