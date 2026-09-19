import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serializeDraft } from "../../../shared/draft";
import { encodeBase64 } from "../../lib/github";
import type { Env } from "../_middleware";
import { onRequestGet, onRequestPost } from "./index";

const env: Env = {
  ACCESS_TEAM_DOMAIN: "example.cloudflareaccess.com",
  ACCESS_AUD: "aud",
  GITHUB_TOKEN: "token",
  GITHUB_REPO: "70-10/blog",
  GITHUB_BRANCH: "main",
};

let fetchMock: ReturnType<typeof vi.fn>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fileResponse(draft: {
  title: string;
  createdAt: string;
  updatedAt: string;
  body: string;
}) {
  return json({ content: encodeBase64(serializeDraft(draft)), sha: "sha-x" });
}

function postRequest(body: unknown) {
  return new Request("https://admin.example.net/api/drafts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("onRequestGet", () => {
  describe("Positive Cases", () => {
    it("should list drafts sorted by updated time descending", async () => {
      // Arrange
      const ids = [
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
      ];
      fetchMock.mockImplementation(async (url: string) => {
        if (url.includes(`${ids[0]}.md`)) {
          return fileResponse({
            title: "古い",
            createdAt: "2026-08-01T00:00:00.000Z",
            updatedAt: "2026-08-01T00:00:00.000Z",
            body: "a",
          });
        }
        if (url.includes(`${ids[1]}.md`)) {
          return fileResponse({
            title: "新しい",
            createdAt: "2026-08-03T00:00:00.000Z",
            updatedAt: "2026-08-13T00:00:00.000Z",
            body: "b",
          });
        }
        if (url.includes(`${ids[2]}.md`)) {
          return fileResponse({
            title: "中くらい",
            createdAt: "2026-08-02T00:00:00.000Z",
            updatedAt: "2026-08-05T00:00:00.000Z",
            body: "c",
          });
        }
        return json(
          ids.map((id) => ({
            name: `${id}.md`,
            path: `src/content/drafts/${id}.md`,
            sha: "sha-dir",
          })),
        );
      });

      // Act
      const response = await onRequestGet({
        request: new Request("https://admin.example.net/api/drafts"),
        env,
      });

      // Assert
      const list = (await response.json()) as { title: string }[];
      expect(list.map((item) => item.title)).toEqual([
        "新しい",
        "中くらい",
        "古い",
      ]);
    });
  });

  describe("Edge Cases", () => {
    it("should still list a draft whose frontmatter cannot be read", async () => {
      // Arrange
      // 1 件でも読めないものがあると一覧ごと落ちる、という作りになっていないこと。
      // 落ちると「残した下書きを開き直せる」が全件について成り立たなくなる。
      const broken = crypto.randomUUID();
      const good = crypto.randomUUID();
      fetchMock.mockImplementation(async (url: string) => {
        if (url.includes(`${broken}.md`)) {
          return json({
            content: encodeBase64("frontmatter のない中身"),
            sha: "s",
          });
        }
        if (url.includes(`${good}.md`)) {
          return fileResponse({
            title: "読める下書き",
            createdAt: "2026-08-01T00:00:00.000Z",
            updatedAt: "2026-08-13T00:00:00.000Z",
            body: "a",
          });
        }
        return json(
          [broken, good].map((id) => ({
            name: `${id}.md`,
            path: `src/content/drafts/${id}.md`,
            sha: "sha-dir",
          })),
        );
      });

      // Act
      const response = await onRequestGet({
        request: new Request("https://admin.example.net/api/drafts"),
        env,
      });

      // Assert
      const list = (await response.json()) as { id: string; title: string }[];
      expect(response.status).toBe(200);
      expect(list).toHaveLength(2);
      expect(list.map((item) => item.id)).toContain(broken);
    });

    it("should return an empty list when the drafts directory is missing", async () => {
      // Arrange
      fetchMock.mockResolvedValue(json({ message: "Not Found" }, 404));

      // Act
      const response = await onRequestGet({
        request: new Request("https://admin.example.net/api/drafts"),
        env,
      });

      // Assert
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([]);
    });
  });
});

describe("onRequestPost", () => {
  describe("Positive Cases", () => {
    it("should create a draft and return its id", async () => {
      // Arrange
      fetchMock.mockResolvedValue(json({ content: { sha: "sha-new" } }, 201));

      // Act
      const response = await onRequestPost({
        request: postRequest({ title: "着想", body: "本文" }),
        env,
      });

      // Assert
      const created = (await response.json()) as { id: string };
      expect(response.status).toBe(201);
      expect(created.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should prefix the commit message with the build skip flag", async () => {
      // Arrange
      fetchMock.mockResolvedValue(json({ content: { sha: "sha-new" } }, 201));

      // Act
      await onRequestPost({
        request: postRequest({ title: "着想", body: "本文" }),
        env,
      });

      // Assert
      const [, init] = fetchMock.mock.calls[0];
      const sent = JSON.parse((init as RequestInit).body as string) as {
        message: string;
      };
      expect(sent.message.startsWith("[CI Skip] ")).toBe(true);
    });

    it("should write the draft under the drafts directory", async () => {
      // Arrange
      fetchMock.mockResolvedValue(json({ content: { sha: "sha-new" } }, 201));

      // Act
      const response = await onRequestPost({
        request: postRequest({ title: "", body: "本文だけ" }),
        env,
      });

      // Assert
      const created = (await response.json()) as { id: string };
      const [url] = fetchMock.mock.calls[0];
      expect(url).toContain(`/contents/src/content/drafts/${created.id}.md`);
    });
  });

  describe("Negative Cases", () => {
    it("should not call GitHub when both title and body are empty", async () => {
      // Act
      const response = await onRequestPost({
        request: postRequest({ title: "  ", body: "\n" }),
        env,
      });

      // Assert
      expect(response.status).toBe(422);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should reject a title longer than the limit", async () => {
      // Act
      const response = await onRequestPost({
        request: postRequest({ title: "あ".repeat(1001), body: "本文" }),
        env,
      });

      // Assert
      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
