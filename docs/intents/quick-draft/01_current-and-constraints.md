# quick-draft — 現状と制約

情報源はそれぞれ明記する。1 つの情報源だけで確認したことは「〜で確認」と書き、断定しない。

## 記事が公開される仕組み

- `src/content/posts/**/*.md` を glob loader で全件読む（`src/content.config.ts` で確認）
- `getPosts()` は `publishDate` でも下書きフラグでも絞り込まない（`src/lib/repositories/posts.ts` で確認）

**`main` に入った Markdown は無条件に公開される。「未公開の記事」を表す仕組みは今ない。** 未来日付にしても隠れない。

## 公開の経路

- `main` への push で Cloudflare Pages がデプロイ（`main` の check-runs に `cloudflare-workers-and-pages / Cloudflare Pages` があることで確認。リポジトリ内にデプロイ設定はない）
- 記事追加コミットは PR を経由せず `main` へ直接入っている（`git log` で確認。直近 4 件はすべて親が 1 つで、どのマージコミットの系列にも含まれない）
- `main` のブランチ保護は force push 禁止・削除禁止のみ。必須ステータスチェックも PR レビュー必須もない（GitHub API `branches/main/protection` で確認）
- CI（test / typecheck / lint / build）は `pull_request` のときだけ動く（`.github/workflows/lint-and-build.yml` で確認）

**今は「`main` に push すれば即公開、その際どの検査も通らない」状態。** 記事は事実上ノーチェックで出ている。

## 今の執筆の入口

`pnpm create-post`（`tools/create-post/index.ts` で確認）:

1. タイトルを聞く
2. slug を聞く（既存ファイルと重複したらエラー）
3. タグを聞く（`tools/create-post/tags.json` の 6 択から multiselect・**必須**）
4. `src/content/posts/<slug>.md` を書き出す
5. `code <file>` で VS Code を開く

- `publishDate` には**作成時刻**が入る
- `description` は空文字で入る（スキーマ上は optional）
- 入口が VS Code を前提にしている（`code` コマンド）
- この時点でファイルは公開ディレクトリに置かれるが、未コミットなので公開はされない

## frontmatter の制約

`src/content.config.ts` で確認:

| 項目          | 型             | 必須 |
| ------------- | -------------- | ---- |
| `title`       | string         | 必須 |
| `publishDate` | date（coerce） | 必須 |
| `tags`        | string[]       | 必須 |
| `description` | string         | 任意 |

スキーマ違反はビルドが落ちる。タグはスキーマ上は任意の文字列だが、実際に使われているのは 6 種で `tags.json` と一致する（全 97 記事の frontmatter を集計して確認）: Develop 45 / Web Frontend 29 / 日記 24 / テスト 9 / JavaScript 3 / セキュリティ 2。

## 校正（textlint）

- 対象は `src/content/posts/**/*.md`（`package.json` の `lint:textlint`）
- 走るのは lefthook の pre-commit だけ（`--fix` つき、修正結果を stage する）（`lefthook.yml` で確認）
- ルールは `preset-ja-technical-writing` + 半角全角間スペース必須（`.textlintrc` で確認）

**ローカルの `git commit` を経ない経路では校正が走らない。**

## 画像

`src/content/images/<slug>/<file>` に置き、記事から `../images/<slug>/<file>` で相対参照する（既存記事と `src/content/images/` の中身で確認）。

## ビルド時の生成物

`src/pages/` で確認:

- OGP 画像 — `og/[slug].png.ts`（Satori + Sharp）
- RSS — `rss.xml.ts`
- タグページ — `tags/[tag].astro`
- 記事ページ — `posts/[id].astro`

「公開された」は、一覧・タグページ・RSS・OGP 画像に反映されることまでを含む。

## 既存の決まり

- `CLAUDE.md` — 記事は `src/content/posts/`、画像は `src/content/images/`。テストは Vitest で AAA コメント必須。テストの型変換は `as unknown as T`
- `docs/adr/0003-articles-stay-as-markdown-in-this-repository.md` — 記事の正はリポジトリ内 Markdown（今回のステップ 0 で記録）
- `docs/adr/0001` `0002` — 記録の仕組みについてのもので、この変更には効かない

## この変更が受ける制約

根拠を言えるものだけ挙げる。

1. **「未公開」を表す手段がない。** 下書きをリポジトリに置くなら、公開対象から外す仕組みが別に要る（根拠: `getPosts()` が絞り込まない）
2. **`publishDate` が作成時刻。** 下書きを長く持つと、公開時に日付が実態とずれる（根拠: `create-post` の `publishDate()` は作成時の `now`。既存記事は `publishDate` と追加コミットが同日で、いまは「書いた日に出す」運用になっている）
3. **タグが必須。** 着想の段階でタグを決めさせられる。短い下書きとして残したいときの障壁になりうる（根拠: `create-post` は multiselect required、スキーマも `tags` 必須）
4. **校正がローカルの `git commit` に依存している。** PC を経ない入口を足すと textlint が働かない（根拠: `lefthook.yml`）
5. **`main` 直 push で無検査公開。** 新しい入口に限った話ではなく今もそうなっている（根拠: workflow の trigger と `git log`）
6. **画像はリポジトリ内に持つ。** 下書きに画像を含めるなら、画像をリポジトリへ入れる経路が別に必要になる（根拠: 既存記事の相対参照）。なお下書きに画像を含めることは Out（`00_intent.md`）

## 未確認

`questions.md` に残す。
