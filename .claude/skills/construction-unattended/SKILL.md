---
name: construction-unattended
description: >
  Construction フェーズを人の承認を挟まずに通しで回すオーケストレーター。6 ステージを順に実行し、
  承認ゲートで止まらずに進む。人の判断が要る状況では BLOCKED として終了する。workflow から複数の
  Unit を自律実行するときに使う。トリガー語：「無人で Construction を回す」「Construction を自動で回す」
  「/construction-unattended <slug> <unit>」。1 回の起動で 1 つの Unit を対象にする。
  人が付いて 1 ステージずつ承認しながら回すなら construction を使う。
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - "Skill(construction-explore *)"
  - "Skill(construction-design *)"
  - "Skill(construction-test-design *)"
  - "Skill(construction-implement *)"
  - "Skill(construction-verify *)"
  - "Skill(construction-review *)"
---

# Construction（無人実行）

1 つの Unit を、情報収集から品質レビューまで人の承認を挟まずに通す。**自身は設計・実装・テストをしない**。6 つのステージスキルを順に呼ぶ。

人が付いて回すなら `construction` を使う。こちらは呼び出した側（workflow など）から自律実行するためのもので、ゲートで止まらない代わりに、人の判断が要る状況では中断して終える。

**スキルを始めたら最初に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

## construction と共通のもの

次は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/SKILL.md` と同じ。ここでは繰り返さない。

- `03_units.md` からの Unit の読み取り（`（slug: <kebab-case>）` の拾い方、US / AC の読み先）
- 成果物の置き場
- ステージ一覧とスキップ条件
- `progress.md` の状態
- センサー

**引数が足りないときの扱いだけ違う。** `construction` は一覧を見せて選ばせるが、こちらは選ぶ相手がいない。`<slug>` と `<unit>` は必ず引数で受け取り、足りなければ中断して終える。

## 無人実行に固有のこと

1. **初期化のとき `progress.md` に `## モード` を作り `unattended` と書く。** ステージはこれを読んでモードを知る。書かないとステージは有人として動き、承認を待ったまま止まる
2. **ステージ末の処理・記録・中断の扱いは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/unattended.md` に従う**
3. **CONDITIONAL ステージのスキップは確認せず、判定と理由を memory に書いて決める**
4. **ステージが progress を `[B]` にしたら、以降のステージを実行せずに終える**
5. **ステージをまたぐ差し戻しは行わない。** 必要になったら `[B]` にする

## 完了報告

全ステージが `[x]` になったら次を報告して終える。呼び出した側が PR を作るときに使う。

- 成果物の所在（`docs/intents/<slug>/units/<unit>/`）
- `records.md` の所在（記録の取捨選択の入口）
- 検証の結果（実行したもの・実行できなかったものとその理由）
- `03_units.md` に残っている次の Unit

`[B]` で終えたときは、`blocked.md` の所在と、何の判断が要るかを報告する。

## 責務外

ブランチ・コミット・push・PR 作成は行わない。呼び出した側が担う。
