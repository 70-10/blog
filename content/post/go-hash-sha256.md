---
title: "Goでsha256ハッシュするCLIをつくる"
date: 2018-07-28T15:52:03+09:00
tags: ["Go", "Node.js", "Hash"]
---

<p></p>

# はじめに

与えられた文字列を SHA-256 でハッシュ化する CLI がほしかったので、Go で書いてみました。

# コード

{{< highlight go >}}
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"flag"
	"fmt"
	"os"
	"strings"
)

func main() {
	flag.Parse()
	args := flag.Args()
	if len(args) <= 0 {
		os.Stderr.WriteString("Please input text\n")
		return
	}

	result := sha256.Sum256([]byte(args[0]))
	fmt.Println(strings.ToUpper(hex.EncodeToString(result[:])))
}
{{< /highlight >}}

標準ライブラリに用意されている`crypto/sha256`を利用するだけで OK です。  
string にキャストするとき、単純に`string(result)`ではできないので`hex.EncodeTostring`を使います。

## 実行結果

{{< highlight terminal >}}
» sha256 test
9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08
{{< /highlight >}}

第一引数にハッシュ化したい文字列を与えれば、ハッシュ化した値を返してくれます。単純。

## ちなみに、Node で書くと

{{< highlight js >}}
#!/usr/bin/env node

const { sha256 } = require("crypto-hash");

async function main() {
  if (process.argv.length <= 2) {
    console.error("Please input text");
    return;
  }

  const plaintext = process.argv[2];
  console.log(await sha256(plaintext));
}

main().catch(console.error);
{{< /highlight >}}

`crypto-hash`というモジュールを使えば`await sha256("text")`だけで OK。簡単。  
とはいえ、ハッシュ化のちょっと面倒くさいコード部分を`crypto-hash`が対応してくれているのです。

このモジュールに頼らずハッシュ化をする場合は以下のように書きます。

{{< highlight js >}}
const crypto = require("crypto");

const sha256 = crypto.createHash("sha256");
sha512.update("text");
const hash = sha512.digest("hex");
{{< /highlight >}}

読めばすぐに何をしているかはわかりますが、Go のほうがより直感的に感じます。

# おわりに

Go は読みやすい。そして Node で実装したものと比べると、やはり実行速度が速い。
