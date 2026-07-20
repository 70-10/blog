import eslint from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import * as astroParser from "astro-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";
import astroPlugin from "eslint-plugin-astro";
import globals from "globals";

const AAA_LABELS = ["Arrange", "Act", "Assert"];
const AAA_PATTERNS = AAA_LABELS.map((label) => new RegExp(`\\b${label}\\b`));

const localPlugin = {
  rules: {
    "require-aaa-comments": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Require // Arrange, // Act, // Assert comments in each test body.",
        },
        schema: [],
        messages: {
          missing:
            "Missing AAA comment(s) in test body: {{missing}}. Add `// Arrange`, `// Act`, and `// Assert` to mark sections.",
        },
      },
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        return {
          CallExpression(node) {
            const callee = node.callee;
            const calleeName =
              callee.type === "Identifier"
                ? callee.name
                : callee.type === "MemberExpression" &&
                    callee.property.type === "Identifier"
                  ? callee.property.name
                  : null;
            if (calleeName !== "it" && calleeName !== "test") return;

            const callback = node.arguments.find(
              (arg) =>
                arg &&
                (arg.type === "ArrowFunctionExpression" ||
                  arg.type === "FunctionExpression"),
            );
            if (
              !callback ||
              !callback.body ||
              callback.body.type !== "BlockStatement"
            )
              return;

            const comments = sourceCode.getCommentsInside(callback.body);
            const lineTexts = comments
              .filter((c) => c.type === "Line")
              .map((c) => c.value.trim());
            const covered = new Set();
            for (const text of lineTexts) {
              for (let i = 0; i < AAA_LABELS.length; i++) {
                if (AAA_PATTERNS[i].test(text)) {
                  covered.add(AAA_LABELS[i]);
                }
              }
            }
            const missing = AAA_LABELS.filter((label) => !covered.has(label));
            if (missing.length > 0) {
              context.report({
                node,
                messageId: "missing",
                data: { missing: missing.join(", ") },
              });
            }
          },
        };
      },
    },
  },
};

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
      "@typescript-eslint/no-explicit-any": "error",
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
  {
    files: ["**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: { local: localPlugin },
    rules: {
      "local/require-aaa-comments": "error",
    },
  },
  eslintConfigPrettier,
];
