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

    describe("Positive Cases", () => {
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
    });

    describe("Edge Cases", () => {
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

    // Negative Cases: Not applicable. publishDate relies on cdate library for date formatting.
  });

  describe("generateContent", () => {
    const tempDir = "/tmp/test-create-post";
    const templatePath = join(tempDir, "template.md");

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

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("Positive Cases", () => {
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
    });

    describe("Edge Cases", () => {
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

    describe("Negative Cases", () => {
      it("should propagate error when template file does not exist", async () => {
        // Arrange
        const nonExistentPath = "/tmp/test-create-post/nonexistent.md";

        // Act & Assert
        await expect(
          generateContent(nonExistentPath, "Title", ["tag"]),
        ).rejects.toThrow();
      });
    });
  });

  describe("checkSameSlug", () => {
    beforeEach(() => {
      vi.mocked(readdir).mockReset();
    });

    describe("Positive Cases", () => {
      it("should return true when slug matches existing file", async () => {
        // Arrange
        // readdir returns string[] when called without withFileTypes option
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
        // readdir returns string[] when called without withFileTypes option
        vi.mocked(readdir).mockResolvedValue([] as unknown as string[]);

        // Act
        const result = await checkSameSlug("any-slug");

        // Assert
        expect(result).toBe(false);
      });

      it("should return false when file with different extension exists", async () => {
        // Arrange
        // readdir returns string[] when called without withFileTypes option
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
        // readdir returns string[] when called without withFileTypes option
        vi.mocked(readdir).mockResolvedValue([
          "existing-post.md",
          "another-post.md",
        ] as unknown as string[]);

        // Act
        const result = await checkSameSlug("non-existing-post");

        // Assert
        expect(result).toBe(false);
      });

      it("should propagate error when readdir fails", async () => {
        // Arrange
        vi.mocked(readdir).mockRejectedValue(
          new Error("ENOENT: no such file or directory"),
        );

        // Act & Assert
        await expect(checkSameSlug("any-slug")).rejects.toThrow("ENOENT");
      });
    });
  });
});
