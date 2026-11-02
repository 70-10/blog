const LABELS = ["Arrange", "Act", "Assert"];
const PATTERNS = LABELS.map((label) => new RegExp(`\\b${label}\\b`));

function calleeName(callee) {
  if (callee.type === "Identifier") return callee.name;
  if (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier"
  ) {
    return callee.property.name;
  }
  return null;
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require // Arrange, // Act and // Assert comments in each test body.",
    },
    schema: [],
    messages: {
      missing:
        "Missing AAA comment(s): {{missing}}. Mark the sections with `// Arrange`, `// Act` and `// Assert` (write `// Arrange (no setup needed)` when there is no setup). See src/lib/repositories/posts.test.ts.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = calleeName(node.callee);
        if (name !== "it" && name !== "test") return;

        const callback = node.arguments.find(
          (arg) =>
            arg.type === "ArrowFunctionExpression" ||
            arg.type === "FunctionExpression",
        );
        if (!callback || callback.body.type !== "BlockStatement") return;

        const texts = context.sourceCode
          .getCommentsInside(callback.body)
          .filter((comment) => comment.type === "Line")
          .map((comment) => comment.value);
        const missing = LABELS.filter(
          (_, i) => !texts.some((text) => PATTERNS[i].test(text)),
        );
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
};
