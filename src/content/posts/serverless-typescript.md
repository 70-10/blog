---
title: Serverless FrameworkのTypeScriptプロジェクト作成と初期設定まとめ
publishDate: 2018-08-29T23:16:00+09:00
tags: ["AWS", "Serverless Framework", "TypeScript"]
draft: false
---

# はじめに

Serveless Framework の TypeScript プロジェクトの作成からローカルで実行するまでの設定についてまとめます。

# プロジェクトを作成〜ローカル実行するまでの手順

Serverless Framework のテンプレートからプロジェクトを作成してから、追加で設定するまでのステップは 4 つです。

1. serverless コマンドでテンプレートプロジェクトを作成する
2. `serverless.yml`に stage と region を設定する
3. handler を callback パターンから async/await パターンに変更する
4. `serverless-offline`を使ってローカルで実行する

## 1. テンプレートからプロジェクトを作成する

`aws-nodejs-typescript`テンプレートを使って、今回は ts-smple という名前のプロジェクトを作成します。

```
$ serverless create -t aws-nodejs-typescript -n ts-sample
```

## 2. `serverless.yml`に`stage`と`region`を設定する

初期状態では、`stage`と`region`は設定されていません。ここでは`stage=dev`、`region=ap-northeast-1`を設定します。

```yaml
provider:
name: aws
runtime: nodejs8.10
stage: dev // この行を追記
region: ap-northeast-1 // この行を追記
```

## 3. handler を callback パターンから async/await パターンに変更する

デフォルトでは callback スタイルで実装されています。これを async/await に変更します。

```typescript
import {
  APIGatewayEvent,
  Context,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";

export const hello: Handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message:
        "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
      input: event,
    }),
  };

  return response;
};
```

## 4. `serverless-offline`を使ってローカルで実行する

`npm run dev`で、`serverless-offline`を使ったローカル実行するようにします。`serverless-offline`はローカルで API Gateway + Lambda をエミュレートするプラグインです。  
HTTP リクエストをトリガーとしない（API Gateway を利用しない）場合は`serverless-offline`の導入は不要です。`serverless invoke local -f <function>`の実行で十分です。

```
$ npm install -D serverless serverless-offline
```

**serverless.yml**

```yaml
plugins:
  - serverless-webpack
  - serverless-offline // この行を追記
```

**package.json**

```json
{
  "script": {
    "dev": "serverless offline" // この行を追記
  }
}
```

`npm run dev`を実行すると 3000 番ポートで起動します。

```
» npm run dev

> aws-nodejs-typescript@1.0.0 dev /path/to/ts-sample
> serverless offline

Serverless: Bundling with Webpack...
Time: 1679ms
Built at: 2018-08-07 00:19:59
Asset Size Chunks Chunk Names
handler.js 130 KiB handler [emitted] handler
handler.js.map 145 KiB handler [emitted] handler
Entrypoint handler = handler.js handler.js.map
[./handler.ts] 940 bytes {handler} [built][./node_modules/buffer-from/index.js] 1.56 KiB {handler} [built][./node_modules/source-map-support/source-map-support.js] 17.1 KiB {handler} [built][./node_modules/source-map/lib/base64-vlq.js] 4.6 KiB {handler} [built][./node_modules/source-map/lib/quick-sort.js] 3.53 KiB {handler} [built][0] multi ./source-map-install.js ./handler.ts 40 bytes {handler} [built][./node_modules/source-map/lib/source-map-consumer.js] 39.6 KiB {handler} [built][./node_modules/source-map/lib/source-map-generator.js] 14 KiB {handler} [built][./node_modules/source-map/lib/source-node.js] 13.5 KiB {handler} [built][./node_modules/source-map/lib/util.js] 12.6 KiB {handler} [built][./node_modules/source-map/source-map.js] 405 bytes {handler} [built][./source-map-install.js] 41 bytes {handler} [built][fs] external "fs" 42 bytes {handler} [optional][built]
[module] external "module" 42 bytes {handler} [optional][built]
[path] external "path" 42 bytes {handler} [built] + 4 hidden modules
Serverless: Watching for changes...
Serverless: Starting Offline: dev/ap-northeast-1.

Serverless: Routes for hello:
Serverless: GET /hello

Serverless: Offline listening on http://localhost:3000
```

## 動作確認

この状態で`http://localhost:3000/hello`にアクセスし、動作確認を行います。

```
» curl http://localhost:3000/hello | jq .
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed
100 1171 100 1171 0 0 18275 0 --:--:-- --:--:-- --:--:-- 18296
{
"message": "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!",
"input": {
"headers": {
"Host": "localhost:3000",
"User-Agent": "curl/7.54.0",
"Accept": "_/_"
},
"path": "/hello",
"pathParameters": null,
"requestContext": {
"accountId": "offlineContext_accountId",
"resourceId": "offlineContext_resourceId",
"apiId": "offlineContext_apiId",
"stage": "dev",
"requestId": "offlineContext_requestId_014965433097108738",
"identity": {
"cognitoIdentityPoolId": "offlineContext_cognitoIdentityPoolId",
"accountId": "offlineContext_accountId",
"cognitoIdentityId": "offlineContext_cognitoIdentityId",
"caller": "offlineContext_caller",
"apiKey": "offlineContext_apiKey",
"sourceIp": "127.0.0.1",
"cognitoAuthenticationType": "offlineContext_cognitoAuthenticationType",
"cognitoAuthenticationProvider": "offlineContext_cognitoAuthenticationProvider",
"userArn": "offlineContext_userArn",
"userAgent": "curl/7.54.0",
"user": "offlineContext_user"
},
"authorizer": {
"principalId": "offlineContext_authorizer_principalId"
},
"protocol": "HTTP/1.1",
"resourcePath": "/hello",
"httpMethod": "GET"
},
"resource": "/hello",
"httpMethod": "GET",
"queryStringParameters": null,
"stageVariables": null,
"body": null,
"isOffline": true
}
}
```

# おわりに

テンプレートを用いた TypeScript の Serverlee Framework プロジェクトの作成から、ローカルで実行するまでの設定をまとめました。  
テンプレートを`aws-nodejs`に変えれば、JavaScript のプロジェクトで始めることもできます。

ちなみに、serverless-offline はフォローしている言語が限られているようで、2018/08/29 現在、Go はフォローされていませんでした。
