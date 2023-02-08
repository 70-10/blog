---
title: serverless-webpackでNODE_ENVを設定する
publishDate: 2019-06-20T22:16+09:00
tags: ["Serverless Framework"]
---

# はじめに

serverless-offlineとserverless-webpackを使用しているプロジェクトで、正しく`NODE_ENV`が設定できませんでした。  
この記事では原因と解決方法をまとめます。

# 困ったこと

serverless-webpackでビルドし、`serverless offline` を実行しても`NODE_ENV`が正しく設定できませんでした。  
serverless.ymlで以下のように`NODE_ENV=DEV`を指定しているにもかかわらず、 `NODE_ENV=Development`と設定されてしまいました。

```yaml:serverless.yml
.
.
.
plugins:
  - serverless-webpack
  - serverless-offline

provider:
  name: aws
  runtime: nodejs10.x
  stage: DEV
  region: ap-northeast-1
  environment:
    NODE_ENV: DEV
.
.
.
```

# 原因

webpackはビルド時に`NODE_ENV`と`DEBUG`の2つにデフォルトの値を設定します。
(`NODE_ENV=Development`, `DEBUG=false`)

Lambdaファンクション実行時は `NODE_ENV=DEV` となります。  
ビルド時にデフォルト値のDevelopmentが設定されるため、ビルド後のコードには `NODE_ENV=Development` が埋め込まれます。  
そのため、実行時に正しく指定できていませんでした。

# 解決方法

ビルド時にNODE_ENVの値を設定することで解決できました。  
webpack.config.js で EnvironmentPlugin が設定可能です。

```js:webpack.config.js
const webpack = require("webpack");
module.exports = {
  .
  .
  .
plugins: [new webpack.EnvironmentPlugin(slsw.lib.serverless.service.provider.environment)],
  .
  .
  .
}
```

(`slsw.lib.serverless.service.provider.environment`はserverless.ymlで定義したEnvironmentがオブジェクト形式で取得できます)

# 参考URL

[EnvironmentPlugin | webpack](https://webpack.js.org/plugins/environment-plugin/)
