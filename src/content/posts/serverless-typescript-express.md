---
title: Serverless + TypescriptのプロジェクトにExpressを導入する
publishDate: 2019-03-09T17:00+09:00
tags: ["Serverless Framework", "TypeScript"]
draft: false
---

# はじめに

[以前の記事](/2018/08/29/serverless-typescript/)で、Serverless + TypeScript のプロジェクトを作りました。  
今回はそのプロジェクトに Express（と、serverless-http）を導入します。

[リポジトリも用意しました](https://github.com/70-10/serverless-typescript)。

# 導入方法

## Express と serverless-http をインストール

```
$ npm install express serverless-http
```

express を TypeScript で扱うために`@types/express`もインストールします。

```
$ npm install -D @types/express
```

## express + serverless-http を使った handler を`app.ts`に用意

```typescript
import serverless from "serverless-http";
import * as express from "express";
import {
  APIGatewayProxyEvent,
  APIGatewayEventRequestContext,
  Context,
} from "aws-lambda";

interface CustomRequest extends express.Request {
  context: APIGatewayEventRequestContext;
}

const app = express();

app.get("/hello", (req: CustomRequest, res: express.Response) => {
  return res.json({
    input: {
      headers: req.headers,
      body: req.body,
      context: req.context,
      method: req.method,
      params: req.params,
      path: req.path,
    },
  });
});

export const handler = serverless(app, {
  request: (
    req: CustomRequest,
    event: APIGatewayProxyEvent,
    _context: Context
  ) => {
    req.context = event.requestContext;
  },
});
```

リクエストに context 情報を追加するために、express.Router を拡張した`CustomRequest`を定義しています。

## `serverless.yml`の function 定義を更新

```yaml
functions:
  app:
    handler: app.handler
    events:
      - http:
          path: /
          method: ANY
          cors: true
      - http:
          path: /{any+}
          method: ANY
          cors: true
```

以上です。

# Express + serverless-http を使うメリット

## API 開発が容易になる

Express が使えるので開発しやすくなります。  
Express さえ理解していればサーバーレス・Lambda をあまり知らなくても開発できるはずです。

以前 Express + serverless-http を使わずに API を実装したことがありますが、最終的に自前のフレームワークを作り込んでいくことになり辛かったです。

## コールドスタート対策が簡単になる

ひとつの Lambda ファンクションに集約されるので、コールドスタート対応の対象もひとつで済みます。

# Express + serverless-http を使わないメリット

## 影響範囲の分離

API エンドポイントごとに Lambda ファンクションが分かれているので、特定のエンドポイントだけアップデートするといった運用が可能です。

## エラーの検知・調査が楽

エラーが起きたときにそのエンドポイントのファンクションだけ確認・調査するだけで済みます。

# おわりに

Serverless + TypeScript に Express を導入しました。  
中規模なものを開発するのであれば導入していくべきだと感じます。それと同時にログ設計もしっかりしておかないと運用時に辛くなります。
