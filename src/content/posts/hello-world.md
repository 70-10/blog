---
title: Hello World.
publishDate: 2017-05-20T15:04+09:00
draft: false
tags: []
---

ブログを始めてみました。  
今年の 1 月から、ローカル環境で[Hugo](https://github.com/spf13/hugo)を使ってブログを立てて遊んでいました。  
[『「UNIX という考え方」を読んだ』](/2017/01/29/unix-philosophy/)はその頃にお試しで書いてみた記事です。  
ローカルでブログ書いてもどうにもならないし、せっかくだから GitHub Pages をブログを始めてみようと思って、今に至る次第です。

# ブログを始めるためにやったこと

- [blog リポジトリ](https://github.com/70-10/blog)の用意
- ドメイン(70-10.net)の取得
- Route53 の設定
  - Certificate Manager の設定  
    → 独自ドメインだと HTTPS 化がうまくできず、結局利用せず
- textlint の設定

# ブログサービスを使わない理由

GitHub Pages を使ってみたかったから。  
はてなブログなどのブログサービスを使う方がだいぶ楽なことには、気づかないふりをしておきます。

# TODO

- CI で gh-pages 更新の自動化
- シンタックスハイライトの設定
- HTTPS 化
  - GitHub Pages で独自ドメインを使っていると HTTPS 化は無理？
- タグ設定
