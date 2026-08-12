---
name: construction
description: >
  AI-DLC の Construction フェーズを最初から最後まで通しで回すオーケストレーター。
  情報収集 → 設計 → テスト設計 → 実装 → 検証 → 品質レビューの6ステージを順に進め、各ステージの承認ゲート・
  品質センサー・学習ループを束ねる。Inception で Unit に割った変更を実装する段で使う。
  トリガー語：「Construction を回す」「Construction フェーズ」「この Unit の実装を始める」「/construction <slug>」。
  1回の起動で1つの Unit を対象にする。
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - Bash
  - "Skill(construction-explore *)"
  - "Skill(construction-design *)"
  - "Skill(construction-test-design *)"
  - "Skill(construction-implement *)"
  - "Skill(construction-verify *)"
  - "Skill(construction-review *)"
---

# Construction（オーケストレーター）

1 つの Unit を、情報収集から品質レビューまで通しで実装するためのオーケストレーター。**自身は設計・実装・テストをしない**。6 つのステージスキルを順に呼び、進捗・承認・品質チェック・学習を束ねる。

**スキルを始めたら最初に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

## はじめに：全体フローと現在地

**ルールを読んだら、次にこれを行う。** 全体像と現在地（途中なら再開点）を提示する。再開時に「どこから続けるか」で迷わないため。

1. 引数から `<slug>` と `<unit>` を決める（後述）
2. `docs/intents/<slug>/units/<unit>/progress.md` があれば、チェックボックスから現在地を判定する
3. 全体フローと現在地を示してから、未完了のステージへ進む。表示は例えば次のようにする:

   ```
   Construction — <slug> / <unit>
   ✅ 1. explore       — 完了
   ✅ 2. design        — 完了
   ▶  3. test-design   — ここから再開
      4. implement
      5. verify
      6. review
   ```

## 入力

`/construction <slug>` または `/construction <slug> <unit>` で起動する。

1. `<slug>` が渡されなければ `docs/intents/` の一覧を出して AskUserQuestion で選ばせる
2. `docs/intents/<slug>/03_units.md` を読み、Unit の一覧（各見出しの `（slug: <kebab-case>）`）を取り出す
3. `<unit>` が渡されていればそれを使う。渡されていなければ、Unit 一覧と依存・順序を見せて AskUserQuestion で選ばせる。既に完了した Unit があればその旨も添える
4. `03_units.md` が無ければ、`inception` のステップ 4 を先に回すか、この Intent 全体を 1 つの Unit として扱うかを確認する。後者なら `<unit>` は Intent の slug と同じにする

Unit の概要・含む US・完了の目安は `03_units.md` から、US / AC は `docs/intents/<slug>/02_user-stories.md` から読む。

## 成果物の置き場

`docs/intents/<slug>/units/<unit>/` 配下に作る。実装コードは成果物ディレクトリではなく**リポジトリ本体**（`src/` `tools/` 等）に置く。

| パス | 中身 | 作る人 |
|---|---|---|
| `progress.md` | 全ステージの進捗（ステートマシン） | オーケストレーター |
| `explore/` `design/` `test-design/` `implementation/` `verification/` `review/` | 各ステージの成果物と、そのステージの `memory.md` | 各ステージスキル |

**`memory.md` はステージごとのディレクトリの中に置く。** Unit をまたいでも Intent をまたいでも混ざらない（[learn.md](references/learn.md)）。

上流の成果物（`00_intent.md` / `02_user-stories.md` / `03_units.md`）は Intent 直下にあり、Unit 配下には複製しない。

## ステップ

1. **対象を読む**: `03_units.md` からこの Unit の範囲を、`02_user-stories.md` から対応する US / AC を読む
2. **初期化**: `docs/intents/<slug>/units/<unit>/` と各サブディレクトリを作成し、`progress.md` を初期化する（既存なら再開点を判定して再利用）
3. **各ステージを順に実行**（下表）。CONDITIONAL はスキップ可否を判断・確認し、ALWAYS は常に実行する。実行時は対象ステージを `[-]` にし、ステージスキルに**成果物ディレクトリと `<slug>` / `<unit>` を引数で渡して**呼ぶ。ステージが承認されて戻ったら `[x]`、スキップなら `[S]` に更新する
4. **完了報告**: 全ステージ完了後、成果物の所在と、`03_units.md` に残っている次の Unit を報告する（コミット・PR 等はプロジェクト運用に委ねる）

