---
title: BulmaからTailwind CSSに乗り換えた
publishDate: 2021-03-04T14:27:00+09:00
tags: ["Web Frontend"]
draft: false
---

# はじめに

このブログの CSS フレームワークを Bulma から Tailwind CSS に変更しました。

いろんなところで Tailwind CSS という言葉を見かけていたのがきっかけに興味を持ち、勉強がてら変更しようと思い立って変更しました。  
いわゆる CSS フレームワークとは違い、`.button`のようなコンポーネントは用意されていません。`border`や`font-bold`のようなユーティリティなクラスが用意されています。  
CSS のエイリアスとしてクラスが用意されている、Bootstrap や Bulma よりも低レイヤーなフレームワークというイメージです。  
そのため、いわゆるフレームワークよりは CSS 自体の知識が求められます。

# 使ってみた感想

低レイヤーなフレームワークなので、Bulma よりも柔軟にコンポーネントを変更できるのが良いです。  
Bulma だと、ボタンコンポーネントをイジりたいとなると Bulma の CSS から上書きする形で自前の CSS を適用することになります。  
Tailwind CSS であれば、イチからつくるので最初の作り始めるコストはありますが、変更に強いコンポーネントを作成できます。

## tailwindcss-typography

Markdown からレンダリングされる HTML に対するスタイル適応は[tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography)を使いました。  
が、これがイマイチでところどころ納得いかない UI でした。なので、細々とした変更を加えています。  
変更せずともいい感じでスタイルがあたってほしいです。

### Prism.js と相性が悪い

tailwindcss-typography は Prism.js と相性が悪いです。  
気に入らない部分は tailwind.config.js で設定していくのですが、シンタックスハイライト部分（code タグ）のスタイルは Prism.js が上書きしてしまいます。  
Prism.js のスタイルを上書きするために直接 CSS を書いています。

## 学習コスト

[Tailwind に変更する PR](https://github.com/70-10/blog/pull/219)のスタートが 1 月で、完了したのが 3 月。Tailwind の学習もこのタイミングからスタートしたので学習コストは 2 ヶ月ほどでした。  
そこまでコストは高くないのかなあという印象です。
