---
name: unit-splitting
description: >
  ユーザーストーリー(US)と受け入れ条件(AC)が揃った状態から、実装できる作業の塊（Unit）に分割する。
  分割案を理由とともに出して承認を取ってから `03_units.md` を書く。
  トリガー語：「Unit に分けて」「Unit 分割」「実装の単位に割って」。
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - Bash
---

# Unit 分割

US と AC が揃った状態から、実装できる作業の塊（Unit）に割る。1 つの Unit が Construction 1 回分になる。

## 前提

- `docs/intents/<slug>/02_user-stories.md` があること。US / AC が足りなければ分割に進まず、先に埋めるよう伝える
- `docs/intents/<slug>/00_intent.md`・`01_current-and-constraints.md` があれば読む

起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/inception.md` を読む。過去のゲートで確定した実践がここにある。

## フロー

### フェーズ 1: 分割案を出す

1. 対象の `<slug>` を確認し、`docs/intents/<slug>/02_user-stories.md` があることを確かめる
2. `docs/intents/<slug>/` の成果物を読む
3. 下の観点で分割案を作り、**理由とともに出す**
   - 各 Unit の概要・含む US・その単位にした理由
   - Unit 間の依存と、作る順序
4. 判断が分かれるところは選択肢を添えて出す

**ここで承認を取る。承認なしに成果物を書かない。**

### フェーズ 2: `03_units.md` を書く

承認された案で `docs/intents/<slug>/03_units.md` を作る。

```markdown
# Unit 分割 — <slug>

## Unit 一覧

### Unit 1: <名前>（slug: <kebab-case>）

- **概要**: 何を作るか
- **含む US**: US-01, US-02
- **この単位にした理由**: どの観点で切ったか
- **完了の目安**: 何ができたら終わりか

### Unit 2: ...

## 依存関係

Unit 1 → Unit 2 のように、先に無いと作れないものを示す。並行して作れるものがあればそれも書く。

## 分割しなかった案とその理由

検討したが採らなかった切り方があれば残す。後から「なぜこの粒度か」を辿れるようにするため。
```

`（slug: <kebab-case>）` は必ず書く。Construction がこの文字列から成果物の置き場（`docs/intents/<slug>/units/<unit>/`）を決めるため。

## 分割の観点

US / AC から責務の境目を読み取り、それを起点に次の観点で調整する。**不要な分割はしない。分ける理由がないなら 1 つにまとめる。**

- **責務の境界** — 凝集した振る舞いを持つ単位で分ける。技術レイヤー（表示 / ロジック / データ）で切らない
- **依存の方向** — 先に無いと作れないものを先の Unit に置く。後ろの Unit が前の Unit を前提にするのはよいが、逆向きの依存を作らない
- **単独で確かめられるか** — その Unit だけ完成した時点でビルドが通り、価値の一部が出るか。出ないなら分け方が細かすぎる
- **変更頻度の違い** — 頻繁に変わる部分と安定した部分を混ぜない

## 制約

- 各 US がどれかの Unit に入っていること（漏れなし）
- 1 つの Unit が大きすぎないこと。Construction を 1 回通しで回せる量に収める
- Unit の境界について後戻りしにくい判断が出たら ADR に残す要否を確認する（3 条件と書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「ADR」）
- 推測で埋めず、決められないことは `docs/intents/<slug>/questions.md` に残す

## 記録

分割の最中に出た解釈・逸脱・トレードオフ・疑問は `docs/intents/<slug>/memory/step4.md` に追記する。ファイルが無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。書くこと自体に承認は要らない。

Unit の切り方は後段が前提にするので後戻りしにくく、別の切り方も必ず存在する。**Tradeoffs に残る候補が最も出やすいところ**なので、採らなかった案とその理由は必ず書く。
