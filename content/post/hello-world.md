+++
date = "2017-05-20T15:04:57+09:00"
draft = false
title = "Hello World."

+++

ブログを始めてみました。  
今年の1月から、ローカル環境で[Hugo](https://github.com/spf13/hugo)を使ってブログを立てて遊んでいたんですが、（[『UNIXという考え方」を読んだ』](/2017/01/29/unix-philosophy/)はその頃にお試しで書いてみた記事です。）  
ローカルでブログ書いててもどうにもならないし、せっかくだからGitHub Pagesをブログを始めてみようと思って、今に至る次第です。

## ブログを始めるためにやったこと

- [blogリポジトリ](https://github.com/70-10/blog)の用意
- ドメイン(70-10.net)の取得
- Route53の設定
  - Certificate Managerの設定  
    → 独自ドメインだとHTTPS化がうまくできず、結局利用せず
- textlintの設定

## ブログサービスを使わない理由

GitHub Pagesを使ってみたかったから。  
はてなブログなどのブログサービスを使う方がだいぶ楽なことには、気づかないふりをしておきます。

## TODO

- CIでgh-pages更新の自動化
- シンタックスハイライトの設定
- HTTPS化
  - GitHub Pagesで独自ドメインを使っているとHTTPS化は無理？
- タグ設定
