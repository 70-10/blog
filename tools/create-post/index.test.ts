// @vitest-environment node
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkSameSlug, generateContent, publishDate } from "./index";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    readdir: vi.fn(),
  };
});

describe("create-post utilities", () => {
  describe("publishDate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return ISO date with JST timezone for JST timezone", () => {
      // Arrange
      const mockDate = new Date("2023-01-01T10:00:00.000Z");
      vi.setSystemTime(mockDate);
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-540);

      // Act
      const result = publishDate();

      // Assert
      expect(result).toBe("2023-01-01T10:00:00.000+09:00");
    });

    it("should return ISO date with Z timezone for non-JST timezone", () => {
      // Arrange
      const mockDate = new Date("2023-01-01T10:00:00.000Z");
      vi.setSystemTime(mockDate);
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(0);

      // Act
      const result = publishDate();

      // Assert
      expect(result).toBe("2023-01-01T10:00:00.000Z");
    });

    it("should return current time when no time is mocked", () => {
      // Arrange
      vi.useRealTimers();
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-540);

      // Act
      const result = publishDate();

      // Assert
      expect(result).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+09:00$/,
      );
    });
  });

  describe("generateContent", () => {
    const tempDir = "/tmp/test-create-post";
    const templatePath = join(tempDir, "template.md");

    afterEach(() => {
      vi.useRealTimers();
    });

    beforeEach(async () => {
      await mkdir(tempDir, { recursive: true });
      await writeFile(
        templatePath,
        `---
title: <title>
publishDate: <date>
tags: [<tags>]
description: ""
---
`,
      );
    });

    it("should replace title, date, and tags in template", async () => {
      // Arrange
      const title = "Test Post";
      const tags = ["javascript", "testing"];
      vi.useFakeTimers();
      const mockDate = new Date("2023-01-01T10:00:00.000Z");
      vi.setSystemTime(mockDate);
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-540);

      // Act
      const result = await generateContent(templatePath, title, tags);

      // Assert
      expect(result).toContain("title: Test Post");
      expect(result).toContain("publishDate: 2023-01-01T10:00:00.000+09:00");
      expect(result).toContain('tags: ["javascript", "testing"]');
      expect(result).toContain('description: ""');
    });

    it("should handle single tag", async () => {
      // Arrange
      const title = "Single Tag Post";
      const tags = ["react"];

      // Act
      const result = await generateContent(templatePath, title, tags);

      // Assert
      expect(result).toContain('tags: ["react"]');
    });

    it("should handle empty tags array", async () => {
      // Arrange
      const title = "No Tags Post";
      const tags: string[] = [];

      // Act
      const result = await generateContent(templatePath, title, tags);

      // Assert
      expect(result).toContain('tags: [""]');
    });

    it("should handle special characters in title", async () => {
      // Arrange
      const title = 'Special & Characters: Test "Post"';
      const tags = ["test"];

      // Act
      const result = await generateContent(templatePath, title, tags);

      // Assert
      expect(result).toContain('title: Special & Characters: Test "Post"');
      expect(result).toContain('description: ""');
    });
  });

  describe("checkSameSlug", () => {
    beforeEach(() => {
      vi.mocked(readdir).mockReset();
    });

    describe("Positive Cases", () => {
      it("should return true when slug matches existing file", async () => {
        // Arrange
        vi.mocked(readdir).mockResolvedValue([
          "existing-post.md",
          "another-post.md",
        ] as unknown as string[]);

        // Act
        const result = await checkSameSlug("existing-post");

        // Assert
        expect(result).toBe(true);
      });
    });

    describe("Edge Cases", () => {
      it("should return false for empty directory", async () => {
        // Arrange
        vi.mocked(readdir).mockResolvedValue([] as unknown as string[]);

        // Act
        const result = await checkSameSlug("any-slug");

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when file with different extension exists", async () => {
        // Arrange
        vi.mocked(readdir).mockResolvedValue([
          "my-post.txt",
          "my-post.mdx",
        ] as unknown as string[]);

        // Act
        const result = await checkSameSlug("my-post");

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("Negative Cases", () => {
      it("should return false when slug does not match any file", async () => {
        // Arrange
        vi.mocked(readdir).mockResolvedValue([
          "existing-post.md",
          "another-post.md",
        ] as unknown as string[]);

        // Act
        const result = await checkSameSlug("non-existing-post");

        // Assert
        expect(result).toBe(false);
      });
    });
  });
});
