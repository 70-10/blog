---
title: serverless-webpackでNODE_ENVを設定する
publishDate: 2019-06-20T22:16:00+09:00
tags: ["Develop"]
draft: false
---

# はじめに

serverless-offline と serverless-webpack を使用しているプロジェクトで、正しく`NODE_ENV`が設定できませんでした。  
この記事では原因と解決方法をまとめます。

# 困ったこと

serverless-webpack でビルドし、`serverless offline` を実行しても`NODE_ENV`が正しく設定できませんでした。  
serverless.yml で以下のように`NODE_ENV=DEV`を指定しているにもかかわらず、 `NODE_ENV=Development`と設定されてしまいました。

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

webpack はビルド時に`NODE_ENV`と`DEBUG`の 2 つにデフォルトの値を設定します。
(`NODE_ENV=Development`, `DEBUG=false`)

Lambda ファンクション実行時は `NODE_ENV=DEV` となります。  
ビルド時にデフォルト値の Development が設定されるため、ビルド後のコードには `NODE_ENV=Development` が埋め込まれます。  
そのため、実行時に正しく指定できていませんでした。

# 解決方法

ビルド時に NODE_ENV の値を設定することで解決できました。  
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

(`slsw.lib.serverless.service.provider.environment`は serverless.yml で定義した Environment がオブジェクト形式で取得できます)

# 参考 URL

https://webpack.js.org/plugins/environment-plugin/
