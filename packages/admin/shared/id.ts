/** 下書きを置くディレクトリ。posts コレクションの glob の外（docs/adr/0009）。 */
export const DRAFTS_DIR = "src/content/drafts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * crypto.randomUUID() が作る形かどうか。
 * 経路の値をファイルのパスに使うので、この検査を通ったものだけを使う。
 * 通れば記号は - と 16 進数だけになり、../ でリポジトリの別の場所を書き換えられない。
 */
export function isDraftId(value: string): boolean {
  return UUID.test(value);
}

/** 下書きのファイルのパス。id が形に合わなければ投げる。 */
export function draftPath(id: string): string {
  if (!isDraftId(id)) {
    throw new Error(`下書きの識別子として扱えません: ${id}`);
  }
  return `${DRAFTS_DIR}/${id}.md`;
}
