---
title: Public Suffix List とは
publishDate: 2025-04-27T08:04:34.406+09:00
tags: ["Develop"]
description: ""
---

Public Suffix List とは、「誰でも登録できるドメイン階層を網羅的に列挙したリスト」です。

まず、「誰でも登録できるドメイン階層」とは、個人や企業など一般の登録者がレジストラ経由で直接取得できる最上位階層のドメインを指します。`.net` や `.com` 、 `.co.jp` などです。

最上位階層のドメインは二種類存在します。TLD (Top Level Domain) と eTLD (effective Top Level Domain) です。

TLD (Top Level Domain) は、ドメイン名の最上位階層を指します。例えば、 `blog.70-10.net` の場合、 `.net` が TLD です。

eTLD (effective Top Level Domain) は、ドメイン名の最上位階層を指します。例えば、 `www.yahoo.co.jp` の場合、 `.co.jp` が eTLD です。  
`.jp` 直下のドメイン登録は許可されておらず、 `.co.jp` や `.or.jp` などが最上位の登録階層となります。つまり `.co.jp` や `.or.jp` Public Suffix であり、`.jp` は Public Suffix ではありません。

この eTLD は国ごとに登録ポリシーが異なり、 `.co.jp`, `.or.id`, `pvt.k12.ma.us` のような多層構造が存在します。  
もしインターネット上のドメインが単純に `.com` や `.net` のような伝統的な TLD ばかりであれば、Public Suffix は「ドメインをドットで区切った一番右の部分」と単純に定義できます。しかし、`.co.jp` や `.or.id` のような eTLD が存在するため、ドメイン階層の扱いは複雑です。eTLD の特定をアルゴリズムで行うのは難しいです。

そのため、Public Suffix List を用意し、誰でも登録できるドメイン階層を網羅的に列挙しています。

# 参考情報

https://publicsuffix.org/
