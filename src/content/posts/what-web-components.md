---
title: Web Componentsとはなんぞや
publishDate: 2021-12-07T12:30+09:00
tags: ["Web Frontend", "Web Components"]
draft: false
---

# Web Componentsとは

Web Componentsとは、カプセル化されたカスタム要素を作成し、Webアプリで再利用するための技術。

# Web Componentsを実現する3つの要素

1. Custom Elements
2. Shadow DOM
3. HTML Templates

## 1. Custom Elements

Custom Elementsとは、独自のタグ名で、任意の振る舞いを持ったHTML要素を定義できるJavaScript API。
`<my-element></my-element>`のように定義できる。

## 2. Shadow DOM

Shadow DOMとは、DOMのカプセル化を実現するJavaScript API。
メインのドキュメントとのDOMとは別にレンダリングされる。メインのドキュメントからアクセスできない。
カプセル化することにより、ローカルのスタイルルールの定義といった要素の機能を限定できる。

## 3. HTML Templates

HTML Templatesとは、要素をテンプレートとして扱う機能。  
`<template>`と`<slot>`要素によってdocument上に配置し、使い回すことができる。

# 参考資料

- [Web Components | MDN](https://developer.mozilla.org/ja/docs/Web/Web_Components)
- [ライブラリを使わずここまでできる！Web Componentsで近未来のフロントエンド開発 | 株式会社ヌーラボ(Nulab inc.)](https://nulab.com/ja/blog/cacoo/web-components/)
- [よくわかるWeb Components](https://www.amazon.co.jp/dp/B07J5R83PY)
