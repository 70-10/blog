---
title: Netlify から Cloudflare Pages に変更した
publishDate: 2023-11-08T18:09:17+09:00
tags: ["Web Frontend"]
---

Netlify から Cloudflare Pages に移行しました。

Netlify から乗り換えようと思ったきかけは、ネットワークの遅さです。  
どうにも次のページへの遷移がもったりしている感じがする。絶対に Netlify を使う必要も特にない。  
それなら別のホスティングサービスに変えるかあ、と思い立った次第です。

Cloudflare Pages を選んだのは、Netlify よりもエッジネットワークや DNS 解決が速くなるだろうと思ったからです。  
実際に検証してみると体感レベルで速くなりました。ちゃんと検証できたわけではないですが、乗り換えて正解だったなと感じます。

Cloudflare Pages の設定は簡単で、GitHub にあるブログのリポジトリを連携してビルドコマンドを設定するだけ。  
Cloudflare Pages には本番環境とプレビュー環境が用意されています。main ブランチの更新をきっかけに本番環境のデプロイをするだけでなく、プルリクエストが作成・更新されるたびにプレビュー環境へのデプロイもしてくれます。  
環境ごとに変数の設定もできるので、それぞれの環境で `NODE_ENV` の設定もしました。

ただ、デプロイまでしかしないのでテストや静的解析をするには GitHub Actions なりを自分で設定する必要があります。

カスタムドメインの設定も簡単にできます。  
設定自体は 5 分ほどで完了しました。

もう少し細やかな設定を入れたビルドをしたい場合は、[cloudflare/pages-action](https://github.com/cloudflare/pages-action) を使うことになりそうです。

### 少しハマったことのメモ

#### 本番環境のビルドが通らない

package.json の scripts に `"prepare": "husky install"` を設定していたのですが、デプロイすると `husky not found` となりビルドが通らなくなる事象にぶち当たりました。  
原因は `NODE_ENV=production` を設定していることで `pnpm install` で `devDependencies` のパッケージがスキップされていたことでした。  
回避策として、prepare の設定を以下のように変更し、`NODE_ENV=production` のときはスキップするようにしました。

```json
"prepare": "if [ \"$NODE_ENV\" != \"production\" ]; then husky install; fi"
```
