---
title: eval-spec-makerをDocker化した
publishDate: 2017-09-25T22:11:00+09:00
tags: ["Docker", "Test"]
draft: false
---

# はじめに

[eval-spec-maker](https://github.com/ryuta46/eval-spec-maker)を[Docker 化](https://hub.docker.com/r/7010/eval-spec-maker/tags/)しました。  
eval-spec-maker がどういうものかについては、[こちらの記事](http://ryuta46.com/255)を参照していただくとわかります。

# 使い方

## インストール

`docker pull`をするだけです。

```
$ docker pull 7010/eval-spec-maker
```

## 実行

7010/eval-spec-maker は`/doc`にある Markdown ファイルを変換します。
Volume オプションで`/doc`を指定する必要があります。

```
$ docker run -it --rm -v $(pwd):/doc 7010/eval-spec-maker test.md test.xlsx
```

# 作った背景

僕のチームではテストケースをエクセルファイルで運用しています。  
それらのファイルは GitLab で管理しており、テストケースの追加や削除などの変更履歴はマージリクエストを使って追えるようにしています。

ですが、エクセルファイルは変更差分が全く出ないので、マージリクエストを見るだけではわかりません。レビューをしようにも変更点を 1 つ 1 つ説明してもらわないといけない状態です。

エクセル以外のファイルにしたり、GitLab 以外の管理ツールを使おうとしてみました。  
ですが、ベターな方法は見つからず、現在も変更差分のわからない管理をしています。

そんなときに[eval-spec-maker の記事](http://ryuta46.com/255)を見つけました。
さっそく使ってみたところ、求めていた機能そのものでした。  
ただ、Java でのコンパイルを 1 枚噛んでいたのが気になり…  
もっと簡単に導入できるようにしたいなと思い Docker 化しました。

これからチームに展開していこうという所存です。

# あとがき

Docker が便利。Java を知らない・使っていない人でもすぐに導入できるのはとても魅力的。CI に乗せることも難なくできます。  
ネックはイメージサイズが大きいこと。alpine ベースの java イメージにビルドし直したいところです。
