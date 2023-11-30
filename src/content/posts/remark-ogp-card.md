---
title: OGPのカードを生成するRemarkプラグインを作った
publishDate: 2023-11-30T12:02:26.533Z
tags: ["Develop", "Web Frontend"]
---

Markdown 内の URL を OGP カードリンクに変換する Remark プラグインを作りました。  
このプラグインは、Markdown の `http` から始まる URL をカード型リンクに変換します。プラグイン側ではスタイルは設定しません。

https://github.com/70-10/blog/pull/570

# 作った経緯

参考にした `remark-link-card` と似ていますが、単に Remark プラグイン作成の経験を積むために作りました。  
このプラグインを作成したことで、URL がどのようにカード型に変換されるかの仕組みを理解できてよかったです。  
YouTube や Spotify のリンクを特定の形式に変換する方法についてもイメージできました。今回はシンプルなカードを表示したいだけだったので、実装はしていません。

# 参考情報

`remark-link-card` の実装をめちゃくちゃ参考にさせてもらいました。

https://github.com/gladevise/remark-link-card
