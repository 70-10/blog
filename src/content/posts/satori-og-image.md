---
title: Astroでsatoriを使ったOG画像生成
publishDate: 2023/03/01
tags: ["Web Frontend"]
draft: false
---

[@vercel/satori](https://github.com/vercel/satori) と [sharp](https://sharp.pixelplumbing.com/)を使って、Astro で記事ごとに OG 画像を自動で生成する仕組みを作りました。

以下のように画像が表示されます。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Astro を色々試している。<a href="https://t.co/FhdsdfdTRw">https://t.co/FhdsdfdTRw</a></p>&mdash; 70_10 (@70_10) <a href="https://twitter.com/70_10/status/1626562972570251264?ref_src=twsrc%5Etfw">February 17, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

# satori とは

`@vercel/satori` とは、HTML/CSS を SVG に変換するツールです。  
[`@vercel/og`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation) という、動的に OG 画像を生成するライブラリの中で使用されています。

# Astro で OG 画像を生成する方法

1. OG 画像用の HTML を作成
2. satori で HTML を SVG に変換
3. sharp で SVG から PNG に変換
4. PNG を [静的ファイルエンドポイント](https://docs.astro.build/core-concepts/endpoints/#static-file-endpoints)として配信
5. meta データの `og:image` に OG 画像の URL を指定

# 対応

## 1. 必要なパッケージのインストール

OG 画像生成に必要なパッケージ、 `@vercel/satori` と `sharp` をインストールします。

```
npm install @vercel/satori sharp
```

## 2. Astro に React を追加

OG 画像にする HTML を jsx で書くため、Astro に React を導入します。

```
npx astro add react
```

## 3. `pages/og/[slug].png.ts` を作成

Astro の静的ファイルエンドポイントとして `pages/og/[slug].png.ts` を作成します。

OG 画像を生成する、 `getOgImage(title: string)` の作成は次の工程で行います。

```ts:src/pages/og/[slug].png.ts
export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

export async function get({ params, request }) {
  const post = await getEntryBySlug("posts", params.slug);

  const body = await getOgImage(post?.data.title as string);

  return {
    body,
    encoding: "binary",
  };
}
```

## 4. `getOgImage(title: string)` を作成

```tsx:src/components/OgpImage.tsx
export async function getOgImage(text: string) {
  const fontData = (await getFontData()) as ArrayBuffer;

  const svg = await satori(
    <main
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <section>
        <h1>{text}</h1>
      </section>
    </main>,
    {
      width: 800,
      height: 400,
      fonts: [
        {
          name: "Noto Sans JP",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
```

### 4.1 OG 画像のフォントの設定

- [satori/font.ts at main · vercel/satori](https://github.com/vercel/satori/blob/main/playground/pages/api/font.ts) を参考にフォント設定

```ts
async function getFontData() {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700`;

  const css = await (
    await fetch(API, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) return;

  return await fetch(resource[1]).then((res) => res.arrayBuffer());
}
```

## 5. meta データの設定

今回は `astro-seo` を使って設定した。

```tsx
<SEO
  title={`${title} | Blog`}
  charset="UTF-8"
  openGraph={{
    basic: {
      title,
      type: seo.openGraph.type,
      image: seo.openGraph.image ?? "",
    },
    article: {
      authors: ["70_10"],
    },
    image: {
      alt: title,
    },
  }}
  twitter={{
    card: "summary_large_image",
    title,
    creator: "@70_10",
  }}
  extend={{
    link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    meta: [
      { name: "viewport", content: "width=device-width" },
      { name: "generator", content: Astro.generator },
      { name: "format-detection", content: "telephone=no" },
    ],
  }}
/>
```

# 参考記事

- [HTML/CSS を SVG に変換する Vercel 製のパッケージ「satori」を試してみる](https://zenn.dev/kou_pg_0131/articles/satori-usage)
- [Next.js Conf 2022 で最も感動したライブラリ、vercel/satori について紹介させてください。 - commmune Engineer Blog](https://tech.commmune.jp/entry/2023/01/24/113000)
- [Satori + SvelteKit で OGP 画像を自動生成する](https://azukiazusa.dev/blog/satori-sveltekit-ogp-image/)
