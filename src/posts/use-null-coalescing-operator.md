---
title: Null合体演算子 (??) を使おう
publishDate: 2021-09-10T14:44+09:00
tags: ["JavaScript"]
---

# 結論

nullもしくはundefinedだけをチェックしたいときは、OR演算子 (`||`)ではなくNull合体演算子 (`??`)を使おう。

# Null合体演算子とは

左辺がnullもしくはundefinedの場合に右辺の値を返す。

## OR演算子 (`||`)との違い

OR演算子は左辺が`null`/`undefined`/`0`/`NaN`/`false`のFalsyな値の場合に右辺を返す。

### Null合体演算子とOR演算子の挙動を見てみる

```javascript
> false || true
true
> false ?? true
false

> 0 || 1
1
> 0 ?? 1
0

> "" || "Hello"
'Hello'
> "" ?? "Hello"
''

> null || "Hello"
'Hello'
> null ?? "Hello"
'Hello'

> undefined || "Hello"
'Hello'
> undefined ?? "Hello"
'Hello'
```

# 参考サイト

- [Null 合体 (??) - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)
