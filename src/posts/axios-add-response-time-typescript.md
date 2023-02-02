---
title: axiosでレスポンスタイムを計測する （TypeScript編）
publishDate: 2019-11-29T20:00+09:00
tags: ["TypeScript", "axios"]
---

# はじめに

axiosで、リクエストからレスポンスまでの時間を計測する必要がありました。  
調べると方法は出てくるが、TypeScriptでやってる記事は見つからなかっのでまとめます。

# `AxiosInstance.interceptors`でレスポンスタイムを追加する
[この記事](https://note.mu/masio/n/n003cb3aca3fa)に書かれているように、axiosインスタンスにある`interceptors`でレスポンスタイムを追加します。

```js
// axios.js
import axios from 'axios'
const instance = axios.create()

instance.interceptors.request.use(config => {
  config.timestamp = Date.now()
  return config
})

instance.interceptors.response.use(response => {
  response.responseTime = Date.now() - response.config.ts
  return response
})

export default instance
```

# TypeScriptのために型定義を拡張する

`interceptors.request.use`, `interceptors.response.use`で扱う関数の引数には`timestamp`や`responseTime`のフィールド変数はありません。  
このまま実行しようとすると型定義に反していてエラーが発生します。

これを回避するには、`AxiosRequestConfig`, `AxiosResponse`の型定義を拡張します。

```typescript
declare module "axios" {
  export interface AxiosRequestConfig {
    timestamp?: number;
  }
  export interface AxiosResponse<T = any> {
    responseTime?: number;
  }
}
```

これで、レスポンス情報から`responseTime`を取得できます。

# 参考記事

- [axiosでレスポンスタイムを計測する｜masio｜note](https://note.com/masio/n/n003cb3aca3fa)
