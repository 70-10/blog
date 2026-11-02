import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { type ESLint, RuleTester } from "eslint";
import rule from "./no-disable-no-explicit-any.mjs";

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser },
  plugins: {
    "@typescript-eslint": typescriptEslint as unknown as ESLint.Plugin,
  },
});

ruleTester.run("no-disable-no-explicit-any", rule, {
  valid: [
    "const posts = [] as unknown as Posts;",
    "// eslint-disable-next-line prefer-rest-params -- gtag needs Arguments\nfoo(arguments);",
    "// mentions @typescript-eslint/no-explicit-any without a directive",
  ],
  invalid: [
    {
      code: "// eslint-disable-next-line @typescript-eslint/no-explicit-any\nmock([] as any);",
      errors: [{ messageId: "forbidden" }],
    },
    {
      code: "/* eslint-disable @typescript-eslint/no-explicit-any */\nmock([] as any);",
      errors: [{ messageId: "forbidden" }],
    },
    {
      code: "mock([] as any); // eslint-disable-line prefer-const, @typescript-eslint/no-explicit-any",
      errors: [{ messageId: "forbidden" }],
    },
  ],
});
