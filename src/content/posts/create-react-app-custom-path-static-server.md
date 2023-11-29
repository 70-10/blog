---
title: create-react-appでルートパスをカスタムした時のStatic Serverの起動について
publishDate: 2020-11-03T20:46:00+09:00
tags: ["Web Frontend"]
draft: false
---

# create-react-app の仕様

create-react-app のビルドでは、`package.json`の`homepage`の値を参照しています。  
無指定だとルートパスは`/`とります。package.json に`"homepage": "https://example.com/custom`と設定するとルートパスは`/custom`になります。

# Static Server での起動

create-react-app で Static Server の起動には`serve`が推奨されています。  
`serve`はルートパスが必ず`/`になり、カスタムできません。

ルートパスを変更した場合は、`express`などの Web フレームワークを使って、自作する必要があります。  
`express`を利用した例は以下のとおりです。

```js
const express = require("express");
const path = require("path");
const app = express();

app.use("/custom", express.static(path.join(__dirname, "build")));

app.get("/custom", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(9000);
```

これで`http://localhost:9000/custom`からアクセスできるようになります。

# 参照

- [Deployment #Building for Relative Paths | Create React App](https://create-react-app.dev/docs/deployment/#building-for-relative-paths)
- [Deployment #Other Solutions | Create React App](https://create-react-app.dev/docs/deployment/#other-solutions)
