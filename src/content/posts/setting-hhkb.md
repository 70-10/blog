---
title: HHKB Professional JPをKarabiner Elementsで快適に利用する
publishDate: 2019-01-14T21:16:00+09:00
tags: ["キーボード"]
draft: false
---

# はじめに

HHKB Professional JP を買いました。  
Mac で使うためには[Karabiner Elements](https://pqrs.org/osx/karabiner/)を必要があったので、その設定をまとめます。

# 背面スイッチの設定

HHKB にはキー設定をできる背面スイッチがあります。  
SW1 のみをオンにしました。

## ドライバをインストール

HHKB の[Mac 用ドライバのインストーラー](https://www.pfu.fujitsu.com/hhkeyboard/macdownload.html)が用意されているのでキーボードを接続する前にインストールします。  
ドライバのインストールが完了したら Mac にキーボードを接続します。キーボードの設定が始まるのでそのまま設定していきます。

## Karabiner Elements でキー設定

そのままだと右の Command キーとシフトキー両端のかな・英数キーが使えません。  
Karabiner Elements で設定して使えるようにします。

### Karabiner Elements の設定

![Karabiner settings](//images.ctfassets.net/sa46287w9bii/3NnTOBIWhWE193NpdmBrWn/dd2d01b4c030fb9cd3135fe78f79d421/karabiner-settings.png)

シフトキーの両端は internatinal4, international5 で指定できます。  
右 Cmd は Kana キーに割り当てました。HHKB ロゴキーには Fn キーを割り当てています。

# 参考にした記事

- [Happy Hacking Keyboard | 背面スイッチの説明 | PFU](https://www.pfu.fujitsu.com/hhkeyboard/leaflet/hhkb_backview.html)
- [HHKB Professional JP を macOS High Sierra で使うための簡単な設定方法](https://qiita.com/shibukk/items/ad24c48a83bb43efe56a)

# おわりに

使い始めてまだ数時間なのですが打ちやすいなと感じます。打鍵音の大きさが少し気になります。  
黒いキーに黒の刻印がされているので当たり前ですが、文字は見づらいです。それがカッコいいんですけどね。
