---
title: Web Test RunnerでTypeScriptコードをテストする
publishDate: 2022-03-16T10:18+09:00
tags: ["Test"]
---

# この記事のゴール

[Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)を使って、TypeScriptで書かれたコードのテストをします。

# 1. Web Test Runnerをインストールする

Web Test Runnerとchaiをインストールします。

```
npm install -D @web/test-runner @esm-bundle/chai
```

# 2. 最初のテストをJavaScriptで書く

今回テストするコードは、引数で与えられた2つの数値を合算する関数（sum）です。  
まずはsum関数を作成します。

```js:src/sum.js
function some(a, b) {
  return a + b;
}
```

次に、sum関数をテストする`sum.test.js`を作成します。

```js:tests/sum.test.js
import { expect } from "@esm-bundle/chai";
import { sum } from "../src/sum";

it("sums up 2 numbers", () => {
  expect(sum(1, 1)).to.equal(2);
  expect(sum(3, 12)).to.equal(15);
});
```

# 3. Web Test Runnerでテストする

## 3-1. package.jsonのscriptsにtestを定義する

テストを実行するために、package.jsonのscriptsに`test`を定義します。

```json:package.json
{
  .
  .
  .
  "scripts": {
    "test": "web-test-runner tests/**/**.test.js --node-resolve"
  }
}
```

`web-test-runner`は`wtr`と書いてもOKです。

## 3-2. テストを実行する

正しく実行できると、以下のようにテストが成功します。

```
$ npm test

> web-test-runner-sample@0.1.0 test
> web-test-runner 'test/**/*.test.js' --node-resolve

Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

Finished running tests in 0.9s, all tests passed! 🎉
```

# 4. Web Test RunnerのConfigファイルを用意する

package.jsonの`test`でテスト対象ファイル等を指定していました。  
これらの設定を`web-test-runner.config.js`に移動させます。

## 4-1. web-test-runner.config.jsを作成する

```js:web-test-runner.config.js
module.exports = {
  files: "./tests/**/*.test.ts",
  nodeResolve: true,
};

```

## 4-2. package.jsonのtestを修正する

package.jsonの`test`を`web-test-runner`のみにします。

```json:package.json
{
  .
  .
  .
  "scripts": {
    "test": "web-test-runner"
  }
}
```

## 4-3. テストを実行する

```
$ npm test

> web-test-runner-sample@0.1.0 test
> web-test-runner

Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

Finished running tests in 0.9s, all tests passed! 🎉
```

# 5. テストコードをTypeScript化して、Web Test Runnerでテストする

## 5-1. ファイルの拡張子を変更する

「2. 最初のテストをJavaScriptで書く」で作成したsum.jsとsum.test.jsの拡張子をtsに変更します。  
中身は変更せず、拡張子のみ変更するだけです。

- `src/sum.js` -> `src/sum.ts`
- `tests/sum.test.js` -> `tests/sum.test.ts`

## 5-2. web-test-runner.config.jsにesbuildPluginを追加する

Web Test RunnerでTypeScriptのコードをテストするには`esbuildPlugin`を使用します。  
`esbuildPlugin`は`@web/dev-server-esbuild`モジュールで提供されています。

### 5-2-1. @web/dev-server-esbuildをインストールする

```
npm install -D @web/dev-server-esbuild
```

### 5-2-3. web-test-runner.config.jsにpluginsを追加する

```js:web-test-runner.config.js
const { esbuildPlugin } = require("@web/dev-server-esbuild");

module.exports = {
  files: "./tests/**/*.test.ts",
  plugins: [esbuildPlugin({ ts: true })],
  nodeResolve: true,
};
```

## 5-3. テストを実行する

```
$ npm test

> web-test-runner-sample@0.1.0 test
> web-test-runner

Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

Finished running tests in 0.9s, all tests passed! 🎉
```

これで、TypeScriptで書かれた関数のテストができるようになりました。

# 参考情報

- [Web Test Runner: Modern Web](https://modern-web.dev/docs/test-runner/overview/)

# 補足

## Web Test Runnerとは

Webアプリケーションのテストランナー  
Litが推奨している。

### 特徴

- ヘッドレスブラウザ
  - Puppeteer, Playwright, Seleniumが利用可能
- ブラウザからログ、404、およびエラーを報告
- devtoolsで実際のブラウザウィンドウからデバッグ
- [Import Maps](https://modern-web.dev/docs/test-runner/writing-tests/mocking/)を使用してES Moduleをモック
- Viewportサイズやダークモードなどのブラウザプロパティを公開
- テストを並行・分離して実行
- インタラクティブウォッチモード
- 変更されたテストのみを再実行することによる迅速な開発
- esbuildおよびrollupプラグインを搭載
