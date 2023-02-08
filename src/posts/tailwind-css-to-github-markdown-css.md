---
title: tailwindcss-typographyからgithub-markdown-cssに乗り換えた
publishDate: 2022-03-24T12:29+09:00
tags: ["CSS"]
---

以前TailwindCSSに乗り換えたタイミングで、tailwindcss-typogphyを採用した。  
そのままでは意図したスタイルが当たらないため、少しカスタマイズする必要があり当時から使い勝手が悪いなという印象だった。

[github-markdown-css](https://github.com/sindresorhus/github-markdown-css)ならほとんどカスタマイズせずに済むということがわかったので今回乗り換えた。

使い方は簡単で、スタイルを当てたいコンポーネントファイルでgithub-markdown-cssをインポートするだけ。  
あとは、そのスタイルを当てるDOMに対して`markdown-body`クラスを付与すれば完了。

github-markdown-cssはダークモードにも対応している。  
今回はダークモードが不要だったので、lightモードのみのCSSを使う必要があったので、[github-markdown-light.css](https://github.com/sindresorhus/github-markdown-css/blob/main/github-markdown-light.css)を利用した。

tailwindcss-typographyと相性の悪かったPrism.jsも、github-markdown-cssなら問題ない。  
codeタグのスタイルを調整する必要もなかった。
