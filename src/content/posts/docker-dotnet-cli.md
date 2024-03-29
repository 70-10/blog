---
title: Dockerで.NET Core CLIを使う
publishDate: 2020-10-07T12:52:00+09:00
tags: ["Develop"]
draft: false
---

[Microsoft が用意している Dokcer イメージ](https://hub.docker.com/_/microsoft-dotnet-core-sdk/)を使うことで、Docker で .NET Core CLI を利用できます。

```
docker run -it --rm --entrypoint dotnet mcr.microsoft.com/dotnet/core/sdk:3.1-alpine
```

ローカルにプロジェクトを作る場合は以下のように実行します。

```
docker run -it --rm -v ${PWD}:/local -w /local --entrypoint dotnet mcr.microsoft.com/dotnet/core/sdk:3.1-alpine new console --project sample1
```

いちいち Docker コマンドを打つのが面倒な場合は、以下のようにエイリアスを設定しましょう。

```
alias dotnet='docker run -it --rm -v ${PWD}:/local -w /local --entrypoint dotnet mcr.microsoft.com/dotnet/core/sdk:3.1-alpine'
```
