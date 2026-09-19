import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serializeDraft } from "../../../shared/draft";
import { encodeBase64 } from "../../lib/github";
import type { Env } from "../_middleware";
import { onRequestGet, onRequestPut } from "./[id]";

const env: Env = {
  ACCESS_TEAM_DOMAIN: "example.cloudflareaccess.com",
  ACCESS_AUD: "aud",
  GITHUB_TOKEN: "token",
  GITHUB_REPO: "70-10/blog",
  GITHUB_BRANCH: "main",
};

const id = crypto.randomUUID();
const createdAt = "2026-08-01T00:00:00.000Z";

let fetchMock: ReturnType<typeof vi.fn>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function storedDraft(title: string, body: string) {
  return json({
    content: encodeBase64(
      serializeDraft({
        title,
        body,
        createdAt,
        updatedAt: "2026-08-02T00:00:00.000Z",
      }),
    ),
    sha: "sha-stored",
  });
}

function putRequest(body: unknown) {
  return new Request(`https://admin.example.net/api/drafts/${id}`, {
    method: "PUT",
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
    it("should return the stored title and body", async () => {
      // Arrange
      fetchMock.mockResolvedValue(storedDraft("残したもの", "本文\n\n続き"));

      // Act
      const response = await onRequestGet({
        request: new Request(`https://admin.example.net/api/drafts/${id}`),
        env,
        params: { id },
      });

      // Assert
      const draft = (await response.json()) as {
        title: string;
        body: string;
        sha: string;
      };
      expect(draft.title).toBe("残したもの");
      expect(draft.body).toBe("本文\n\n続き");
      expect(draft.sha).toBe("sha-stored");
    });
  });

  describe("Edge Cases", () => {
    it("should return not found for an unknown id", async () => {
      // Arrange
      fetchMock.mockResolvedValue(json({ message: "Not Found" }, 404));

      // Act
      const response = await onRequestGet({
        request: new Request(`https://admin.example.net/api/drafts/${id}`),
        env,
        params: { id },
      });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe("Negative Cases", () => {
    it("should reject a request with a malformed id", async () => {
      // Act
      const response = await onRequestGet({
        request: new Request("https://admin.example.net/api/drafts/x"),
        env,
        params: { id: "../../src/content/posts/hijacked" },
      });

      // Assert
      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});

describe("onRequestPut", () => {
  describe("Positive Cases", () => {
    it("should update a draft and advance the updated time", async () => {
      // Arrange
      fetchMock
        .mockResolvedValueOnce(storedDraft("前のタイトル", "前の本文"))
        .mockResolvedValueOnce(json({ content: { sha: "sha-next" } }));

      // Act
      const response = await onRequestPut({
        request: putRequest({
          title: "新しいタイトル",
          body: "新しい本文",
          sha: "sha-stored",
        }),
        env,
        params: { id },
      });

      // Assert
      const result = (await response.json()) as { updatedAt: string };
      const [, init] = fetchMock.mock.calls[1];
      const sent = JSON.parse((init as RequestInit).body as string) as {
        content: string;
        message: string;
        sha: string;
      };
      expect(response.status).toBe(200);
      expect(result.updatedAt > "2026-08-02T00:00:00.000Z").toBe(true);
      expect(sent.sha).toBe("sha-stored");
      expect(sent.message.startsWith("[CI Skip] ")).toBe(true);
    });

    it("should keep the original created time", async () => {
      // Arrange
      fetchMock
        .mockResolvedValueOnce(storedDraft("前のタイトル", "前の本文"))
        .mockResolvedValueOnce(json({ content: { sha: "sha-next" } }));

      // Act
      await onRequestPut({
        request: putRequest({ title: "更新", body: "本文", sha: "sha-stored" }),
        env,
        params: { id },
      });

      // Assert
      const [, init] = fetchMock.mock.calls[1];
      const sent = JSON.parse((init as RequestInit).body as string) as {
        content: string;
      };
      expect(atob(sent.content)).toContain(`createdAt: ${createdAt}`);
    });
  });

  describe("Negative Cases", () => {
    it("should not overwrite when the sha does not match", async () => {
      // Arrange
      fetchMock
        .mockResolvedValueOnce(storedDraft("前のタイトル", "前の本文"))
        .mockResolvedValueOnce(json({ message: "conflict" }, 409));

      // Act
      const response = await onRequestPut({
        request: putRequest({ title: "更新", body: "本文", sha: "sha-old" }),
        env,
        params: { id },
      });

      // Assert
      expect(response.status).toBe(409);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should reject an update with an empty draft", async () => {
      // Act
      const response = await onRequestPut({
        request: putRequest({ title: " ", body: "\n", sha: "sha-stored" }),
        env,
        params: { id },
      });

      // Assert
      expect(response.status).toBe(422);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("should reject an update without a sha", async () => {
      // Act
      const response = await onRequestPut({
        request: putRequest({ title: "更新", body: "本文" }),
        env,
        params: { id },
      });

      // Assert
      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
