---
title: Astro 5 にアップデートした
publishDate: 2024-12-21T09:09:52.289+09:00
tags: ["Web Frontend", "Develop", "JavaScript"]
---

このブログを Astro 5 にアップデートしました。

アップデート内容は [Upgrade to Astro v5 | Docs](https://docs.astro.build/en/guides/upgrade-to/v5/) にまとめられています。

# このブログの Astro 5 アップデート対応まとめ

アップデートで対応した内容は以下の 5 つ。

1. Astro 関連のパッケージをアップグレード
2. Content Collections API から Content Layer API への移行
3. `post.slug` から `post.id` への変更
4. `post.render()` を `render(post)` へ変更
5. `src/env.d.ts` の削除と `tsconfig.json` の更新

## 1. Astro 関連のパッケージをアップグレード

以下のコマンドでパッケージを最新バージョンにアップグレードしました。

```
pnpm add -E @astrojs/partytown@latest @astrojs/rss@latest @astrojs/tailwind@latest astro@latest @astrojs/react@latest
```

## 2. Content Collections API から Content Layer API への移行

Astro v2 から使用されていた Content Collections API は終了し、Content Layer API に移行しました。この変更により、パフォーマンスが向上するとのことです。

Content Collections API では `src/content` にコンテンツを配置する必要がありましたが、Content Layer API では自由な配置が可能になりました。そのため、`src/content.config.ts` でコンテンツの場所を指定する必要があります。

主な対応は以下の通りです。

- `src/content/config.ts` を `src/content.config.ts` に移動
- Content の loader を設定

## 3. `post.slug` から `post.id` への変更

`slug` を `id` に変更しました。

## 4. `post.render()` を `render(post)` へ変更

`render()` が `astro:content` パッケージに移動したため、`post.render()` を `render(post)` に書き換えました。

## 5. `src/env.d.ts` の削除と `tsconfig.json` の更新

Astro 5 では、型参照に `.astro/types.d.ts` を使用し、`tsconfig.json` で `include` と `exclude` を設定する方法が推奨されています。  
また、`astro sync` で `src/env.d.ts` が不要になり、作成や更新が行われなくなりました。
