---
title: ブラウザ上の fetch でレスポンスヘッダにある Date が取得できない
publishDate: 2025-01-24T17:12:05.736+09:00
tags: ["Develop", "Web Frontend"]
---

ブラウザ上で fetch を実行し、レスポンスヘッダにある `Date` を取得したいとします。

コードでは以下のように書きました。実際に動かしてみると `res.headers.get("Date")` は null を返してきます。

```tsx
const res = await fetch("https://example.com");
const date = res.headers.get("Date");

console.log(date); // => null
```

実際のリクエスト情報を見ると、たしかにレスポンスヘッダに `Date` は存在します。  
なぜブラウザ上の fetch では取得できないか。それは CORS が関係しています。

https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

CORS の仕組み上、クライアントからは一部のヘッダにしかアクセスできません。このアクセスを許可されているヘッダ群を CORS-safelisted Response Header (Simple Response Header) と呼びます。クライアントに公開しても安全であると考えられるヘッダで、常にクライアントからアクセスできます。

https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_response_header

今回取得しようとた `Date` ヘッダは、CORS-safelisted Response Header に含まれていません。そのため null が返されました。

`Date` ヘッダをクライアントからアクセス可能にするには、 `Access-Control-Expose-Headers` ヘッダを使って登録します。  
サーバー側で `Access-Control-Expose-Headers: Date` を設定することで、クライアントからの `Date` ヘッダのアクセスを許可できます。

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
