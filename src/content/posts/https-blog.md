---
title: ブログをHTTPS化した
publishDate: 2017-12-24T21:07+09:00
tags: ["AWS"]
draft: false
---

ブログを HTTPS 化しました。これまでは、GitHub Pages にカスタムドメインを設定していました。  
GitHub Pages ではカスタムドメインの HTTPS 化ができません。

今回は、GitHub Pages の前に CloudFront ＋ ACM をおいて HTTPS 化しました。

## やったこと

* [すでに実践されている方の記事](https://qiita.com/iogi/items/82618c1d56abba6b9337)を参考に [CloudFormation を作成しました](https://github.com/70-10/blog/tree/master/cfn)

  * 記事にある 2 つ目の方法で対応

    > CNAME を無効にして、 https://example.github.io/reponame/ でアクセスするようにし、/reponame/ を Origin のパスとして利用する

  - CloudFormation のスタックを domain と dns の 2 つに分離したけど、ひとつにまとめても問題なさそう

* gh-pages ブランチで設定していた CNAME を削除しました

### CloudFlare を使わなかった理由

GitHub Pages の HTTPS 化で検索すると、真っ先に CloudFlare を利用した設定方法がヒットします。  
ですが、ドメインを Route53 で管理し、 ACM の設定をしていたのでAWS サービス（CloudFront）で完結したかったため、CloudFlare は採用しませんでした。

## つまずいたこと

### CloudFront に設定できる ACM にはリージョン制限がある

CloudFront への ACM 設定するには、ACM がリージョンがバージニア北部（us-east-1）のものでないといけません。  
以前に、先に ACM の登録を東京リージョンで登録していたため、ここでかなりの時間を費やしました。

### config.toml の baseurl が http のままだった

なぜか css ファイルが読み込めないなと思っていたら、[config.toml に設定している baseurl](https://github.com/70-10/blog/blob/master/config.toml#L3)が http のままでした。
