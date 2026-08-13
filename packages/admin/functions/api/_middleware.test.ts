import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "./_middleware";
import { onRequest, resetKeyCache } from "./_middleware";

const TEAM_DOMAIN = "example.cloudflareaccess.com";
const AUD = "aud-tag-for-the-admin-app";
const ISSUER = `https://${TEAM_DOMAIN}`;

const env: Env = {
  ACCESS_TEAM_DOMAIN: TEAM_DOMAIN,
  ACCESS_AUD: AUD,
  GITHUB_TOKEN: "token",
  GITHUB_REPO: "70-10/blog",
  GITHUB_BRANCH: "main",
};

type KeyPair = Awaited<ReturnType<typeof generateKeyPair>>;

let signingKey: KeyPair;
let otherKey: KeyPair;
let fetchMock: ReturnType<typeof vi.fn>;

async function jwks(pair: KeyPair, kid: string) {
  const jwk = await exportJWK(pair.publicKey);
  return { keys: [{ ...jwk, kid, alg: "RS256", use: "sig" }] };
}

function jwksResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

async function sign(
  pair: KeyPair,
  kid: string,
  claims: { aud?: string; expiresIn?: string } = {},
) {
  return await new SignJWT({ email: "me@example.com" })
    .setProtectedHeader({ alg: "RS256", kid })
    .setIssuer(ISSUER)
    .setAudience(claims.aud ?? AUD)
    .setIssuedAt()
    .setExpirationTime(claims.expiresIn ?? "1h")
    .sign(pair.privateKey);
}

function request(token?: string) {
  const headers = new Headers();
  if (token) headers.set("Cf-Access-Jwt-Assertion", token);
  return new Request("https://admin.example.net/api/drafts", { headers });
}

function context(token?: string) {
  return {
    request: request(token),
    env,
    next: vi.fn(async () => new Response("ok", { status: 200 })),
  };
}

beforeEach(async () => {
  resetKeyCache();
  signingKey = await generateKeyPair("RS256", { extractable: true });
  otherKey = await generateKeyPair("RS256", { extractable: true });
  fetchMock = vi.fn(async () => jwksResponse(await jwks(signingKey, "key-1")));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("onRequest", () => {
  describe("Positive Cases", () => {
    it("should pass a request with a valid access token", async () => {
      // Arrange
      const token = await sign(signingKey, "key-1");
      const ctx = context(token);

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(ctx.next).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("Edge Cases", () => {
    it("should refetch the key set after the keys rotate", async () => {
      // Arrange
      // 鍵は 6 週ごとに入れ替わる。入れ替わる前の鍵で一度通してから、
      // 取り直しの間隔（30 秒）を越えた時点で新しい鍵の JWT を検証する。
      const rotated = await generateKeyPair("RS256", { extractable: true });
      fetchMock
        .mockResolvedValueOnce(jwksResponse(await jwks(signingKey, "key-1")))
        .mockResolvedValue(jwksResponse(await jwks(rotated, "key-2")));
      await onRequest(context(await sign(signingKey, "key-1")));
      const fetchCountBefore = fetchMock.mock.calls.length;

      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(Date.now() + 60_000);
      const ctx = context(await sign(rotated, "key-2"));

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(response.status).toBe(200);
      expect(fetchMock.mock.calls.length).toBeGreaterThan(fetchCountBefore);
      vi.useRealTimers();
    });

    it("should reuse the cached key set on a second request", async () => {
      // Arrange
      const first = context(await sign(signingKey, "key-1"));
      await onRequest(first);
      const fetchCountBefore = fetchMock.mock.calls.length;
      const second = context(await sign(signingKey, "key-1"));

      // Act
      const response = await onRequest(second);

      // Assert
      expect(response.status).toBe(200);
      expect(fetchMock.mock.calls.length).toBe(fetchCountBefore);
    });
  });

  describe("Negative Cases", () => {
    it("should reject a request without the access header", async () => {
      // Arrange
      const ctx = context();

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(response.status).toBe(401);
      expect(ctx.next).not.toHaveBeenCalled();
    });

    it("should reject a token with an invalid signature", async () => {
      // Arrange
      const token = await sign(otherKey, "key-1");
      const ctx = context(token);

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(response.status).toBe(401);
      expect(ctx.next).not.toHaveBeenCalled();
    });

    it("should reject a token with a mismatched audience", async () => {
      // Arrange
      const token = await sign(signingKey, "key-1", { aud: "someone-else" });
      const ctx = context(token);

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should reject an expired token", async () => {
      // Arrange
      const token = await sign(signingKey, "key-1", { expiresIn: "-1h" });
      const ctx = context(token);

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should reject when the key is still missing after refetching", async () => {
      // Arrange
      const unknown = await generateKeyPair("RS256", { extractable: true });
      const token = await sign(unknown, "key-missing");
      const ctx = context(token);

      // Act
      const response = await onRequest(ctx);

      // Assert
      expect(response.status).toBe(401);
      expect(ctx.next).not.toHaveBeenCalled();
    });
  });
});
