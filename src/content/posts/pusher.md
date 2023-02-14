---
title: iOS端末にプッシュ配信するCLIツールを作った
publishDate: 2017-09-03T23:44+09:00
tags: ["iOS", "Go"]
draft: false
---

[pusher](https://github.com/70-10/pusher)という iOS 端末にプッシュ配信を行うツールを作りました。  
使い方や作った背景などをまとめます。

# どういうツールなのか

iOS 端末にプッシュ配信をする、Go 言語製の CLI ツールです。  
このツールでできるのは、自分で定義した payload を指定の端末にプッシュすることです。  
証明書ファイルの生成やデバイストークンの取得など、プッシュ配信に必要なものは事前に揃えておきます。

# 使い方

## インストール

`go get`でインストールします。

```
$ go get github.com/70-10/pusher
```

## config ファイルの設定

プッシュ配信をする際に必要な設定を、`~/.config/pusher/config.toml`に設定します。

config.toml の設定はサブコマンドの config から行えます。

```
$ pusher config
```

### 設定する値について

```
p12 = "/path/to/file.p12"
password = ""
devicetoken = ""
topic = ""
payload = "/Users/your_name/.config/pusher/payload.json"
env = "production"
```

### `config.toml`の中身

| 設定値      | 内容                                                       |
| ----------- | ---------------------------------------------------------- |
| p12         | プッシュ配信を行うための証明書のパス。p12 形式。           |
| password    | 証明書のパスワード                                         |
| devicetoken | プッシュを配信する iOS 端末のデバイストークン              |
| topic       | プッシュ通知のトピック。アプリの Bundle ID を設定すれば OK |
| payload     | `payload.json`のパス                                       |
| env         | APNs の環境（Production or Sandbox）                       |

## payload.json の設定

配信する内容を`~/.config/pusher/payload.json`に設定します。  
設定はサブコマンドの payload から行えます。

```
$ pusher config
```

以下の JSON がデフォルト値として設定されています。  
※設定値の詳細は[Apple のドキュメント](https://developer.apple.com/jp/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/APNsProviderAPI.html)を参照してください。

```json
{
  "aps": {
    "alert": "Alert",
    "badge": 10,
    "sound": "sound-file"
  },
  "custom-key": "custom-value"
}
```

# プッシュの配信

プッシュのコマンドを実行するのみです。

```
$ pusher push
```

# 開発の背景

新 OS の検証やアプリの動作確認をする際は、いつもプッシュサービスを使ってプッシュ配信を行っています。  
プッシュ配信が届かない場合、以下のように原因切り分けで 3 つ目の選択肢が増えてしまいます。

1. プッシュを受信するアプリ（または端末、OS）がおかしい

- APNs から端末へプッシュするところがおかしい
- プッシュサービスから APNs へのリクエストがおかしい

プッシュサービスが自前でない限り、ブラックボックスが 2 つ（プッシュサービスと APNs）になり、問題箇所がかなり見つけづらくなります。  
問題箇所が特定しづらくなるのを少しでも軽減するために、このツールを作りました。  
（自分が作ったツールであれば、ツールに問題があっても調査がしやすいはず）

また、同じ payload 設定のプッシュを手軽にできるようにするというのも目的でした。  
（Web からは毎回手動で項目を埋める必要がありました）

# 今後のこと

APNs のトークン認証や Android のプッシュ配信など、追加したい機能を時間を見つけて対応していきたいです。
