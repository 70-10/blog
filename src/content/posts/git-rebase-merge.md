---
title: rebase時にマージコミットを残したいのなら、--rebase-mergeオプションを使おう
publishDate: 2021-09-13T14:14:00+09:00
tags: ["Develop"]
draft: false
---

Git の rebase は、デフォルトではマージコミットを削除してしまいます。  
マージコミットを残したい場合は、`--rebase-merge`オプションをつけて実行しましょう。

```
git rebase --rebase-merge -i <リベース先>
```

## もしつけ忘れて、そのまま push しちゃったら？

「`--rebase-merge`をつけ忘れた！もう 1 回 rebase しなおせ！」と思っても、もう遅いです。  
そのブランチからマージコミットは消えているので何度やっても復活しません。

`git reflog`でリベース前のコミットを見つけ出し、そこから再度 rebase しましょう。

# 参考サイト

- [Git - git-rebase Documentation](https://git-scm.com/docs/git-rebase#Documentation/git-rebase.txt---rebase-mergesrebase-cousinsno-rebase-cousins)
