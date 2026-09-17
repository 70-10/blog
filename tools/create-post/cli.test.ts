// @vitest-environment node
import { execa } from "execa";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../..");

describe("create-post CLI", () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "create-post-cli-"));
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  function runCli(args: string[]) {
    return execa(
      "pnpm",
      ["create-post", ...args, "--output-dir", outputDir, "--no-open"],
      {
        cwd: repositoryRoot,
        stdin: "ignore",
        env: { CI: "true" },
        timeout: 15_000,
        reject: false,
      },
    );
  }

  const postArgs = [
    "--title",
    "CLI integration test",
    "--slug",
    "cli-integration-test",
    "--tag",
    "Develop",
    "--tag",
    "テスト",
  ];

  it("creates a post through the real pnpm entrypoint without interactive input or an editor", async () => {
    // Arrange
    const postPath = join(outputDir, "cli-integration-test.md");

    // Act
    const result = await runCli(postArgs);

    // Assert
    expect(result.timedOut).toBe(false);
    expect(result.exitCode, result.stderr).toBe(0);
    expect(await readdir(outputDir)).toEqual(["cli-integration-test.md"]);
    const content = await readFile(postPath, "utf8");
    expect(content).toMatch(/^---\ntitle: CLI integration test\n/);
    expect(content).toContain('tags: ["Develop", "テスト"]');
    expect(content).toContain('description: ""\n---');
    const date = content.match(/^publishDate: (.+)$/m)?.[1];
    expect(date).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(Z|\+09:00)$/,
    );
    expect(Number.isNaN(Date.parse(date!))).toBe(false);
    expect(content).not.toMatch(/<title>|<date>|<tags>/);
  }, 20_000);

  it("fails for a duplicate slug without changing the existing post", async () => {
    // Arrange
    const initialResult = await runCli(postArgs);
    expect(initialResult.exitCode, initialResult.stderr).toBe(0);
    const postPath = join(outputDir, "cli-integration-test.md");
    const original = await readFile(postPath, "utf8");

    // Act
    const result = await runCli([...postArgs, "--title", "Replacement"]);

    // Assert
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("The slug already exists");
    expect(await readFile(postPath, "utf8")).toBe(original);
  }, 40_000);

  it("fails promptly for incomplete non-interactive arguments", async () => {
    // Arrange
    const args = ["--title", "Incomplete post"];

    // Act
    const result = await runCli(args);

    // Assert
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Non-interactive mode requires");
    expect(await readdir(outputDir)).toEqual([]);
  }, 20_000);

  it.each(["../escape", "nested/post", "nested\\post", ".", "..", " "])(
    "rejects invalid slug %j without generating a post",
    async (slug) => {
      // Arrange
      const args = [
        "--title",
        "Invalid slug",
        "--slug",
        slug,
        "--tag",
        "Develop",
      ];

      // Act
      const result = await runCli(args);

      // Assert
      expect(result.timedOut).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("The slug must be a single file name");
      expect(await readdir(outputDir)).toEqual([]);
    },
    20_000,
  );
});
