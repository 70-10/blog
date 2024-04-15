---
title: リーディングプログレスをつくる
publishDate: 2024-04-12T07:01:13.374+09:00
tags: ["Develop", "Web Frontend"]
---

```astro:ReadingProgress.astro
<progress
  id="progress-bar"
  class="fixed left-0 top-0 h-1 w-full"
  value="0"
  max="100"></progress>

<script is:inline>
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;

    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollableHeight = documentHeight - windowHeight;
    const scrolledPercentage = (scrollPosition / scrollableHeight) * 100;

    const progressBar = document.getElementById("progress-bar");
    progressBar.value = scrolledPercentage.toFixed(2);
  });
</script>

<style>
  progress {
    @apply bg-gray-300;
  }
  progress::-webkit-progress-bar {
    @apply bg-gray-300;
  }
  progress::-webkit-progress-value {
    @apply bg-emerald-600;
  }
  progress::-moz-progress-bar {
    @apply bg-emerald-600;
  }
</style>
```

# 参考情報

https://developer.mozilla.org/docs/Web/HTML/Element/progress

https://stackoverflow.com/questions/18368202/how-can-i-set-the-color-for-the-progress-element

https://zenn.dev/tokuyuuuuuu/articles/1aaaebb604bf69
