---
title: Jestを導入するためのワンライナーコマンド
publishDate: 2022-03-25T14:30:00+09:00
tags: ["テスト"]
---

Jest を触りたいときに、すぐに環境を用意するためのワンライナーコマンド。  
これで Jest + TypeScript の環境が出来上がる。

```
npm init -y && npm i -D jest ts-jest typescript @types/jest && npx ts-jest config:init
```
