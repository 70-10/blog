---
title: "JavaScript: Null合体演算子 (??) を使おう"
publishDate: 2021-09-10T14:44:00+09:00
tags: ["Develop", "JavaScript"]
draft: false
---

# 結論

JavaScript で null もしくは undefined だけをチェックしたいときは、OR 演算子 (`||`)ではなく Null 合体演算子 (`??`)を使おう。

# Null 合体演算子とは

左辺が null もしくは undefined の場合に右辺の値を返す。

## OR 演算子 (`||`)との違い

OR 演算子は左辺が`null`/`undefined`/`0`/`NaN`/`false`の Falsy な値の場合に右辺を返す。

### Null 合体演算子と OR 演算子の挙動を見てみる

```js
false || true;
// => true
false ?? true;
// => false

0 || 1;
// => 1
0 ?? 1;
// => 0

"" || "Hello";
// => 'Hello'
"" ?? "Hello";
// => ''

null || "Hello";
// => 'Hello'
null ?? "Hello";
// => 'Hello'

undefined || "Hello";
// => 'Hello'
undefined ?? "Hello";
// => 'Hello'
```

# 参考サイト

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
