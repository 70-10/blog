---
title: KindleGenのDockerイメージを作った
publishDate: 2020-07-24T09:57+09:00
tags: ["Docker", "Kindle"]
---

# はじめに

## この記事の要約

- KindleGenのDockerイメージ、[7010/kindlegen](https://hub.docker.com/r/7010/kindlegen)を作成した
- 実行方法は`docker run -it --rm -v ${PWD}:/kindlegen sample.epub`


# macOS CatalinaでKindleGenが使えなかった

epubしか存在しない本をKindleで読みたかったので、KindleGenを使ってmobiに変換しようとしたところ、Catalinaだと動きませんでした。  
回避方法もあるようですが、せっかくならDockerで実行できるようにと思い作成しました。

リポジトリは[こちら](https://github.com/70-10/docker-kindlegen)。

# 参考記事

- [KindleGenはmacOS Catalinaでは動きません – Quickcaman Strikes back !](https://www.quickcaman.com/archives/6441)
- [「KindleGen」を使って epub の電子書籍を mobi に変換する - Beeeat’s log](https://bake0937.hatenablog.com/entry/2020/04/13/000343)