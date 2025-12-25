---
title: Claude Code Custom Slash Commandのインライン実行で引数を渡す方法
publishDate: 2025-12-25
tags: ["Develop"]
description: "Claude CodeのCustom Slash Commandで引数を渡そうとしたところ、${ARGUMENTS:-default}がインライン実行では動作しませんでした。この記事では、その原因と外部スクリプト化による解決方法を解説します。"
---

_この記事の事象は Claude Code 2.0.76 で確認しています。_

Claude Code の Custom Slash Command で、`git diff` を実行するコマンド `/diff` を作成しているとします。  
最初の実装では、ベースブランチを `main` にハードコードしていました。

```markdown:.claude/commands/diff.md
---
description: Show git diff from main and current changes
---

- Changes: !`git diff main...HEAD`
```

## 引数を設定する

これを柔軟にするため、ベースブランチを引数で指定できるように argument-hint を設定します。

```markdown:.claude/commands/diff.md
---
description: Show git diff from base and current changes
argument-hint: [base-branch]
---

- Changes: !`git diff ${ARGUMENTS:-main}...HEAD`
```

`${ARGUMENTS:-main}` という構文は、`ARGUMENTS` が設定されていればその値を使い、未設定なら `main` を使うという意味です。  
これで引数として `develop` を指定すれば、develop ブランチと比較できるはずです。

### argument-hint とは

`argument-hint` は、Custom Slash Command のフロントマターに記述する設定です。

```markdown:argument-hintの例
---
description: Show git diff from base and current changes
argument-hint: [base-branch]
---
```

この設定は、オートコンプリート時に期待される引数を表示するための機能です。ユーザーがコマンドを入力する際に、どのような引数を渡せるかを視覚的に示します。  
`argument-hint` を設定することで、コマンドに引数を渡すことができ、その値は `$ARGUMENTS`（全引数）や `$1`, `$2`（個別引数）として Markdown 本文内で使用できます。

## インライン実行ではシェル変数展開が動かない

しかし、実際に実行してみると次のエラーが発生します。

```
Error: fatal: ambiguous argument 'main...HEAD'
```

`develop` を指定したはずなのに、`main` が使われています。引数が渡っていません。  
原因は、**インライン実行（`!`構文）内ではシェル変数展開が動作しない**ということです。

```markdown
!`git diff ${ARGUMENTS:-main}...HEAD`
```

この書き方では、`${ARGUMENTS:-main}` というシェルの変数展開構文が期待通り動作しません。  
`$ARGUMENTS` は Markdown 本文内では展開されますが、`!`構文による Bash コマンド実行の内部では、このような変数展開の仕組みが利用できません。

一方、**外部のシェルスクリプトとして実行する場合は、通常の Bash 機能が使えます**。位置引数（`$1`, `$2`, ...）として引数を受け取り、`${1:-default}` のような変数展開が正しく動作します。

## ロジックを外部スクリプト化して解決する

制約を回避するため、ロジックを外部スクリプトに分離しました。

```markdown:.claude/commands/diff.md
---
description: Show git diff from base and current changes
allowed-tools: Bash(~/.claude/scripts/git-diff.sh:*)
argument-hint: [base]
---

!`~/.claude/scripts/git-diff.sh $ARGUMENTS`
```

コマンド定義ファイルは、外部スクリプトを呼び出すだけのシンプルな構造になりました。`$ARGUMENTS` をそのまま位置引数として渡します。

```bash:.claude/scripts/git-diff.sh
#!/usr/bin/env bash
set -euo pipefail

base="${1:-main}"

git diff --stat "$base"...HEAD
git log --oneline "$base"..HEAD
git diff "$base"...HEAD
```

外部スクリプトでは、第 1 引数を `base="${1:-main}"` で受け取ります。引数がない場合は `main` がデフォルト値として使用されます。

このように、インライン実行（`!`構文）では `${ARGUMENTS:-default}` のようなシェル変数展開が動作しないため、引数を扱いたい場合は外部スクリプトを用意することで解決できます。
