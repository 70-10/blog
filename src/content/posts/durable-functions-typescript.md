---
title: TypeScript で Durable Functions をつくる
publishDate: 2025-03-02T21:18:11.535+09:00
tags: ["Develop"]
description: ""
---

Azure Functions の拡張機能である Durable Functions を TypeScript で実装し、ローカルで実行するまでをまとめます。

Durable Functions については以下のドキュメントを参照してください。

https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview

# 環境を用意する

Dev Containers を使って開発環境を用意します。
`.devcontainer/devcontainer.json` を以下のように設定します。

```json
{
  "name": "Durable Functions",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm",
  "features": {
    "ghcr.io/jlaundry/devcontainer-features/azure-functions-core-tools:1": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "azurite.location": "./.azurite"
      },
      "extensions": ["azurite.azurite", "ms-azuretools.vscode-azurefunctions"]
    }
  }
}
```

この設定で、TypeScript の開発環境と Azure Functions Core Tools、Azurite が含まれたコンテナを利用できます。

## 補足: Azure Functions Core Tools とは

Azure Functions Core Tools は、Azure Functions をローカルで作成、テスト、デバッグ、デプロイするためのコマンドラインツールです。これにより、クラウドへデプロイする前に関数をローカル環境で実行し、検証できます。

https://learn.microsoft.com/azure/azure-functions/functions-run-local

## 補足: Azurite とは

Durable Functions は、実行する際に Storage を必要とします。  
Azurite はローカル環境に Azure Storage を動作させるエミュレーターです。ローカル環境では Azurite を Storage として利用し Durable Functions を実行します。

https://learn.microsoft.com/azure/storage/common/storage-use-azurite

Azurite は npm からインストールもできます。今回は Visual Studio Code のエクステンションを使って導入します。

# プロジェクトの作成

VSCode のコマンドパレット（Ctrl + Shift + P）を開き、 `Azure Functions: Create New Project` を選択しプロジェクトを作成します。

```
> Azure Functions: Create New Project
```

プロジェクトの作成が完了すると、必要なコードが自動生成されます。

次に、Durable Functions を利用するために、以下のコマンドでモジュールをインストールします。

```
npm install -E durable-functions@preview
```

# Durable Functions の作成

Durable Functions には以下の 3 つの関数があります。

1. Orchestrator: メインのワークフローを管理する関数。
2. Activity: Orchestrator によって呼び出される個々の処理。
3. Client: Orchestrator を開始するトリガー（HttpTrigger など）。

VSCode のコマンドパレットから、`Azure Functions: Create Function` を選択し、関数を作成します。

```
> Azure Functions: Create Function
```

Hello という関数を作成したときの例はこちらです。

```typescript
import {
  app,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
} from "@azure/functions";
import * as df from "durable-functions";
import {
  ActivityHandler,
  OrchestrationContext,
  OrchestrationHandler,
} from "durable-functions";

const activityName = "Hello";

const HelloOrchestrator: OrchestrationHandler = function* (
  context: OrchestrationContext,
) {
  const outputs = [];
  outputs.push(yield context.df.callActivity(activityName, "Tokyo"));
  outputs.push(yield context.df.callActivity(activityName, "Seattle"));
  outputs.push(yield context.df.callActivity(activityName, "Cairo"));

  return outputs;
};
df.app.orchestration("HelloOrchestrator", HelloOrchestrator);

const Hello: ActivityHandler = (input: string): string => {
  return `Hello, ${input}`;
};
df.app.activity(activityName, { handler: Hello });

const HelloHttpStart: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const body: unknown = await request.text();
  const instanceId: string = await client.startNew(
    request.params.orchestratorName,
    { input: body },
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return client.createCheckStatusResponse(request, instanceId);
};

app.http("HelloHttpStart", {
  route: "orchestrators/{orchestratorName}",
  extraInputs: [df.input.durableClient()],
  handler: HelloHttpStart,
});
```

# 設定ファイルの変更

`local.settings.json` の内容を以下のように書き換える。

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

`AzureWebJobsStorage` の値に `UseDevelopmentStorage=true` を設定することで、ローカルで起動している Azurite を利用するようになる。

# 実行・動作確認

Durable Functions を実行する前に、Azurite を起動します。VSCode のコマンドパレットから `Azurite:Start` を実行します。

```
> Azurite:Start
```

正しく起動できると、 `.azurite/` に Azurite のファイル群が作成されます。

以下のコマンドで関数を実行します。

```
npm start
```

または、ビルド後に `func start` を実行します。

```
npm run build && func start
```

正しく実行できると以下の出力が得られます。

```
[2025-02-26T06:42:03.180Z] Worker process started and initialized.

Functions:

        HelloHttpStart: [GET,POST] http://localhost:7071/api/orchestrators/{orchestratorName}

        Hello: activityTrigger

        HelloOrchestrator: orchestrationTrigger
```

`http://localhost:7071/api/orchestrators/HelloOrchestrator` にリクエストすると、以下のようなレスポンスが返ります。

```json
{
  "id": "42d07a595a7641b2ad7b52d31954cf46",
  "statusQueryGetUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "sendEventPostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "terminatePostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "rewindPostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "purgeHistoryDeleteUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "restartPostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "suspendPostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/...",
  "resumePostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/..."
}
```

レスポンスにある `statusQueryGetUri` の URL にリクエストすると実行状況が確認できます。

```json
{
  "name": "HelloOrchestrator",
  "instanceId": "42d07a595a7641b2ad7b52d31954cf46",
  "runtimeStatus": "Completed",
  "input": "",
  "customStatus": null,
  "output": ["Hello, Tokyo", "Hello, Seattle", "Hello, Cairo"],
  "createdTime": "2025-02-26T06:42:05Z",
  "lastUpdatedTime": "2025-02-26T06:42:10Z"
}
```

`runtimeStatus` が `Completed` になっていると、Durable Functions の実行完了です。
Activity が返す値は `output` に格納されています。この例では `["Hello, Tokyo", "Hello, Seattle", "Hello, Cairo"]` が返されています。

# 参考情報

https://learn.microsoft.com/azure/azure-functions/durable/quickstart-ts-vscode
