---
title: eval-spec-makerをDocker化した
publishDate: 2017-09-25T22:11+09:00
tags: ["Docker", "Test"]
---

# はじめに

[eval-spec-maker](https://github.com/ryuta46/eval-spec-maker)を[Docker化](https://hub.docker.com/r/7010/eval-spec-maker/tags/)しました。  
eval-spec-makerがどういうものかについては、[こちらの記事](http://ryuta46.com/255)を参照していただくとわかります。

# 使い方

## インストール

`docker pull`をするだけです。

```
$ docker pull 7010/eval-spec-maker
```

## 実行

7010/eval-spec-makerは`/doc`にあるMarkdownファイルを変換します。
Volumeオプションで`/doc`を指定する必要があります。

```
$ docker run -it --rm -v $(pwd):/doc 7010/eval-spec-maker test.md test.xlsx
```

# 作った背景

僕のチームではテストケースをエクセルファイルで運用しています。  
それらのファイルはGitLabで管理しており、テストケースの追加や削除などの変更履歴はマージリクエストを使って追えるようにしています。

ですが、エクセルファイルは変更差分が全く出ないので、マージリクエストを見るだけではわかりません。レビューをしようにも変更点を一つ一つ説明してもらわないといけない状態です。

エクセル以外のファイルにしたり、GitLab以外の管理ツールを使おうとしてみました。  
ですが、ベターな方法は見つからず、現在も変更差分のわからない管理をしています。

そんなときに[eval-spec-makerの記事](http://ryuta46.com/255)を見つけました。
さっそく使ってみたところ、求めていた機能そのものでした。  
ただ、Javaでのコンパイルを1枚噛んでいたのが気になり…  
もっと簡単に導入できるようにしたいなと思いDocker化しました。

これからチームに展開していこうという所存です。

# あとがき

Dockerが便利。Javaを知らない・使っていない人でもすぐに導入できるのはとても魅力的。CIに乗せることも難なくできます。  
ネックはイメージサイズが大きいこと。alpineベースのjavaイメージにビルドし直したいところです。
