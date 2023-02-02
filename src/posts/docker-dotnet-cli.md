---
title: Dockerで.NET Core CLIを使う
publishDate: 2020-10-07T12:52+09:00
tags: ["Docker", ".NET Core"]
---

[Microsoftが用意しているDokcerイメージ](https://hub.docker.com/_/microsoft-dotnet-core-sdk/)を使うことで、Dockerで .NET Core CLIを利用できます。

```
docker run -it --rm --entrypoint dotnet mcr.microsoft.com/dotnet/core/sdk:3.1-alpine
```

ローカルにプロジェクトを作る場合は以下のように実行します。

```
docker run -it --rm -v ${PWD}:/local -w /local --entrypoint dotnet mcr.microsoft.com/dotnet/core/sdk:3.1-alpine new console --project sample1
```

いちいちDockerコマンドを打つのが面倒な場合は、以下のようにエイリアスを設定しましょう。

```
alias dotnet='docker run -it --rm -v ${PWD}:/local -w /local --entrypoint dotnet mcr.microsoft.com/dotnet/core/sdk:3.1-alpine'
```
