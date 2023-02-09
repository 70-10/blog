---
title: Jestを導入するためのワンライナーコマンド
publishDate: 2022-03-25T14:30+09:00
tags: ["Node.js", "Test"]
draft: false
---

Jestを触りたいときに、すぐに環境を用意するためのワンライナーコマンド。  
これでJest + TypeScriptの環境が出来上がる。

```
npm init -y && npm i -D jest ts-jest typescript @types/jest && npx ts-jest config:init
```
