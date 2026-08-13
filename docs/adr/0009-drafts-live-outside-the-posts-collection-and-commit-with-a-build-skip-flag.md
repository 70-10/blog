# 下書きは posts コレクションの外に置き、`main` にビルドを飛ばす印を付けてコミットする

Status: accepted
発生元: quick-draft

下書きをリポジトリのどこにどう持つかを決める。`src/content/drafts/<id>.md` に Markdown で置く。
posts コレクションの glob は `./src/content/posts` を基点にしているので、この場所は生成物に一切現れない。
書き込みは `main` へのコミットで行い、コミットメッセージの先頭に `[CI Skip]` を付けて Cloudflare Pages の
デプロイを飛ばす。自動保存のたびにサイト全体が再ビルドされるのを防ぐため。GitHub Actions は
`pull_request` のときだけ動くので `main` への直接のコミットでは走らない。
`.prettierignore` に `src/content/drafts/` を足す。`pnpm lint` の `prettier . --check` が下書きを
検査対象にしてしまい、スマホで書いた整形されていない文章で CI が落ちるため。

却下した代替案: posts コレクションの中に置き、下書きのフラグで `getPosts()` から外す — 絞り込む場所が
1 か所で済む。それでも採らないのは、コレクションのスキーマが `title` / `publishDate` / `tags` を必須に
しており、本文だけの下書きを置くには必須を外すことになるため。緩和は既存 97 記事にも効き、記事ページ・
RSS・OGP 画像がタイトルの無い記事を受け取りうる型になる。

却下した代替案: 下書き専用のブランチにコミットする — `main` の履歴が自動保存で埋まらず、ビルドを飛ばす
印にも頼らない。それでも採らないのは、公開のときにブランチをまたいでファイルを移すことになり、
[ADR 0004](0004-treat-idea-to-publish-as-one-change.md) の「着想から公開までを 1 つの変更として扱う」から
遠のくため。下書きと記事が別のブランチに分かれると、書き継ぎのたびに同期を気にすることになる。

却下した代替案: リポジトリの外（Cloudflare の保存領域など）に下書きを持ち、公開のときだけリポジトリへ
書き出す — 自動保存が速く、履歴も汚さない。それでも採らないのは
[ADR 0003](0003-articles-stay-as-markdown-in-this-repository.md) と
[ADR 0006](0006-build-our-own-admin-screen-for-writing.md) が下書きをリポジトリの中に持つと決めているため。
