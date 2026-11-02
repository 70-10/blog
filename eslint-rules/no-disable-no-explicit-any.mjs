const DIRECTIVE =
  /^\s*eslint-disable(?:-next-line|-line)?\s+([^]*?)(?:\s--\s|$)/;
const TARGET = "@typescript-eslint/no-explicit-any";

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: `Forbid eslint-disable comments that turn off ${TARGET}.`,
    },
    schema: [],
    messages: {
      forbidden: `Do not disable ${TARGET}. Cast with \`as unknown as T\` instead (see src/lib/repositories/posts.test.ts).`,
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const match = DIRECTIVE.exec(comment.value);
          if (!match) continue;
          const rules = match[1].split(",").map((rule) => rule.trim());
          if (rules.includes(TARGET)) {
            context.report({ loc: comment.loc, messageId: "forbidden" });
          }
        }
      },
    };
  },
};
