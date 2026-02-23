import eslint from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import astroParser from "astro-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";
import astroPlugin from "eslint-plugin-astro";
import globals from "globals";

export default [
  {
    ignores: [
      "**/.astro/",
      "node_modules/**/*",
      "**/*.d.ts",
      "**/dist/",
      "coverage/**",
    ],
  },
  eslint.configs.recommended,
  ...astroPlugin.configs.recommended,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
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
    },
  },
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
  eslintConfigPrettier,
];
