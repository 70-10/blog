---
title: VitestでMSWを使ってAPIモックする
publishDate: "2023-03-14T17:47:00+09:00"
tags: ["Test", "Node.js"]
---

# Node.js のプロジェクトに `vitest` と `msw` をインストールする

はじめに Node.js のプロジェクトを作成します。

```:Terminal
npm init -y
```

つぎに `vitest` と `msw` をインストールします。

```:Terminal
npm install -D vitest msw
```

# テスト用の関数を作成

テストをする関数を作成します。  
今回は `https://example.com` にリクエストするだけの関数を用意します。

```ts:sample.ts
export function fetchExample() {
  return fetch("https://example.com");
}
```

# テストを作成する

さきほど作成した sample.ts の `fetchExample()` をテストするファイルを作成します。

```ts:sample.test.ts
import { expect, test } from "vitest";
import { fetchExample } from "./sample";

test("use msw", async () => {
  const res = await fetchExample();

  expect(await res.json()).toEqual({ text: "hello, world" });
});
```

このままだと、 `https://example.com` から `{ text: "hello, world" }` は返ってこないので、テストは失敗します。  
つぎは msw でレスポンスを変更します。

# setup ファイルで msw を設定する

vitest の setup ファイルを作成し、msw を呼び出します。  
まず setup ファイルから呼び出す server.ts を作成します。

```ts:server.ts
import { rest } from "msw";
import { setupServer } from "msw/node";

const restHandlers = [
  rest.get("https://example.com", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ text: "hello, world" }));
  }),
];

export const server = setupServer(...restHandlers);
```

server.ts では msw の `setupServer` を使って API のモックを作成しています。  
`setupServer` の引数にモックしたい API エンドポイントを定義しています。  
今回は `https://example.com` の GET リクエストしたときに `{ text: "hello, world" }` を返すように変更しています。

つぎに、server.ts を呼び出す vitest.setup.ts を用意します。

```ts:vitest.setup.ts
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

すべてのテストの前に server を起動、テストケースがひとつ終わるたびにリセット、すべてのテストが終わったら server を終了させています。

さいごに、 vitest.setup.ts を vitest.config.ts から読み込むようにします。

```ts:vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

# テストを実行

テストを実行します。

```:Terminal
npx vitest
```

無事テストが通ります。

# テストケースごとにモックを変更する

つぎに、テストケースごとにレスポンスを書き換えてみます。  
さきほど作成した sample.test.ts に テストを追加します。

```ts:sample.test.ts
import { rest } from "msw";
import { expect, test } from "vitest";
import { fetchExample } from "./sample";
import { apiEndpoint, server } from "./server";

test("use msw", async () => {
  const res = await fetchExample();

  expect(await res.json()).toEqual({ text: "hello, world" });
});

test("custom response", async () => {
  // Setup
  server.use(
    rest.get("https://example.com", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ text: "hello, msw" }));
    })
  );

  const res = await fetchExample();

  expect(await res.json()).toEqual({ text: "hello, msw" });
});
```

2 つ目のテストケースではレスポンスを `{ text: "hello, msw" }` に変更しています。

# msw の URL 指定の煩わしさを少し解消する

レスポンスを変更する際に毎回ドメインから指定するのが面倒なので、パス指定のみで設定できるように修正します。  
[MSW の Issue に上がっていたコメント](https://github.com/mswjs/msw/issues/397#issuecomment-751230924)のアイデアを拝借します。

```ts:server.ts
import { rest } from "msw";
import { setupServer } from "msw/node";

// https://github.com/mswjs/msw/issues/397#issuecomment-751230924
export const apiEndpoint = (path: string) =>
  new URL(path, "https://example.com").toString();

const restHandlers = [
  rest.get(apiEndpoint("/"), (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ text: "hello, world" }));
  }),
];

export const server = setupServer(...restHandlers);
```

`apiEndpoint(path: string)` を用意することで毎回ドメイン指定をする手間を省いています。
