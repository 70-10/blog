---
title: redux-saga v1.0.0を使うとredux-saga-test-planでエラーが出る
publishDate: 2019-01-28T23:14:00+09:00
tags: ["Web Frontend"]
draft: false
---

# はじめに

2019/01/20 に redux-saga の[v1.0.0 がリリースされました](https://github.com/redux-saga/redux-saga/releases/tag/v1.0.0)。  
v1.0.0 を使うと `redux-saga-test-plan` でのテストでエラーが発生したので、その内容をまとめます。

# 実行環境

| redux-saga | redux-saga-test-plan |
| :--------: | :------------------: |
|   v1.0.0   |        v3.7.0        |

# エラー内容

テストを実行すると以下のエラーが発生しました。

```
FAIL  src/saga.test.js
 ● Test suite failed to run

   Cannot find module 'redux-saga/lib/internal/sagaHelpers' from 'index.js'

     at Resolver.resolveModule (node_modules/jest-resolve/build/index.js:221:17)
     at Object.<anonymous> (node_modules/redux-saga-test-plan/lib/expectSaga/index.js:17:20)
```

# redux-saga-test-plan の Issue を見る

[同様のエラーが起きたと報告されている Issue](https://github.com/jfairbank/redux-saga-test-plan/issues/217)では、`v1.0.0-beta.2`を使用していることが原因と言及されています。`v1.0.0-beta.1`にダウングレードするとエラーは発生しなくなっています。  
redux-saga-test-plan では v1.0.0-beta.1 までフォローしているようで、それ以降のバージョンはまだ対応していません。（[関連 Pull Request](https://github.com/jfairbank/redux-saga-test-plan/pull/200)）

## redux-saga-test-plan の活動状況

master ブランチのコミット履歴を見ると、2018 年の 5 月のコミットが最後でした。あまり積極的に活動が行われていないように見受けられます。

### redux-saga v1.0.0 対応の Pull Request は上がっている

[早速 v1.0.0 対応をしてくれた方がいました](https://github.com/jfairbank/redux-saga-test-plan/pull/242)。早くマージされることを待つしかないようです。

## インストール時をよく見たら…

redux-saga-test-plan のインストール時に、以下の Warning が出ていました。  
redux-saga-test-plan としては v0.16.0 系を使いましょうとのことです。

```
warning " > redux-saga-test-plan@3.7.0" has unmet peer dependency "redux-saga@>= 0.15.0 < 0.17.0".
```

# おわりに

結論としては以下の通りで、今時点では v0.16.2 を使うしかありません。

- redux-saga-test-plan は redux-saga v1.0.0-beta.2 以降では動かない
  - すでに v1.0.0 対応の Pull Request は上がっており、マージ待ちの状態
- 現時点では redux-saga は v0 系で最新の v0.16.2 を選ぶしかない
