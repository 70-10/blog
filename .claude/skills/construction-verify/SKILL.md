---
name: construction-verify
description: >
  Construction の Stage 5（ビルド・テスト）。実装コードのビルドとテストと lint を実行し、結果を記録する。
  実装が「動くか」を検証するステージ。construction オーケストレーターから呼ばれる。ALWAYS（常に実行）。
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

# Construction Stage 5: verify（ビルド・テスト）

**責務**: 実装コードのビルド・テスト・lint を実行し、結果を記録する。

**なぜ必要か**: 実装が終わっても、ビルドが通らない・テストが落ちる状態では意味がない。検証を独立したステージに分け、実装完了と動作確認を別のチェックポイントにする。

**起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

## 入出力

- **consumes**: implementation-plan（必須）, code-summary（必須）, test-cases（任意）
- **produces**: `verification/` に `build-results.md` / `test-results.md`
- 必須 H2 見出しは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/artifact-schemas.md` の Stage 5 節が定める

## このリポジトリで走らせるもの

| コマンド | 見るもの |
|---|---|
| `pnpm test:run` | Vitest を1回実行 |
| `pnpm lint` | ESLint / Prettier / textlint を並列実行 |
| `pnpm typecheck` | `astro check` による型チェック |
| `pnpm build:local` | OGP 画像の生成を飛ばしたビルド。日常の確認はこちら |
| `pnpm build` | OGP 画像の生成を含む本番と同じビルド。画像生成に関わる変更をしたときはこちらも走らせる |

最新は `package.json` の scripts と `CLAUDE.md` を見る。食い違っていたら実際の `package.json` に従い、この記述を直す。

## ステップ

1. **対象特定**: コードサマリーからビルド・テスト対象を特定する。OGP 画像の生成に関わる変更かどうかをここで判断する
2. **テスト**: `pnpm test:run` を実行し結果を記録する
3. **lint と型チェック**: `pnpm lint` と `pnpm typecheck` を実行する
4. **ビルド**: `pnpm build:local`（必要なら `pnpm build` も）を実行し結果を記録する
5. **失敗対応**: 失敗があれば修正を試みる（**最大2回**）。それでも直らなければ失敗として記録し、ゲートでユーザーに諮る
6. **出力**:
   - `build-results.md` — ビルド結果・実行コマンド。lint と型チェックの結果もここに書く
   - `test-results.md` — テスト結果サマリー（合計・成功・失敗・スキップ）。失敗があれば失敗テスト詳細
7. **承認ゲート**（下記）

> パイプを挟んだコマンドの exit code は最後のコマンドのものになる。うまくいったかどうかは `${PIPESTATUS[0]}` を見るか、パイプを挟まずに実行して `$?` で確かめてから記録する。`pnpm lint` は複数の linter を並列に走らせるので、1つが落ちても出力の途中にしかエラーが出ないことがある。出力全体を読む。

## センサーと学習

- 成果物生成後・承認ゲート前に `required-sections` を走らせる。実行方法は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/sensors.md`
- 実行中の判断は `docs/intents/<slug>/units/<unit>/verify/memory.md` に追記する。無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。ステージを表すタグは書かない（パスがステージを表す）

## 承認ゲート

①成果物サマリー → ②センサー結果（参考・ブロックしない）→ ③記録の振り分け → ④AskUserQuestion で **承認 / 修正指示**。修正指示なら progress を `[R]` にして同ステージ内で修正し、再ゲート。

③は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

## 完了条件

ビルド・テスト・lint・型チェックがすべて通り、結果が記録されている。通らないものがあれば、その理由と判断が記録されている。
