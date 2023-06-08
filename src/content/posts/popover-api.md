---
title: Chrome 114から使える popover API を試す
publishDate: 2023-06-08T14:18:00+09:00
tags: ["Web Frontend"]
---

# popover API の登場

Chrome 114 から popover API が利用可能になりました。

[Introducing the popover API - Chrome Developers](https://developer.chrome.com/en/blog/introducing-popover-api/)

他のブラウザのサポート状況は以下のとおりです。

[HTMLElement API: popover | Can I use... Support tables for HTML5, CSS3, etc](https://caniuse.com/mdn-api_htmlelement_popover)

# popover API の機能

popover API の機能はとてもざっくりと説明すると以下の 2 つです。

1. 画面の空いているところに独立したレイヤーでポップオーバーを表示
2. ポップオーバーの領域外をクリック・タップする、もしくは ESC キーを押すとポップオーバーが閉じてフォーカスが戻る

# 検証：ポップオーバー表示の領域について

以下のようなグリッドレイアウトの画面で、ポップオーバー表示をしてみます。  
この場合、ポップオーバーは `.main` の DOM の領域に表示されるのか試します。

```html
<body>
  <main class="parent">
    <div class="header">
      <h2>Header</h2>
    </div>
    <div class="main">
      <h2>Main</h2>
      <button popovertarget="my-popover">Open Popover</button>

      <div id="my-popover" popover>
        <p>I am a popover with more information.</p>
      </div>
    </div>
    <div class="side">
      <h2>Side</h2>
    </div>
  </main>
</body>

<style>
  body {
    background-color: cadetblue;
  }

  .parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  .header {
    padding-left: 20px;
    background-color: brown;
    grid-area: 1 / 1 / 2 / 6;
  }

  .main {
    padding-left: 20px;

    background-color: beige;
    grid-area: 2 / 1 / 6 / 5;
  }

  .side {
    padding-left: 20px;

    background-color: darkgoldenrod;
    grid-area: 2 / 5 / 6 / 6;
  }
</style>
```

## 結果：ポップオーバーは画面全体を領域とする

ポップオーバーは `.main` の領域内に表示されるのではなく、画面全体の空いている場所に表示されました。  
もし `.main` の領域内で表示したい場合は独自に制御する必要があります。

<p class="codepen" data-height="300" data-default-tab="result" data-slug-hash="QWJWqNN" data-preview="true" data-user="70-10" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/70-10/pen/QWJWqNN">
  popover api sample</a> by 70_10 (<a href="https://codepen.io/70-10">@70-10</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
