---
title: GatsbyからAstroに移行した
publishDate: 2023/02/08
tags: ["Web Frontend"]
---

ブログを、Gatsby + Contentful で構築していたのからAstroに移行しました。

# きっかけ

ただ単純に Astro を使ってみたいと思ったのがきっかけです。

Gatsby でも良かったのだけど、プラグインが多くて管理するのが大変でした。  
Gatsby をアップデートするのにも少しばかり苦労したこともありました。  
移行して気づきましたが、 Astro に比べると Gatsby は設定項目が多かったです。

# Astro を触ってみた感想

Gatsby に比べて、設定することが少ないのは開発体験としてよかったです。  
Tailwind CSS を導入するのも `npx astro add tailwind` のコマンド一発で完了するのには感動です。  

React や Vue などのUIコンポーネントライブラリを混ぜ合わせて使えるというのも魅力の1つでした。  
が、結局どのコンポーネントライブラリも使わずに実装しました。使わなくても困らないです。

## Contentful をやめた理由

Astro 移行をきっかけに、Contentful で管理していたデータを一緒にリポジトリで管理するようにしました。  
Contentful、というか Headlss CMS を Astro で使おうとするとレンダリングに苦労します。  

https://docs.astro.build/en/guides/markdown-content/#fetching-remote-markdown

> Astro does not include built-in support for remote Markdown! To fetch remote Markdown and render it to HTML, you will need to install and configure your own Markdown parser from npm. This will not inherit from any of Astro’s built-in Markdown and MDX settings that you have configured. Be sure that you understand these limitations before implementing this in your project.
> 
> （Astroは、標準でリモートのMarkdownをサポートしていません！ リモートのMarkdownを取得し、それをHTMLにレンダリングするには、npmから独自のMarkdownパーサーをインストールし、設定する必要があります。これは、カスタマイズしたAstroのビルトインMarkdownとMDXの設定をいずれからも継承しません。プロジェクトでこれを実装する前に、これらの制限を理解しておいてください。）

わざわざ Markdown のパーサーを用意しないといけないし、そのシンタックスハイライトの設定も頑張らないといけません。  
Astro自身が管理する Markdown ファイルであれば勝手にパースしてくれますシンタックスハイライトも用意されています。

毎回 Contentful へ API を叩いてデータを取得するのもネックのひとつだけでした。  
API キーの管理が必要になるし、 API にリクエストする分時間がかかるのも不満でした。

それなら記事のデータもリポジトリで管理するほうが手っ取り早いなと思って、一緒くたにしました。  
リポジトリで管理すれば [textlint](https://textlint.github.io/) で校閲することも可能になるので、今後やっていきたいです。

## Astro はまだまだインテグレーションが少ない

Astro にも Gatsby のプラグインのような、[インテグレーション](https://astro.build/integrations/)というものが用意されています。  
Gatsbyに比べるとまだまだ少ないです。  
Google Analytics のインテグレーションを探しましたが、どれを使うのがベターなのかわからず、結局自前で実装しました。

# やり残していること

- Astro 2.0 から導入された [Content Collections](https://docs.astro.build/en/guides/content-collections/) で Markdownの管理をする
- textlint の導入
- 404ページ
