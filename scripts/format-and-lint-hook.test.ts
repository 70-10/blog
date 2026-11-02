import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

const postsDir = join(import.meta.dirname, "..", "src", "content", "posts");

describe("format-and-lint-hook.sh", { timeout: 60_000 }, () => {
  // The hook may run from another checkout than the edited file (worktree sessions),
  // so every case runs a copy of the script from outside the repository.
  let outside: string;
  let dir: string;

  function runHook(filePath: string) {
    return spawnSync("bash", [join(outside, "format-and-lint-hook.sh")], {
      cwd: outside,
      input: JSON.stringify({ tool_input: { file_path: filePath } }),
      encoding: "utf8",
      timeout: 60_000,
    });
  }

  beforeAll(() => {
    outside = mkdtempSync(join(tmpdir(), "hook-script-"));
    copyFileSync(
      join(import.meta.dirname, "format-and-lint-hook.sh"),
      join(outside, "format-and-lint-hook.sh"),
    );
  });

  afterAll(() => {
    rmSync(outside, { recursive: true, force: true });
  });

  beforeEach(() => {
    dir = mkdtempSync(join(import.meta.dirname, ".hook-test-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe("Positive Cases", () => {
    it("formats a clean TypeScript file and exits 0", () => {
      // Arrange
      const file = join(dir, "clean.ts");
      writeFileSync(file, "export const value   = 1\n");

      // Act
      const result = runHook(file);

      // Assert
      expect(result.status).toBe(0);
      expect(readFileSync(file, "utf8")).toBe("export const value = 1;\n");
    });
  });

  describe("Edge Cases", () => {
    it("exits 0 for a file type that is only formatted", () => {
      // Arrange
      const file = join(dir, "data.json");
      writeFileSync(file, '{"a":1}\n');

      // Act
      const result = runHook(file);

      // Assert
      expect(result.status).toBe(0);
      expect(readFileSync(file, "utf8")).toBe('{ "a": 1 }\n');
    });

    it("does not gate textlint errors in Markdown outside posts", () => {
      // Arrange
      const file = join(dir, "notes.md");
      writeFileSync(file, "これは私は好きです。\n");

      // Act
      const result = runHook(file);

      // Assert
      expect(result.status).toBe(0);
    });

    it("exits 0 when the edited file no longer exists", () => {
      // Arrange
      const file = join(dir, "deleted.ts");

      // Act
      const result = runHook(file);

      // Assert
      expect(result.status).toBe(0);
    });
  });

  describe("Negative Cases", () => {
    it("exits 2 and reports ESLint errors on stderr", () => {
      // Arrange
      const file = join(dir, "bad.ts");
      writeFileSync(file, "export const value = [] as any;\n");

      // Act
      const result = runHook(file);

      // Assert
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("@typescript-eslint/no-explicit-any");
    });

    it("exits 2 and reports textlint errors that --fix cannot fix in a post", () => {
      // Arrange
      const file = join(postsDir, `.hook-test-${process.pid}.md`);
      writeFileSync(file, "これは私は好きです。\n");

      // Act
      const result = runHook(file);
      rmSync(file, { force: true });

      // Assert
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("no-doubled-joshi");
    });
  });
});
