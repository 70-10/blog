---
title: "Kinesisストリームからのイベントを処理するLambdaをローカルで実行する"
date: 2018-03-16T22:30:30+09:00
draft: false
---

<p></p>

# はじめに

Kinesis ストリームからイベントを処理する Lambda 関数をローカルで実行する環境を構築します。

# 実装する

## ローカルで実行するファンクションを用意する

**handler.js**

{{< highlight js >}}
module.exports.putRecord = (event, context, callback) => {
  const { Records } = event;

  const records = Records.map(r => ({
    data: Buffer.from(r.kinesis.data, "base64").toString("ascii")
  }));

  callback(null, records);
};
{{< /highlight >}}

Kinesis ストリームから取得したレコードを返すだけのものです。

## ローカル環境に Kinesis を立てる

[kinesalite](https://github.com/mhart/kinesalite)というモジュールを使って、ローカル環境に Kinesis を立てます。  
kinesalite 実行後にストリームの作成も行います。

**run-local.js**

{{< highlight js >}}
const kinesalite = require("kinesalite");
const AWS = require("aws-sdk");
const { putRecord } = require("./handler");

const Kinesis = new AWS.Kinesis({
  endpoint: "http://localhost:4567/",
  region: "ap-northeast-1",
  sslEnabled: false
});

function startKinesalite(port) {
  return new Promise((resolve, reject) => {
    const kinesisServer = kinesalite();
    kinesisServer.listen(port, err => (err ? reject(err) : resolve()));
  });
}

async function main() {
  await startKinesalite(4567);

  console.log(`Kinesalite start http://localhost:4567/`);

  await Kinesis.createStream({
    ShardCount: 1,
    StreamName: "sample-stream"
  }).promise();
}

main().catch(console.error);
{{< /highlight >}}

## ローカル Kinesis にレコードが PUT されたときに handler.js の putRecord を実行する

### local-kinesis-lambda-runner について

[@rabblerouser/local-kinesis-lambda-runner](https://github.com/rabblerouser/local-kinesis-lambda-runner)を使います。  
このモジュールに、実行する Lambda ファンクションを引数に渡して実行するだけでローカル実行ができます。

**サンプル**

{{< highlight js >}}
const run = require('@rabblerouser/local-kinesis-lambda-runner');
const lambda = require('./index').handler;

run(lambda);
{{< /highlight >}}

実行時、環境変数に`KINESIS_ENDPOINT`と`STREAM_NAME`を指定する必要があります。

### run-local.js に local-kinesis-lambda-runner を組み込む

**run-local.js**

{{< highlight javascript >}}
const PORT = 4567;
process.env.KINESIS_ENDPOINT = `http://localhost:${PORT}/`;
process.env.STREAM_NAME = "sample-stream";

const run = require("@rabblerouser/local-kinesis-lambda-runner");
const kinesalite = require("kinesalite");
const AWS = require("aws-sdk");
const { putRecord } = require("./handler");

const Kinesis = new AWS.Kinesis({
  endpoint: process.env.KINESIS_ENDPOINT,
  region: "ap-northeast-1",
  sslEnabled: false
});

function startKinesalite(port) {
  return new Promise((resolve, reject) => {
    const kinesisServer = kinesalite();
    kinesisServer.listen(port, err => (err ? reject(err) : resolve()));
  });
}

async function main() {
  await startKinesalite(PORT);

  console.log(`Kinesalite start ${process.env.KINESIS_ENDPOINT}`);

  await Kinesis.createStream({
    ShardCount: 1,
    StreamName: process.env.STREAM_NAME
  }).promise();

  run(putRecord);
}

main().catch(console.error);
{{< /highlight >}}

# 実行する

`run-local.js`を実行すると、以下のように kinesalite と Kinesis のイベントポーリングが起動します。  
あとは、実際に Kinesis に対してレコードを PUT すれば OK です。

{{< highlight terminal >}}
$ node run-local.js
Kinesalite start http://localhost:4567/
Found sample-stream!
Polling kinesis for events...
{{< /highlight >}}

**ローカル Kinesis にレコードを PUT するスクリプト**

{{< highlight js >}}
const AWS = require("aws-sdk");
const uuid = require("uuid");

const Kinesis = new AWS.Kinesis({
  endpoint: "http://localhost:4567/",
  region: "ap-northeast-1",
  sslEnabled: false
});

async function main() {
  const res = await Kinesis.putRecord({
    Data: JSON.stringify({ hello: "world" }),
    PartitionKey: uuid.v1(),
    StreamName: "sample-stream"
  }).promise();
  console.log(res);
}

main().catch(console.error);
{{< /highlight >}}

# おわりに

[kinesalite](https://github.com/mhart/kinesalite) と [local-kinesis-lambda-runner](https://github.com/rabblerouser/local-kinesis-lambda-runner) を利用することで簡単にローカルで実行することができます。  
ソースは[GitHub](https://github.com/70-10/sandbox/tree/master/node/serverless/kinesis-offline-sample) にも上げています。
