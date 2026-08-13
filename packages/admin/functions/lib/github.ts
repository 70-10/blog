import type { Env } from "../api/_middleware";

const API = "https://api.github.com";

/** 下書きの書き込みで使うコミットメッセージ。
 *
 * [CI Skip] は先頭に置く。Cloudflare Pages はこの印が先頭にあるときだけ
 * デプロイを飛ばす（大文字小文字は問わない）。付けないと下書きを保存するたびに
 * サイト全体が再ビルドされる（docs/adr/0009）。 */
export function draftCommitMessage(
  action: "add" | "update",
  id: string,
): string {
  return `[CI Skip] chore(draft): ${action} ${id}`;
}

export type DirEntry = { name: string; path: string; sha: string };
export type FileContent = { text: string; sha: string };

function headers(env: Env): HeadersInit {
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "user-agent": "blog-admin",
    "x-github-api-version": "2022-11-28",
  };
}

function contentsUrl(env: Env, path: string): string {
  return `${API}/repos/${env.GITHUB_REPO}/contents/${path}?ref=${env.GITHUB_BRANCH}`;
}

/** ディレクトリの中身。無ければ null（下書きが 1 件も無い状態はエラーではない）。 */
export async function listDirectory(
  env: Env,
  path: string,
): Promise<DirEntry[] | null> {
  const response = await fetch(contentsUrl(env, path), {
    headers: headers(env),
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`GitHub の一覧に失敗しました: ${response.status}`);

  const body = (await response.json()) as DirEntry[] | DirEntry;
  return Array.isArray(body) ? body : [body];
}

/** ファイルの中身。無ければ null。 */
export async function readFile(
  env: Env,
  path: string,
): Promise<FileContent | null> {
  const response = await fetch(contentsUrl(env, path), {
    headers: headers(env),
  });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`GitHub の取得に失敗しました: ${response.status}`);

  const body = (await response.json()) as { content: string; sha: string };
  return { text: decodeBase64(body.content), sha: body.sha };
}

export type WriteResult =
  { ok: true; sha: string } | { ok: false; reason: "conflict" };

/** ファイルを書く。sha を渡すと更新、渡さないと新規作成。 */
export async function writeFile(
  env: Env,
  path: string,
  text: string,
  message: string,
  sha?: string,
): Promise<WriteResult> {
  const response = await fetch(
    `${API}/repos/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...headers(env), "content-type": "application/json" },
      body: JSON.stringify({
        message,
        content: encodeBase64(text),
        branch: env.GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    },
  );

  // sha が合わなければ GitHub は 409 を返す。黙って上書きしない（design/rules.md）。
  if (response.status === 409 || response.status === 422) {
    return { ok: false, reason: "conflict" };
  }
  if (!response.ok)
    throw new Error(`GitHub の書き込みに失敗しました: ${response.status}`);

  const body = (await response.json()) as { content: { sha: string } };
  return { ok: true, sha: body.content.sha };
}

/** GitHub は Base64 で返すが、日本語を含むので latin1 のままでは壊れる。 */
export function decodeBase64(value: string): string {
  const binary = atob(value.replaceAll("\n", ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
