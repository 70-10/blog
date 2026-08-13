# 制約 — draft-anywhere

Unit 1「下書きを残せるようにする」が受ける制約。上流は [00_intent.md](../../../00_intent.md)、[02_user-stories.md](../../../02_user-stories.md)（US-01 / US-03）、[03_units.md](../../../03_units.md)。

情報源はそれぞれ明記する。この Unit のためにコードを読み直して確かめたものは「本 Unit で確認」と書く。

## 技術的制約

### 下書きを公開対象から外す口は 1 つに絞れる

`getPosts()` を呼んでいるのは 5 か所で、記事に関わる生成物はすべてここを通る（本 Unit で `grep` して確認）。

| 呼び出し元                   | 生成物             |
| ---------------------------- | ------------------ |
| `src/pages/index.astro`      | トップページの一覧 |
| `src/pages/posts/[id].astro` | 記事ページ         |
| `src/pages/tags/[tag].astro` | タグページ         |
| `src/pages/rss.xml.ts`       | RSS                |
| `src/pages/og/[slug].png.ts` | OGP 画像           |

`getCollection("posts")` を直接呼んでいる本番コードは `src/lib/repositories/posts.ts` だけ（記事本文の Markdown 内にコード例としての記述はあるが、これは実行されない）。

US-01 の受け入れ条件「下書きは記事ページ・一覧・タグページ・RSS・OGP 画像のいずれにも現れない」を守る場所は、**下書きを posts コレクションの中に置くなら `getPosts()` の 1 か所だけ**で足りる。posts コレクションの外に置くなら、そもそも守る場所が要らない。

### コレクションのスキーマが本文だけの下書きを拒む

`src/content.config.ts` は `title` / `publishDate` / `tags` を必須にしている（本 Unit で確認）。

```ts
schema: z.object({
  title: z.string(),
  publishDate: z.coerce.date(),
  tags: z.array(z.string()),
  description: z.string().optional(),
});
```

US-01 は「タイトル・タグを決めなくても保存できる」「本文が空でも保存できる」を求める。**下書きを `src/content/posts/` に置くなら、この 3 つを必須のままにはできない。** 必須を外すと既存 97 記事にも同じ緩和が効く（型の上で `title` が `string | undefined` になり、記事ページ・OGP 画像・RSS がそれを受ける）。

これは好みではなくコードから来る制約なので、下書きの置き場を決めるときの分かれ目になる。

### 新しいワークスペースパッケージは本体の検査に即つながる

- `pnpm-workspace.yaml` は `packages/*` と `tools/*` を列挙する。`packages/` は現在存在しない（本 Unit で確認）
- `vitest.config.ts` に `test.exclude` の指定がない。**新しいパッケージのテストは何もしなくても `pnpm test:run` に入る**
- `vitest.config.ts` の `coverage.include` は `["src/**/*", "tools/**/*"]`。`tools/` 配下に足せばカバレッジの対象にも入り、CI の `vitest-coverage-report-action` がその数字を PR に出す

### CI はプルリクエストのときだけ動き、ロックファイルの差分で落ちる

`.github/workflows/lint-and-build.yml`（本 Unit で確認）:

- トリガーは `pull_request` の `main` 宛てのみ。`main` への直接 push では動かない
- `pnpm install --frozen-lockfile` のあとに `git diff --exit-code pnpm-lock.yaml` がある。**依存を足してロックファイルを一緒にコミットしないと落ちる**
- 走る検査は `pnpm test:coverage` → `pnpm typecheck` → `pnpm lint` → `pnpm build`（`NODE_ENV=production`）

### 校正はローカルのコミットにしか掛からない

`lefthook.yml` の pre-commit で `pnpm textlint --fix {staged_files}`、対象は `src/content/posts/*.md`（本 Unit で確認）。`package.json` の `lint:textlint` も `src/content/posts/**/*.md` だけを見る。

**下書きは校正の対象外**（[00_intent.md](../../../00_intent.md) の Out）。この Unit では校正を足さない。ただし下書きのファイルを `src/content/posts/` の中に置くと、pre-commit の glob に掛かって意図せず校正が走る。置き場を決めるときに関わる。

### 既存の入口を壊さない

`tools/create-post/index.ts`（本 Unit で確認）は `src/content/posts/<slug>.md` を直接書き出し、`code` コマンドで VS Code を開く。`publishDate` には作成時刻が入る。US-03 の受け入れ条件が「今と同じようにタイトル・slug・タグを聞き、記事のファイルを作る」なので、**この振る舞いを変えない**。

`tools/create-post/index.test.ts` が既にあるので、壊れれば `pnpm test:run` が知らせる。

### 実行環境

- Node.js 22 系（CI の `node-version: 22.x`）
- pnpm 11.15.1（`mise.toml` と CI で一致）
- 公開は `main` への push を Cloudflare Pages が受けてデプロイする。リポジトリ内にデプロイ設定はない（[01_current-and-constraints.md](../../../01_current-and-constraints.md)）

### 管理画面の土台（Cloudflare / GitHub）

構成は [ADR 0008](../../../../../adr/0008-admin-runs-as-its-own-pages-project-behind-cloudflare-access.md) で決めた。ここはその決定が受ける制約で、**すべて Cloudflare / GitHub の公開ドキュメントで確認**したもの（このリポジトリのコードからは分からない）。

