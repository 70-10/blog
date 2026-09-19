import { hasContent, parseDraft, serializeDraft } from "../../../shared/draft";
import { draftPath, isDraftId } from "../../../shared/id";
import { draftCommitMessage, readFile, writeFile } from "../../lib/github";
import { isInvalid, validateDraftInput } from "../../lib/validate";
import type { Env } from "../_middleware";

type RequestContext = {
  request: Request;
  env: Env;
  params: { id: string | string[] };
};

function idOf(context: RequestContext): string | null {
  const raw = Array.isArray(context.params.id)
    ? context.params.id[0]
    : context.params.id;
  // 経路の値をファイルのパスに使うので、形を確かめてからでないと使わない。
  return typeof raw === "string" && isDraftId(raw) ? raw : null;
}

/** 1 件取得。開き直すときに使う。 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const id = idOf(context);
  if (!id) {
    return Response.json(
      { message: "識別子が正しくありません" },
      { status: 400 },
    );
  }

  const file = await readFile(context.env, draftPath(id));
  if (!file) {
    return Response.json(
      { message: "下書きが見つかりません" },
      { status: 404 },
    );
  }

  const draft = parseDraft(file.text);
  return Response.json({ id, ...draft, sha: file.sha });
}

/** 更新（自動保存）。createdAt は変えず、updatedAt だけ進める。 */
export async function onRequestPut(context: RequestContext): Promise<Response> {
  const id = idOf(context);
  if (!id) {
    return Response.json(
      { message: "識別子が正しくありません" },
      { status: 400 },
    );
  }

  const payload = (await context.request.json()) as Record<string, unknown>;
  const input = validateDraftInput(payload);
  if (isInvalid(input)) {
    return Response.json({ message: input.message }, { status: 400 });
  }
  if (typeof payload.sha !== "string" || payload.sha.length === 0) {
    return Response.json({ message: "sha がありません" }, { status: 400 });
  }
  if (!hasContent(input.title, input.body)) {
    return Response.json({ message: "残すものがありません" }, { status: 422 });
  }

  // createdAt は画面から受け取らず、保存されているものを読む（画面を信じない）。
  const existing = await readFile(context.env, draftPath(id));
  if (!existing) {
    return Response.json(
      { message: "下書きが見つかりません" },
      { status: 404 },
    );
  }

  const updatedAt = new Date().toISOString();
  const text = serializeDraft({
    title: input.title,
    body: input.body,
    createdAt: parseDraft(existing.text).createdAt,
    updatedAt,
  });

  const result = await writeFile(
    context.env,
    draftPath(id),
    text,
    draftCommitMessage("update", id),
    payload.sha,
  );
  if (!result.ok) {
    return Response.json(
      { message: "他のところで変わっています。読み直してください" },
      { status: 409 },
    );
  }

  return Response.json({ id, updatedAt, sha: result.sha });
}
