# テスト方針 — draft-anywhere

上流は [00_intent.md](../../../00_intent.md) と [02_user-stories.md](../../../02_user-stories.md)（US-01 / US-03）。テストケースそのものは Stage 3（test-design）が書く。ここは既存の構造と、どこを守るかの方針まで。

## 既存テスト構造

`pnpm test:run`（Vitest）で 13 ファイル（本 Unit で `find` して確認）。

| 置き場                 | ファイル                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/`             | `environments.test.ts`, `repositories/posts.test.ts`                                                                                                 |
| `src/components/`      | `Footer.test.ts`, `Header.test.ts`, `OgpImage.test.ts`, `ProductionOnly.test.ts`, `ProfileCard.test.ts`, `ReadingProgressBar.test.ts`, `Tag.test.ts` |
| `src/__tests__/pages/` | `og/[slug].png.test.ts`, `rss.xml.test.ts`                                                                                                           |
| `tools/`               | `create-post/index.test.ts`, `remark-ogp-card/index.test.ts`                                                                                         |

- **ソースの隣に置くのが既定**（`src/lib/repositories/posts.test.ts`）。ページのテストだけ `src/__tests__/pages/` にまとめてある
- 実行環境は `node`、`globals: true`。`typecheck.enabled` が真なので**型エラーもテスト実行で落ちる**
- カバレッジの対象は `src/**/*` と `tools/**/*` から `*.test.*` / `*.config.*` / `*.d.ts` / `*.astro` を除いたもの
- `test.exclude` の指定がないため、**新しく足したテストは何もしなくても本体の実行に入る**

### 書き方

`src/lib/repositories/posts.test.ts` が手本（本 Unit で確認）。

- `describe("<関数名>")` の下を `Positive Cases` / `Edge Cases` / `Negative Cases` に分ける
- テストの名前は英語（`should sort posts by publish date in descending order`）
- 各ケースに `// Arrange` / `// Act` / `// Assert` のコメント
- Astro の API は `vi.mock("astro:content", ...)` で差し替える。型変換は `as unknown as T`
- 当てはまらない分類は、書かない代わりに理由をコメントで残している（同ファイルの `// Negative Cases: Not applicable. ...`）

## テスト方針

US-01 / US-03 の受け入れ条件を、テストで守れるものと手で確かめるしかないものに分ける。

### 自動テストで守るもの

| 受け入れ条件                                 | どう守るか                                                                                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 本文だけ・タイトルだけでも下書きが作られる   | 保存を担う関数のユニットテスト（`Positive Cases`）                                                                                                                                                        |
| 本文もタイトルも空なら下書きが作られない     | 同上（`Negative Cases`）。「残すものがないことが分かる」は戻り値かエラーで表す                                                                                                                            |
| 残した下書きを開き直せる                     | 読み書きの裏側のユニットテスト（書いたものが同じ内容で読み出せる）                                                                                                                                        |
| 下書きが生成物のいずれにも現れない           | **下書きを posts コレクションに入れる形を採るなら** `getPosts()` のユニットテスト（下書きを含む入力を渡して、返りに含まれないこと）。外に置く形なら、この経路は成立しないので `pnpm build` の確認に寄せる |
| 既存 97 記事の URL・日付・並び順が変わらない | 既存の `posts.test.ts` / `rss.xml.test.ts` / `og/[slug].png.test.ts` がそのまま通ること                                                                                                                   |
| `pnpm create-post` が今と同じように動く      | 既存の `tools/create-post/index.test.ts` がそのまま通ること                                                                                                                                               |

**下書きを posts コレクションに入れる形を採るなら、`getPosts()` の絞り込みが US-01 の要のテストになる。** 5 つの生成物すべてがここを通るため、1 つのテストで 5 つを守れる（[constraints.md](constraints.md) の「下書きを公開対象から外す口は 1 つに絞れる」）。

### ビルドで守るもの

- **下書きがある状態で `pnpm build:local` が通る。** スキーマ違反はビルドが落ちるので、これ自体が検査になる
- 生成物に下書きが出ないことは、`dist/` を検索して確かめられる（記事ページの有無・`rss.xml` の中身・`index.html` の一覧）

### 手で確かめるもの

- 画面から実際に下書きを書いて残せること。**PC が手元にない状況の再現**は自動テストの範囲外
- US-03 の「本文に最初の一文字を打てるまでの操作の数が 4 未満」。数え方は人が数える

### 型で守るもの

`typecheck.enabled` が真なので、Vitest の実行が型エラーも拾う。`pnpm typecheck`（`astro check`）は別途 CI が走らせる。

## 影響範囲

### 既存テストへの影響

| テスト                                      | 影響の条件                                                                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/repositories/posts.test.ts`        | **`getPosts()` に絞り込みを足すなら直す。** 現在のテストは「渡したものが全部返る」を確かめており、絞り込みを足すと前提が変わる |
| `src/__tests__/pages/rss.xml.test.ts`       | `getPosts()` の戻りの型が変われば影響する（`title` が省略可になる形を採った場合など）                                          |
| `src/__tests__/pages/og/[slug].png.test.ts` | 同上                                                                                                                           |
| `tools/create-post/index.test.ts`           | **変えない前提。** 落ちたら `create-post` を壊したということ                                                                   |
| `src/components/*.test.ts`                  | 影響しない見込み。この Unit は公開側の表示を変えない                                                                           |

### 新しく足すテスト

管理画面をどこで動かすかが決まっていないため、**テストの実行環境（`node` のままでよいか、ブラウザの API を使う部分をどう扱うか）はまだ決められない**。`vitest.config.ts` の `environment` は現在 `node` の 1 つだけで、画面の描画を testing-library のようなもので確かめるなら環境の切り替えが要る。[open-questions.md](open-questions.md) の Q2 が決まってから Stage 3 で決める。

### 検査全体

この Unit の変更は、CI が走らせる 4 つすべてに掛かる。

```
pnpm test:coverage → pnpm typecheck → pnpm lint → pnpm build
```

`pnpm lint` は ESLint / Prettier / textlint を並列で回す。**textlint は記事だけが対象**なので、この Unit が足すコードは掛からない。
