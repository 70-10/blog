/** 下書き 1 件。実体は src/content/drafts/<id>.md（docs/adr/0009）。 */
export type Draft = {
  id: string;
  title: string;
  body: string;
  /** ISO 8601（UTC） */
  createdAt: string;
  /** ISO 8601（UTC） */
  updatedAt: string;
};

/** 一覧で使う分だけ。本文は返さない。 */
export type DraftSummary = Pick<Draft, "id" | "title" | "updatedAt">;

/** frontmatter に書き出す項目。id は本文に持たず、ファイル名が持つ。 */
export type DraftFrontmatter = Pick<Draft, "title" | "createdAt" | "updatedAt">;
