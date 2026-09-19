# Construction Progress — quick-draft / draft-anywhere

## モード

unattended

## ステージ

- [x] explore
- [x] design
- [x] test-design
- [x] implement
- [x] verify
- [x] review

## Stage 1: explore

**結果**: 完了。途中で一度 `[B]`（中断）になり、人の判断を受けて再開した。

### 中断と再開

未解決だった「管理画面をどこで動かし、認証をどう作るか」は、公開 URL と認証方式が外部に見える約束であること、リポジトリの外で人が用意するものが要ることから `[B]` にした。判断は [ADR 0008](../../../../adr/0008-admin-runs-as-its-own-pages-project-behind-cloudflare-access.md) で決着。

| 軸                       | 決着                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| 動かす場所               | ブログとは**別の** Cloudflare Pages プロジェクト。サブドメインで開く。プレビューデプロイは止める |
| 「自分だけが入れる」作り | Cloudflare Access。アプリ側は Access が付ける JWT を検証する                                     |
| リポジトリの書き込み     | `70-10/blog` だけに絞った細かい権限のトークンを秘密の値として持ち、Contents API を叩く           |

**人がリポジトリの外で用意するものが 4 つある**（[explore/open-questions.md](explore/open-questions.md)）。**Stage 4（implement）に入る前に揃っている必要がある。**

### 成果物

| ファイル                                                   | 中身                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [explore/constraints.md](explore/constraints.md)           | 既存コードから来る制約 6 件、管理画面の土台の制約 12 件（出典つき）、規約、やってはいけないこと    |
| [explore/design-decisions.md](explore/design-decisions.md) | 効く ADR 5 件、既存コードが置いている設計判断 6 件、触る見込みのファイル 8 件、新しく足すもの 3 件 |
| [explore/test-strategy.md](explore/test-strategy.md)       | 既存テスト 13 ファイルの構造と書き方、守り方の分類、既存テストへの影響                             |
| [explore/open-questions.md](explore/open-questions.md)     | 未解決 2 件（Q1 は design、Q3 は test-design で決まる。人の判断待ちは無し）、解消済み 9 件         |
| [explore/memory.md](explore/memory.md)                     | 解釈 2・逸脱 5・トレードオフ 2・未解決 2                                                           |

### 分かったことのうち大きいもの

- **`getPosts()` が下書きを公開対象から外す唯一の口。** 一覧・記事ページ・タグページ・RSS・OGP 画像の 5 つがすべてここを通る
- **コレクションのスキーマが本文だけの下書きを拒む。** `title` / `publishDate` / `tags` が必須なので、下書きを `src/content/posts/` に置くなら必須を外すことになり、緩和が既存 97 記事にも効く
- **Access の JWT はアプリ側で署名まで検証する。** ヘッダーだけの確認ではなりすませる。公開鍵は 6 週ごとに入れ替わるので埋め込まない
- **`*.pages.dev` は独自ドメインとは別に守る必要がある。** ADR 0008 が別プロジェクトにしたのは露出を 1 か所に閉じ込めるため
- **新しいパッケージのテストは何もしなくても `pnpm test:run` に入る。** `vitest.config.ts` に `test.exclude` の指定がない
- **依存を足すならロックファイルを一緒にコミットする。** CI が `git diff --exit-code pnpm-lock.yaml` で見ている

### センサー

| センサー          | 結果                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| required-sections | PASS（4 ファイルとも）                                                                                    |
| upstream-coverage | PASS（4 ファイルとも）                                                                                    |
| glossary-drift    | 成果物は揺れなし。`explore/memory.md` と `records.md` の各 1 行は検出された語を名指しした記録なので残した |

### 記録

[records.md](records.md) に振り分けの結果がある。ルール 3 件・用語集 1 件・ADR 1 件。

## Stage 2: design

**結果**: 完了。**人の判断を要する点は出なかった。**

### 決めたこと

Q1（下書きをどんな形でリポジトリに持つか）を決着させた → [ADR 0009](../../../../adr/0009-drafts-live-outside-the-posts-collection-and-commit-with-a-build-skip-flag.md)

| 決めたこと       | 中身                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 下書きの置き場   | `src/content/drafts/<id>.md`。**posts コレクションの glob の外**なので生成物に現れない            |
| 下書きの形       | Markdown + frontmatter（`title` / `createdAt` / `updatedAt`）。`tags` と `publishDate` は持たない |
| 識別子           | `crypto.randomUUID()`。時刻を埋め込まない（`createdAt` と二重になるため）                         |
| 書き込み         | `main` へのコミット。メッセージの先頭に `[CI Skip]` を付けてデプロイを飛ばす                      |
| 管理画面の置き場 | `packages/admin/`（`pnpm-workspace.yaml` は既に `packages/*` を列挙）                             |
| 枠組み           | Vite + React + Tailwind 4 + react-router の SPA。**Astro は使わない**                             |
| 裏側             | Cloudflare Pages Functions。JWT の検証は `functions/api/_middleware.ts` の 1 か所                 |
| 自動保存         | 入力が止まって 3 秒。フォーカスが外れたとき・タブが隠れたときは待たずに発火                       |

