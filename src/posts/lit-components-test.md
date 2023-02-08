---
title: LitのコンポーネントテストはVitestで決まりかもしれない
publishDate: 2022-07-15T11:00+09:00
tags: ["Test", "Web Frontend", "Web Components", "Lit"]
---

# 結論：コンポーネントテストはVitestが最適解（かもしれない）

[Vitest](https://vitest.dev/)が良い。
イメージとしてはVite + Jest。テストはJestライクに書けて、コンポーネントテストもできるようになった感じ。

VitestだとLitのコンポーネントテストがここまで簡単に書けてしまう。
[StackBlitzでオンライン実行する](https://stackblitz.com/fork/github/vitest-dev/vitest/tree/main/examples/lit?initialPath=__vitest__)

ただ、まだv1にも達していないので今後の動向を注視していきたい。

# 結論にいたるまで：Litのテスト方法の調査変遷

## Web Test Runnerを調べる

最近プロダクトでLitを使っていて、コンポーネントテストをどうやってやるかに悩んでいた。  
まず、[Litが推している](https://lit.dev/docs/tools/testing/#web-test-runner)、[Web Test Runner](https://modern-web.dev/docs/test-runner/overview/)を試した。  
試しているうちに、どうにも`@customElement`がうまく処理できないことが判明。  
[Web Test RunnerのExampleリポジトリ](https://github.com/modernweb-dev/example-projects/blob/master/lit-element-ts-esbuild/my-element.ts)を見ると、わざわざ別ファイルから`window.customElements.define`を呼び出しているので、何かしらの問題を抱えているように見える。  
`@customElement`を多様しているプロダクトだったので、これはかなり致命的だった。

次に、[LitのStarter Kitリポジトリのテスト](https://github.com/lit/lit-element-starter-ts/)を参考にしてみた。  
Web Test Runnerでテストするための設定項目が多すぎて途中で挫折。

そんなこんなで、Web Test Runnerは見送った。

## Jestを調べる

Web Test Runnerを諦めたあとは、Jestで実現できないか調べた。  
TypeScriptで書いているのでts-jestを使うのはもちろんだけど、babel-jestまで導入しないといけなかった。  
（[GitHubでのIssue](https://github.com/facebook/jest/issues/11783)を参照）

しかもこの方法を取ったけれども、結局Shadow DOMがちゃんとレンダリングされなくて詰むという状態になって心が折れた。

## コンポーネントテストが導入されたCypress,Playwrightを調べる

最近、E2Eテストフレームワークがコンポーネントテストをサポートするようになってきた。  
CypressとPlaywrightがサポートし始めている。どちらもまだPreview版な状態。

これでLit（Web Components）もできるかと思ったけれど、現在サポートしているのはReact/Vueなどの有名所のみ。  
Litはもう少し待つ必要がありそうだとわかったところで調査終了。

## Vitestに出会う

Viteを調べているときにVitestを見つけた。  
[Examples](https://vitest.dev/guide/#examples)を眺めていると、なんとLitがある！  
コードを見ると、`vite.config.ts`を設定するだけのシンプルさ。  
アサーションやモックもJestライクに書けるから、すでにJestを導入しているプロダクトでも学習コストが低い。

ということで、Vitestを導入することに決めた。

