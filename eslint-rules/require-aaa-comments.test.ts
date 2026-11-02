import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import rule from "./require-aaa-comments.mjs";

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser },
});

ruleTester.run("require-aaa-comments", rule, {
  valid: [
    `it("adds", () => {
      // Arrange
      const a = 1;
      // Act
      const b = a + 1;
      // Assert
      expect(b).toBe(2);
    });`,
    `test("no setup", async () => {
      // Arrange (no setup needed)
      // Act
      const b = await Promise.resolve(2);
      // Assert
      expect(b).toBe(2);
    });`,
    `describe("group", () => {
      const shared = 1;
    });`,
  ],
  invalid: [
    {
      code: `it("renders", async () => {
        const html = await render();
        expect(html).toContain("x");
      });`,
      errors: [
        { messageId: "missing", data: { missing: "Arrange, Act, Assert" } },
      ],
    },
    {
      code: `test("partial", () => {
        // Act
        const b = 1;
        // Assert
        expect(b).toBe(1);
      });`,
      errors: [{ messageId: "missing", data: { missing: "Arrange" } }],
    },
    {
      code: `it("block comment does not count", () => {
        /* Arrange */
        // Act
        // Assert
      });`,
      errors: [{ messageId: "missing", data: { missing: "Arrange" } }],
    },
  ],
});
