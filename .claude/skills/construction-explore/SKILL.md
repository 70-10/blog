---
name: construction-explore
description: >
  Construction の Stage 1（情報収集・整理）。Inception の成果物とコードベースから、実装に必要な制約・
  既存の設計判断・テスト方針・未解決の疑問を収集して整理する。construction オーケストレーターから呼ばれる
  （単独起動は想定しない）。CONDITIONAL — 単純なバグ修正・リファクタでは構造的にスキップされうる。
user-invocable: false
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - Bash
---

# Construction Stage 1: explore（情報収集・整理）

**責務**: Inception の成果物とコードベースから、実装に必要な情報を収集・整理する。「何がわかっているか」の棚卸し。

**なぜ必要か**: 設計・実装に入る前に既存の制約・設計判断・テスト方針を整理しないと、「既存と矛盾する設計をした」「既存テストを壊す実装をした」といった手戻りが起きる。

**起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

## 入出力

- **consumes**: user-stories（必須）, intent（必須）, acceptance-criteria（任意）
- **produces**: `explore/` に `constraints.md` / `design-decisions.md` / `test-strategy.md` / `open-questions.md`
- 必須 H2 見出しは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/artifact-schemas.md` の Stage 1 節が定める（ここで再定義しない）

## ステップ

1. **スコープ把握**: `docs/intents/<slug>/00_intent.md` を読み、目的・スコープと完了条件を押さえる
2. **上流ドキュメント読込**: `docs/intents/<slug>/` の US・AC・現状と制約を読む
3. **コードベース探索**: 変更対象の既存実装・パターン・制約を収集する。`CLAUDE.md` の規約もここで押さえる
4. **整理して出力**:
   - `constraints.md` — 技術的制約・命名/コーディング規約・やってはいけないこと
   - `design-decisions.md` — 既存の設計判断とその理由・変更対象の既存実装。`docs/adr/` に該当する ADR があれば挙げる
   - `test-strategy.md` — 既存テスト構造・テスト方針・影響範囲
   - `open-questions.md` — 未解決の疑問（ユーザー確認が必要な点）と解消済みの疑問
5. **疑問の解消**: 未解決の疑問をユーザーに確認して解消する
6. **承認ゲート**（下記）

## センサーと学習

- 成果物生成後・承認ゲート前に `required-sections` と `upstream-coverage` を走らせる。実行方法は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/sensors.md`。`upstream-coverage` の上流キーは `user-stories` `intent`（任意で `acceptance-criteria`）
- 実行中の解釈・逸脱・トレードオフ・疑問は `docs/intents/<slug>/units/<unit>/explore/memory.md` に追記する。無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。ステージを表すタグは書かない（パスがステージを表す）

## 承認ゲート

①成果物サマリー → ②センサー結果（参考・ブロックしない）→ ③記録の振り分け → ④AskUserQuestion で **承認 / 修正指示**。修正指示なら progress を `[R]` にして同ステージ内で修正し、再ゲート。

③は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

## スキップ条件

新しいロジック・データ構造・外部連携がない単純なバグ修正・リファクタならスキップ候補。スキップ可否はオーケストレーターが判断しユーザーに確認する。

## 完了条件

制約・設計判断・テスト方針が整理され、未解決の疑問がゼロ（または「実装しないとわからない」と明示されている）。