Q3（テストの実行環境）も決まった。`jsdom` は既に devDependency にあり、`// @vitest-environment` のファイル単位の指定が既存テストで使われている（`src/components/Tag.test.ts`）。**`vitest.config.ts` の `environment` は変えない。**

### 既存コードへの影響

**下書きの保存のために既存の実装を変える必要は無い。** `src/content.config.ts` も `src/lib/repositories/posts.ts` も `lefthook.yml` も `pnpm-workspace.yaml` も触らない。触るのは設定ファイル 3 つだけ。

| ファイル           | 変更                                         | 落とすとどうなるか                            |
| ------------------ | -------------------------------------------- | --------------------------------------------- |
| `.prettierignore`  | `src/content/drafts/` を足す                 | 整形されていない下書きで `pnpm lint` が落ちる |
| `vitest.config.ts` | `coverage.include` に `packages/**/*` を足す | 管理画面がカバレッジに出ず、CI の報告がずれる |
| `pnpm-lock.yaml`   | 依存を足すので同じコミットに入れる           | CI の `git diff --exit-code` が落ちる         |

### 成果物

| ファイル                                       | 中身                                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [design/logic-model.md](design/logic-model.md) | 全体の構成（[SVG](design/assets/overview.svg)）、6 つの処理の流れ、値の動き、検査の経路への影響     |
| [design/data-model.md](design/data-model.md)   | 下書きのファイルの形、識別子、記事との対応、設定と秘密の値、GitHub API とのやりとり                 |
| [design/rules.md](design/rules.md)             | 判定 6 件（認証・作る／作らない・空になったとき・並び順・衝突・コミットメッセージ）、バリデーション |
| [design/components.md](design/components.md)   | 枠組みの選定理由、階層 8 件、裏側の 3 ファイル、状態 5 件と保存の状態 7 通り                        |
| [design/memory.md](design/memory.md)           | 解釈 3・逸脱 3・トレードオフ 8・未解決 2                                                            |

### センサー

| センサー          | 結果                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| required-sections | PASS（4 ファイルとも）                                                                                   |
| upstream-coverage | PASS（4 ファイルとも。`constraints` `design-decisions` も含む）                                          |
| glossary-drift    | 1 件出たので言い換えて直した（計算機の記憶領域を指す語で、下書きの別名ではなかった）。**現在は揺れなし** |

SVG は実際にブラウザで描画して確認した。テキストのはみ出し・クリッピング・viewBox 超えは無い。

**設計を書いたあとに 2 点を直した**（コミット `882786d`）。

- `_middleware.ts` を `functions/` の直下から `functions/api/` の下へ移した。根に置くとミドルウェアが静的なファイルの前でも動き、**JWT が無いことを理由に画面そのものが出なくなる**（Cloudflare のドキュメントで確認）
- `vitest.config.ts` の `coverage.include` への追加を、触るファイルの一覧に足した。explore で調べてあったのに design で漏らしていた

## Stage 3: test-design

**結果**: 完了。**人の判断を要する点は出なかった。**

### 決めたこと

| 決めたこと             | 中身                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| 確かめ方の分け方       | U（単体テスト）/ B（ビルド）/ E（既存テストが通る）/ M（実際に動かす）の 4 つ         |
| 単体テストのケース数   | **44 件**（`shared` 13 / 裏側 19 / 画面 12）                                          |
| 既存テストへの影響     | **1 つも直さない。** 落ちたら「触らないつもりのものに触った」ということ               |
| Q3（テストの実行環境） | `jsdom` は既にある。`// @vitest-environment jsdom` のファイル単位の指定で足りる見込み |

### 実装の最初にやること（T0）

**`packages/admin` のテストが本体の `pnpm test:run` と `pnpm typecheck` で動くことを、中身を作る前に確かめる。**

根の `vitest.config.ts` は Astro の `getViteConfig()` を包んでいて、React の TSX を jsdom で通した先例が無い。`@` の別名もブログの `src/` に向いている。**アプリを作り終えてから通らないと分かると手戻りが大きい**ので、捨てて構わない 1 ファイルで先に確かめる。通らなければ `packages/admin/vitest.config.ts` を別に置く。

### 動作検証に回したもの（T10）

**単体テストでは確かめられず、デプロイと Access の設定が要る。**

