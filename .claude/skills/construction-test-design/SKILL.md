---
name: construction-test-design
description: >
  Construction の Stage 3（テスト設計）。US / AC と設計成果物から、何をどこまでテストするかを決めて
  テストケースに落とす。実際のテストコードは Stage 4 で書く。construction オーケストレーターから
  呼ばれる。CONDITIONAL — コード変更を伴わない変更ではスキップされうる。
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

# Construction Stage 3: test-design（テスト設計）

**責務**: US / AC から「何をどこまでテストするか」を決め、テストケースの一覧に落とす。テストコードそのものはここでは書かない。

**なぜ必要か**: テストを書きながら観点を考えると、実装しやすいところだけがテストされ、AC との対応が抜ける。先に観点を決めて AC と突き合わせておくと、Stage 4 で赤いテストから書き始められる。

**起動時に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/construction.md` を読む。** 過去のゲートで確定した実践がここにある。

## 入出力

- **consumes**: user-stories（必須）, acceptance-criteria（必須）, logic-model / rules / data-model（任意）
- **produces**: `test-design/` に `test-cases.md`
- 必須 H2 見出しは `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/artifact-schemas.md` の Stage 3 節が定める（ここで再定義しない）

## このリポジトリのテスト環境

| 項目 | 内容 |
|---|---|
| テストランナー | Vitest（`pnpm test:run` で1回実行、`pnpm test` で watch） |
| 置き場 | テスト対象と同じディレクトリに `<name>.test.ts` で置く |
| 書き方 | 各テストに `// Arrange` `// Act` `// Assert` のコメントを入れる |
| 型キャスト | `as any` ではなく `as unknown as T` を使う。`eslint-disable` で逃げない |
| カバレッジ | `pnpm test:coverage` |

規約の最新は `CLAUDE.md` の Testing Strategy 節を見る。ここと食い違っていたら `CLAUDE.md` に従い、この記述を直す。

## ステップ

1. **読込**: US / AC と設計成果物を読む
2. **テスト観点の洗い出し**: AC の各シナリオに対し、何を確かめれば満たしたと言えるかを決める。AC に無い観点（既存の壊れやすい箇所、境界値）も足してよい
3. **テストの粒度を決める**: 各観点をどのレベルで確かめるかを振り分ける
   - **単体テスト（Vitest）** — 純粋な関数・データ変換・リポジトリ層。ここが主戦場
   - **ビルドで確かめる** — 型・コンテンツコレクションのスキーマ違反・リンク切れ。テストを書かずに `pnpm build:local` が落ちることで検出できるならそれでよい
   - **実際に見て確かめる** — 表示・レイアウト・スタイル。Stage 6 の動作検証に回す
4. **`test-cases.md` を書く**:
   - `## テスト観点` — 何を確かめるか。上の 3 つのどれで確かめるかを添える
   - `## テストケース一覧` — 単体テストにするものを、入力と期待結果の形で並べる
   - `## トレーサビリティ` — 各 US 番号（`US-01` 形式）とテストケースの対応。US に対応するケースが無い場合は理由を書く
5. **既存テストへの影響**: 今回の変更で壊れる既存テストがあれば挙げ、直すのか仕様変更として更新するのかを決める
6. **承認ゲート**（下記）

テストを書かない判断をしてよい。ただし「書かない」と決めた観点は `## テスト観点` に理由とともに残す。書かなかったことが後から見て意図的だと分かるようにするため。

## センサーと学習

- 成果物生成後・承認ゲート前に `required-sections` と `upstream-coverage` と `completeness` を走らせる。実行方法は `${CLAUDE_PROJECT_DIR}/.claude/skills/construction/references/sensors.md`。`completeness` は `## トレーサビリティ` に書いた US 番号を見て、触れられていない US を検出する
- 実行中の判断は `docs/intents/<slug>/units/<unit>/test-design/memory.md` に追記する。無ければ作る。書式は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。ステージを表すタグは書かない（パスがステージを表す）

## 承認ゲート

①成果物サマリー → ②センサー結果（参考・ブロックしない）→ ③記録の振り分け → ④AskUserQuestion で **承認 / 修正指示**。修正指示なら progress を `[R]` にして同ステージ内で修正し、再ゲート。

③は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

## スキップ条件

コード変更を伴わない変更（記事の追加・文言修正・依存更新のみ）ならスキップ候補。**コードを書くならスキップしない。** スキップ可否はオーケストレーターが判断しユーザーに確認する。

## 完了条件

全 AC に対応するテスト観点があり（無いものは理由が書かれている）、単体テストにするケースが入力と期待結果の形で並び、US とのトレーサビリティが取れている。
