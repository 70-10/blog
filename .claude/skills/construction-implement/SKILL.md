---
name: construction-implement
description: >
  Construction の Stage 4（実装）。設計成果物から実装計画を立てて承認を得てからコードを実装し、
  コードサマリーを残す。実装計画承認と完了の2回の承認ゲートを持つ。construction オーケストレーター
  から呼ばれる。ALWAYS（常に実行）。
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

# Construction Stage 4: implement（実装）

**責務**: 設計成果物をもとに実装計画を立て、承認を得てからコードを実装する。

**なぜ必要か**: 設計から直接コードを書き始めると、全体の構造や順序が考慮されない断片的な実装になりがち。実装計画を先に立てて承認を得ることで、方向性を事前に合わせられる。

**起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

**あわせて `progress.md` の `## モード` を読む。** `unattended` なら、人に確認せずに進める・中断の条件・記録の書き方が変わる。扱いは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/unattended.md` にある。

## 入出力

- **consumes**: intent（必須）, logic-model / rules / data-model / components / test-cases / constraints（任意）
- **produces**: `implementation/` に `implementation-plan.md` / `code-summary.md`。**実装コード（テストコードを含む）はリポジトリ本体**（`src/` `tools/` 等）に置く（成果物ディレクトリではない）
- 必須 H2 見出しは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/artifact-schemas.md` の Stage 4 節が定める

## ステップ

1. **読込**: 全設計成果物を読む
2. **実装計画**: `implementation/implementation-plan.md` を作成する
   - 実装ステップを順序付きチェックリストで記述
   - 各ステップと US / AC のトレーサビリティを示す
   - **テストファイルを計画に含める（必須）**。Stage 3 の `test-cases.md` にあるケースが、どのテストファイルのどのステップで書かれるかを対応付ける
3. **承認ゲート①（実装計画）**: 計画を承認してもらう（下記ゲート手順）。承認まで実装に入らない
4. **実装**: 承認された計画に従ってコードを実装する
   - テストがあるケースは、失敗するテストを書いてから実装を通す（Red → Green → Refactor）
   - 各ステップ完了でチェックリストを更新する
5. **コードサマリー**: `implementation/code-summary.md` を作成する（変更ファイル一覧・主要な実装判断・計画からの逸脱）
6. **承認ゲート②（完了）**

**コミット**: テストが通る状態でコミットする。1 つのコミットに複数の独立した変更を混ぜない。過度に細かい粒度（1 行ずつ等）は不要で、意味のまとまりでコミットする。ブランチの作成・命名やコミットの手順そのものはこのスキルでは規定しない。

## 2段ゲートと再開

承認が 2 回あり、progress 上はどちらも `[?]` になりうる。再開時は成果物の有無で中間状態を判定する: `implementation-plan.md` のみ存在＝計画承認済み・実装中／`code-summary.md` も存在＝完了ゲート。

## センサーと学習

- 各成果物の生成後・承認ゲート前に `required-sections` を走らせる。実行方法は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/sensors.md`
- 実行中の判断は `docs/intents/<slug>/units/<unit>/implement/memory.md` に追記する。無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。ステージを表すタグは書かない（パスがステージを表す）

## 承認ゲート（各回共通）

①成果物サマリー → ②センサー結果（参考・ブロックしない）→ ③記録の振り分け → ④AskUserQuestion で **承認 / 修正指示**。修正指示なら progress を `[R]` にして同ステージ内で修正し、再ゲート。

③は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

このゲートは 2 回ある（実装計画・完了）。2 回とも③を行う。スクリプトはファイルの中身を全部出すので、1 回目で振り分け済みのエントリも再び出る。2 回目はタイムスタンプを見て 1 回目以降に追記した分に絞る。

無人モード（`progress.md` の `## モード` が `unattended`）のときの扱いは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/unattended.md` に従う。

## 完了条件

実装計画が承認され、実装コードがコミットされ、コードサマリーが作成されている。
