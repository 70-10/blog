---
title: HttpClientのBaseAddressを使うときの注意まとめ
publishDate: 2020-06-27T22:30:00+09:00
tags: ["Develop"]
draft: false
---

# はじめに

HttpClient で`http://example.com/base/test/api`にリクエストしたいとします。
HttpClient は以下のように`BaseAddress`で初期化し、`GetAsync`を使ってリクエストを実行します。

```csharp
var client = new HttpClient
{
    BaseAddress = new Uri("<ベースとなるURI>")
};

var res = await client.GetAsync("<アクセスしたいパス>");
```

# 設定する値によってリクエストする URI が代わる

`BaseAddress`, `GetAsync`それぞれに設定する値によって、リクエストする URI が変わります。

| BaseAddress の値         | GetAsync の引数                  | 生成される URI                   |
| ------------------------ | -------------------------------- | -------------------------------- |
| http://example.com       | base/test/api                    | http://example.com/base/test/api |
| http://example.com       | /base/test/api                   | http://example.com/base/test/api |
| http://example.com       | http://example.com/base/test/api | http://example.com/base/test/api |
| http://example.com/      | base/test/api                    | http://example.com/base/test/api |
| http://example.com/      | /base/test/api                   | http://example.com/base/test/api |
| http://example.com/      | http://example.com/base/test/api | http://example.com/base/test/api |
| http://example.com/base/ | test/api                         | http://example.com/base/test/api |
| http://example.com/base/ | /test/api                        | http://example.com/test/api      |
| http://example.com/base/ | http://example.com/base/test/api | http://example.com/base/test/api |
| http://example.com/base  | test/api                         | http://example.com/test/api      |
| http://example.com/base  | /test/api                        | http://example.com/test/api      |
| http://example.com/base  | http://example.com/base/test/api | http://example.com/base/test/api |

## BaseAddress にパスを含めない場合は期待通りになる

`BaseAddress`が`http://example.com`もしくは`http://example.com/`の場合は、`GetAsync`にどのような引数を渡してもリクエストする URI は期待通りです。

## パスを含める場合、最後の`/`の有無でリクエスト URI が変化する

`BaseAddress`にパスを含む URI を設定すると、最後に`/`があるかないかで結果が変わります。  
意図しない URI になってしまう可能性があるということです。

# 結論

## 1. BaseAddress にパスを含ませない

パスを含ませると、意図しないリクエスト URI になる可能性があります。  
基本的にパスを含ませないようにしましょう。

## 2. BaseAddress にパスを含ませる場合は`/`に気をつける

`BaseAddress`にパスを含む場合は最後に`/`を入れましょう。  
`GetAsync`の引数にも注意しましょう。先頭の`/`の有無で生成される URI は変化します。

つまり、パスを含ませる場合は以下の 2 点を守りましょう。

1. `BaseAddress` は必ず最後 `/` で終わる
2. `GetAsync` の引数の先頭は `/` をつけない
