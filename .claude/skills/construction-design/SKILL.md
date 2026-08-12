---
name: construction-design
description: >
  Construction の Stage 2（設計）。explore と Inception の成果物をもとに、処理の流れ・判定ルール・
  データ構造・（UI があれば）コンポーネント構成を設計する。construction オーケストレーターから
  呼ばれる。CONDITIONAL — 新しいロジックの設計が不要ならスキップされうる。
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

# Construction Stage 2: design（設計）

**責務**: explore と Inception の成果物をもとに設計を行う。「どう作るか」のモデリング。

**なぜ必要か**: 実装に直接入るとロジックの構造が曖昧なままコードを書き始め、後から大幅な設計変更が必要になる。設計を明示的に行い、実装前に構造を確定させる。

**起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

**あわせて `progress.md` の `## モード` を読む。** `unattended` なら、人に確認せずに進める・中断の条件・記録の書き方が変わる。扱いは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/unattended.md` にある。

## 入出力

- **consumes**: user-stories（必須）, intent（必須）, constraints（任意）, design-decisions（任意）
- **produces**: `design/` に `logic-model.md` / `rules.md` / `data-model.md` /（UI を含む場合のみ）`components.md`
- 必須 H2 見出しは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/artifact-schemas.md` の Stage 2 節が定める（ここで再定義しない）

## ステップ

1. **読込**: explore の成果物（あれば）と Inception の成果物（US / AC・目的とスコープ）を読む
2. **設計領域の特定**: スコープを分析し、設計が必要な領域を見極める
3. **設計を出力**:
   - `logic-model.md` — 処理フロー・データフロー（アルゴリズム・処理の順序）
   - `rules.md` — 判定ルール・バリデーション（制約・方針）
   - `data-model.md` — データ構造・関連（型定義・コンテンツコレクションのスキーマ・ライフサイクル）
   - `components.md`（UI を含む場合のみ）— コンポーネント階層・状態管理（Astro コンポーネントと React コンポーネントの切り分け、props・state、操作の流れ）
4. **承認ゲート**（下記）

## センサーと学習

- 成果物生成後・承認ゲート前に `required-sections` と `upstream-coverage` を走らせる。実行方法は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/sensors.md`。`upstream-coverage` の上流キーは `user-stories` `intent`（任意で `constraints` `design-decisions`）
- 実行中の判断は `docs/intents/<slug>/units/<unit>/design/memory.md` に追記する。無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。ステージを表すタグは書かない（パスがステージを表す）

## 承認ゲート

①成果物サマリー → ②センサー結果（参考・ブロックしない）→ ③記録の振り分け → ④AskUserQuestion で **承認 / 修正指示**。修正指示なら progress を `[R]` にして同ステージ内で修正し、再ゲート。

③は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

このステージはデータ構造を定義するため、新しい語が出やすい。用語の揺れの提示では、`data-model.md` で定義した語を `docs/glossary.md` に登録するかを必ず確認する。

無人モード（`progress.md` の `## モード` が `unattended`）のときの扱いは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/unattended.md` に従う。

## スキップ条件

新しいデータ構造・複雑なロジック・判定ルールの設計が不要な単純な変更ならスキップ候補。スキップ可否はオーケストレーターが判断しユーザーに確認する。

## 完了条件

実装に必要な設計成果物が揃っている。
