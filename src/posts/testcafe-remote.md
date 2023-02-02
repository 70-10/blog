---
title: TestCafeのremote機能が良い
publishDate: 2021-10-15T16:58+09:00
tags: ["TestCafe", "Test", "E2E"]
---

# メモ

- 任意のデバイスでテストを実行できる
- `testcafe remote test.ts --qr-code`と実行するとURLとそのQRコードが生成される
- 任意の端末でQRコードを読み込む or URLにアクセスするとブラウザ上でテストが実行される
- 任意の端末はQRを発行しているPCのネットワークにアクセスできる必要がある
- iPhoneやAndroidなどのスマホブラウザ上でテストができる

# 参考サイト

- [Test on Remote Computers and Mobile Devices | Basics | Recipes | Docs](https://testcafe.io/documentation/402807/recipes/basics/test-on-remote-computers-and-mobile-devices)
