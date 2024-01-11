---
title: 私が else-if を書かない理由
publishDate: 2024-01-10T08:39:03.650+09:00
tags: ["Develop"]
---

ここ数年、else-if を書いていない。書いてはいけないとまで思っている。
else-if を書かないというより、早期 return を意識し続けてきた結果、else-if を書くタイミングがなくなったというほうが正しいかもしれない。

コードレビューをしているときに、 else-if を見るとうっとなってしまう。直感的にリファクタリングしたいという思いに駆られる。  
いつも通り、「else-if は書かない形に書き換えたほうが読みやすいですよ」とコメントを入れた。

読みやすさは人それぞれだから、else-if のほうが読みやすい人もいる。

なぜ else-if ではないほうがいいのかをうまく説明できなかった。

社会人 1 年目のとき、「オブジェクト指向できていますか？」というスライドとリーダブルコードを何度も読んだ。

https://www.slideshare.net/MoriharuOhzu/ss-14083300

https://www.oreilly.co.jp/books/9784873115658/

「オブジェクト指向できていますか？」には「#2 else 句を使用しないこと」と書かれていて、おそらくここが発端だろう。

<iframe src="https://www.slideshare.net/slideshow/embed_code/key/bgbkoCfRlkIu2R?startSlide=35" width="597" height="486" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px;max-width: 100%;" allowfullscreen></iframe><div style="margin-bottom:5px"><strong><a href="https://www.slideshare.net/MoriharuOhzu/ss-14083300" title="オブジェクト指向できていますか？" target="_blank">オブジェクト指向できていますか？</a></strong> from <strong><a href="https://www.slideshare.net/MoriharuOhzu" target="_blank">Moriharu Ohzu</a></strong></div>

今読み返してみると、なぜ else-if を避けるべきなのかは詳しく書かれていない。

ということで、「オブジェクト指向できていますか？」の元ネタである「ThoughtWorks アンソロジー」を読んでみる。

https://www.oreilly.co.jp/books/9784873113890/

書籍内にはこう書かれていた。

> プログラマなら誰でも if-else 構文を知っています。この構文は、ほとんどのプログラミング言語に組み込まれており、単純な条件ロジックなら誰でも簡単に理解できます。  
> しかし、ほとんどのプログラマは、うんざりするほどネストされた追跡 不可能な条件文や、何度もスクロールしなければ読めない case 文を見たことがあるでしょう。  
> さらに悪いことに、既存の条件文に単に分岐を 1つ増やすほうが、もっと適切な解決方法を考えるよりも楽なのです。また、条件文は重複の原因になることがよくあります。

なるほど、else-if をそのままにしておくと、そこにどんどん新たな分岐を追加していって、最後は読むに耐えない状態になってしまうと。楽な方法だけど後々困ることになる原因のひとつだと言っている。

つまり、else-if は、今後やってくるであろう複雑性の根源になりえるから、早いうちに芽を摘んでおかないといけないんだ。

「じゃあ、複雑になってきたら else-if 使わない書き方にリファクタリングしましょう」という声が聞こえてきそうだ。  
まあ、それでいいのかもしれない。その時点で読みづらくないならそれでいいし、きれいにしすぎることにこだわるのも危ない。作り込みの無駄になりかねない。

ただ、厄介なのは、複雑になってきたら else-if をやめるという判断基準を知らない人がコードを触るときだ。多分、数年後の自分もそのひとり。  
ああ、ここでは else-if を書く習慣なのだろうと思って、そのまま else-if で書き加えてしまうはず。プログラミングにそこまで慣れてない人ならなおさらそうなる。

やっぱり、最初のうちに芽を摘んでおくべきだ。割れ窓理論に近い話な気がする。
