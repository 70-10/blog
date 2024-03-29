---
title: .NET 5.0のWeb APIをDockerで起動する
publishDate: 2020-11-30T14:24:00+09:00
tags: ["Develop"]
draft: false
---

# 0. 前提

.NET 5 がインストールされていること。

```
$ dotnet --version
5.0.100
```

# 1. プロジェクトの作成

```
dotnet new webapi -o ApiDockerSample
cd ApiDockerSample
```

# 2. Dockerfile の作成

ビルドには `mcr.microsoft.com/dotnet/sdk:5.0` イメージを使います。  
ビルドされた dll を `mcr.microsoft.com/dotnet/aspnet:5.0` イメージ内で実行します。

```docker:ApiDockerSample/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:5.0 as builder
COPY . /app
WORKDIR /app

RUN dotnet publish -c Release

FROM mcr.microsoft.com/dotnet/aspnet:5.0

COPY --from=builder /app/bin/Release/net5.0/publish/ /app
WORKDIR /app
ENTRYPOINT [ "dotnet", "ApiDockerSample.dll" ]
```

# 3. Docker の実行

今回は docker-compose を使って起動します。

```yaml:ApiDockerSample/docker-copose.yml
version: "3"
services:
  api:
    image: api-docker-sample
    build: .
    ports:
      - 8000:80
```

以下のコマンドを実行すると、`http://localhost:8000/weatherForecast`からアクセスできる。

```
docker-compose up
```
