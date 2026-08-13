# 実装計画 — draft-anywhere

上流は [00_intent.md](../../../00_intent.md)、設計は [design/](../design/)、テストは [test-design/test-cases.md](../test-design/test-cases.md)、制約は [explore/constraints.md](../explore/constraints.md)。

**テストのあるケースは、失敗するテストを書いてから実装を通す**（`~/.claude/rules/coding/tdd.md`）。

## T0 の結果（着手前に確かめたこと）

[test-cases.md](../test-design/test-cases.md) の T0 を最初に実施した。**結果は「追加の設定は要らない」。**

| 確かめたこと                                           | 結果                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `packages/admin` のテストが `pnpm test:run` に拾われる | **拾われる。** 13 ファイル → 14 ファイル、110 → 111 テスト      |
| `.tsx` を `// @vitest-environment jsdom` で描画できる  | **できる。** `react-dom/client` の `createRoot` と `act` で通る |
| `typecheck.enabled: true` の下で型が通る               | **通る。** `Type Errors  no errors`                             |
| `pnpm typecheck`（`astro check`）が通る                | **通る。** exit 0、44 ファイル・0 errors                        |

**`packages/admin/vitest.config.ts` は作らない。** 根の `vitest.config.ts` のままでよい。

確かめに使った `packages/admin/src/smoke.test.tsx` は**最後のステップで消す**。

## 実装ステップ

### 1. パッケージの土台

- [ ] `packages/admin/package.json` に依存を足す（`react-router` / `jose` / `vite` / `@vitejs/plugin-react` / `tailwindcss` / `@tailwindcss/vite`）
- [ ] `packages/admin/vite.config.ts`（`@vitejs/plugin-react` と `@tailwindcss/vite`）
- [ ] `packages/admin/tsconfig.json`（根を継ぎ、`@` の別名を**このパッケージの `src/`** に向け直す）
- [ ] `packages/admin/index.html` と `src/main.tsx` と `src/styles.css`
- [ ] `pnpm install` を通し、`pnpm-lock.yaml` を同じコミットに入れる

**根の `tsconfig.json` は `@/*` をブログの `src/` に向けている。** そのままだと管理画面から `@` が使えないので、パッケージ側で上書きする。

### 2. `shared/` — 画面と裏側で共有するもの

- [ ] `shared/types.ts` — `Draft` / `DraftSummary`
- [ ] `shared/draft.test.ts` を先に書く（ケース 1〜9）
- [ ] `shared/draft.ts` — `hasContent()`（空の判定）、`serializeDraft()`、`parseDraft()`
- [ ] `shared/id.test.ts` を先に書く（ケース 10〜13）
- [ ] `shared/id.ts` — `isDraftId()`
- [ ] `shared/paths.ts` — `draftPath(id)` = `src/content/drafts/<id>.md`

**空の判定を 1 か所に置く。** 画面と裏側で別々に書くと、画面を通ったのに 422 が返る食い違いが起きる（[design/components.md](../design/components.md)）。

### 3. 裏側 — JWT の検証

- [ ] `functions/api/_middleware.test.ts` を先に書く（ケース 14〜20）
- [ ] `functions/api/_middleware.ts` — `Cf-Access-Jwt-Assertion` を `jose` で検証。`iss` / `aud` / `exp` を確かめ、鍵は JWKS から取り、`kid` が無ければ取り直す

**置き場は `functions/api/` の下。`functions/` の直下にしない。** 根に置くと静的なファイルにも掛かり、画面そのものが出なくなる（[design/components.md](../design/components.md)）。

### 4. 裏側 — 一覧と作成

- [ ] `functions/api/drafts/index.test.ts` を先に書く（ケース 21〜27）
- [ ] `lib/github.ts` — Contents API を叩く薄い層（`fetch` をそのまま使う）
- [ ] `functions/api/drafts/index.ts` — `onRequestGet`（一覧）と `onRequestPost`（作成）

### 5. 裏側 — 取得と更新

- [ ] `functions/api/drafts/[id].test.ts` を先に書く（ケース 28〜32）
- [ ] `functions/api/drafts/[id].ts` — `onRequestGet` と `onRequestPut`

