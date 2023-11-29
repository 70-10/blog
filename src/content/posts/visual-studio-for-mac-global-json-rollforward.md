---
title: Visual Studio For Macはglobal.jsonのrollForwardが使えない（追記あり）
publishDate: 2021-02-04T16:52:00+09:00
tags: ["Develop"]
draft: false
---

# 追記（2021/02/10）

2021/02/10 時点で、Visual Studio For Mac でも`rollForward`を認識するようになっています。

# global.json とは

プロジェクトの.NET Core バージョンを指定するための仕組み  
`version`には完全なバージョン番号しか指定できず、`3.1.*`のようなワイルドカードは不可能。  
ワイルドカードが指定できない代わりに、`rollForward`が用意されている。

`3.1.*`を実現するためには以下のように設定する。

```json:global.json
{
  "sdk": {
    "version": "3.1.102",
    "rollForward": "latestFeature"
  }
}
```

# だがしかし、Visual Studio For Mac は別だ。

[Developer Community でのやりとり](https://developercommunity.visualstudio.com/content/problem/1088196/vs2019-for-mac-globaljson-latestfeature-does-not-w.html)を見ると、どうも Visual Studio For Mac では`rollForwad`が機能しない。  
上記のような設定が行われていても、`3.1.102`しか使用を認めてくれない。

# 結論

Visual Studio For Mac を使う場合は指定されたバージョンの SDK を入れましょう。

# 参考サイト

- [global.json の概要 - .NET CLI | Microsoft Docs](https://docs.microsoft.com/ja-jp/dotnet/core/tools/global-json?tabs=netcore3x)
