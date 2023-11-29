---
title: tailwindcss-typographyからgithub-markdown-cssに乗り換えた
publishDate: 2022-03-24T12:29:00+09:00
tags: ["Web Frontend"]
draft: false
---

以前 TailwindCSS に乗り換えたタイミングで、tailwindcss-typogphy を採用した。  
そのままでは意図したスタイルが当たらないため、少しカスタマイズする必要があり当時から使い勝手が悪いなという印象だった。

[github-markdown-css](https://github.com/sindresorhus/github-markdown-css)ならほとんどカスタマイズせずに済むということがわかったので今回乗り換えた。

使い方は簡単で、スタイルを当てたいコンポーネントファイルで github-markdown-css をインポートするだけ。  
あとは、そのスタイルを当てる DOM に対して`markdown-body`クラスを付与すれば完了。

github-markdown-css はダークモードにも対応している。  
今回はダークモードが不要だったので、light モードのみの CSS を使う必要があったので、[github-markdown-light.css](https://github.com/sindresorhus/github-markdown-css/blob/main/github-markdown-light.css)を利用した。

tailwindcss-typography と相性の悪かった Prism.js も、github-markdown-css なら問題ない。  
code タグのスタイルを調整する必要もなかった。
