---
title: Remix on Cloudflare Pages で SSRの練習
publishDate: 2024-02-11T14:56:35.286+09:00
tags: ["Develop", "Web Frontend"]
---

Cloudflare Pages 上に Remix で SSR アプリケーションを作成します。  
`GET /pokemon/{図鑑番号}` にアクセスすると、ポケモンの名前と画像が表示されるという簡単なページの作成を目指します。

Cloudflare が用意しているドキュメントを参考に進めます。

https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/

# 1. プロジェクトの作成

プロジェクトを作成します。 Cloudflare が用意しているプロジェクトテンプレートを使います。

```terminal
npm create cloudflare@latest remix-ssr-sample-app -- --framework=remix
```

プロジェクトが作成できたら、まずはローカル実行してみます。

```terminal
cd remix-ssr-sample-app
npm run dev
```

以下のようなページが表示されます。

| ![Hello World](../images/ssr-remix-on-cloudflare-pages/hello-world.png) |
| ----------------------------------------------------------------------- |

# 2. 最初のデプロイ

```
npm run pages:deploy
```

デプロイが正しくできるとデプロイ完了後に表示される URL からアクセスできます。URL は `https://{プロジェクト名}.pages.dev` という形式になります。  
プロジェクト名がそのままサブドメインになります。すでに同じ名前のものが存在する場合は、別名になると思われます。

**_メモ_** :  
デプロイ直後にアクセスしても、すぐにはページが表示されませんでした。  
何分か経過してからようやくアクセスできるようになりました。SSG とは違い、SSR はデプロイ反映に少し時間がかかるようです。

# 3. PokéAPI を使ったページの作成

https://pokeapi.co/

`https://pokeapi.co/api/v2/pokemon/{ずかん番号 or ポケモンの英語名}` でポケモンのデータを取得できます。  
ピカチュウのデータを取得する場合は、`GET /api/v2/pokemon/25` もしくは `GET /api/v2/pokemon/pikachu` です。

Remix で API からデータを取得する場合、 `LoaderFunction` と `useLaoderData` を使います。  
`LoaderFunction` 内で PokéAPI を呼び出し、取得したデータを返します。コンポーネント内からは `useLoaderData` を介して取得したデータにアクセスできます。

```tsx:./app/routes/pokemon.$id.tsx
import { LoaderFunction, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

interface Pokemon {
  name: string;
  sprites: {
    front_default: string;
  };
}

export const loader: LoaderFunction = async ({ params }) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch pokemon");
  }

  const data = await res.json<Pokemon>();

  return json(data);
};

export default function PokemonPage() {
  const pokemon = useLoaderData<Pokemon>();

  return (
    <div>
      <h1>{pokemon.name}</h1>
      <img
        src={pokemon.sprites.front_default}
        alt={`Sprite of ${pokemon.name}`}
      />
    </div>
  );
}
```

# 4. デプロイ

再度デプロイします。

```
npm run pages:deploy
```

`https://{プロジェクト名}.pages.dev/pokemon/1000` にアクセスすると、サーフゴーが表示されます。

| ![alt text](../images//ssr-remix-on-cloudflare-pages/gholdengo.png) |
| ------------------------------------------------------------------- |

こんなに簡単に SSR アプリを作成・デプロイできてしまうのは感動があります。
