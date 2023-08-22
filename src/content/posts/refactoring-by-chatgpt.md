---
title: ChatGPTにリファクタリングしてもらう
publishDate: 2023-05-22T17:06:00+09:00
tags: ["GPT", "プログラミング"]
---

# ChatGPT Plus に課金

今になって、ようやく ChatGPT Plus に課金しました。  
ChatGPT にそこまで関心を寄せてなかったんですが、時代の潮流を見るに無視できないなと思いまして。

# 過去に書いたコードのリファクタリングを依頼

以前作成した[複数文字列検索のコード](/posts/js-multiple-includes)のリファクタリングを ChatGPT にリファクタリングしてもらいます。

```ts:複数文字列検索
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

## ChatGPT (GPT-4) からの回答

> 与えられたコードをリファクタリングすると以下のようになります。
>
> ```typescript
> type LogicOperator = "and" | "or";
>
> function containsPatterns(
>   text: string,
>   patterns: string[],
>   operator: LogicOperator,
> ): boolean {
>   return operator === "and"
>     ? patterns.every((pattern) => text.includes(pattern))
>     : patterns.some((pattern) => text.includes(pattern));
> }
> ```
>
> リファクタリングした関数は配列のメソッド `every` と `some` を使っています。`every` メソッドは配列のすべての要素が条件を満たすときに `true` を返し、`some` メソッドは配列のうち少なくとも 1 つの要素が条件を満たすときに `true` を返します。これにより、for ループを使わずに簡潔に書くことができます。
>
> また、このリファクタリングでは条件演算子 (三項演算子) を使っています。これにより、if...else 文を 1 行で書くことができます。このコードは、論理演算子が 'and' の場合は `every` メソッドを使い、'or' の場合は `some` メソッドを使います。

なるほど。ちゃんとリファクタリングしてくれています。  
しかも、どういう修正をしたのか・なぜその修正をしたのかまでちゃんと教えてくれました。

# イチからコードの作成を頼んでみる

## 自分が書いたのと似たようなコードができあがった

> 指定されたテキストが指定されたパターンを含んでいるかを確認する関数を TypeScript で作成してください。パターンは複数指定できるものとし、and/or 条件の指定ができるものとします。

という指示を与えると、以下のようなコードが生成されました。自分が最初に書いたものと近いです。  
if や for が多用されてネストが深いです。少し読みづらいですね。

```ts
type LogicOperator = "and" | "or";

function containsPatterns(
  text: string,
  patterns: string[],
  operator: LogicOperator,
): boolean {
  if (operator === "and") {
    for (let pattern of patterns) {
      if (!text.includes(pattern)) {
        return false;
      }
    }
    return true;
  } else if (operator === "or") {
    for (let pattern of patterns) {
      if (text.includes(pattern)) {
        return true;
      }
    }
  }
  return false;
}

// 使用例
let text = "Hello, world!";
let patterns1 = ["Hello", "world"];
let patterns2 = ["Hello", "Goodbye"];

console.log(containsPatterns(text, patterns1, "and")); // true
console.log(containsPatterns(text, patterns2, "and")); // false
console.log(containsPatterns(text, patterns1, "or")); // true
console.log(containsPatterns(text, patterns2, "or")); // true
```

## 生成されたコードのリファクタリングを依頼

生成されたコードに対してのリファクタリングも頼んでみました。  
すると、自分が書いたコードをリファクタリングしてもらった結果とほぼ同じものにしあがりました。

# 感想

## 普遍的な関数は自分で作らなくてもいい

「複数文字列の検索」のような普遍的な関数であれば、正しい仕様さえ伝えればそれなりのクオリティまで持っていけそうだとわかりました。  
仕様を正しく認識しそれを言語化する能力がちゃんと身についていれば、かなり便利に使えますね。

## コードの細か部分に頭を使う時間が減る

どうやって実装すればいいかなあと悩む時間が劇的に減りそうです。  
そしてその空いた時間には、設計や仕様、要求や要件といったひとつ上の工程に対して費やすのがベターなのでしょう。

徐々に自分自身のエンジニアとしての役割が変わってくるのだろうなとひしひしと感じます。

とはいえ、すべてを AI に奪われるとも思えないです。  
提案してきたリファクタリングを採用するのか決めるのは自分ですし、生成されたコードに対して責任を負うのも自分です。  
実際、提案されたリファクタリングの三項演算子の部分は採用せず if 文で書き直すでしょう。