| 制約                                                                                                                       | 出典                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages Functions は現役で、Pages プロジェクトの中でサーバー側のコードを動かせる（廃止の告知なし）                           | [Pages Functions](https://developers.cloudflare.com/pages/functions/)                                                                             |
| Pages Functions は KV と秘密の値を bind できる。秘密の値はダッシュボードで設定し `context.env` から読む                    | [バインディング](https://developers.cloudflare.com/pages/functions/bindings/)                                                                     |
| ローカル開発の秘密の値は `.dev.vars` か `.env`（**両方は不可**）。`.env` は `.gitignore` 済み                              | 同上                                                                                                                                              |
| **Access の JWT はアプリ側で署名まで検証する。** ヘッダーだけの確認ではなりすませる                                        | [JWT の検証](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)                                     |
| JWT は `Cf-Access-Jwt-Assertion` ヘッダーから取る（`CF_Authorization` Cookie は届く保証がない）                            | 同上                                                                                                                                              |
| 公開鍵は `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` から取得する。**6 週ごとに入れ替わるので埋め込まない** | 同上                                                                                                                                              |
| Access で守れるのは自分の Cloudflare アカウントの有効なゾーンに属するドメインだけ。パスでも絞れる                          | [自己ホスト型アプリケーション](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/)              |
| Access のポリシーは既定が拒否。`Emails` セレクタでアドレスを 1 つ指定できる                                                | [Access ポリシー](https://developers.cloudflare.com/cloudflare-one/policies/access/)                                                              |
| **使い捨てのコードをメールで送る方式（OTP）は新しい組織では既定で無効。** 既定は Cloudflare の ID プロバイダー             | [One-time PIN](https://developers.cloudflare.com/cloudflare-one/identity/one-time-pin/)                                                           |
| Zero Trust は 50 席まで無料                                                                                                | [Cloudflare One の 50 席](https://blog.cloudflare.com/zero-trust-week-setting-up-cloudflare-one-as-a-small-business/)                             |
| 細かい権限のトークンは対象リポジトリを絞れる。Contents を read and write にする。期限は 1〜366 日、期限なしも選べる        | [個人アクセストークンの管理](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) |

**`*.pages.dev` の露出に注意。** 独自ドメインにだけ Access を掛けると、Pages プロジェクトに付く `*.pages.dev` とブランチプレビューは守られないまま残る。[ADR 0008](../../../../../adr/0008-admin-runs-as-its-own-pages-project-behind-cloudflare-access.md) が管理画面を別プロジェクトにしたのはこれを 1 か所に閉じ込めるため。**管理画面のプロジェクトではプレビューデプロイを止める。**

**ゾーンの確認は人が行う。** `70-10.net` が Cloudflare アカウントの有効なゾーンになっているかは、このリポジトリからは確かめられない。Access を設定する時点でダッシュボードで分かる。

## 命名規約・コーディング規約

`CLAUDE.md` と既存コードから（本 Unit で確認）。

- **TypeScript**。`@typescript-eslint/no-explicit-any` は `error`。テストでの型変換は `as unknown as T` を使い、`eslint-disable` で逃げない
- **テストは Vitest**。ソースと同じ場所に `*.test.ts` を置く（`src/lib/repositories/posts.test.ts` の形）。ページのテストだけ `src/__tests__/pages/` にある
- **テストケースには `// Arrange` / `// Act` / `// Assert` のコメントを付ける**
- **テストの名前は英語**、`describe` を `Positive Cases` / `Edge Cases` / `Negative Cases` に分ける（`src/lib/repositories/posts.test.ts` がこの形）
- 整形は Prettier、`prettier-plugin-organize-imports` が import を並べ替える。手で並べ直さない
- パスの別名は `@` が `src/` を指す（`astro.config.ts` と `vitest.config.ts` の両方で設定）
- 記事は `src/content/posts/`、画像は `src/content/images/<slug>/`
- ブランチ名は `intent/<intent-slug>/unit/<unit-slug>`、コミットメッセージは Conventional Commits（[docs/rules/project.md](../../../../../rules/project.md)）

## やってはいけないこと

[00_intent.md](../../../00_intent.md) の Out と [03_units.md](../../../03_units.md) から。

- **記事の正の置き場を変えない。** 記事はこのリポジトリ内の Markdown のまま（[ADR 0003](../../../../../adr/0003-articles-stay-as-markdown-in-this-repository.md)）
- **`pnpm create-post` を廃止・作り直ししない。** 今の経路はそのまま動くこと（US-03 の受け入れ条件）
- **下書きに画像を含める作りにしない。** 下書きはテキストだけでよい
- **下書きの段階で校正を掛けない。** 校正が働くのは公開のときだけ
- **既存 97 記事の URL・日付・一覧の並び順を変えない**（US-01 / US-03 の「既存コンテンツへの影響」）
- **この Unit で公開・取り消し・プレビュー・下書きのまとめると捨てるを作らない。** 順に Unit 2 / Unit 3 / Unit 4 の担当（[03_units.md](../../../03_units.md) の割り振り）。この Unit が持つのは認証・読み書きの裏側・編集画面・下書きの保存の形・最小の一覧の 5 つ
