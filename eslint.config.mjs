import eslint from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import * as astroParser from "astro-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";
import astroPlugin from "eslint-plugin-astro";
import globals from "globals";
import localPlugin from "./eslint-rules/index.mjs";

export default [
  {
    ignores: [
      "**/.astro/",
      "node_modules/**/*",
      "**/*.d.ts",
      "**/dist/",
      "coverage/**",
      ".claude/worktrees/",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  eslint.configs.recommended,
  ...astroPlugin.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      local: localPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      ...typescriptEslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "local/no-disable-no-explicit-any": "error",
    },
  },
  typescriptEslint.configs["flat/eslint-recommended"],
  {
    files: ["**/*.astro"],

    languageOptions: {
      parser: astroParser,

      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "local/require-aaa-comments": "error",
    },
  },
  eslintConfigPrettier,
];
