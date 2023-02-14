---
title: React.FragmentでDOMの構成を正しく保つ
publishDate: 2019-04-19T14:14+09:00
tags: ["Web Frontend", "React"]
draft: false
---

# 課題: 正しい DOM 構成のままコンポーネントを分離したい

ある Table コンポーネントの td 要素をひとまとめにした、`Columns`コンポーネントを用意したいとします。

```jsx
const Table = () => (
  <table>
    <tbody>
      <tr>
        <Columns />
      </tr>
    </tbody>
  </table>
);
```

td 要素をまとめるとき、div で囲ってしまうとノードの構成がおかしくなってしまいます。

```jsx
const Columns = () => (
  <div>
    <td>1</td>
    <td>2</td>
  </div>
);
```

## 展開後の HTML

```html
<table>
  <tbody>
    <tr>
      <div>
        <td>1</td>
        <td>2</td>
      </div>
    </tr>
  </tbody>
</table>
```

tr と td の間に div が入ってしまい正しい構成ではありません。

# 解決: `React.Fragment`を使う

`React.Fragment`を使うことで解決できました。

```jsx
import React, { Fragment } from "react";

const Columns = () => (
  <Fragment>
    <td>1</td>
    <td>2</td>
  </Fragment>
);
```

## 展開後の HTML

```html
<table>
  <tbody>
    <tr>
      <td>1</td>
      <td>2</td>
    </tr>
  </tbody>
</table>
```

React.Fragment は展開時に無視されるので、正しい構成になりました。

## 省略記法

`<Fragment> ... </Fragment>`を`<> ... </>`と省略して書くこともできます。  
ただ、ツールがこの省略記法にまだ対応していない可能性があるため、Fragment を使ったほうが無難とのことです。

# ドキュメント

https://ja.reactjs.org/docs/fragments.html
