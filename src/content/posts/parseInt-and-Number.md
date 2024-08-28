---
title: "JavaScript: parseInt() と Number() の違い"
publishDate: 2023-08-29T13:53:00+09:00
tags: ["Develop", "JavaScript"]
---

JavaScript の `parseInt()` と `Number()` はどちらも与えられた文字列を数値に変換する関数です。  
それぞれの違いについて、どちらを使えばいいかをまとめます。

# 主な違い

|                     違い | `parseInt()`                                                 | `Number()`                                                        |
| -----------------------: | :----------------------------------------------------------- | :---------------------------------------------------------------- |
| 対応している数値のタイプ | 整数のみ                                                     | 整数と浮動小数点                                                  |
|       不正な文字への対応 | 部分的に解析する                                             | `NaN` を返す                                                      |
|               基数の指定 | できる                                                       | できない                                                          |
|         空白文字への対応 | 前後の空白を無視する。数字の間に空白が含まれていても認識する | 前後の空白を無視する。数字の間に空白が含まれていると `NaN` を返す |

## 1. 対応している数値のタイプ

`parseInt()` は整数のみ対応しています。  
`Number()` は整数と浮動小数点に対応しています。

```js
parseInt("10"); // 10
parseInt("10.5"); // 10
Number("10"); // 10
Number("10.5"); // 10.5
```

## 2. 不正な文字への対応

`parseInt()` は数字から始まる文字列は部分的に解析し、数字から始まらない文字列には `NaN` を返します。  
`Number()` は `NaN` を返します。

```js
parseInt("10abc"); // 10
parseInt("abc10"); // NaN
Number("10abc"); // NaN
Number("abc10"); // NaN
```

## 3. 基数の指定

`parseInt()`は第二引数に基数を指定できます。  
`Number()` は基数を指定できず文字列を必ず 10 進数の値として処理します。

```js
parseInt("100", 2); // 4
parseInt("100", 16); // 256
```

## 4. 空白文字への対応

`parseInt()` 、 `Number()` ともに前後の空白を無視します。  
`parseInt()` は数字の間に空白が存在する場合、空白より前にある数字だけを認識します。 `Number()` は数字の間に空白があると `NaN` を返します。

```js
parseInt(" 10 "); // 10
parseInt("10 20"); // 10
Number(" 10 "); // 10
Number("10 20"); // NaN
```

# どちらを使うべきか

`parseInt()` と `Number()` のどちらを使うかはユースケースによります。

## スタイルプロパティやCSSの解析

`10px` といった値を数値化するには `parseInt()` を使うほうが良いでしょう。

## 科学的な計算

浮動小数点を扱える `Number()` が良いでしょう。

# 参考情報

https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/parseInt

https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number/Number
