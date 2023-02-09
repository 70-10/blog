---
title: Netlifyに7ドル支払った話（GitHub ActionsでNetlifyにデプロイする）
publishDate: 2020-05-31T22:37+09:00
tags: ["GitHub Actions", "Netlify"]
draft: false
---

# はじめに

Netlifyはとてもいいサービスです。Netlifyは高機能なホスティングサービスです。このブログもNetlifyを利用しています。

ある日、Netlifyから7ドル請求されました。支払わないとサービスを停止すると言われました。  
無料プランを利用していて、課金をした覚えはありません。  
なんで勝手に課金したことになってるんだ。自分の意思じゃないから払う気なんか無い。  
そう思っても、支払わないとこのブログが続けられなくなるという事実は変わりません。

そうして僕は7ドル支払いました。

## 当時のツイート

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Netlifyのビルド時間が上限の300分達してしまい、そのまま放っておいたら、いつのまにか500分プラスされていた。ラッキーと思ってたら7ドルの請求来た。「7ドル払ってね。じゃないとサービス停止してしまうよ」というメールも飛んできた。<br>どうやら自動で課金されるようだ。</p>&mdash; 70_10 (@70_10) <a href="https://twitter.com/70_10/status/1265814047460519939?ref_src=twsrc%5Etfw">May 28, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

# この記事のまとめ

- 無料プランでビルド時間を300分超えて利用すると、7ドルの支払いが発生する
- 支払わないとサービス停止するので素直に払おう
- ビルド時間が300分超えないように対策を取ろう
  - GitHub ActionsでビルドしてNetlifyにデプロイしよう

# ビルド時間の制約

Netlifyは無料で十分な機能が揃っています。  
GitHubのリポジトリを連携すると、masterへのプッシュ・プルリクエスト作成をトリガーとしてビルドとデプロイを自動で実行してくれます。  
ビルドは1ヶ月に300分までしか利用できません。それ以上使う場合は課金する必要があります。500分で7ドルです。

## 300分を超えた時点で請求が発生する

ビルド時間が300分に達すると利用できなくなるわけではありません。  
自動で7ドルの課金処理を行い、500分のビルド時間がプラスされます。  

Netlifyにクレジットカード情報を入力していなくても自動で発生します。  
入力していないので、当然ですが放っておくと7ドルの支払いは行われません。  

支払わない場合、サービス停止してしまいます。  
サービス停止させないためにはクレジットカードを登録し支払いを完了させないといけません。

# 再び7ドル支払わないためには

さて、このままではまた300分超えると7ドル支払わなければいけません。  
300分に収めつつ、サービスは継続させたいです。たかが7ドルですが、されど7ドルです。

対策として、ビルドをNetlifyで行わないようにしました。  
GitHub Actionsでnpmのインストールとビルド、そしてNetlifyへのパブリッシュを行うようにします。

# GitHub ActionsでNetlifyにデプロイする

まずはGitHub Actionsに用意されているNode.jsのテンプレートを使います。これでインストールとビルドは完了です。
テンプレートでは、masterへのPull Requestもトリガーになっているので、それは削除します。  
Nodeのバージョンはv14系のみにします。

## Node.jsプロジェクトのテンプレート

```yaml
# This workflow will do a clean install of node dependencies, build the source code and run tests across different versions of node
# For more information see: https://help.github.com/actions/language-and-framework-guides/using-nodejs-with-github-actions

name: Node.js CI

on:
  push:
    branches: [ master ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: 14.x

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
```

残りはNetlifyへのパブリッシュです。Netlifyが公式でActionを用意してくれています。  
`netlify/actions/cli`を使います。これで完了です。

## 完成版

```yaml
name: Deploy

on:
  push:
    branches: [ master ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: 14.x

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
    - name: Publish
       uses: netlify/actions/cli@master
       with:
         args: deploy --dir=public --prod
         env:
           NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
           NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

`NETLIFY_SITE_ID`の値はサイトごとに発行されるAPI IDを指定します。  
Authトークンは[ここから発行できます](https://app.netlify.com/user/applications#personal-access-tokens)。

# どれほど短縮したか

これまで1分40秒かかっていたものが、GitHub Actionsに切り替えたことでほぼ数秒のうちに完了しました。  
これで7ドル払う心配は無いでしょう。

ちなみに、自動ビルド設定はオフにしないとNetlifyのビルドが走ってしまいます。  
Build SettingsのBuildを`Activate Builds`から`Stop builds`にすればOKです。
