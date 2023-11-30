---
title: Web Test RunnerでTypeScriptコードをテストする
publishDate: 2022-03-16T10:18:00+09:00
tags: ["Web Frontend", "テスト"]
draft: false
---

# この記事のゴール

[Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)を使って、TypeScript で書かれたコードのテストをします。

# 1. Web Test Runner をインストールする

Web Test Runner と chai をインストールします。

```
npm install -D @web/test-runner @esm-bundle/chai
```

# 2. 最初のテストを JavaScript で書く

今回テストするコードは、引数で与えられた 2 つの数値を合算する関数（sum）です。  
まずは sum 関数を作成します。

```js:src/sum.js
function some(a, b) {
  return a + b;
}
```

次に、sum 関数をテストする`sum.test.js`を作成します。

```js:tests/sum.test.js
import { expect } from "@esm-bundle/chai";
import { sum } from "../src/sum";

it("sums up 2 numbers", () => {
  expect(sum(1, 1)).to.equal(2);
  expect(sum(3, 12)).to.equal(15);
});
```

# 3. Web Test Runner でテストする

## 3-1. package.json の scripts に test を定義する

テストを実行するために、package.json の scripts に`test`を定義します。

```json:package.json
{
  .
  .
  .
  "scripts": {
    "テスト": "web-test-runner tests/**/**.test.js --node-resolve"
  }
}
```

`web-test-runner`は`wtr`と書いても OK です。

## 3-2. テストを実行する

正しく実行できると、以下のようにテストが成功します。

```
$ npm test

> web-test-runner-sample@0.1.0 test
> web-test-runner 'test/**/*.test.js' --node-resolve

Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

Finished running tests in 0.9s, all tests passed! 🎉
```

# 4. Web Test Runner の Config ファイルを用意する

package.json の`test`でテスト対象ファイル等を指定していました。  
これらの設定を`web-test-runner.config.js`に移動させます。

## 4-1. web-test-runner.config.js を作成する

```js:web-test-runner.config.js
module.exports = {
  files: "./tests/**/*.test.ts",
  nodeResolve: true,
};

```

## 4-2. package.json の test を修正する

package.json の`test`を`web-test-runner`のみにします。

```json:package.json
{
  .
  .
  .
  "scripts": {
    "テスト": "web-test-runner"
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

# 5. テストコードを TypeScript 化して、Web Test Runner でテストする

## 5-1. ファイルの拡張子を変更する

「2. 最初のテストを JavaScript で書く」で作成した sum.js と sum.test.js の拡張子を ts に変更します。  
中身は変更せず、拡張子のみ変更するだけです。

- `src/sum.js` -> `src/sum.ts`
- `tests/sum.test.js` -> `tests/sum.test.ts`

## 5-2. web-test-runner.config.js に esbuildPlugin を追加する

Web Test Runner で TypeScript のコードをテストするには`esbuildPlugin`を使用します。  
`esbuildPlugin`は`@web/dev-server-esbuild`モジュールで提供されています。

### 5-2-1. @web/dev-server-esbuild をインストールする

```
npm install -D @web/dev-server-esbuild
```

### 5-2-3. web-test-runner.config.js に plugins を追加する

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

これで、TypeScript で書かれた関数のテストができるようになりました。

# 参考情報

https://modern-web.dev/docs/test-runner/overview/

# 補足

## Web Test Runner とは

Web アプリケーションのテストランナー  
Lit が推奨している。

### 特徴

- ヘッドレスブラウザ
  - Puppeteer, Playwright, Selenium が利用可能
- ブラウザからログ、404、およびエラーを報告
- devtools で実際のブラウザウィンドウからデバッグ
- [Import Maps](https://modern-web.dev/docs/test-runner/writing-tests/mocking/)を使用して ES Module をモック
- Viewport サイズやダークモードなどのブラウザプロパティを公開
- テストを並行・分離して実行
- インタラクティブウォッチモード
- 変更されたテストのみを再実行することによる迅速な開発
- esbuild および rollup プラグインを搭載
