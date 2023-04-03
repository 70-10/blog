---
title: Playwright + sinonでブラウザの時間を操作する
publishDate: 2023-03-27T12:24:00+09:00
tags: ["Web Frontend", "Test", "Playwright", "E2E"]
---

現在 Playwright にはブラウザ内の時計を操作する機能がありません。  
この機能について Issue が上がっていますが、まだ対応するまでには至っていません。  
[\[Feature\] Time/Date emulation via e.g. a `clock()` primitive · Issue #6347 · microsoft/playwright](https://github.com/microsoft/playwright/issues/6347)

この Issue ではワークアラウンドとして Sinon.js を使った方法が提案されています。  
今回はその方法でブラウザの時刻を操作します。

# 準備: Playwright のプロジェクトを用意

まずは Playwright のプロジェクトを用意します。

```:Terminal
npm init playwright@latest
```

# Sinon.js のインストール

```:Terminal
npm install -D sinon @types/sinon
```

# Sinon.js を使った時刻操作をするテストを作成

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
});
```

# `waitForResponse()`

`waitForResponse()` で取得できるリクエストタイミングの時刻は FakeTimer ではない。

# 参考記事

- [\[Feature\] Time/Date emulation via e.g. a `clock()` primitive · Issue #6347 · microsoft/playwright](https://github.com/microsoft/playwright/issues/6347#issuecomment-965887758)
