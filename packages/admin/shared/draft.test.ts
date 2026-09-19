import { describe, expect, it } from "vitest";
import { hasContent, parseDraft, serializeDraft } from "./draft";

const createdAt = "2026-08-13T05:15:31.482Z";
const updatedAt = "2026-08-13T05:20:07.913Z";

describe("hasContent", () => {
  describe("Positive Cases", () => {
    it("should keep a draft with both title and body", () => {
      // Arrange
      const title = "タイトル";
      const body = "本文";

      // Act
      const result = hasContent(title, body);

      // Assert
      expect(result).toBe(true);
    });

    it("should keep a draft with only a title", () => {
      // Arrange
      const title = "タイトルだけ思いついた";
      const body = "";

      // Act
      const result = hasContent(title, body);

      // Assert
      expect(result).toBe(true);
    });

    it("should keep a draft with only a body", () => {
      // Arrange
      const title = "";
      const body = "思いついたことを書き留める";

      // Act
      const result = hasContent(title, body);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should treat whitespace-only input as empty", () => {
      // Arrange
      const title = "   ";
      const body = "\n\n \t\n";

      // Act
      const result = hasContent(title, body);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("Negative Cases", () => {
    it("should reject a draft with neither title nor body", () => {
      // Arrange
      const title = "";
      const body = "";

      // Act
      const result = hasContent(title, body);

      // Assert
      expect(result).toBe(false);
    });
  });
});

describe("serializeDraft and parseDraft", () => {
  describe("Positive Cases", () => {
    it("should round-trip a draft through serialize and parse", () => {
      // Arrange
      const input = {
        title: "着想のタイトル",
        body: "1 行目\n\n2 行目",
        createdAt,
        updatedAt,
      };

      // Act
      const parsed = parseDraft(serializeDraft(input));

      // Assert
      expect(parsed).toEqual(input);
    });
  });

  describe("Edge Cases", () => {
    it("should keep body untouched when it contains a frontmatter fence", () => {
      // Arrange
      const body =
        "書き出し\n\n---\n\ntitle: これは本文の一部\n\n---\n\nまとめ";
      const input = { title: "区切りを含む", body, createdAt, updatedAt };

      // Act
      const parsed = parseDraft(serializeDraft(input));

      // Assert
      expect(parsed.body).toBe(body);
    });

    it("should write an empty title as an explicit field", () => {
      // Arrange
      const input = { title: "", body: "本文だけ", createdAt, updatedAt };

      // Act
      const serialized = serializeDraft(input);

      // Assert
      expect(serialized).toContain('title: ""');
      expect(parseDraft(serialized).title).toBe("");
    });

    it("should keep text that violates the prose linter", () => {
      // Arrange
      // textlint の preset-ja-technical-writing に触れる書き方（弱い表現・長すぎる一文）。
      // 下書きは校正の対象外なので、そのまま往復すること（00_intent.md の Out）。
      const body =
        "これはたぶん良いと思うのだが、そうではないかもしれないと思いつつも、" +
        "とりあえず書いておくことにして、あとで直すつもりで放置している一文です!!";
      const input = { title: "校正に反する", body, createdAt, updatedAt };

      // Act
      const parsed = parseDraft(serializeDraft(input));

      // Assert
      expect(parsed.body).toBe(body);
    });

    it("should keep an empty body", () => {
      // Arrange
      const input = { title: "タイトル先行", body: "", createdAt, updatedAt };

      // Act
      const parsed = parseDraft(serializeDraft(input));

      // Assert
      expect(parsed.body).toBe("");
    });
  });

  describe("Negative Cases", () => {
    it("should throw when the frontmatter is missing", () => {
      // Arrange
      const text = "frontmatter のない本文";

      // Act & Assert
      expect(() => parseDraft(text)).toThrow();
    });
  });
});
