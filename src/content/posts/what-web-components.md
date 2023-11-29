---
title: Web Componentsとはなんぞや
publishDate: 2021-12-07T12:30:00+09:00
tags: ["Web Frontend"]
draft: false
---

# Web Components とは

Web Components とは、カプセル化されたカスタム要素を作成し、Web アプリで再利用するための技術。

# Web Components を実現する 3 つの要素

1. Custom Elements
2. Shadow DOM
3. HTML Templates

## 1. Custom Elements

Custom Elements とは、独自のタグ名で、任意の振る舞いを持った HTML 要素を定義できる JavaScript API。
`<my-element></my-element>`のように定義できる。

## 2. Shadow DOM

Shadow DOM とは、DOM のカプセル化を実現する JavaScript API。
メインのドキュメントとの DOM とは別にレンダリングされる。メインのドキュメントからアクセスできない。
カプセル化することにより、ローカルのスタイルルールの定義といった要素の機能を限定できる。

## 3. HTML Templates

HTML Templates とは、要素をテンプレートとして扱う機能。  
`<template>`と`<slot>`要素によって document 上に配置し、使い回すことができる。

# 参考資料

- [Web Components | MDN](https://developer.mozilla.org/ja/docs/Web/Web_Components)
- [ライブラリを使わずここまでできる！Web Components で近未来のフロントエンド開発 | 株式会社ヌーラボ(Nulab inc.)](https://nulab.com/ja/blog/cacoo/web-components/)
- [よくわかる Web Components](https://www.amazon.co.jp/dp/B07J5R83PY)
