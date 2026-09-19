# ドキュメントとの照合 — draft-anywhere

設計・テスト設計・ADR に書いたことと、実際のコードが食い違っていないかを突き合わせた。

## 照合結果

### 設計で決めたことがコードにあるか

| 設計で決めたこと                                        | 出どころ                                                                                                          | コード                                                      | 一致 |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---- |
| 下書きは `src/content/drafts/<id>.md`                   | [ADR 0009](../../../../../adr/0009-drafts-live-outside-the-posts-collection-and-commit-with-a-build-skip-flag.md) | `shared/id.ts` の `DRAFTS_DIR` / `draftPath()`              | ○    |
| frontmatter は `title` / `createdAt` / `updatedAt`      | [data-model.md](../design/data-model.md)                                                                          | `shared/draft.ts` の `serializeDraft()`                     | ○    |
| `tags` と `publishDate` は持たない                      | [data-model.md](../design/data-model.md)                                                                          | どこにも書き出していない                                    | ○    |
| 識別子は `crypto.randomUUID()`                          | [data-model.md](../design/data-model.md)                                                                          | `functions/api/drafts/index.ts`                             | ○    |
| コミットメッセージの先頭に `[CI Skip]`                  | [ADR 0009](../../../../../adr/0009-drafts-live-outside-the-posts-collection-and-commit-with-a-build-skip-flag.md) | `functions/lib/github.ts` の `draftCommitMessage()`         | ○    |
| JWT の検証は `functions/api/_middleware.ts` の 1 か所   | [components.md](../design/components.md)                                                                          | 同じ場所にある。**`functions/` の直下には無い**             | ○    |
| `GITHUB_TOKEN` は裏側だけが持つ                         | [logic-model.md](../design/logic-model.md)                                                                        | `packages/admin/src/` に 1 件も出てこない                   | ○    |
| 空の判定は `shared/` に 1 つ                            | [components.md](../design/components.md)                                                                          | `shared/draft.ts` の `hasContent()`。画面と裏側の両方が使う | ○    |
| 自動保存は 3 秒。フォーカスが外れる・タブが隠れると即時 | [logic-model.md](../design/logic-model.md)                                                                        | `src/hooks/useAutosave.ts`                                  | ○    |
| 空にしたら保存せず、案内を出す                          | [rules.md](../design/rules.md)                                                                                    | `useAutosave` の `empty`                                    | ○    |
| 409 で上書きしない                                      | [rules.md](../design/rules.md)                                                                                    | `github.ts` は 409 と 422 を衝突として返す                  | ○    |
| 並び順は `updatedAt` の新しい順                         | [rules.md](../design/rules.md)                                                                                    | `index.ts` の `sort`                                        | ○    |
| タイトルが空なら「（無題）」                            | [rules.md](../design/rules.md)                                                                                    | `DraftListPage.tsx` の `UNTITLED`                           | ○    |
| 下書きが 1 件も無いのはエラーではない                   | [rules.md](../design/rules.md)                                                                                    | 404 を空の配列に読み替えている                              | ○    |
| `packages/admin` に置く                                 | [logic-model.md](../design/logic-model.md)                                                                        | そこにある                                                  | ○    |
| Vite + React + Tailwind + react-router                  | [components.md](../design/components.md)                                                                          | `package.json` と `vite.config.ts`                          | ○    |
| `.prettierignore` に `src/content/drafts/`              | [ADR 0009](../../../../../adr/0009-drafts-live-outside-the-posts-collection-and-commit-with-a-build-skip-flag.md) | 追加済み。**両側で効果を確認済み**                          | ○    |
| `coverage.include` に `packages/**/*`                   | [logic-model.md](../design/logic-model.md)                                                                        | 追加済み                                                    | ○    |

**食い違いは 0 件。**

### 触らないと書いたものを触っていないか

| 触らないと書いたもの            | 実際                   |
| ------------------------------- | ---------------------- |
| `src/content.config.ts`         | 触っていない           |
| `src/lib/repositories/posts.ts` | 触っていない           |
| `lefthook.yml`                  | 触っていない           |
| `pnpm-workspace.yaml`           | 触っていない           |
| `tools/create-post/`            | 触っていない           |
| `.github/workflows/`            | 触っていない           |
| 既存の 13 テストファイル        | **1 つも直していない** |

`git diff --name-only c4bce1a..HEAD` を `src` `tools` `lefthook.yml` `pnpm-workspace.yaml` `.github` に絞って確認した。**該当 0 件。**

## 検出された乖離

### 1. テストの件数がドキュメントと合わなくなった（直した）

[test-cases.md](../test-design/test-cases.md) は「合計 44 ケース」と書いている。実際は **55 件**（実装中に 9 件、レビューで 2 件増えた）。

**test-cases.md は直さない。** あれは Stage 3 の時点の設計で、増えた分は [code-summary.md](../implementation/code-summary.md)・[test-results.md](../verification/test-results.md)・[code-review-report.md](code-review-report.md) に理由つきで書いてある。**減った観点は無い**ので、設計が満たされていないわけではない。

### 2. 設計に無いファイルが 2 つある（記録済み）

`functions/lib/validate.ts` と `src/globals.d.ts`。どちらも [code-summary.md](../implementation/code-summary.md) の「計画からの逸脱」に理由つきで書いてある。

### 3. `progress.md` の Stage 2 の記述が古かった（直した）

`_middleware.ts` の置き場を「`_middleware.ts` の 1 か所」と書いていたが、修正後は `functions/api/_middleware.ts`。コミット `a60826d` で直した。

### 4. `jose` の取り直しの間隔が設計に無い（記録済み）

`cooldownDuration: 30_000` は実装で決めた。[code-summary.md](../implementation/code-summary.md) の「実装で決めたこと」と `_middleware.ts` のコメントにある。設計と食い違ってはいない（設計は「鍵が見つからなければ取り直す」までしか定めていない）。

### 用語の揺れ

`glossary-drift.sh` を Unit の成果物全体に掛けた。**成果物本文の揺れは 0 件。** 残っているのは `memory.md` と `records.md` で、検出された語そのものを名指ししている記録の行だけ。
