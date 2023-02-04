---
title: BulmaからTailwind CSSに乗り換えた
publishDate: 2021-03-04T14:27+09:00
tags: ["CSS"]
---

# はじめに

このブログのCSSフレームワークをBulmaからTailwind CSSに変更しました。

いろんなところでTailwind CSSという言葉を見かけていたのがきっかけに興味を持ち、勉強がてら変更しようと思い立って変更しました。  
いわゆるCSSフレームワークとは違い、`.button`のようなコンポーネントは用意されていません。`border`や`font-bold`のようなユーティリティなクラスが用意されています。  
CSSのエイリアスとしてクラスが用意されている、BootstrapやBulmaよりも低レイヤーなフレームワークというイメージです。  
そのため、いわゆるフレームワークよりはCSS自体の知識が求められます。

# 使ってみた感想

低レイヤーなフレームワークなので、Bulmaよりも柔軟にコンポーネントを変更できるのが良いです。  
Bulmaだと、ボタンコンポーネントをイジりたいとなるとBulmaのCSSから上書きする形で自前のCSSを適応することになります。  
Tailwind CSSであれば、イチからつくるので最初の作り始めるコストはありますが、変更に強いコンポーネントにできます。

## tailwindcss-typography

MarkdownからレンダリングされるHTMLに対するスタイル適応は[tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography)を使いました。  
が、これがイマイチでところどころ納得いかないUIでした。なので、細々とした変更を加えています。  
変更せずともいい感じでスタイルがあたってほしいです。

### Prism.jsと相性が悪い

tailwindcss-typographyはPrism.jsと相性が悪いです。  
気に入らない部分はtailwind.config.jsで設定していくのですが、シンタックスハイライト部分（codeタグ）のスタイルはPrism.jsが上書きしてしまいます。  
Prism.jsのスタイルを上書きするために直接CSSを書いています。

## 学習コスト

[Tailwindに変更するPR](https://github.com/70-10/blog/pull/219)のスタートが1月で、完了したのが3月。Tailwindの学習もこのタイミングからスタートしたので学習コストは2ヶ月ほどでした。  
そこまでコストは高くないのかなあという印象です。