- スマホから管理画面を開ける
- **自分だけが入れる**（別のアドレスでは入れない）
- 本文に最初の一文字を打つまでの手数が 4 未満（人が数える）
- 下書きが実際に GitHub に入り、開き直すと同じ本文が出る
- 下書きの保存で Cloudflare Pages のデプロイが走らない（`[CI Skip]` が効く）

**Stage 6 の `ac-check-report.md` はこれらを「未実施」と理由つきで書く。** コードを読んで満たしていそうだから合格とはしない。

### ビルドの確認（T8）

`src/content/drafts/` が空のままビルドしても何も証明できないので、**Stage 5 が下書きを 2 件（うち 1 件はタイトルが空）置いてから** `pnpm build:local` を走らせ、`dist/` を目印の文字列で検索して 1 件も出ないことを確かめ、そのあと消す。

### 成果物

| ファイル                                               | 中身                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| [test-design/test-cases.md](test-design/test-cases.md) | テスト観点 11 件（T0〜T10）、書かないと決めた観点 5 件、ケース 44 件、US とのトレーサビリティ |
| [test-design/memory.md](test-design/memory.md)         | 解釈 2・逸脱 2・トレードオフ 3・未解決 2                                                      |

### センサー

| センサー          | 結果                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| required-sections | PASS                                                                        |
| upstream-coverage | PASS（`acceptance-criteria` が拾われず 1 度 WARN。本文に語を補って解消）    |
| completeness      | PASS（US-01〜US-05 すべてに言及。US-02 / US-04 / US-05 は担当外として明記） |
| glossary-drift    | 揺れなし                                                                    |

## Stage 4: implement

**結果**: 完了。**人の判断を要する点は出なかった。**

### 検査の結果

| コマンド                          | 結果   | 中身                              |
| --------------------------------- | ------ | --------------------------------- |
| `pnpm test:run`                   | exit 0 | **20 ファイル / 163 テスト** 通過 |
| `pnpm typecheck`                  | exit 0 | 66 ファイル・0 errors             |
| `pnpm lint`                       | exit 0 | Prettier / textlint / ESLint      |
| `pnpm build:local`                | exit 0 | 106 ページ                        |
| `pnpm --filter @blog/admin build` | exit 0 | 79 モジュール                     |

**既存の 13 テストファイルは 1 つも直していない。** 110 → 163 テストに増えたのは `packages/admin` の 7 ファイル分。

### 作ったもの

`packages/admin/` に 17 ファイル + テスト 7 ファイル。詳細は [implementation/code-summary.md](implementation/code-summary.md)。

- `shared/` — 空の判定・frontmatter の組み立てと分解・識別子の検査（画面と裏側で共有）
- `functions/api/_middleware.ts` — Access の JWT の検証（`/api/` 以下だけ）
- `functions/api/drafts/` — 一覧・作成・取得・更新
- `src/` — 編集画面（自動保存）・最小の一覧・ルーティング

### 既存ファイルへの変更（3 つだけ）

`.prettierignore` / `vitest.config.ts` / `pnpm-lock.yaml`。**`src/content.config.ts` も `src/lib/repositories/posts.ts` も `lefthook.yml` も `tools/create-post/` も 1 行も触っていない。**

### T0 の結果

**追加の設定は要らなかった。** `packages/admin` のテストは根の `vitest.config.ts` のまま拾われ、TSX + jsdom も型検査も通った。`packages/admin/vitest.config.ts` は作っていない。

### 実装で直したこと

| 直したもの                     | 何が起きていたか                                                                |
| ------------------------------ | ------------------------------------------------------------------------------- |
| 鍵の入れ替わりのテスト         | `jose` は取り直しに間隔の下限を置く。**即時に取り直す前提のテストが誤りだった** |
| フォーカスが外れたときのテスト | React の `onBlur` は native の `focusout` に対応する。`blur` は上がってこない   |
| `IS_REACT_ACT_ENVIRONMENT`     | `pnpm typecheck` が型で落ちたので `src/globals.d.ts` で宣言                     |
| 依存の版                       | 一度 `^` 付きで入れてしまい、`-E` で入れ直した                                  |

### センサー

| センサー          | 結果                   |
| ----------------- | ---------------------- |
| required-sections | PASS（2 ファイルとも） |
| glossary-drift    | 揺れなし               |

## Stage 5: verify

**結果**: 完了。**検証は 1 度も落ちなかった**（失敗対応の再試行は使っていない）。

### 4 つの検査（下書きを置いた状態でも実行）

| コマンド                          | exit | 中身                         |
| --------------------------------- | ---- | ---------------------------- |
| `pnpm test:run`                   | 0    | 20 ファイル / 163 テスト     |
| `pnpm typecheck`                  | 0    | 66 ファイル・0 errors        |
| `pnpm lint`                       | 0    | Prettier / textlint / ESLint |
| `pnpm build:local`                | 0    | 106 ページ                   |
| `pnpm --filter @blog/admin build` | 0    | 79 モジュール                |

