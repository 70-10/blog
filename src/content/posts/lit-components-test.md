---
title: LitのコンポーネントテストはVitestで決まりかもしれない
publishDate: 2022-07-15T11:00:00+09:00
tags: ["Web Frontend", "テスト"]
draft: false
---

# 結論：コンポーネントテストは Vitest が最適解（個人的見解）

[Vitest](https://vitest.dev/)が良い。
イメージとしては Vite + Jest。テストは Jest ライクに書けて、コンポーネントテストもできるようになった感じ。

Vitest だと Lit のコンポーネントテストがここまで簡単に書けてしまう。
[StackBlitz でオンライン実行する](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/lit?initialPath=__vitest__)

ただ、まだ v1 にも達していないので今後の動向を注視していきたい。

# 結論にいたるまで：Lit のテスト方法の調査変遷

## Web Test Runner を調べる

最近プロダクトで Lit を使っていて、コンポーネントテストをどうやってやるかに悩んでいた。  
まず、[Lit が推している](https://lit.dev/docs/tools/testing/#web-test-runner)、[Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)を試した。  
試しているうちに、どうにも `@customElement` をうまく処理できないことが判明。  
[Web Test Runner の Example リポジトリ](https://github.com/modernweb-dev/example-projects/blob/master/lit-element-ts-esbuild/my-element.ts)を見ると、わざわざ別ファイルから`window.customElements.define`を呼び出している。何かしらの問題を抱えているように見える。  
`@customElement`を多様しているプロダクトだったので、これはかなり致命的だった。

次に、[Lit の Starter Kit リポジトリのテスト](https://github.com/lit/lit-element-starter-ts/)を参考にしてみた。  
Web Test Runner でテストするための設定項目が多すぎて途中で挫折。

そんなこんなで、Web Test Runner は見送った。

## Jest を調べる

Web Test Runner を諦めたあとは、Jest で実現できないか調べた。  
TypeScript で書いているので ts-jest を使うのはもちろんだけど、babel-jest まで導入しないといけなかった。  
（[GitHub での Issue](https://github.com/facebook/jest/issues/11783)を参照）

しかもこの方法を取ったけれども、結局 Shadow DOM がちゃんとレンダリングされなくて詰むという状態になって心が折れた。

## コンポーネントテストが導入された Cypress,Playwright を調べる

最近、E2E テストフレームワークがコンポーネントテストをサポートするようになってきた。  
Cypress と Playwright がサポートし始めている。どちらもまだ Preview 版な状態。

これで Lit（Web Components）もできるかと思ったけれど、現在サポートしているのは React/Vue などの有名所のみ。  
Lit はもう少し待つ必要がありそうだとわかったところで調査終了。

## Vitest に出会う

Vite を調べているときに Vitest を見つけた。  
[Examples](https://vitest.dev/guide/#examples)を眺めていると、なんと Lit がある！  
コードを見ると、`vite.config.ts`を設定するだけのシンプルさ。  
アサーションやモックも Jest ライクに書けるから、すでに Jest を導入しているプロダクトでも学習コストが低い。

ということで、Vitest を導入することに決めた。
