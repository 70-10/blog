---
title: Astroで環境変数に応じてコンポーネント表示制御をする
publishDate: 2023/02/16
tags: ["Web Frontend", "Astro"]
draft: true
---

Google Analytics の script タグは本番環境でのみ動くようにしたいです。開発時やプレビュー状態のときは script タグを除きたいです。

- `astro dev` は `process.env.NODE_ENV` は `development` に設定される
- `astro build` は `process.env.NODE_ENV` は `production` に設定される
- `development` か `production` かで表示制御をすればよい
- `const isProduction = process.env.NODE_ENV === "production"` を用意する

```ts:src/lib/environments.ts
const isProduction = process.env.NODE_ENV === "production"
```

```astro:src/component/ProductionOnly.astro
---
import { isProduction } from "../lib/environments";
---

{isProduction && <slot />}
```

本番環境でのみ表示させたいものに対して以下のように設定すればよい。

```astro:例）GoogleAnalytisを本番環境のみ表示する
<ProductionOnly>
  <GoogleAnalytics>
</ProductionOnly>
```
