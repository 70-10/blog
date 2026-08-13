# 既存の設計判断と変更対象 — draft-anywhere

上流は [00_intent.md](../../../00_intent.md)、[02_user-stories.md](../../../02_user-stories.md)、[03_units.md](../../../03_units.md)。

## 既存の設計判断

### この Unit に効く ADR

| ADR                                                                                   | 決めたこと                                                              | この Unit への効き方                                                                       |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [0003](../../../../../adr/0003-articles-stay-as-markdown-in-this-repository.md)       | 記事の正はこのリポジトリ内の Markdown。外部の記事管理サービスは使わない | 下書きもリポジトリの中に持つ。外部のデータベースに置く案は最初から外れる                   |
| [0004](../../../../../adr/0004-treat-idea-to-publish-as-one-change.md)                | 着想から公開までを 1 つの変更として扱う                                 | 下書きから記事への移行で作り直しが起きない形にする。Unit 2 が引き継げる形で保存する        |
| [0006](../../../../../adr/0006-build-our-own-admin-screen-for-writing.md)             | 記事を書く画面を自分で作り、公開までその中で完結させる                  | この Unit が画面の土台・認証・読み書きの裏側を作る。**技術構成は白紙**（下の「未解決」へ） |
| [0007](../../../../../adr/0007-unattended-runs-move-recording-decisions-to-review.md) | 無人実行では記録の判断を承認ゲートからレビューへ移す                    | この実行がまさに無人。記録は `records.md` に並べる                                         |

[ADR 0006](../../../../../adr/0006-build-our-own-admin-screen-for-writing.md) が引き受けると書いた 8 つのうち、この Unit が作るのは **認証 / リポジトリの読み書き / 編集画面 / 下書きの保存の形 / 最小の一覧** の 5 つ（[03_units.md](../../../03_units.md) の割り振り表）。

### 既存コードが置いている設計判断

- **記事の読み出しは 1 か所に集めてある。** `src/lib/repositories/posts.ts` の `getPosts()` が `getCollection("posts")` を包み、5 つのページがすべてそこを通る。`CLAUDE.md` はこれを「Repository Pattern」と呼び、Astro のコンテンツコレクション API を隠す層と位置づけている
- **並び順は `publishDate` の降順だけで決まる。** `sortByPublishDate` に他の条件はない
- **日付は JST として扱う。** `src/lib/cdate-jst.ts` が `cdate` を包む。`sortByPublishDate` も `cdateJST` を通してから比較する
- **環境による分岐は `src/lib/environments.ts` に集めてある。** `isProduction`（`NODE_ENV`）と `shouldSkipOgGeneration`（`SKIP_OG_GENERATION`）の 2 つだけ。環境変数を読む場所を散らさない形になっている
- **ワークスペースは目的別に分けてある。** `tools/create-post`（記事を作る CLI）と `tools/remark-ogp-card`（Markdown の変換）。どちらも `tools/` 配下の独立したパッケージで、それぞれ `package.json` を持つ
- **記事のスキーマは緩めていない。** `title` / `publishDate` / `tags` を必須にすることで、記事として出るものの形を揃えている

### 記録の仕組み

[ADR 0001](../../../../../adr/0001-recording-fires-at-approval-gates.md) / [0002](../../../../../adr/0002-recording-implemented-in-repository.md) / [0005](../../../../../adr/0005-memory-split-per-stage.md) は AI-DLC の記録の仕組みについてのもので、作るものには効かない。この Unit の進め方（`memory.md` の置き場、承認ゲートでの振り分け）にだけ効く。

## 変更対象の既存実装

置き場が決まるまで確定しないものは「〜なら」と条件を付ける。

| ファイル                        | 今どうなっているか                                                  | この Unit で触る見込み                                                                                             |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/content.config.ts`         | `title` / `publishDate` / `tags` が必須                             | **下書きを posts コレクションに入れるなら触る。** 別のコレクション・別ディレクトリにするなら触らない               |
| `src/lib/repositories/posts.ts` | `getPosts()` が絞り込まずに全件返す                                 | **下書きを posts コレクションに入れるなら触る**（絞り込みを足す）。外に置くなら触らない                            |
| `pnpm-workspace.yaml`           | `packages/*` と `tools/*` を列挙。`packages/` は存在しない          | **管理画面を新しいパッケージにするなら触る**（`packages/` に置く場合は列挙済みなので追記不要、それ以外なら追記）   |
| `pnpm-lock.yaml`                | —                                                                   | **依存を足すなら必ず一緒にコミットする。** CI が `git diff --exit-code pnpm-lock.yaml` で見ている                  |
| `vitest.config.ts`              | `test.exclude` の指定がない。`coverage.include` は `src` と `tools` | 新しいパッケージのテストを本体の実行から外すなら触る。**外さないなら触らない**（既定で拾われる）                   |
| `lefthook.yml`                  | pre-commit の textlint の対象が `src/content/posts/*.md`            | **下書きを `src/content/posts/` の中に置くなら触る**（下書きは校正の対象外なので除外が要る）。外に置くなら触らない |
| `.gitignore`                    | `.env` と `.env.production` を除外済み                              | 管理画面が秘密の値を持つなら、置き場によっては追記                                                                 |
| `tools/create-post/`            | 記事のファイルを作る CLI                                            | **変えない。** US-03 が「今と同じように動く」を求める。既存のテストが変化を知らせる                                |

### 触らないが影響を受けるもの

- `src/pages/index.astro` / `posts/[id].astro` / `tags/[tag].astro` / `rss.xml.ts` / `og/[slug].png.ts` — いずれも `getPosts()` を通るので、絞り込みを足せば自動的に効く。**ページ側を 1 つずつ直す必要はない**
- `src/__tests__/pages/rss.xml.test.ts` / `og/[slug].png.test.ts` — `getPosts()` の戻りを前提にしているので、型が変わると影響する

## 未解決

技術構成が白紙のため、この Unit の作るものの多くが「どこで動かすか」に依存する。詳細は [open-questions.md](open-questions.md) にある。
