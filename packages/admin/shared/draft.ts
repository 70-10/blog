import type { DraftFrontmatter } from "./types";

const FENCE = "---";

/**
 * 下書きとして残すだけの中身があるか。
 * 前後の空白を落として長さ 0 なら空として扱う（design/rules.md）。
 * 画面と裏側の両方がこれを使う。2 か所で判定すると食い違う。
 */
export function hasContent(title: string, body: string): boolean {
  return title.trim().length > 0 || body.trim().length > 0;
}

/** frontmatter つきの Markdown に組み立てる。title は空でも項目として書く。 */
export function serializeDraft(
  draft: DraftFrontmatter & { body: string },
): string {
  const frontmatter = [
    `title: ${quote(draft.title)}`,
    `createdAt: ${draft.createdAt}`,
    `updatedAt: ${draft.updatedAt}`,
  ].join("\n");

  return `${FENCE}\n${frontmatter}\n${FENCE}\n\n${draft.body}`;
}

/**
 * frontmatter つきの Markdown を分解する。
 * 本文には一切手を入れない。本文が区切りに見える行を含んでいても壊れないよう、
 * 先頭の区切りから数えて 2 つ目の区切り行までだけを frontmatter として読む。
 */
export function parseDraft(text: string): DraftFrontmatter & { body: string } {
  const lines = text.split("\n");
  if (lines[0] !== FENCE) {
    throw new Error("下書きの frontmatter が見つかりません");
  }

  const closing = lines.indexOf(FENCE, 1);
  if (closing === -1) {
    throw new Error("下書きの frontmatter が閉じていません");
  }

  const fields = new Map<string, string>();
  for (const line of lines.slice(1, closing)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    fields.set(
      line.slice(0, separator).trim(),
      unquote(line.slice(separator + 1).trim()),
    );
  }

  // 区切りの次の 1 行（組み立てで入れた空行）を落とす。
  const bodyStart = lines[closing + 1] === "" ? closing + 2 : closing + 1;

  return {
    title: fields.get("title") ?? "",
    createdAt: fields.get("createdAt") ?? "",
    updatedAt: fields.get("updatedAt") ?? "",
    body: lines.slice(bodyStart).join("\n"),
  };
}

function quote(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function unquote(value: string): string {
  if (!value.startsWith('"') || !value.endsWith('"') || value.length < 2) {
    return value;
  }
  return value.slice(1, -1).replaceAll('\\"', '"').replaceAll("\\\\", "\\");
}