### T8: 下書きを置いた状態で生成物に出ないこと

`src/content/drafts/` に 2 件（**うち 1 件は `title: ""`**、記事のスキーマなら落ちる形）を置いてビルドした。

| 確かめたこと             | 結果                                         |
| ------------------------ | -------------------------------------------- |
| ビルドが通る             | exit 0・106 ページ（下書きが無いときと同じ） |
| `dist/` に目印が出ない   | 1 件も出ない                                 |
| `dist/posts/` の数       | **97 件**（記事の実数と一致）                |
| `rss.xml` / `index.html` | 0 件                                         |

**確かめ終えてフィクスチャは消した。** 残すと管理画面の一覧に偽の下書きが出続けるため。

### `.prettierignore` の行が必要であることを両側で確認

| 状態       | `prettier . --check`         |
| ---------- | ---------------------------- |
| 除外しない | **exit 1**（下書きを名指し） |
| 除外する   | exit 0                       |

**1 回目の確認は無意味だった。** フィクスチャがたまたま整形済みで両側の差が出ず、整形されない中身に差し替えてから確かめ直した。

### 成果物

| ファイル                                                       | 中身                                              |
| -------------------------------------------------------------- | ------------------------------------------------- |
| [verification/build-results.md](verification/build-results.md) | 実行コマンドと exit、T8 の 6 項目、T9、両側の確認 |
| [verification/test-results.md](verification/test-results.md)   | 163 件の内訳、途中で落ちた 2 件とその原因         |
| [verification/memory.md](verification/memory.md)               | 解釈 1・逸脱 1・トレードオフ 1・未解決 1          |

### 実施できなかったもの

**T10（実際に動かして確かめる）は 1 件も実施していない。** デプロイと Cloudflare Access の設定が要る。Stage 6 の `ac-check-report.md` に未実施として書く。

## Stage 6: review

**結果**: 完了。**コードの欠陥を 2 件見つけて直した。**

### 見つけた欠陥

| #   | 欠陥                                                      | 受け入れ条件への影響                                              | 回帰テスト                                                   |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | 一覧が 1 件の読み取り失敗で全滅する                       | **手で編集した下書きが 1 件でもあると、どの下書きも開き直せない** | `should still list a draft whose frontmatter cannot be read` |
| 2   | 最初の保存で URL が変わると取得し直し、打った分が消えうる | **「着想が失われないようにする」という目的に反する**              | `should not refetch after the first save changes the url`    |

**2 の回帰テストは、修正を戻すと落ちることを確かめた**（戻すと 1 failed / 戻すと 11 passed）。

**2 を直す過程で自分が欠陥を入れた**（既存の下書きの読み込みが始まらなくなる）。既存のテスト 6 件が落ちて検出できた。

### 照合

設計・ADR に書いた 17 項目とコードを突き合わせて**食い違い 0 件**。触らないと書いた 7 つ（`src/content.config.ts` / `src/lib/repositories/posts.ts` / `lefthook.yml` / `pnpm-workspace.yaml` / `tools/create-post/` / `.github/` / 既存 13 テスト）も**すべて触っていない**。

### 受け入れ条件

**コードとビルドで確かめられる範囲はすべて満たしている。実際に動かす範囲は 1 件も確かめていない。**

| 確かめ方     | 件数         |
| ------------ | ------------ |
| 単体テスト   | 55 件        |
| ビルド       | T8 の 6 項目 |
| 既存テスト   | 110 件       |
| 実際に動かす | **0 件**     |

未実施は M1〜M5 の 5 件（[review/ac-check-report.md](review/ac-check-report.md)）。**コードを読んで満たしていそうだから合格、とはしていない。**

### 最終の検査

| コマンド                          | exit | 中身                         |
| --------------------------------- | ---- | ---------------------------- |
| `pnpm test:run`                   | 0    | 20 ファイル / **165 テスト** |
| `pnpm typecheck`                  | 0    | 0 errors                     |
| `pnpm lint`                       | 0    | —                            |
| `pnpm build:local`                | 0    | 106 ページ                   |
| `pnpm --filter @blog/admin build` | 0    | —                            |

### 成果物

| ファイル                                                         | 中身                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| [review/code-review-report.md](review/code-review-report.md)     | 欠陥 2 件と修正、確かめて問題が無かった 7 観点、直さなかった 4 件 |
| [review/doc-alignment-report.md](review/doc-alignment-report.md) | 設計 17 項目との照合、乖離 4 件                                   |
| [review/ac-check-report.md](review/ac-check-report.md)           | US-01 / US-03 の全シナリオ、未実施 5 件、未カバーの分岐           |
| [review/memory.md](review/memory.md)                             | 解釈 1・逸脱 2・トレードオフ 2・未解決 1                          |
