---
title: Next.jsでAPIをリクエストする
publishDate: 2023-05-02T13:02:00+09:00
tags: ["Web Frontend", "Next.js"]
---

Next.js で API リクエストを行う方法 3 つのパターン例をまとめます。  
それぞれの方法で、[PokeAPI](https://pokeapi.co/) を使ってピカチュウの情報を取得してみます。

# API にリクエストする 3 つのパターン

1. CSR (Client-side Rendering)
   - ページのレンダリングをブラウザで行う
   - API リクエストはブラウザから行われる
2. SSR (Server-side Renderring)
   - ページのレンダリングをサーバーで行う
   - API リクエストはサーバーから行われる
3. SSG (Static-site Generation)
   - ページのレンダリングをビルド時に行う
   - API リクエストはビルドを実行処理のなかで行われる

PokeAPI でピカチュウの情報を取得するサンプルアプリ。

# 1. CSR (Client-side Rendering)

```tsx
import type { Pokemon } from "@/models/pokemon";
import useSWR from "swr";

const pokeapiUrl = "https://pokeapi.co/api/v2/pokemon/25";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CSR() {
  const { data, error, isLoading } = useSWR<Pokemon>(pokeapiUrl, fetcher);

  return (
    <main>
      <h2>CSR (Client-side Rendering)</h2>
      {error && <p>Failed to load</p>}
      {isLoading && <p>Loading...</p>}
      {data && (
        <p>
          {data.id}: {data.name}
        </p>
      )}
    </main>
  );
}
```

# SSR (Server-side Renderring)

```tsx
import type { Pokemon } from "@/models/pokemon";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

const pokeapiUrl = "https://pokeapi.co/api/v2/pokemon/25";

interface Props {
  pokemon: Pokemon;
}

export default function SSR({
  pokemon,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main>
      <h2>SSR (Server-side Rendering)</h2>
      <p>
        {pokemon.id}: {pokemon.name}
      </p>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const res = await fetch(pokeapiUrl);
  const pokemon = (await res.json()) as Pokemon;

  return {
    props: {
      pokemon,
    },
  };
};
```

# SSG (Static-site Generation)

```tsx
import type { Pokemon } from "@/models/pokemon";
import type { GetStaticProps, InferGetStaticPropsType } from "next";

const pokeapiUrl = "https://pokeapi.co/api/v2/pokemon/25";

interface Props {
  pokemon: Pokemon;
}

export default function SSG({
  pokemon,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <main>
      <h2>SSG (Static-site Generation)</h2>
      <p>
        {pokemon.id}: {pokemon.name}
      </p>
    </main>
  );
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const res = await fetch(pokeapiUrl);
  const pokemon = (await res.json()) as Pokemon;

  return {
    props: {
      pokemon,
    },
  };
};
```
