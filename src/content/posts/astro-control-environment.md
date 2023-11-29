---
title: Astroで環境変数に応じてコンポーネント表示制御をする
publishDate: 2023-02-17
tags: ["Web Frontend"]
draft: false
---

Google Analytics の script タグは本番でのみ動くようにしたいです。  
script タグを開発時やプレビューのときは除き、本番ビルド時だけ埋め込まれる仕組みをつくります。

## 実装イメージ

```astro
<ProductionOnly>
  <span>本番用ビルド時のみ表示される</span>
</ProductionOnly>
```

## 実行方法による NODE_ENV の違い

Astro は 実行方法によって `NODE_ENV` が変わります。  
`astro dev` は `development` 、 `astro build` は `production` が設定されます。  
自身で `NODE_ENV` の指定もできます。

```
$ astro dev
// NODE_ENV => development

$ astro build
// NODE_ENV => production

$ NODE_ENV=development astro build
// NODE_ENV => development
```

つまり、 `NODE_ENV` が `production` のときのみ表示される仕組みが必要です。

## `isProduction` を実装する

`NODE_ENV` が `production` のとき true を返す変数を作ります。

```ts:src/lib/environments.ts
const isProduction = process.env.NODE_ENV === "production"
```

## `<ProductionOnly>` を実装する

`src/components/ProductionOnly.astro` を用意します。  
`isProduction` が true のときだけ `<slot />` をレンダリングします。

```astro:src/components/ProductionOnly.astro
---
import { isProduction } from "../lib/environments";
---

{isProduction && <slot />}
```

## 完成形

```astro:src/pages/index.astro
---
import ProductionOnly from "../components/ProductionOnly.astro`
---
<ProductionOnly>
  <span>本番用ビルド時のみ表示される</span>
</ProductionOnly>
```