## ステージ一覧

| # | ステージ | 実行 | 呼ぶスキル | スキップ条件（CONDITIONAL のみ） |
|---|---|---|---|---|
| 1 | explore | CONDITIONAL | `construction-explore` | 単純なバグ修正・リファクタで、新しいロジック・データ構造・外部連携がない |
| 2 | design | CONDITIONAL | `construction-design` | 単純なロジック変更で、新しい設計が不要 |
| 3 | test-design | CONDITIONAL | `construction-test-design` | コード変更を伴わない（記事の追加・文言修正・依存更新のみ）。**コードを書くならスキップしない** |
| 4 | implement | ALWAYS | `construction-implement` | — |
| 5 | verify | ALWAYS | `construction-verify` | — |
| 6 | review | ALWAYS | `construction-review` | — |

Stage 3 のスキップ条件が他より狭いのは、CLAUDE.md がテストを先に書く進め方を求めているため。コードを書くのにテスト設計を飛ばす経路は作らない。

## progress.md ステートマシン

```markdown
# Construction Progress — <slug> / <unit>

## ステージ

- [ ] explore
- [ ] design
- [ ] test-design
- [ ] implement
- [ ] verify
- [ ] review
```

| 記号 | 状態 | 意味 |
|---|---|---|
| `[ ]` | Pending | 未開始 |
| `[-]` | Active | 実行中 |
| `[?]` | AwaitingApproval | 承認ゲート待ち |
| `[R]` | Revising | 修正指示 → 修正中 |
| `[x]` | Completed | 承認済み・完了 |
| `[S]` | Skipped | CONDITIONAL スキップ |

- オーケストレーターが各ステージを `[-]` で囲み、承認後 `[x]` ／スキップ時 `[S]` に更新する
- `[?]` / `[R]` はステージが自分の承認ゲートのループ中に反映する（**ステージは自分の状態しか触らない**）
- セッション再開はこのチェックボックスから現在地を判定する。Stage 4 は承認が 2 回（実装計画・完了）あり両方 `[?]` になりうるので、再開時の中間状態は `implementation/` の成果物の有無で判定する

## CONDITIONAL ステージのスキップ判断

AI が対象の内容（バグ修正か新機能か）・コードベースの複雑さ・変更規模からスキップの妥当性を評価し、**理由とともに AskUserQuestion で確認する**。ユーザーが実行を選べばスキップしない。

## 承認ゲート

全ステージの末尾に承認ゲートがある（Stage 4 は実装計画と完了の 2 回で計 7 回）。ゲートの手順はステージスキルが実施するが、共通の流れは: ①成果物サマリー提示 → ②センサー結果提示（参考・ブロックしない・[sensors.md](references/sensors.md)）→ ③記録の振り分け（learn 候補 → ADR 候補 → 用語の揺れ。**候補がゼロでも1問聞く**。`${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`）→ ④AskUserQuestion で **承認 / 修正指示**。修正指示なら `[R]` にして同ステージ内で修正し再ゲート（Revising ループ）。

## Rework（手戻り・変更対応）

ステージ進行中・完了後に変更が必要になったら、2 軸で差し戻し先を決める:

1. **原因による初期候補**: 仕様変更・仕様誤り → explore または `inception` ／ Unit の切り方が違った → `inception` のステップ 4 ／ テスト観点漏れ → test-design ／ 実装バグ・表示の微修正 → implement
2. **影響範囲の分析で確定**: 変更がどの成果物に影響するかを特定し、一覧をユーザーに提示して承認を得る。**他の Unit に及ぶなら、その Unit の progress も巻き戻す必要があるかを確認する**

確定したら、差し戻し先以降のステージの progress を巻き戻し（`[x]` → `[ ]`）、差し戻し先を `[-]` にして上流から順に再実行する。承認ゲートの「修正指示」（Revising）はステージ内の修正で、これとは別物。

## 参照ファイル

| ファイル | 用途 |
|---|---|
| [references/sensors.md](references/sensors.md) | 成果物の品質チェック（Bash・参考） |
| [references/learn.md](references/learn.md) | 学習ループの Construction 固有の点 |
| [references/artifact-schemas.md](references/artifact-schemas.md) | 各成果物の必須 H2 見出し |
| `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` | memory・ADR・用語集の書式と、承認ゲートでの振り分け手順 |
| `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` | Construction の各ステージに効く実践（起動時に読む） |
