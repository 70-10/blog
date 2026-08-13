# テストの検証 — draft-anywhere

`pnpm test:run` を実行した結果。ビルドと `dist/` の確認は [build-results.md](build-results.md)。

## テスト結果サマリー

```
Test Files  20 passed (20)
     Tests  163 passed (163)
Type Errors  no errors
```

**exit 0。失敗は 0 件。**

### この Unit で増えた分

| ファイル                                             | 件数 | 何を守るか                                           |
| ---------------------------------------------------- | ---- | ---------------------------------------------------- |
| `packages/admin/shared/draft.test.ts`                | 11   | 空の判定 5、frontmatter の往復 6                     |
| `packages/admin/shared/id.test.ts`                   | 6    | 識別子の形、パスの組み立て                           |
| `packages/admin/functions/api/_middleware.test.ts`   | 8    | **JWT の検証**（署名・`aud`・`exp`・鍵の入れ替わり） |
| `packages/admin/functions/api/drafts/index.test.ts`  | 7    | 一覧の並び順、空の一覧、作成、`[CI Skip]`、上限      |
| `packages/admin/functions/api/drafts/[id].test.ts`   | 8    | 取得、更新、`createdAt` の保持、衝突、識別子の検査   |
| `packages/admin/src/routes/DraftEditorPage.test.tsx` | 10   | 自動保存の待ち・差分・空の見送り・衝突・新規作成     |
| `packages/admin/src/routes/DraftListPage.test.tsx`   | 3    | 並び順、無題の表示、空の一覧                         |
| **合計**                                             | 53   |                                                      |

既存 110 件 + 新規 53 件 = 163 件。

**[test-cases.md](../test-design/test-cases.md) の計画は 44 件だった。** 実装中に 9 件増えた（読み込み・新規作成・`createdAt` の保持・鍵の使い回し・その他の失敗・パスの組み立てなど）。減った観点は無い。

## 失敗テスト詳細

**最終的な失敗は 0 件。** ただし実装の途中で 2 件落ち、いずれも**テスト側の前提が誤っていた**ので直した。

| 落ちたテスト                                            | 何が誤っていたか                                                                                                      | どう直したか                                                                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `should refetch the key set when the key id is unknown` | `jose` の `createRemoteJWKSet` は取り直しに間隔の下限を置く。**知らない鍵 ID が来たら即座に取り直す**という前提が誤り | 入れ替わる前の鍵で一度通してから、間隔を越えた時点で新しい鍵を検証する形にした。名前も `after the keys rotate` に変えた |
| `should save immediately when the input loses focus`    | React の `onBlur` は native の `focusout` に対応する。`blur` を投げても上がってこない                                 | `focusout` を投げるようにした                                                                                           |

**実装を落とすためにテストを緩めてはいない。** どちらもテストが確かめようとしていた振る舞い（鍵の入れ替わりに追随する / フォーカスが外れたら待たずに保存する）はそのまま守られている。

## 型検査

`pnpm typecheck`（`astro check`）が **exit 0**。66 ファイル・0 errors・0 warnings・9 hints。

途中で 2 件の型エラーが出た（`globalThis.IS_REACT_ACT_ENVIRONMENT`）。`packages/admin/src/globals.d.ts` で宣言して解消した。

## 静的検査

`pnpm lint` が **exit 0**。

| 検査     | 対象                         | この Unit の影響                   |
| -------- | ---------------------------- | ---------------------------------- |
| Prettier | リポジトリ全体（除外を除く） | `src/content/drafts/` を除外に追加 |
| textlint | `src/content/posts/**/*.md`  | 無し（下書きは対象外）             |
| ESLint   | リポジトリ全体               | `packages/admin` も対象に入る      |

## カバレッジ

`vitest.config.ts` の `coverage.include` に `packages/**/*` を足したので、CI の報告に管理画面のコードが載る。**このステージでは `pnpm test:coverage` を実行していない**（CI が PR で実行する）。

## 実施していないもの

**実際に動かして確かめる観点（[test-cases.md](../test-design/test-cases.md) の T10）。** デプロイと Cloudflare Access の設定が要る。扱いは [review/ac-check-report.md](../review/ac-check-report.md) に書く。
