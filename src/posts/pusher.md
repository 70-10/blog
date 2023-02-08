---
title: iOS端末にプッシュ配信するCLIツールを作った
publishDate: 2017-09-03T23:44+09:00
tags: ["iOS", "Go"]
---

[pusher](https://github.com/70-10/pusher)というiOS端末にプッシュ配信を行うツールを作りました。  
使い方や作った背景などをまとめます。

# どういうツールなのか

iOS端末にプッシュ配信をする、Go言語製のCLIツールです。  
このツールでできるのは、自分で定義したpayloadを指定の端末にプッシュすることです。  
証明書ファイルの生成やデバイストークンの取得など、プッシュ配信に必要なものは事前に揃えておきます。


# 使い方

## インストール

`go get`でインストールします。

```
$ go get github.com/70-10/pusher
```

## configファイルの設定

プッシュ配信をする際に必要な設定を、`~/.config/pusher/config.toml`に設定します。

config.tomlの設定はサブコマンドのconfigから行えます。


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

| 設定値      | 内容                                                    |
| ----------- | ------------------------------------------------------- |
| p12         | プッシュ配信を行うための証明書のパス。p12形式。         |
| password    | 証明書のパスワード                                      |
| devicetoken | プッシュを配信するiOS端末のデバイストークン             |
| topic       | プッシュ通知のトピック。アプリのBundle IDを設定すればOK |
| payload     | `payload.json`のパス                                    |
| env         | APNsの環境（Production or Sandbox）                     |

## payload.jsonの設定

配信する内容を`~/.config/pusher/payload.json`に設定します。  
設定はサブコマンドのpayloadから行えます。

```
$ pusher config
```

以下のJSONがデフォルト値として設定されています。  
※設定値の詳細は[Appleのドキュメント](https://developer.apple.com/jp/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/APNsProviderAPI.html)を参照してください。

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

新OSの検証やアプリの動作確認をする際は、いつもプッシュサービスを使ってプッシュ配信を行っています。  
プッシュ配信が届かない場合、以下のように原因切り分けで3つ目の選択肢が増えてしまいます。

1. プッシュを受信するアプリ（または端末、OS）がおかしい
- APNsから端末へプッシュするところがおかしい
- プッシュサービスからAPNsへのリクエストがおかしい

プッシュサービスが自前でない限り、ブラックボックスが2つ（プッシュサービスとAPNs）になり、問題箇所がかなり見つけづらくなります。  
問題箇所が特定しづらくなるのを少しでも軽減するために、このツールを作りました。  
（自分が作ったツールであれば、ツールに問題があっても調査がしやすいはず）

また、同じpayload設定のプッシュを手軽にできるようにするというのも目的でした。  
（Webからは毎回手動で項目を埋める必要がありました）

# 今後のこと

APNsのトークン認証やAndroidのプッシュ配信など、追加したい機能を時間を見つけて対応していきたいです。
