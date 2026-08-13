# 実装のまとめ — draft-anywhere

計画は [implementation-plan.md](implementation-plan.md)、設計は [design/](../design/)、テストは [test-design/test-cases.md](../test-design/test-cases.md)。

## 変更ファイル一覧

### 新しく作ったもの（`packages/admin/`）

| ファイル                                           | 中身                                                           |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `package.json` / `tsconfig.json`                   | ワークスペースのパッケージ。依存はすべて版を固定               |
| `vite.config.ts` / `index.html` / `src/styles.css` | Vite + React + Tailwind 4 の土台                               |
| `public/_redirects`                                | SPA の深いリンクを `index.html` に落とす                       |
| `shared/types.ts`                                  | `Draft` / `DraftSummary` / `DraftFrontmatter`                  |
| `shared/draft.ts`                                  | `hasContent()`（空の判定）、`serializeDraft()`、`parseDraft()` |
| `shared/id.ts`                                     | `isDraftId()`、`draftPath()`、`DRAFTS_DIR`                     |
| `functions/api/_middleware.ts`                     | **Access の JWT の検証。`/api/` 以下だけに掛かる**             |
| `functions/lib/github.ts`                          | Contents API を叩く層と、`[CI Skip]` 付きのコミットメッセージ  |
| `functions/lib/validate.ts`                        | 入力の検査（型・上限）                                         |
| `functions/api/drafts/index.ts`                    | 一覧（`GET`）と作成（`POST`）                                  |
| `functions/api/drafts/[id].ts`                     | 取得（`GET`）と更新（`PUT`）                                   |
| `src/lib/api.ts`                                   | 画面から裏側を呼ぶ処理と `ApiError`                            |
| `src/hooks/useAutosave.ts`                         | 3 秒の待ち・差分の判定・空の見送り・同時送信の抑止             |
| `src/routes/DraftEditorPage.tsx`                   | 編集画面と保存の状態の表示                                     |
| `src/routes/DraftListPage.tsx`                     | 最小の一覧                                                     |
| `src/App.tsx` / `src/main.tsx`                     | ルーティングと入口                                             |
| `src/globals.d.ts`                                 | `IS_REACT_ACT_ENVIRONMENT` の型                                |

テストは 7 ファイル（`shared/draft.test.ts` / `shared/id.test.ts` / `functions/api/_middleware.test.ts` / `functions/api/drafts/index.test.ts` / `functions/api/drafts/[id].test.ts` / `src/routes/DraftEditorPage.test.tsx` / `src/routes/DraftListPage.test.tsx`）。

### 既存ファイルへの変更（3 つだけ）

| ファイル           | 変更                                             |
| ------------------ | ------------------------------------------------ |
| `.prettierignore`  | `src/content/drafts/` を足した                   |
| `vitest.config.ts` | `coverage.include` に `packages/**/*` を足した   |
| `pnpm-lock.yaml`   | 依存の追加に伴う更新（同じコミットに入っている） |

**`src/content.config.ts` / `src/lib/repositories/posts.ts` / `lefthook.yml` / `pnpm-workspace.yaml` / `tools/create-post/` は 1 行も触っていない。**

## 主要な実装判断

### 設計どおりに実装したもの

- **下書きは `src/content/drafts/<id>.md`。** posts コレクションの glob の外なので、絞り込む処理を足さずに生成物から外れる（[ADR 0009](../../../../../adr/0009-drafts-live-outside-the-posts-collection-and-commit-with-a-build-skip-flag.md)）
- **コミットメッセージの先頭に `[CI Skip]`。** 自動保存のたびにサイトが再ビルドされるのを防ぐ
- **JWT の検証は `functions/api/_middleware.ts` の 1 か所。** `functions/` の直下ではない
- **空の判定は `shared/draft.ts` に 1 つ。** 画面と裏側の両方がこれを使う
- **`GITHUB_TOKEN` は裏側だけが持つ。** 画面のコードは GitHub を直接叩かない

