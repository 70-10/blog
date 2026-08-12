---
name: construction-review
description: >
  Construction の Stage 6（品質レビュー）。/code-review と /simplify でコード品質を検証・改善し、
  ドキュメント照合と AC 受け入れチェック（静的照合 + 動作検証）を行う。実装が「正しいか」を検証する
  ステージ。construction オーケストレーターから呼ばれる。ALWAYS（常に実行）。
user-invocable: false
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - Bash
  - "Skill(code-review *)"
  - "Skill(simplify *)"
---

# Construction Stage 6: review（品質レビュー）

**責務**: コード品質レビュー・ドキュメントと実装の整合性確認・AC 受け入れチェックを行う。Stage 5 が「動くか」を見るのに対し、Stage 6 は「正しいか」を見る。

**なぜ Stage 5 と分けるか**: 「ビルドが通る・テストが通る」と「品質が高く仕様どおり」は別の観点。テストで捕まえきれない問題（命名・設計との乖離・冗長なコード）を見るために独立させる。

**起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

## 入出力

- **consumes**: code-summary（必須）, implementation-plan（必須）, user-stories（必須）, acceptance-criteria（必須）, build-results（必須）, test-results（必須）, test-cases（任意）
- **produces**: `review/` に `code-review-report.md` / `doc-alignment-report.md` / `ac-check-report.md`
- 必須 H2 見出しは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/artifact-schemas.md` の Stage 6 節が定める

## 委譲先

| スキル | 役割 |
|---|---|
| `Skill(code-review)` | バグ・ロジックエラー・品質問題の検出（現在の diff が対象。報告のみ／`--fix` で適用） |
| `Skill(simplify)` | 冗長・重複・非効率なコードの改善を変更コードに適用 |

## ステップ

1. **コードレビュー**: `/code-review` を実行し、バグ・ロジックエラー・品質問題を検出する。指摘があれば対応する
2. **コード改善**: `/simplify` を実行し、冗長・重複・非効率を改善する
3. ステップ 1〜2 の結果を `review/code-review-report.md`（コードレビュー結果・改善適用結果）に記録する
4. **ドキュメント照合**: US / AC ↔ テスト設計 ↔ 実装計画 ↔ 実装コード の整合を確認する。矛盾・乖離があれば指摘・修正し、`review/doc-alignment-report.md`（照合結果・検出された乖離）に記録する
5. **AC 受け入れチェック（静的照合）**: 各 AC に対しテスト観点が実装でカバーされているかを、テスト観点と実装コードの条件分岐を突き合わせて確認する。未カバーの条件分岐を洗い出す
6. **動作検証**: 実装した内容を実際に動かして AC が満たされるか確認する
   - 表示に関わる変更なら `pnpm dev` で開発サーバーを起動し、対象のページをブラウザで見る。描画ロジック・スタイルを変えた場合は、構文チェックやテストの通過だけで済ませず、実際の見た目を確かめる
   - ビルド成果物に関わる変更（OGP 画像・RSS・静的ルート）なら `pnpm build` の後 `pnpm preview` で確認する
   - 確認できない事情があれば「動作検証未実施」とその理由を記録する
7. ステップ 5〜6 を `review/ac-check-report.md`（AC カバレッジ（静的照合）・動作検証結果・未カバーの条件分岐）に記録する
8. **承認ゲート**（下記）

## センサーと学習

- 3 つのレポート生成後・承認ゲート前に `required-sections` を走らせる。実行方法は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/sensors.md`
- 実行中の判断は `docs/intents/<slug>/units/<unit>/review/memory.md` に追記する。無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。ステージを表すタグは書かない（パスがステージを表す）

## 承認ゲート

①成果物サマリー → ②センサー結果（参考・ブロックしない）→ ③記録の振り分け → ④AskUserQuestion で **承認 / 修正指示**。修正指示なら progress を `[R]` にして同ステージ内で修正し、再ゲート。

③は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

最後のゲートなので、この Unit のここまでの各ステージ（`explore/` 〜 `verify/` の `memory.md`）に残したまま持ち越したエントリを見直し、ルールに上げるか捨てるかを決め切る。ステージごとにファイルが分かれているので、順に `memory-candidates.sh` へ通す。

## 完了条件

`/code-review` の指摘に全対応（または「対応しない」理由を記録）、`/simplify` の改善が適用済み、ドキュメントと実装に矛盾がない（または修正済み）、AC のテスト観点が実装でカバーされている（または未カバーの理由を記録）、動作検証が実施済み（または実施できない理由を記録）。
