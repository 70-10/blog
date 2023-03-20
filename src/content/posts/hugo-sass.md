---
title: HugoでSass/Scssを使う
publishDate: 2018-08-26T21:01:00+09:00
tags: ["Web Frontend", "CSS"]
draft: false
---

# はじめに

Hugo が v0.43 から[Sass/Scss をサポートしたので](https://gohugo.io/hugo-pipes/scss-sass/)、この機能を使ってブログのデザインを変更しました。  
設定方法や、困ったことなどをまとめます。

## _注意_ （2018/08/26 時点）

**Netlify は Hugo の extended をフォローしておらず、Sass/Scss のビルド機能が利用できません。**  
ワークアラウンド対応を本記事の最後に記載しています。

# Hugo で Sass/Scss を使う

まずは、`assets/scss/`に Scss ファイルを用意します。（本記事では`assets/scss/main.scss`を用意）  
テンプレートで以下のように定義することで利用できます。

```html
{{ $styles := resources.Get "scss/main.scss" | toCSS | postCSS | minify |
fingerprint }}
<link
  rel="stylesheet"
  href="{{ $styles.Permalink }}"
  integrity="{{ $styles.Data.Integrity }}"
  media="screen"
/>
```

ファイルに対する処理をパイプで書き連ねられます。この例では以下の順番で処理しています。

1. CSS に変換
2. PostCSS を実行
3. minify を実行
4. fingerprint を生成

## PostCSS を使う場合

PostCSS を使う場合は`postcss-cli`モジュールが必要です。先にインストールしておきましょう。

```
$ npm install -g postcss-cli
```

## ビルドをする

ビルドはいつもどおり`hugo`コマンドを実行するだけで OK です。  
ビルドが成功すると、`resources`ディレクトリに css ファイルが出来上がります。

# Netlify でデプロイできない問題が発生

v0.43 以降から Sass のビルドができるようになりましたが、利用するためには Hugo の extended バージョンが必要です。

❌: `v0.46`  
⭕: `v0.46/extended`

Netlify では extended バージョンがまだサポートされていないためビルドが行えません。

## 関連 Issue

https://github.com/netlify/build-image/issues/182

## Netlify でデプロイするためのワークアラウンド

ビルドして生成される[`resources`ディレクトリを一時的にコミットすることで対応しました](https://github.com/70-10/blog/commit/8ee2b8fb9f4a55a05f28bfbe224fa81f2e29fa38)。  
こうすることでビルド時に resources の生成がパスされるようになりデプロイが通ります。

# おわりに

Sass/Scss が使えるようになったことで、より使いやすくなりました。  
この機能が使えるのは v0.43 以降の extended バージョンのみです。そして、Netlify ではまだ extended バージョンがサポートされていないため、先に`resources`ディレクトリを含めておく必要がありました。
