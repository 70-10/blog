---
title: 2020年5月のふりかえり
publishDate: 2020-05-31T23:00:00+09:00
tags: ["日記"]
draft: false
---

# 技術

- aws-cdk で Route53 の RecordSet を定義
  - 既存の HostedZone の指定方法がわからず途中で断念した
- Github のプライベートリポジトリの GitHub Pages を公開
  - Pro にしないとできなかったので課金した
  - https://codetime.70-10.net (コードをどれだけ書いたか可視化するページ)を作った
- GitHub Actions で Netlify にデプロイするよう変更
  - Netlify のビルド時間短縮のため
  - GitHub Actions がテンプレート用意してたり Netlify も Action を用意してくれているので簡単に導入できた
- [Spotify の Recommendation API](https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/)で遊んでみた
  - BPM で曲を検索したかったけどアプリではできなかったので API を探ってみた
  - 検索ではなくレコメンドという形で API が存在している
  - ジャンルやアーティスト、テンポやその他属性を指定すれば自分好みの曲を返してくれる

# 読書

- [なぜ僕らは、こんな働き方を止められないのか](https://www.amazon.co.jp/dp/B07Y4XXH7J)
  - Kindle Unlimited にあったので読んでみた
  - Chapter 1 はコロナ時代の今こそ読むべき
  - コロナが終わったあと、どう働くかということを考えるきっかけになった
- [自分の中に毒を持て](https://www.amazon.co.jp/dp/B079VNN2FX)
  - どこかのオススメに上がっていたので読んでみた
  - 岡本太郎なりの人生観がまとめられている
  - 難しい。読むにはまだ早すぎる。もう少し時間が経ったらまた読んでみよう。
- [任せる技術](https://www.amazon.co.jp/dp/B00D6D1DYK/)
  - 本の内容は、まあそうだよねという感触。ところどころ体育会系な雰囲気で書かれているのがうっ…となった
  - できることだけを任せるのではなく、ひとつ上の課題を任せる
  - 任せたら、ギリギリまで任せる。とやかく手を出さない
- [800 字を書く力](https://www.amazon.co.jp/dp/B00FPGWB5G/)
  - 国語が嫌いだった昔の自分に読ませたい
  - 後半は読み方についての話
- [僕らは SNS でものを買う](https://www.amazon.co.jp/dp/B07WC7YJBM/)
  - 言われてみればそういう行動している
  - SNS でファンを作り、ファンに情報を拡散してもらうというマーケティングになってきている
  - Amazon のレビューでは酷評されてるけど、マーケティング初心者な自分からすれば読んでいてタメになった

# 音楽

藤井風のアルバムが今月のすべてでした。  
毎年星野源が作っている日村さんバースデーソングの「折り合い」も最高でした。

## よかった曲まとめプレイリスト

https://open.spotify.com/playlist/5i1snlI2ci3z0P59PORymI?si=hDROJvxuS4ygjgSKEn4Eog

## 聴いたアルバム

| タイトル                    | アーティスト |
| --------------------------- | ------------ |
| Notes On A Conditional Form | The 1975     |
| HELP EVER HURT NEVER        | 藤井風       |
| Dream in Colour             | Franc Moody  |
| Take Off Music EP           | STL          |

# その他

- Amazon Prime で彼方のアストラを見た
  - SKET DANCE 見てたからギャグ系かと思ってた
  - 最後に伏線回収していくのが最高
  - アニメを見たからマンガは読まなくていいかなと言う気持ち
- 光 BB ユニット（IPv6 対応の申し込み）
  - 光 BB ユニット使ったことで劇的に速くなった。平均 150Mbps
  - ルーター買い換える前にこっちの対応をすべきだった
- GitHub に課金した
  - プライベートリポジトリを GitHub Pages で公開したかった
  - Pro プランじゃないとできないことが他にもあるようす
- Paravi に登録してみた
  - 二週間だけ無料で使えるのでお試し
  - 逃げ恥を妻と見ている
  - 逃げ恥以外に見たいのが特にない
- iMac をラクウルで買取に出した
  - 初期化するのに 40 時間ほどかかった
  - 16000 円で売れた
  - 集荷されてから査定までがスピーディでユーザー体験良かった

# 買い物

- 猿田彦のコーヒー豆
  - 2 種類買ってみた
  - 淹れ方についての紙が入っていたので、その通りに入れたら美味しい
- Nature Remo E lite
  - B ルートサービスの利用手続きをしておかないとけない
    - その認証情報が必要になる
  - 今は現在の電力消費を眺められるだけ
  - これからの発展に期待
- HDMI 変換器（リモコン付き）
  - テレビの HDMI 端子が少なくて毎回差し替えるのが面倒で購入
  - 自動切り替えはうまく動いたためしがないので、手動（リモコン）のにした
  - IFTTT と Nature Remo を使って、Alexa から切り替えできるようにした
