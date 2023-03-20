---
title: react-helmetについて
publishDate: 2019-03-06T19:00:00+09:00
tags: ["React", "Web Frontend"]
draft: false
---

# はじめに

Gatsby のチュートリアルやサンプルコードでたびたび目にする`react-helmet`について調べました。

# [react-helmet](https://github.com/nfl/react-helmet)とは

head タグの管理をするコンポーネントです。

> It’s dead simple

[README](https://github.com/nfl/react-helmet#react-helmet)にこう書かれているように、死ぬほど簡単なようです。

# 基本的な書き方

```jsx
import React from "react";
import { Helmet } from "react-helmet";

class Application extends React.Component {
  render() {
    return (
      <div className="application">
        <Helmet>
          <meta charSet="utf-8" />
          <title>My Title</title>
          <link rel="canonical" href="http://mysite.com/example" />
        </Helmet>
        ...
      </div>
    );
  }
}
```

## props で渡すこともできる

```jsx
<Helmet title={`${post.title} | ${siteTitle}`} />
```

### 渡せる props

- `base`
- `bodyAttributes`
- `htmlAttributes`
- `link`
- `meta`
- `noscript`
- `script`
- `style`
- `title`

ここまで細かく設定するなら children で定義していくほうが楽でしょう。

# 導入を見送ったパターン

調べてみると、react-helmet の[導入を見送るべきパターンもあるようです](https://techblog.lclco.com/entry/2018/10/31/200000)。  
導入を見送った理由は以下のように書かれていました。

> 1. meta title しか更新されない（description, keywords は更新ではなく、追加されてしまう＜ 2 つになってしまう＞）
> 2. React コンポーネントのため、更新タイミングを制御できない（Google Analytics などの計測ツールへ値を送るタイミングでタイトルが変わっていなかった）

# おわりに

要件次第では対応できないこともありますが、Gatsby のような静的サイトを作成する場合は必須のコンポーネントです。  
meta タグを動的に変更したいケースは注意が必要です。
