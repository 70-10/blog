import { describe, expect, it } from "vitest";
import { draftPath, isDraftId } from "./id";

describe("isDraftId", () => {
  describe("Positive Cases", () => {
    it("should accept an id produced by randomUUID", () => {
      // Arrange
      const id = crypto.randomUUID();

      // Act
      const result = isDraftId(id);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("Negative Cases", () => {
    it("should reject an id containing a path traversal", () => {
      // Arrange
      const id = "../../src/content/posts/hijacked";

      // Act
      const result = isDraftId(id);

      // Assert
      expect(result).toBe(false);
    });

    it("should reject an empty id", () => {
      // Act
      const result = isDraftId("");

      // Assert
      expect(result).toBe(false);
    });

    it("should reject an id with unexpected characters", () => {
      // Act
      const result = isDraftId("abc.md");

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe("draftPath", () => {
  describe("Positive Cases", () => {
    it("should place a draft under the drafts directory", () => {
      // Arrange
      const id = crypto.randomUUID();

      // Act
      const path = draftPath(id);

      // Assert
      expect(path).toBe(`src/content/drafts/${id}.md`);
    });
  });

  describe("Negative Cases", () => {
    it("should throw for an id that is not a draft id", () => {
      // Act & Assert
      expect(() => draftPath("../x")).toThrow();
    });
  });
});
