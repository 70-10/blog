---
title: Public Suffix List とは
publishDate: 2025-04-27T08:04:34.406+09:00
tags: ["Develop"]
description: ""
---

Public Suffix List は、 `.com` や `.co.jp` のようなユーザーがドメイン名を登録できる範囲の境界を示すサフィックスをまとめたリストです。ユーザーは通常、このリストに記載されたサフィックスの直下のレベルで、レジストラを通じてドメイン名を登録します。
`.net` が Public Suffix List に含まれている（つまり、公開された登録を受け付けるサフィックスである）ため、その下のレベルである `70-10` という名前部分を組み合わせた このブログの `70-10.net` というドメイン名をレジストラ経由で取得できるのです。

ドメイン取得可能なドメイン末尾部分は `.jp` や `.net` のように一層のものもあれば、 `.co.jp` や `.or.jp` のように二層以上のものもあります。
ドメイン名の階層で最上位にあるものを TLD (Top Level Domain) と呼びます（例: `.jp`, `.net`）。一方、Public Suffix List に掲載されている、一般のドメイン登録の基点となる部分全体を eTLD (effective Top Level Domain) または Public Suffix と呼びます。eTLD には、TLD そのもの（例: `.com`, `.net`）や、複数の部分から成るサフィックス（例: `.co.jp`, `.or.jp`, `pvt.k12.ma.us`）が含まれます。

eTLD は特に国コード TLD（ccTLD）の下では、国や地域ごとに登録ポリシーが異なり、その結果として `.co.jp`, `.or.id`, `pvt.k12.ma.us` のような多層構造を持つ eTLD が多数存在します。  
もしインターネット上のドメインが `.com` や `.net` のような単純な TLD ばかりであれば、Public Suffix は「ドメインをドットで区切った一番右の部分」と単純に定義できます。Public Suffix List を用意せずともロジックで定義できてしまいます。
しかし、`.co.jp` や `pvt.k12.ma.us` のような eTLD が存在するため、ドメイン階層の扱いは複雑です。eTLD の特定をアルゴリズムで行うのは難しいのです。

そのため、Public Suffix List で、ドメイン名の末尾部分をまとめたリストを用意し、ドメイン名の末尾部分を正確に特定できるようにしています。

# 参考情報

https://publicsuffix.org/
