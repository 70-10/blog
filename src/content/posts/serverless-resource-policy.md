---
title: Serverless Frameworkでリソースポリシーを使ってホワイトリスト・ブラックリストを設定する
publishDate: 2018-09-04T10:00:00+09:00
tags: ["Develop"]
draft: false
---

# はじめに

Serverless Framework の v1.28.0 から[API Gateway のリソースポリシーを設定できるようになりました](https://github.com/serverless/serverless/pull/5071)。  
リソースポリシーは、API エンドポイントに対して IP によるアクセス制御が行えます。

API エンドポイント全体に対して設定したり、特定のエンドポイントのみといった細かな設定ができます。IP は範囲指定などが設定できます。

今回はそのリソースポリシーを使ってホワイトリストとブラックリストそれぞれを設定します。行う設定は以下の 3 パターンです。

1. ホワイトリストを設定する
2. ブラックリストを設定する
3. ホワイトリストとブラックリスト両方を設定する

## 準備：API エンドポイントを用意する

リソースポリシーの設定するエンドポイント、 `GET /hello` と `GET /world` を用意します。

**serverless.yml**

```yaml
service: resource-policy-sample
frameworkVersion: ">=1.28.0"

provider:
  name: aws
  runtime: nodejs8.10
  region: ap-northeast-1

functions:
  hello:
    handler: handler.hello
    events:
      - http: GET /hello
  world:
    handler: handler.world
    events:
      - http: GET /world
```

**handler.js**

```javascript
"use strict";

module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello",
    }),
  };
};

module.exports.world = async (event, context) => {
  return {
    statuCode: 200,
    body: JSON.stringify({
      message: "world",
    }),
  };
};
```

ここにリソースポリシーの設定を実装していきます。

# 1. ホワイトリストを設定する

`GET /hello` に対してホワイトリストを設定します。

`serverless.yml` の `provider` に `resoucePolicy`を定義することでリソースポリシーを利用できます。

```yaml
provider:
  name: aws
  runtime: nodejs8.10

  resourcePolicy:
    - Effect: Allow
      Principal: "*"
      Action: execute-api:Invoke
      Resource:
        - execute-api:/*/GET/hello
      Condition:
        IpAddress:
          aws:SourceIp:
            - "123.123.123.123"
```

この例の場合では `123.123.123.123` がホワイトリストに追加されます。  
`Resource` に `execute-api:/{stage}/{method}/{path}` という形式でエンドポイントを設定できます。すべての stage, method, path に対して設定する場合は `execute-api:/*/*/*` と設定します。

## 検証 1: `123.123.123.123` からアクセスする

`123.123.123.123` からアクセスした場合は正常にレスポンスが返されます。

```
» curl https://**********.execute-api.ap-northeast-1.amazonaws.com/dev/hello
{"message":"hello"}
```

## 検証 2: `123.123.123.123` 以外からアクセスする

`123.123.123.123` 以外の IP からアクセスした場合は 403 が返されます。

```
» curl https://**********.execute-api.ap-northeast-1.amazonaws.com/dev/hello
{
Message: "User: anonymous is not authorized to perform: execute-api:Invoke on resource: arn:aws:execute-api:ap-northeast-1:************:**********/dev/GET/hello with an explicit deny"
}
```

# 2. ブラックリストを設定する

ブラックリストを設定する場合は、さきほどのホワイトリストの設定を `Effect: Deny` に変更するだけです。

```yaml
provider:
  name: aws
  runtime: nodejs8.10

  resourcePolicy:
    - Effect: Deny # Allow → Deny に変更するだけでブラックリストになる
      Principal: "*"
      Action: execute-api:Invoke
      Resource:
        - execute-api:/*/GET/hello
      Condition:
        IpAddress:
          aws:SourceIp:
            - "123.123.123.123"
```

アクセス結果はホワイトリストと逆になります。  
`123.123.123.123` からのアクセスには 403 を返し、それ以外のアクセルには正常なレスポンスを返します。

# 3. ホワイトリストとブラックリスト両方を設定する

すべてのエンドポイント ( `execute-api:/*/*/*` ) に対してホワイトリストを、 `GET /world` にブラックリストを設定します。

```yaml
service: resource-policy-sample
frameworkVersion: ">=1.28.0"

provider:
  name: aws
  runtime: nodejs8.10
  region: ap-northeast-1

  resourcePolicy:
    - Effect: Allow
      Principal: "*"
      Action: execute-api:Invoke
      Resource:
        - execute-api:/*/*/*
      Condition:
        IpAddress:
          aws:SourceIp:
            - "123.123.123.123"
    - Effect: Deny
      Principal: "*"
      Action: execute-api:Invoke
      Resource:
        - execute-api:/*/GET/world
      Condition:
        IpAddress:
          aws:SourceIp:
            - "123.123.123.123"

functions:
  hello:
    handler: handler.hello
    events:
      - http: GET /hello
  world:
    handler: handler.world
    events:
      - http: GET /world
```

この場合、それぞれの IP から `GET /hello` と `GET /world` にアクセスするとどうなるでしょうか。

## 結果

結果は、`GET /hello` には `123.123.123.123` のみがアクセスでき、`GET /world` にはどの IP からもアクセスできなくなります。

| リクエスト先 | 123.123.123.123 | それ以外の IP |
| :----------: | :-------------: | :-----------: |
|  GET /hello  |        ○        |       ☓       |
|  GET /world  |        ☓        |       ☓       |

- `GET /hello`
  - `123.123.123.123` は正常にレスポンスを返す （ホワイトリスト設定）
  - その他の IP からは 403 を返す （ブラックリスト設定）
- `GET /world`
  - `123.123.123.123` は 403 を返す （ブラックリスト設定）
  - その他の IP 設定からは 403 を返す （ホワイトリスト設定）

# 参考ドキュメント

リソースポリシーの設定に関する詳細は AWS のドキュメントを読みましょう。

https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-resource-policies-examples.html

Serverless Framework での設定方法は以下のページに記載されています。

https://serverless.com/framework/docs/providers/aws/events/apigateway#resource-policy

今回実装したソースコードはこちらにコミットしてあります。

https://github.com/70-10/sandbox/tree/master/node/serverless/resource-policy

# おわりに

リソースポリシーによって、簡単にホワイトリスト・ブラックリストの設定ができました。 Serverless Framework では `serverless.yaml` に数行書くだけで簡単に設定できます。  
Serverless Framework は内部で CloudFormation を使っています。  
新機能がリリースされても CloudFormation が対応しないと利用できないという欠点はありますが、自分で CloudFormation のスタックを書くよりも簡単です。

また、リクエストする IP が限定された API サービスであれば、API キーを使うよりも簡単にアクセス制御できます。
