---
title: String.prototype.includes()の検索文字列を複数指定できる関数を作る
publishDate: 2021-02-05T09:00:00+09:00
tags: ["JavaScript", "TypeScript"]
draft: false
---

# String.prototype.includes()とは

- `String.prototype.includes()`は特定の文字列がある文字列の中に存在するかをチェックする
  - [リファレンス](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/includes)
- 特定の文字列は 1 つしか指定できない
- `"Hello, World".includes(["Hello", "World"])`のように文字列を複数指定できるようにしたい

# 関数を作る

複数指定できる関数を作る。言語は TypeScript。  
or 検索か and 検索も選べるようにしている。

```typescript
const multipleIncludes = (
  text: string,
  pattern: string | string[],
  conditions: "and" | "or" = "or"
) => {
  if (typeof pattern === "string") {
    return text.includes(pattern);
  }

  if (conditions === "and") {
    for (const word of pattern) {
      if (!text.includes(word)) {
        return false;
      }
    }

    return true;
  }

  for (const word of pattern) {
    if (text.includes(word)) {
      return true;
    }
  }
  return false;
};

export default multipleIncludes;
```