### 実装で決めたこと（設計に無かった細部）

| 判断                                                                | 理由                                                                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `jose` の `createRemoteJWKSet` に `cooldownDuration: 30_000` を明示 | 知らない鍵 ID を送りつけられるたびに取りに行くと、外から取得を何度でも起こせる。鍵の入れ替わりは 6 週に 1 回なので 30 秒で十分追いつく |
| 更新のとき `createdAt` を GitHub から読み直す                       | 画面から受け取ると偽れる。1 回の保存で取得と書き込みの 2 回になるが、自動保存は待ちを入れているので問題ない                            |
| GitHub の 422 も衝突として扱う                                      | Contents API は `sha` が合わないとき 409 だけでなく 422 を返すことがある                                                               |
| Base64 の変換を自前で書いた                                         | `atob` / `btoa` は latin1 なので、日本語がそのままでは壊れる。`TextEncoder` / `TextDecoder` を挟んだ                                   |
| 一覧の並び替えを文字列の比較で行う                                  | `updatedAt` は ISO 8601（UTC）なので、辞書順が時刻順と一致する                                                                         |
| 画面のテストを testing-library なしで書いた                         | 依存を 1 つ増やさずに `react-dom/client` と `act` で足りた                                                                             |

### 計画からの逸脱

| 逸脱                                                           | 理由                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T0（土台の確認）を実装計画より先に実施した**                 | [test-cases.md](../test-design/test-cases.md) が「実装の最初にこれをやる」と定めていた。結果が計画の内容（`packages/admin/vitest.config.ts` を作るかどうか）を左右するため、先に確かめて計画に書いた |
| テストケースが 44 件の予定に対して 46 件になった               | 実装中に「保存済みの鍵を使い回す」「`createdAt` を保つ」の 2 件を足す価値があると分かった                                                                                                            |
| `functions/lib/validate.ts` と `src/globals.d.ts` は計画に無い | 前者は検査を 1 か所に集めるため、後者は `pnpm typecheck` が `IS_REACT_ACT_ENVIRONMENT` で落ちたため                                                                                                  |

### テストで直したこと

| 直したもの                     | 何が起きていたか                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 鍵の入れ替わりのテスト         | `jose` は取り直しに間隔の下限を置く。**即時に取り直す前提のテストが誤りだった**ので、間隔を越えてから検証する形に直した |
| フォーカスが外れたときのテスト | React の `onBlur` は native の `focusout` に対応する。`blur` は上がってこない                                           |
| `IS_REACT_ACT_ENVIRONMENT`     | 立てないと React が act の外の更新として警告を出す。型は `src/globals.d.ts` で宣言                                      |

## 検査の結果

| コマンド                          | 結果   | 中身                              |
| --------------------------------- | ------ | --------------------------------- |
| `pnpm test:run`                   | exit 0 | **20 ファイル / 163 テスト** 通過 |
| `pnpm typecheck`                  | exit 0 | 66 ファイル・0 errors             |
| `pnpm lint`                       | exit 0 | Prettier / textlint / ESLint      |
| `pnpm build:local`                | exit 0 | 106 ページ                        |
| `pnpm --filter @blog/admin build` | exit 0 | 79 モジュール                     |

**既存の 13 テストファイルは 1 つも直していない。** 増えたのは `packages/admin` の 7 ファイル（110 → 163 テスト）。

## この実装で満たしていないもの

**Stage 5 と Stage 6 に残る。**

- 下書きを置いた状態でビルドし、生成物に出ないこと（[test-cases.md](../test-design/test-cases.md) の T8）
- スマホから開ける・自分だけが入れる・手数 4 未満・実際に GitHub に入る・`[CI Skip]` が効く（T10）

**T10 は[人がリポジトリの外で用意するもの](../explore/open-questions.md) 4 つが揃うまで実施できない。**
