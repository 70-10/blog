# ブログ記事サンプル

## サンプル1: エッセイ記事「10年前の君から」

```markdown
---
title: 10年前の君から
publishDate: 2025-05-07T04:26:38.121+09:00
tags: ["日記"]
description: "「作るまでが楽しい」という先輩の言葉が、10年後の自分にどう響いたか。AIと働くようになったエンジニアの視点から考察"
---

「作るまでが楽しい。どう作るかを考えているときがピークで、作り出すところからは楽しさが減っていくんだよ」

社会人になって4年目のころ、当時のチームの先輩がふとこぼした言葉だ。

先輩は自分より10年ほど年上で、技術力も高く、要件定義や設計といった上流工程もこなしながら、客先へ出向いて顧客と会話もするというなんでもできてしまう能力の高い人だ。

当時の自分はこの言葉にピンとこなかったし、理解できなかった。相容れないとすら思っていた。
なんでこんなすごい人がこんなこと言うのだろう。コードを書くことが楽しくてこの仕事についたのだから、そこを手放すなんてありえない。設計が大事なのは重々承知している。けど、それよりも実際に自ら手を動かして作ったものが世の中で動くという実感のほうが自分にとって価値が高かった。

先輩の言葉は、腑に落ちず、共感もしなかった。
でも、その言葉がなぜか、ずっと頭の中で反芻していた。

生成AIが登場し、AIがコードを書く時代に突入した。
実装をAIに任せる場面が増えてきた。自分は新しい機能を追加するために、必要な修正箇所を洗い出して設計を進めていく。そして、それを言葉にして、AIに伝える。正しく伝わって思ったとおりのアウトプットができたときに達成感を感じる。

どう作るかを言葉にすることが自分の仕事になっている。
作り出す楽しさはもはやAIに渡してしまった。

いつのまにか先輩と同じ気持ちになっていた。あの頃の先輩もちょうどこれくらいの年次だったんだろうか。

社会人14年目、作り出す楽しさをAIに手放した淋しさを感じながら、先輩の言葉に頷いた。
```

## サンプル2: 技術記事「serverless-webpackでNODE_ENVを設定する」

```markdown
---
title: serverless-webpackでNODE_ENVを設定する
publishDate: 2019-06-20T22:16:00+09:00
tags: ["Develop"]
draft: false
---

# はじめに

serverless-offlineとserverless-webpackを使用しているプロジェクトで、正しく`NODE_ENV`が設定できませんでした。
この記事では原因と解決方法をまとめます。

# 困ったこと

serverless-webpackでビルドし、`serverless offline`を実行しても`NODE_ENV`が正しく設定できませんでした。
serverless.ymlで以下のように`NODE_ENV=DEV`を指定しているにもかかわらず、`NODE_ENV=Development`と設定されてしまいました。

\`\`\`yaml:serverless.yml
plugins:
  - serverless-webpack
  - serverless-offline

provider:
  name: aws
  runtime: nodejs10.x
  stage: DEV
  region: ap-northeast-1
  environment:
    NODE_ENV: DEV
\`\`\`

# 原因

webpackはビルド時に`NODE_ENV`と`DEBUG`の2つにデフォルトの値を設定します。
(`NODE_ENV=Development`, `DEBUG=false`)

Lambdaファンクション実行時は`NODE_ENV=DEV`となります。
ビルド時にデフォルト値のDevelopmentが設定されるため、ビルド後のコードには`NODE_ENV=Development`が埋め込まれます。
そのため、実行時に正しく指定できていませんでした。

# 解決方法

ビルド時にNODE_ENVの値を設定することで解決できました。
webpack.config.jsでEnvironmentPluginが設定可能です。

\`\`\`js:webpack.config.js
const webpack = require("webpack");
module.exports = {
  plugins: [new webpack.EnvironmentPlugin(slsw.lib.serverless.service.provider.environment)],
}
\`\`\`

# 参考URL

https://webpack.js.org/plugins/environment-plugin/
```

## サンプル3: 短文エッセイ「自分のことばで」

```markdown
---
title: 自分のことばで
publishDate: 2025-04-28T09:18:36.529+09:00
tags: ["日記"]
description: ""
---

自分が書いた文章をAIに添削してもらうと、どうにも無味無臭な文章に変化する。「読みやすいようにして」「初心者にもわかりやすく」「簡潔に書いて」といった注文をすると、だいたい味のしない文章ができあがる。

読みやすさや分かりやすさを追求するとそうなることは理解できる。
実際、読みやすいし分かりやすい。けど、それでいいとは思えない。

味がしない言葉になった文章を良しとすると、いよいよすべてをAIに渡してしまった気持ちになる。

コーディングはすでにAIにだいぶ任せている。コードは無味無臭でも良いと思える。
けど、ブログの文章を任せてしまうと、自分がいなくなってしまう怖さを感じる。

わかりづらいままでもいいから、自分のことばで書いていこう。
少しだけAIの手を借りながら。
```
