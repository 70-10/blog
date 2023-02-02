---
title: react-helmetについて
publishDate: 2019-03-06T19:00+09:00
tags: ["React", "react-helmet"]
---

# はじめに

Gatsbyのチュートリアルやサンプルコードでたびたび目にする`react-helmet`について調べました。

# [react-helmet](https://github.com/nfl/react-helmet)とは

headタグの管理をするコンポーネントです。

[README](https://github.com/nfl/react-helmet#react-helmet)に

> It’s dead simple

とあるように、死ぬほど簡単なようです。

# 基本的な書き方

```jsx

import React from "react";
import {Helmet} from "react-helmet";

class Application extends React.Component {
  render () {
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
};
```

## propsで渡すこともできる

```jsx
<Helmet title={`${post.title} | ${siteTitle}`} />
```

### 渡せるprops

- `base`
- `bodyAttributes`
- `htmlAttributes`
- `link`
- `meta`
- `noscript`
- `script`
- `style`
- `title`

ここまで細かく設定するならchildrenで定義していくほうが楽でしょう。


# 導入を見送ったパターン

調べてみると、react-helmetの[導入を見送るべきパターンもあるようです](https://techblog.lclco.com/entry/2018/10/31/200000)。  
導入を見送った理由は以下のように書かれていました。

> 1. meta titleしか更新されない（description, keywordsは更新ではなく、追加されてしまう＜2つになってしまう＞）
> 2. Reactコンポーネントのため、更新タイミングを制御できない（Google Analyticsなどの計測ツールへ値を送るタイミングでタイトルが変わっていなかった）

# おわりに

要件次第では対応できないこともありますが、Gatsbyのような静的サイトを作成する場合は必須のコンポーネントです。  
metaタグを動的に変更したいケースは注意が必要です。
