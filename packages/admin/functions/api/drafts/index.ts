import { hasContent, parseDraft, serializeDraft } from "../../../shared/draft";
import { DRAFTS_DIR, draftPath } from "../../../shared/id";
import type { DraftSummary } from "../../../shared/types";
import {
  draftCommitMessage,
  listDirectory,
  readFile,
  writeFile,
} from "../../lib/github";
import { isInvalid, validateDraftInput } from "../../lib/validate";
import type { Env } from "../_middleware";

type RequestContext = { request: Request; env: Env };

/** 一覧。タイトルと更新時刻だけを返す（本文は返さない）。 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const entries = await listDirectory(context.env, DRAFTS_DIR);

  // ディレクトリが無い = 下書きが 1 件も無い。エラーにしない（design/rules.md）。
  if (entries === null) return Response.json([] satisfies DraftSummary[]);

  const files = entries.filter((entry) => entry.name.endsWith(".md"));

  // ディレクトリの一覧はファイル名と sha しか返さないので、タイトルを出すには
  // 1 件ずつ取りに行く。Unit 1 は件数が少ない前提で受け入れる（design/data-model.md）。
  const summaries = await Promise.all(
    files.map(async (entry): Promise<DraftSummary | null> => {
      const id = entry.name.replace(/\.md$/, "");
      const file = await readFile(context.env, entry.path);
      if (!file) return null;

      // 1 件でも読めないものがあると一覧ごと落ちる、という作りにしない。
      // 落ちると「残した下書きを開き直せる」が全件について成り立たなくなる。
      // 読めなかったものは中身なしとして並べ、開くことはできるようにする。
      try {
        const draft = parseDraft(file.text);
        return { id, title: draft.title, updatedAt: draft.updatedAt };
      } catch {
        return { id, title: "", updatedAt: "" };
      }
    }),
  );

  const list = summaries
    .filter((summary): summary is DraftSummary => summary !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return Response.json(list);
}

/** 新しく作る。両方が空なら作らない。 */
export async function onRequestPost(
  context: RequestContext,
): Promise<Response> {
  const input = validateDraftInput(await context.request.json());
  if (isInvalid(input)) {
    return Response.json({ message: input.message }, { status: 400 });
  }

  // 両方空なら GitHub を呼ばずに終わる（US-01 の異常系）。
  if (!hasContent(input.title, input.body)) {
    return Response.json({ message: "残すものがありません" }, { status: 422 });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const text = serializeDraft({
    title: input.title,
    body: input.body,
    createdAt: now,
    updatedAt: now,
  });

  const result = await writeFile(
    context.env,
    draftPath(id),
    text,
    draftCommitMessage("add", id),
  );
  if (!result.ok) {
    return Response.json(
      { message: "同じ識別子の下書きが既にあります" },
      { status: 409 },
    );
  }

  return Response.json(
    { id, createdAt: now, updatedAt: now, sha: result.sha },
    { status: 201 },
  );
}
