---
title: "redux-saga-test-planでエラーが出る"
date: 2019-01-23T22:14:39+09:00
draft: true
---

<p></p>

# はじめに

`redux-saga-test-plan` で redux-saga のテストをしようとしたときにエラーが発生したので、その内容と回避策をまとめます。

## 実行環境

| redux-saga | redux-saga-test-plan |
| :--------: | :------------------: |
|   v1.0.0   |        v3.7.0        |


# テストを実行するとエラーが起きる

```
FAIL  src/saga.test.js
 ● Test suite failed to run

   Cannot find module 'redux-saga/lib/internal/sagaHelpers' from 'index.js'

     at Resolver.resolveModule (node_modules/jest-resolve/build/index.js:221:17)
     at Object.<anonymous> (node_modules/redux-saga-test-plan/lib/expectSaga/index.js:17:20)
```

## [関連 Issue](https://github.com/jfairbank/redux-saga-test-plan/issues/217)

- `v1.0.0-beta.2`を使っていたことが原因で、`v1.0.0-beta.1`にするとエラーが発生しなくなったとのこと
- 自分が試している環境では`^1.0.0`で指定していた
- プロダクトでは`^0.16.0`を指定しているので、そちらに変更してみる
  - テスト通った

## redux-saga-test-plan のフォロー状況

- [v1.0.0-beta.1 のフォローまではしていた様子](https://github.com/jfairbank/redux-saga-test-plan/pull/200)
- 最後のコミットが 2018 年 5 月で止まっている
- redux-saga の v1.0.0 に対してはフォローできていないし、それを対応する Issue や PR も見当たらない

**redux-saga のバージョンについて**

- 現在は[v1.0.0](https://github.com/redux-saga/redux-saga/releases/tag/v1.0.0)が最新
  - [redux-saga Release](https://github.com/redux-saga/redux-saga/releases)
  - 3 日前（2019/01/20）にリリースされたばかり

# インストール時をよく見たら…

redux-saga-test-planをインストールしたときに、Warning が出ていました。

```
warning " > redux-saga-test-plan@3.7.0" has unmet peer dependency "redux-saga@>= 0.15.0 < 0.17.0".
```

# 結論

- redux-saga-test-plan は redux-saga v1.0.0-beta.2 以降では動かない
  - フォローする様子も今の所見られない
- プロダクトでは v0.16.0（0 系の最新）を使っているので、redux-saga-test-plan が使えた

# 参考記事

- [参考にした Qiita の記事](https://qiita.com/yasuhiro-yamada/items/a57d286b5cfc47a22c15)
