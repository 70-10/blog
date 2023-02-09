---
title: CypressでShadow DOMにアクセスする
publishDate: 2023-01-25T12:06+09:00
tags: ["Test", "E2E", "Web Components"]
draft: false
---

# Cypressで入れ子のWeb Componentsをテストしたい

この例では`<hello-world>`の中に`<my-element>`がある。  
その`<my-element>`内の`<button class="button">Click</button>`を取得したい。

```html
<hello-world>
  #shadow-root
    <h1 class="title">Hello Web Components</h1>
    <my-element>
      #shadow-root
        <button class="button">Click</button>
    </my-element>
</hello-world>
```

# `shadowRoot()` を何度も呼び出す

セレクタでShadow DOMにアクセスするには`shadowRoot()`を呼び出す必要がある。  
例のDOMだと、`<button class="button">Click</button>`にアクセスするには、以下のように2回`shadowRoot()`を呼び出す。

```typescript
cy.get("hello-world")
  .shadowRoot()
  .get("my-element")
  .shadowRoot()
  .get("button.button")
```

 `shadowRoot()`を呼び出さずに、`cy.get("button.button")`としても取得できない。  
Web Componentsの入れ子が深くなればなるほど、何度も`cy.get()` と`shadowRoot()`を呼び出さなければいけない。

# `includeShadowDom`オプションで`shadowRoot()`の呼び出しを省略する

`includeShadowDom`オプションを有効にするとShadow DOMも展開された状態となる。  
何度も`shadowRoot()`を呼び出さす必要がなくなり、`cy.get("button.button")`で取得できる。

ただ、取得できるパターン・できないパターンがある。

```typescript
// 取得できるパターン
cy.get("button.button");

cy.get("hello-world")
  .get("button.button");

cy.get("my-element")
  .get("button.button");

cy.get("hello-world")
  .get("my-element")
  .get("button.button");

// 取得できないパターン
cy.get("hello-world my-element button.button");

cy.get("hello-world button.button");

cy.get("my-element button.button");

cy.get("hello-world")
  .get("my-element button.button")
```

`cy.get("hello-world my-element button.button")`のようにひとつのセレクタ内にDOMとShadow DOMが混ざり合うことは許されていない。  

# 参考情報

- [shadow | Cypress Documentation](https://docs.cypress.io/api/commands/shadow)
  - Shadow DOMへのアクセス方法について
- [Configuration | Cypress Documentation](https://docs.cypress.io/guides/references/configuration#Global)
  -  `includeShadowDom`オプションについて
