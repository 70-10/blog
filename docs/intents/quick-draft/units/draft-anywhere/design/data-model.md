# データ構造 — draft-anywhere

上流は [00_intent.md](../../../00_intent.md)、[02_user-stories.md](../../../02_user-stories.md)（US-01 / US-03）、[explore/constraints.md](../explore/constraints.md)、[explore/design-decisions.md](../explore/design-decisions.md)。

置き場と書き込み方は [ADR 0009](../../../../../adr/0009-drafts-live-outside-the-posts-collection-and-commit-with-a-build-skip-flag.md) で決めた。

## データ構造

### 下書きのファイル

`src/content/drafts/<id>.md`

```markdown
---
title: ""
createdAt: 2026-08-13T05:15:31.482Z
updatedAt: 2026-08-13T05:20:07.913Z
---

本文
```

| 項目        | 型              | 必須 | 中身                                             |
| ----------- | --------------- | ---- | ------------------------------------------------ |
| `title`     | string          | 必須 | 決まっていなければ空文字。**項目自体は常にある** |
| `createdAt` | ISO 8601 文字列 | 必須 | 最初に作った時刻（UTC）                          |
| `updatedAt` | ISO 8601 文字列 | 必須 | 最後に保存した時刻（UTC）                        |
| 本文        | Markdown        | —    | 空文字でもよい                                   |

**`tags` と `publishDate` は持たない。** タグは下書きの段階では決めない（[questions.md](../../../questions.md) の解決済み）。公開日は公開した日にする（US-05）ので、下書きの時点では存在しない。どちらも Unit 2 が公開のときに与える。

**`title` を省略可にせず空文字にするのは、項目の有無と値の空を区別しないため。** 「タイトルが決まっていない」は 1 通りで表す。

### 識別子

`id` は `crypto.randomUUID()` で作る文字列。ファイル名は `<id>.md`。

- **時刻を埋め込まない。** 作成時刻は `createdAt` にあり、ファイル名にも入れると同じ事実が 2 か所になる
- ブラウザにも Cloudflare Workers にもある API なので、追加の依存が要らない
- 一覧の並び順はファイル名ではなく `updatedAt` で決める

### 下書きの型（画面と裏側で共有する）

```ts
type Draft = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

// 一覧では本文を返さない（Unit 1 の一覧はタイトルと更新時刻だけ）
type DraftSummary = Pick<Draft, "id" | "title" | "updatedAt">;
```

保存のやりとりでは GitHub の `sha` も要る（下の「GitHub Contents API とのやりとり」）。これはファイルの中身ではなく通信の都合なので `Draft` には入れない。

### 記事との対応

記事（`src/content/posts/<slug>.md`）の frontmatter は `title` / `publishDate` / `tags` が必須、`description` は任意（[explore/constraints.md](../explore/constraints.md)）。

下書きから記事への移行で**本文はそのまま**、frontmatter は次のように変わる。**この移行を書くのは Unit 2**。ここでは移行できる形になっていることだけを示す。

| 下書き              | 記事                                |
| ------------------- | ----------------------------------- |
| `title`（空でも可） | `title`（必須。空なら公開できない） |
| —                   | `tags`（必須。公開のときに与える）  |
| —                   | `publishDate`（公開した日）         |
| `createdAt`         | 引き継がない                        |
| `updatedAt`         | 引き継がない                        |
| 本文                | 本文（**一字も変えない**）          |

### 設定と秘密の値

管理画面のパッケージが動くのに要る値。[ADR 0008](../../../../../adr/0008-admin-runs-as-its-own-pages-project-behind-cloudflare-access.md) で決めた構成から出てくる。

| 名前                 | 種別     | 中身                                               |
| -------------------- | -------- | -------------------------------------------------- |
| `GITHUB_TOKEN`       | 秘密の値 | `70-10/blog` だけに絞った細かい権限のトークン      |
| `ACCESS_TEAM_DOMAIN` | 環境変数 | `<team>.cloudflareaccess.com`。JWKS の取得先になる |
| `ACCESS_AUD`         | 環境変数 | Access アプリケーションの AUD タグ                 |
| `GITHUB_REPO`        | 環境変数 | `70-10/blog`                                       |
| `GITHUB_BRANCH`      | 環境変数 | `main`                                             |

秘密の値は Cloudflare のダッシュボードで設定し、コードからは `context.env` で読む。ローカル開発は `.dev.vars`（[explore/constraints.md](../explore/constraints.md) の「管理画面の土台」）。

## 関連

### 置き場の全体

```
src/content/
├── posts/     記事（公開される。posts コレクションの glob の基点）
├── drafts/    下書き（コレクションではない。生成物に現れない）  ← 新規
└── images/    画像（コレクションではない。既存）
```

`src/content/drafts/` を選んだのは、`src/content/images/` という**コレクションでない同居ディレクトリの先例がある**ため。公開の対象になるかどうかは `content.config.ts` の glob だけが決めていて、`src/content/` の下に置くこと自体は公開を意味しない。

### 下書きの一生

| 段         | きっかけ                   | 起きること                                                 | 担当   |
| ---------- | -------------------------- | ---------------------------------------------------------- | ------ |
| 作られる   | 画面で「新しく書く」→ 入力 | ファイルができる。**本文もタイトルも空なら作られない**     | Unit 1 |
| 書き足す   | 自動保存                   | 中身が置き換わり `updatedAt` が進む。何度でも繰り返す      | Unit 1 |
| 記事になる | 公開                       | `src/content/posts/<slug>.md` へ移り、**下書きは残らない** | Unit 2 |
| 捨てる     | 一覧から捨てる             | ファイルが消える                                           | Unit 4 |

**Unit 1 が持つのは「作られる」と「書き足す」の 2 段だけ**（[03_units.md](../../../03_units.md) の割り振り）。

### GitHub Contents API とのやりとり

下書きの実体はリポジトリのファイルなので、状態は GitHub が持つ。管理画面は状態を持たない。

| 操作     | API                                             | 要るもの                           |
| -------- | ----------------------------------------------- | ---------------------------------- |
| 一覧     | `GET /repos/{repo}/contents/src/content/drafts` | —                                  |
| 1 件取得 | `GET /repos/{repo}/contents/{path}`             | —                                  |
| 作成     | `PUT /repos/{repo}/contents/{path}`             | 中身（Base64）、コミットメッセージ |
| 更新     | `PUT /repos/{repo}/contents/{path}`             | 上に加えて **既存の `sha`**        |

**更新には `sha` が要る。** これは楽観的な排他制御になっていて、他所で書き換わっていれば 409 が返る。1 人で使う前提でも、同じ下書きを 2 つの端末で開いたときに起こりうるので、画面まで伝える（[rules.md](rules.md) の「保存の衝突」）。

**一覧はディレクトリの一覧では足りない。** ディレクトリを取る API はファイル名と `sha` だけを返し、中身を返さない。タイトルを出すには 1 件ずつ取ることになる（N+1 回）。Unit 1 の一覧は件数が少ない前提で受け入れる。**Unit 4 が冒頭の抜粋つきの一覧に育てるとき、この回数が問題になりうる**ので、そこで見直す。

### 既存のデータへの影響

**無い。** `src/content/posts/` にも `src/content.config.ts` にも `src/lib/repositories/posts.ts` にも触らない。既存 97 記事の URL・日付・並び順は変わらない（US-01 / US-03 の「既存コンテンツへの影響」）。
