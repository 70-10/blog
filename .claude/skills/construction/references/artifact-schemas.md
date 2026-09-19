# 成果物スキーマ（必須 H2 見出しを定める）

各ステージが生成する Markdown 成果物に最低限含める H2 見出しを定義する。`required-sections` センサー（[sensors.md](sensors.md)）はこの表と成果物の見出しを照合して欠落を報告する。

- **実行時にはこのファイルが支配する。** スキルは他の設計文書に実行時依存しない
- AI は必須見出しを最低限含めたうえで、必要に応じて見出しを追加してよい
- 「（条件付き）」の見出しは、その条件が成立する場合のみ必須。`required-sections` センサーは条件付き見出しを欠落として報告しない

## Stage 1: explore（`explore/`）

| 成果物 | 必須 H2 見出し |
|---|---|
| `constraints.md` | `## 技術的制約`, `## 命名規約・コーディング規約`, `## やってはいけないこと` |
| `design-decisions.md` | `## 既存の設計判断`, `## 変更対象の既存実装` |
| `test-strategy.md` | `## 既存テスト構造`, `## テスト方針`, `## 影響範囲` |
| `open-questions.md` | `## 未解決の疑問`, `## 解消済みの疑問` |

## Stage 2: design（`design/`）

| 成果物 | 必須 H2 見出し |
|---|---|
| `logic-model.md` | `## 処理フロー`, `## データフロー` |
| `rules.md` | `## 判定ルール`, `## バリデーション` |
| `data-model.md` | `## データ構造`, `## 関連` |
| `components.md`（UI を含む場合のみ） | `## コンポーネント階層`, `## 状態管理` |

## Stage 3: test-design（`test-design/`）

| 成果物 | 必須 H2 見出し |
|---|---|
| `test-cases.md` | `## テスト観点`, `## テストケース一覧`, `## トレーサビリティ` |

`## トレーサビリティ` には対応する US 番号（`US-01` 形式）を書く。`completeness` センサーがこの番号を見て、テスト設計で触れられていない US を検出する。

## Stage 4: implement（`implementation/`）

| 成果物 | 必須 H2 見出し |
|---|---|
| `implementation-plan.md` | `## 実装ステップ`, `## トレーサビリティ` |
| `code-summary.md` | `## 変更ファイル一覧`, `## 主要な実装判断` |

## Stage 5: verify（`verification/`）

| 成果物 | 必須 H2 見出し |
|---|---|
| `build-results.md` | `## ビルド結果`, `## 実行コマンド` |
| `test-results.md` | `## テスト結果サマリー`, `## 失敗テスト詳細`（条件付き: 失敗がある場合） |

## Stage 6: review（`review/`）

| 成果物 | 必須 H2 見出し |
|---|---|
| `code-review-report.md` | `## コードレビュー結果`, `## 改善適用結果` |
| `doc-alignment-report.md` | `## 照合結果`, `## 検出された乖離` |
| `ac-check-report.md` | `## AC カバレッジ（静的照合）`, `## 動作検証結果`, `## 未カバーの条件分岐` |
