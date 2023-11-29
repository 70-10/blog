---
title: Go 1.8以前のバージョンでソートする
publishDate: 2019-10-31T20:00:00+09:00
tags: ["Develop"]
draft: false
---

# はじめに

**※Go 1.8 以降の場合は`sort.Slice`,`sort.StableSlice`を使いましょう。**

## AtCoder でソートしたかった

AtCoder の問題を解くなかで、独自に定義した型のソートをしたい場面があったので、`sort.Slice`を使って実装しました。  
ですが、AtCoder に提出するとコンパイルエラーとなりました。

```
# command-line-arguments
./Main.go:30: undefined: sort.SliceStable
```

調べてみると、`sort.Slice`は[1.8 から導入されました](https://golang.org/doc/go1.8#sort_slice)。

では、1.8 以前ではどうやってソートを実現していたのだろう？と疑問に思い調べた結果をメモとして残しておきます。

# 1.8 以前では、sort.Interface を満たすための関数実装が必要

1.8 以前でソートを実現するには sort.Interface 満たすための関数を実装する必要があります。  
sort.Interface には`Len`,`Less`,`Swap`の 3 つの関数が定義されています。

```go
// A type, typically a collection, that satisfies sort.Interface can be
// sorted by the routines in this package. The methods require that the
// elements of the collection be enumerated by an integer index.
type Interface interface {
	// Len is the number of elements in the collection.
	Len() int
	// Less reports whether the element with
	// index i should sort before the element with index j.
	Less(i, j int) bool
	// Swap swaps the elements with indexes i and j.
	Swap(i, j int)
}
```

これらを定義することでソートが可能になります。

## 検証用コード

```go
package main

import (
	"fmt"
	"sort"
)

type Student struct {
	ID     int
	Height int
}

type Students []Student

func (s Students) Len() int {
	return len(s)
}

func (s Students) Less(i, j int) bool {
	return s[i].Height > s[j].Height
}

func (s Students) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func main() {
	sortSlice()
	sortSort()
}

func sortSlice() {
	students := []Student{
		{ID: 1, Height: 150},
		{ID: 2, Height: 170},
		{ID: 3, Height: 180},
		{ID: 4, Height: 155},
		{ID: 5, Height: 180},
	}

	sort.Slice(students, func(i, j int) bool {
		return students[i].Height > students[j].Height
	})

	fmt.Println("sort.Slice")
	for _, s := range students {
		fmt.Printf("%+v\n", s)
	}
}

func sortSort() {
	students := []Student{
		{ID: 1, Height: 150},
		{ID: 2, Height: 170},
		{ID: 3, Height: 180},
		{ID: 4, Height: 155},
		{ID: 5, Height: 180},
	}

	sort.Sort(Students(students))
	fmt.Println("sort.Sort")
	for _, s := range students {
		fmt.Printf("%+v\n", s)
	}
}
```

## 参考文献

- [Golang の sort パッケージ - Qiita](https://qiita.com/Jxck_/items/fb829b818aac5b5f54f7)
- [Big Sky :: golang の sort インタフェース難しい問題が解決した](https://mattn.kaoriya.net/software/lang/go/20161004092237.htm)
