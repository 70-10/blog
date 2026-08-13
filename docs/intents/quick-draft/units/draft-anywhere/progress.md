# Construction Progress — quick-draft / draft-anywhere

## モード

unattended

## ステージ

- [x] explore
- [x] design
- [ ] test-design
- [ ] implement
- [ ] verify
- [ ] review

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
| 裏側             | Cloudflare Pages Functions。JWT の検証は `_middleware.ts` の 1 か所                               |
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

| センサー          | 結果                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| required-sections | PASS（4 ファイルとも）                                                                  |
| upstream-coverage | PASS（4 ファイルとも。`constraints` `design-decisions` も含む）                         |
| glossary-drift    | 1 件出たので直した（「メモリ」→「一度取った鍵を実行中だけ保持し」）。**現在は揺れなし** |

SVG は実際にブラウザで描画して確認した。テキストのはみ出し・クリッピング・viewBox 超えは無い。
