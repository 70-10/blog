---
title: リーディングプログレスバーをつくる
publishDate: 2024-08-13T18:15:13.374+09:00
tags: ["Develop", "Web Frontend"]
---

ブログでよくあるページのスクロール進捗を視覚的に表すリーディングプログレスバーをこのブログにも導入してみました。

# 実装手順

Astro コンポーネントで実装します。  
`<progress>` を使用して進捗バーを作成し、JavaScript を使用してスクロール位置に応じて進捗バーの値を更新します。

```astro:ReadingProgressBar.astro
<progress
  id="progress-bar"
  class="fixed left-0 top-0 h-1 w-full"
  value="0"
  max="100"></progress>

<script is:inline>
  window.addEventListener("scroll", function () {
    // ページの上からスクロールした距離
    const scrollPosition = window.scrollY;

    // ページ全体の高さ
    const documentHeight = document.documentElement.scrollHeight;

    // 画面の高さ
    const windowHeight = window.innerHeight;

    // スクロール可能な高さ
    const scrollableHeight = documentHeight - windowHeight;

    // どれだけスクロールしたかのパーセンテージ
    const scrolledPercentage = (scrollPosition / scrollableHeight) * 100;

    const progressBar = document.getElementById("progress-bar");
    progressBar.value = scrolledPercentage.toFixed(2);
  });
</script>

<style>
  #progress-bar {
    @apply bg-gray-300;
  }
  #progress-bar::-webkit-progress-bar {
    @apply bg-gray-300;
  }
  #progress-bar::-webkit-progress-value {
    @apply bg-emerald-600;
  }
  #progress-bar::-moz-progress-bar {
    @apply bg-emerald-600;
  }
</style>
```

## 実装詳細

### HTML

`<progress>` がスクロール進捗を表示するバーです。  
この要素の value 属性がスクロール進捗に応じて更新され、max 属性は 100 に設定しています。

### JavaScript

スクロールイベントが発生するたびに、ページのスクロール位置に基づいてプログレスバーの値を更新します。  
ユーザーがページを上下にスクロールするたび、バーの長さが動的に変化します。

### CSS

`@apply` ディレクティブを使って、Tailwind CSS を利用し、進捗バーの見た目をカスタマイズしています。
`-webkit-progress-value` と `-moz-progress-bar` のスタイルを定義することで、異なるブラウザでの表示を統一しています。

# 参考情報

https://developer.mozilla.org/docs/Web/HTML/Element/progress

https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-progress-value

https://developer.mozilla.org/en-US/docs/Web/CSS/::-moz-progress-bar

https://stackoverflow.com/questions/18368202/how-can-i-set-the-color-for-the-progress-element

https://zenn.dev/tokuyuuuuuu/articles/1aaaebb604bf69
