---
title: HttpClientのBaseAddressを使うときの注意まとめ
publishDate: 2020-06-27T22:30+09:00
tags: ["C Sharp", "HttpClient"]
---

# はじめに

HttpClientで`http://example.com/base/test/api`にリクエストしたいとします。
HttpClientは以下のように`BaseAddress`で初期化し、`GetAsync`を使ってリクエストを実行します。

```csharp
var client = new HttpClient
{
    BaseAddress = new Uri("<ベースとなるURI>")
};

var res = await client.GetAsync("<アクセスしたいパス>");
```

# 設定する値によってリクエストするURIが代わる

`BaseAddress`, `GetAsync`それぞれに設定する値によって、リクエストするURIが変わります。


| BaseAddressの値  | GetAsyncの引数                   | 生成されるURI                    |
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

## BaseAddressにパスを含めない場合は期待通りになる

`BaseAddress`が`http://example.com`もしくは`http://example.com/`の場合は、`GetAsync`にどのような引数を渡してもリクエストするURIは期待通りです。

## パスを含める場合、最後の`/`の有無でリクエストURIが変化する

`BaseAddress`にパスを含むURIを設定すると、最後に`/`があるかないかで結果が変わります。  
意図しないURIになってしまう可能性があるということです。


# 結論

## 1. BaseAddressにパスを含ませない

パスを含ませると、意図しないリクエストURIになる可能性があります。  
基本的にパスを含ませないようにしましょう。

## 2. BaseAddressにパスを含ませる場合は`/`に気をつける

`BaseAddress`にパスを含む場合は最後に`/`を入れましょう。  
`GetAsync`の引数にも注意しましょう。先頭の`/`の有無で生成されるURIは変化します。

つまり、パスを含ませる場合は以下の2点を守りましょう。

1. `BaseAddress` は必ず最後 `/` で終わる
2. `GetAsync` の引数の先頭は `/` をつけない
