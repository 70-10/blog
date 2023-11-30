---
title: Playwrightでブラウザの時刻を操作する
publishDate: 2023-04-11T13:02:00+09:00
tags: ["Web Frontend", "テスト"]
---

現在 Playwright にはブラウザ内の時刻を操作する機能がありません。  
この機能について Issue が上がっていますが、まだ対応するまでには至っていません。

https://github.com/microsoft/playwright/issues/6347

この Issue ではワークアラウンドとして Sinon.js を使った方法が提案されています。  
今回はその方法でブラウザの時刻を操作します。

# 流れ

0. Playwright のプロジェクトを用意
1. Sinon.js のインストール
2. 時刻操作をするサンプルテストを作成

## 0. Playwright のプロジェクトを用意

まずは Playwright のプロジェクトを用意します。

```:Terminal
npm init playwright@latest
```

## 1. Sinon.js のインストール

[Sinon.js](https://sinonjs.org/) をインストールします。TypeScript を使用するので `@types/sinon` もインストールします。

```:Terminal
npm install -D sinon @types/sinon
```

## 2. 時刻操作をするサンプルテストを作成

```ts:tests/fake-timer.test.ts
import test, { expect } from "@playwright/test";
import path from "node:path";
import { SinonFakeTimers, SinonStatic } from "sinon";

declare global {
  interface Window {
    __clock: SinonFakeTimers;
    sinon: SinonStatic;
  }
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript({
    path: path.join(__dirname, "..", "./node_modules/sinon/pkg/sinon.js"),
  });

  await context.addInitScript(() => {
    window.__clock = window.sinon.useFakeTimers();
  });
});

test("fake timer test", async ({ page }) => {
  await page.setContent(`
    <h1>UTC Time: <x-time></x-time></h1>
    <script>
      const time = document.querySelector('x-time');
      (function renderLoop() {
        const date = new Date();
        time.textContent = [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()]
          .map(number => String(number).padStart(2, '0'))
          .join(':');
        setTimeout(renderLoop, 1000);
      })();
    </script>
  `);

  await expect(page.locator("x-time")).toHaveText("00:00:00");
  await page.evaluate(() => window.__clock.tick(60 * 60 * 1000));
  await expect(page.locator("x-time")).toHaveText("01:00:00");
});
```

最初に Window へ **clock と sinon を定義しています。  
`Window.**clock` から時刻を操作します。

`beforeEach`内では Sinon.js をブラウザに追加し、 `Window.__clock` を初期化しています。  
時刻を操作するには以下のように `page.evaluete` を使います。

```ts:時刻を1時間進める
await page.evaluate(() => window.__clock.tick(60 * 60 * 1000));
```

# テストのサンプル

[playwright-samples/fake-timer.spec.ts at main · 70-10/playwright-samples](https://github.com/70-10/playwright-samples/blob/main/tests/fake-timer.spec.ts)

# 参考記事

https://github.com/microsoft/playwright/issues/6347#issuecomment-965887758