### 6. 画面 — 編集

- [ ] `src/lib/api.ts` — 裏側を呼ぶ処理
- [ ] `src/routes/DraftEditorPage.test.tsx` を先に書く（ケース 33〜41）
- [ ] `src/hooks/useAutosave.ts` — 3 秒の待ち、差分の判定、空の見送り、同時送信の抑止
- [ ] `src/routes/DraftEditorPage.tsx` — `TitleInput` / `BodyEditor` / `SaveStatus`

### 7. 画面 — 一覧とルーティング

- [ ] `src/routes/DraftListPage.test.tsx` を先に書く（ケース 42〜44）
- [ ] `src/routes/DraftListPage.tsx`
- [ ] `src/App.tsx` — `/` と `/drafts/:id`
- [ ] `public/_redirects` — SPA の深いリンクを `index.html` に落とす

### 8. 設定ファイル

- [ ] `.prettierignore` に `src/content/drafts/` を足す
- [ ] `vitest.config.ts` の `coverage.include` に `packages/**/*` を足す

**この 2 つは既存ファイルへの変更。** 落とすと CI が落ちる／カバレッジの報告がずれる（[design/logic-model.md](../design/logic-model.md)）。

### 9. 後始末

- [ ] `packages/admin/src/smoke.test.tsx` を消す
- [ ] `pnpm test:run` / `pnpm typecheck` / `pnpm lint` / `pnpm build:local` が exit 0

## トレーサビリティ

### ステップと US / AC

| ステップ | US / AC                                                           | テストケース   |
| -------- | ----------------------------------------------------------------- | -------------- |
| 1        | —（土台）                                                         | —              |
| 2        | US-01 の 4 シナリオ（本文だけ / タイトルだけ / 両方 / 空）        | 1〜13          |
| 3        | Unit 1 の完了の目安「自分だけが入れる」の裏側                     | 14〜20         |
| 4        | US-01「後から取り出せる状態で保存されている」、一覧               | 21〜27         |
| 5        | US-01「残した下書きを開き直せる」、US-02 が引き継げる形           | 28〜32         |
| 6        | US-01「着想を書き残す」、自動保存                                 | 33〜41         |
| 7        | US-01「開き直せる最小の一覧」、US-03「少ない手数で書き始める」    | 42〜44         |
| 8        | US-01「ビルドが通る」（`.prettierignore` を落とすと CI が落ちる） | —（T8 で確認） |
| 9        | 全体                                                              | —              |

### テストファイルとケースの対応

| テストファイル                                       | ケース | ステップ |
| ---------------------------------------------------- | ------ | -------- |
| `packages/admin/shared/draft.test.ts`                | 1〜9   | 2        |
| `packages/admin/shared/id.test.ts`                   | 10〜13 | 2        |
| `packages/admin/functions/api/_middleware.test.ts`   | 14〜20 | 3        |
| `packages/admin/functions/api/drafts/index.test.ts`  | 21〜27 | 4        |
| `packages/admin/functions/api/drafts/[id].test.ts`   | 28〜32 | 5        |
| `packages/admin/src/routes/DraftEditorPage.test.tsx` | 33〜41 | 6        |
| `packages/admin/src/routes/DraftListPage.test.tsx`   | 42〜44 | 7        |

**44 ケースすべてがどこかのステップに割り当たっている。**

### この計画で満たさないもの

| 受け入れ条件                                      | いつ満たすか                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| 下書きが生成物に出ない（US-01）                   | **Stage 5（verify）の T8。** 下書きを置いてビルドし、`dist/` を検索する |
| 既存記事・既存の入口が変わらない（US-01 / US-03） | **Stage 5。** 既存 13 テストがそのまま通ることで確かめる                |
| スマホから開ける・自分だけが入れる・手数 4 未満   | **Stage 6 の動作検証（T10）。** デプロイと Access の設定が要る          |

**T10 は人がリポジトリの外で用意するもの 4 つ**（[explore/open-questions.md](../explore/open-questions.md)）**が揃うまで実施できない。** 実装はそれを待たずに進む。
