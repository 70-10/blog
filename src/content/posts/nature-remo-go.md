---
title: GoでNature Remo APIのSDKとCLIをつくっている
publishDate: 2018-05-20T21:29:00+09:00
tags: ["Go", "Nature Remo"]
draft: false
---

# はじめに

今年の始めに[Nature Remo](https://nature.global/)を購入しました。  
Google Home（+IFTTT）と連携しています。いつも「OK, Google、テレビつけて」と、声でテレビを操作しています。

Google Home との連携はとても便利ですが、例えば「テレビつけて」という指示に対しては「テレビの電源ボタンの信号を発信する」という 1 つの処理しかできません。  
1 つの入力に対して行える処理は 1 つとなっています。  
「テレビをつけて」という言葉に対して「電源ボタンの信号発信＋ 8 チャンネルの信号発信」といった 2 つの処理を行おうとすると自分で API を制御する必要があります。

Nature Remo は API が公開されています。API を使えば電源ボタン＋ 8 チャンネルといった複数処理も可能になります。  
（IFTTT と連携する、2 つの信号を発信する API を独自で用意する必要はありますが）

現在、Nature Remo API の SDK と CLI を Go で実装しています。  
今回は、その SDK と CLI について書きます。

# Nature Remo の API について

Nature Remo は[API が公開されています](http://swagger.nature.global/)。  
[Nature Remo のサイト](https://home.nature.global)で発行されるアクセストークンをリクエストヘッダの`Authorization`に設定することで API を利用できます。

```
» curl -H "Authorization: Bearer <アクセストークン>" "https://api.nature.global/1/users/me"
```

# 開発中の SDK と CLI

現在、Go で SDK と CLI を実装しています。

- SDK  
  [https://github.com/70-10/nature-remo-go](https://github.com/70-10/nature-remo-go)
- CLI  
  [https://github.com/70-10/nature-remo-go/cmd/nature-remo](https://github.com/70-10/nature-remo-go/cmd/nature-remo)

# CLI を使う

## インストール

```
» go get -u github.com/70-10/nature-remo-go/cmd/nature-remo
```

## アクセストークンの設定

config ファイルにアクセストークンを設定します。 `~/.config/nature-remo/config.toml`に作成されます。

```
token = “**************************”
```

config ファイルは、サブコマンドの`config`から設定できます。

```
» nature-remo config
```

## デバイス情報を確認する

サブコマンドの`devices`で、登録している Nature Remo のデバイス情報が取得できます。

```
» nature-remo devices
ID               : ********-****-****-****-************
Name             : デバイス名
temperature      : 25
humidity         : 50
Firmware Version : Remo/1.0.62-gabbf5bd
Created At       : 2018-01-01 00:00:00
```

## 登録している家電を確認する

サブコマンドの`appliances`で、登録している家電の ID と名前の一覧を取得できます。

```
» nature-remo appliances
********-****-****-****-************ ライト
********-****-****-****-************ テレビ
********-****-****-****-************ エアコン
```

## 家電のシグナルを確認する

サブコマンドの`signals`で、家電ごとに登録しているシグナル（リモコンボタンの信号）の一覧を取得できます。

```
nature-remo signals -id <家電のID>
********-****-****-****-************ 電源
********-****-****-****-************ 消音
********-****-****-****-************ 入力切替
```

## シグナルを実行する

実際に家電の操作するには、サブコマンドの`send`を実行します。

```
» nature-remo send -id <シグナルのID>
Send <シグナルのID>
```

# おわりに

Nature Remo に用意されている API の SDK と CLI を開発中です。  
使いたかったシグナルの実行はできるようになったので、SDK と Serverless Framework を使って IFTTT 用 API を実装したいです。  
実装はまだまだ途中段階で機能追加・修正していく必要がありそうです。

## ToDo リスト

- サブコマンドの`send`で設定する ID はオプション引数じゃなく、`nature-remo send <シグナルのID>`という形式にする
- 複数のシグナル ID を渡して、複数実行できるようにする
- 用意されている API すべてを実装する
  - まだ 20 エンドポイントあるうちの 5 エンドポイントしか実装できていません
