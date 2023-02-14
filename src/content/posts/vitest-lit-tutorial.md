---
title: VitestでLitコンポーネントをテストするためのチュートリアル
publishDate: 2022-08-02T12:45+09:00
tags: ["Web Frontend", "Lit", "Test"]
draft: false
---

Vitest で Lit のコンポーネントをテストするまでのチュートリアルです。

# プロジェクトを用意する

lit-test-sample という名前の Node プロジェクトを作成します。

```
mkdir lit-test-sample
cd lit-test-sample
npm init -y
```

# Lit をインストールする

```
npm install lit
```

# Vitest と jsdom をインストールする

```
npm install --save-dev vitest
```

テストコードの実行環境として jsdom を使うので、一緒にインストールします。

```
npm install --save-dev jsdom
```

# vitest.config.ts を用意する

実行環境に jsdom を指定するため、vitest.config.ts を設定します。

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
});
```

# package.json の scripts にテストスクリプトを設定する

Vitest を実行できるように package.json の scripts に`test`を定義します。

```json
{
  "name": "lit-test-sample",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "vitest"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "lit": "^2.2.8"
  },
  "devDependencies": {
    "jsdom": "^20.0.0",
    "vitest": "^0.20.2"
  }
}
```

# tsconfig.json を用意する

以下の tsconfig.json を用意します。

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "importsNotUsedAsValues": "preserve"
  }
}
```

# テストをする Lit コンポーネントを作成する

テストする Lit コンポーネント、`hello-world.ts`を作成します。  
`name`で指定された値を使って"Hello, {name}!"と表示するだけのシンプルなコンポーネントです。

```typescript
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("hello-world")
export class HelloWorld extends LitElement {
  @property()
  name = "World";

  render() {
    return html`<p>Hello, ${this.name}!</p>`;
  }
}
```

# テストを作成する

`hello-world.ts`をテストする、`hello-world.test.ts`を作成します。

```typescript
import { describe, expect, it } from "vitest";
import "./hello-world";

describe("HelloWorld", () => {
  it("should show name props", async () => {
    // Setup
    document.body.innerHTML = "<hello-world name='Test'></hello-world>";
    await customElements.whenDefined("hello-world");

    // Action
    const helloWorldElement = document.body.querySelector("hello-world");
    const actual = helloWorldElement.shadowRoot.querySelector("p").textContent;

    // Assert
    expect(actual).toBe("Hello, Test!");
  });
});
```

# テストを実行する

```
npm test
```

正しくテストが通ると以下のように結果が出力されます。

```
 ✓ hello-world.test.ts (1)

Test Files  1 passed (1)
     Tests  1 passed (1)
      Time  1.44s (in thread 22ms, 6536.64%)

 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

# 参考情報

- [vitest/examples/lit at main · vitest-dev/vitest](https://github.com/vitest-dev/vitest/tree/main/examples/lit)
