import { getViteConfig } from "astro/config";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

type VitestConfig = Parameters<typeof getViteConfig>[0] &
  Parameters<typeof defineConfig>[0];

export default getViteConfig({
  test: {
    environment: "node",
    globals: true,
    typecheck: {
      enabled: true,
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "tools/admin/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "json-summary"],
      include: ["src/**/*", "tools/**/*"],
      exclude: [
        "**/*.test.*",
        "**/*.config.*",
        "**/*.d.ts",
        "**/*.astro",
        "tools/admin/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
} as VitestConfig);
