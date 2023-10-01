---
title: Jestでカスタムエラーのフィールド変数をアサートする
publishDate: 2023-10-01T21:20:00+09:00
tags: ["JavaScript", "TypeScript", "Jest"]
---

以下のようなカスタムエラークラスが持つフィールド変数、 `name` のテストを書きたいとします。

```ts
class CustomError extends Error {
  constructor(name, message = "This is a custom error") {
    super(message);
    this.name = name;
  }
}
```

テストをするために `CustomError` を throw するだけの関数を用意します。  
`CustomError` の引数には `Error Name` を渡しています。  
つまり、 `CustomError` の `name` に `Error Name` がセットされます。

```ts
function throwErrorFunction() {
  throw new CustomError("Error Name");
}
```

## `toThrow`, `toThrowError` は型とメッセージをチェックする

`throwErrorFunction()` を `toThrow` と `toThrowError` でテストします。

```ts
test("should throw the custom error", () => {
  expect(() => throwErrorFunction()).toThrow(
    new CustomError("Different Error Name"),
  );
});

test("should throw the custom error with the correct message", () => {
  expect(() => throwErrorFunction()).toThrowError(
    new CustomError("Different Error Name"),
  );
});
```

どちらのテストケースも期待値には `Different Error Name` を引数に渡す `CustomError` インスタンスを指定しています。  
`throwErrorFuntcion()` は `Error Name` が設定された `CustomError` を返します。期待値 (`Differrent Error Name`) と実際の値 (`Error Name`) は違っています。  
ですが、テストは通ってしまいます。

`toThrow` と `toThrowError` はエラーの型とエラーメッセージ（Error.message）をチェックします。その他のフィールド変数はチェックしません。  
なので先程のテストケースが通るのです。

## フィールド変数をアサートするには try-catch を使う

カスタムしたエラーが持つフィールド変数をチェックするには以下のように、try-catch を使います。

```ts
test("should throw the custom error with the correct message", () => {
  try {
    throwErrorFunction();
  } catch (error) {
    expect(error).toBeInstanceOf(CustomError);
    expect(error.name).toBe("Error Name");
  }
});
```

このように、カスタムエラークラスのフィールド変数をチェックするには、ひと手間加える必要があります。
