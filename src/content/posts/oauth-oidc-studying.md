---
title: OAuth / OIDCを学ぶための最短経路
publishDate: 2020-07-24T10:43:00+09:00
tags: ["OAuth", "OpenID Connect"]
draft: false
---

# はじめに

ここ数ヶ月、OAuth / OIDC の勉強をしていました。  
はじめはどこからどう手を付ければいいのかわからず、OAuth と名のつく本や資料をとりあえず色々読んでいました。  
勉強していくなかで、効率の良い学習方法が少しずつわかってきたので、まとめます。

# 学習する順番のまとめ

1. [OAuth & OIDC 入門編 by #authlete - YouTube](https://www.youtube.com/watch?v=PKPj_MmLq5E)を見る
   - OAuth / JWT /OIDC の全体感を掴みます
   - ここではすべてを理解するのではなく、何がわからないのかをわかることが目的です
2. [雰囲気で使わずきちんと理解する！整理して OAuth2.0 を使うためのチュートリアルガイド](https://www.amazon.co.jp/dp/B07XT8H2YG)を読む
   - OAuth とはどういうものかということを理解します
3. [OAuth、OAuth 認証、OpenID Connect の違いを整理して理解できる本](https://authya.booth.pm/items/1550861)を読む
   - OIDC とはどういうものか、OAuth とはどう違うかということを理解します
4. [OAuth・OIDC への攻撃と対策を整理して理解できる本（リダイレクトへの攻撃編）](https://authya.booth.pm/items/1877818)を読む
   - OAuth/OIDC のセキュリティに対して理解します
5. [OAuth 徹底入門 セキュアな認可システムを適用するための原則と実践](https://www.amazon.co.jp/dp/B07L5M7DXS) と[Authlete 川崎さんの Qiita 記事](https://qiita.com/TakahikoKawasaki)を読む
   - これまでの学習では足りていない内容の学習として利用します
   - すべて読みきるというよりはリファレンスとして使用します
6. RFC を読み込む
   - ここまで学習しても疑問に残る部分については RFC を読んで確認します
   - 今後の学習でもまずは RFC を確認するようにします

# メモ

ありものの認可サービスを実際に動かして学習するパターンは多いですが、認可サーバーを作って覚えようみたいなパターンは少なかったです。  
読んだ中では、OAuth 徹底入門が唯一このパターンでした。  
ただ、OAuth 徹底入門で扱われている Node.js のバージョンが古かったり、コードが読みにくかったりと色々難ありでとっつきにくいです。
