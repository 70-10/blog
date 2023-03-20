---
title: TestCafeのremote機能が良い
publishDate: 2021-10-15T16:58:00+09:00
tags: ["Test", "E2E"]
draft: false
---

# メモ

- 任意のデバイスでテストを実行できる
- `testcafe remote test.ts --qr-code`と実行すると URL とその QR コードが生成される
- 任意の端末で QR コードを読み込む or URL にアクセスするとブラウザ上でテストが実行される
- 任意の端末は QR を発行している PC のネットワークにアクセスできる必要がある
- iPhone や Android などのスマホブラウザ上でテストができる

# 参考サイト

- [Test on Remote Computers and Mobile Devices | Basics | Recipes | Docs](https://testcafe.io/documentation/402807/recipes/basics/test-on-remote-computers-and-mobile-devices)
