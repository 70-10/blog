---
title: Chrome DevTools の Recorder はE2Eテストを助けてくれる
publishDate: 2023-07-31T19:55:00+09:00
tags: ["Web Frontend"]
---

# Recorder はユーザーフローを記録・再生できる

Recorder は、ユーザーフローの記録・再生・パフォーマンス測定ができる機能です。  
詳しい使い方は下記の URL にある動画を見るとわかります。

[Record, replay, and measure user flows - Chrome Developers](https://developer.chrome.com/docs/devtools/recorder/ "https://developer.chrome.com/docs/devtools/recorder/")

# 記録をコードに出力できる

記録した情報はコードとして出力できます。  
基本的に Puppeteer のコードで出力されます。

## エクステンションを使えばいろんな出力形式が選べる

エクステンションを入れると他フレームワークの形式でコードに出力できます。

[Customize the Recorder with extensions - Chrome Developers](https://developer.chrome.com/docs/devtools/recorder/extensions/#extensions-list)

## E2E テストのコード生成に使える

E2E フレームワークの [Cypress](https://www.cypress.io/) はユーザーフローを記録し、コードに出力する機能は公式には提供されていません。毎回頑張ってコードを書く必要がありました。  
Recorder を使えばテストコードの作成も楽になりそうです。
