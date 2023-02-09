---
title: QRコードジェネレーターを作った
publishDate: 2019-12-12T22:20+09:00
tags: ["Web Frontend", "React", "GatsbyJS"]
---

フロントエンドでQRコードを生成する処理が業務で必要だったので、調査がてらQRコードジェネレーターを作成しました。

https://qr-generate.now.sh

![QR Code Generator](//images.ctfassets.net/sa46287w9bii/1rIZTxffHmrPRRjeIH37YH/827b1baf6618cce7927b6b7ae2e5bdc5/0bf7a4435facb935454b30587bd4386e.gif)

フレームワークには[GatsbyJS](https://www.gatsbyjs.org/)を、QRの生成には[qrcode.react](https://github.com/zpao/qrcode.react)を使用しています。  
qrcode.reactはとても簡単で、QRコードにしたい文字列を `value` へ渡すだけです。

```jsx
import React from "react";
import QRCode from "qrcode.react";

export default () => (
  <QRCode value="http://qr-generate.now.sh" />
);
```
