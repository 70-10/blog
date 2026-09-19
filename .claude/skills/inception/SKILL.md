---
name: inception
description: >
  変更の検討・要件整理・ユーザーストーリー作成・受け入れ条件の整理をするときに必ず使う。
  1つの変更について「何を作るか」を固め、ユーザーストーリー(US)・受け入れ条件(AC)まで導き、
  実装できる単位（Unit）に割るところまでを扱う。
  トリガー語：「Inception」「要件を整理したい」「何を作るか固めたい」「US を書いて」「AC を整理して」。
  1回の起動で1つの変更を対象にする。
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - Bash
  - "Skill(unit-splitting *)"
---

# Inception

1 つの変更について「何を作るか」を固めるスキル。**AI-DLC を知らなくても、このステップに沿えば Inception を一周できる**ことを目的にしている。

ゴールは、変更を **ユーザーストーリー(US)** と **受け入れ条件(AC)** まで落として未確定をなくし、実装できる **Unit** に割ること。

ステップは順番に進め、**各ステップの終わりに内容をユーザーに見せて承認を取ってから**次へ行く。また各ステップは、成果物を埋める前に [対話ガイド](references/dialogue-guide.md) に従って **what（何を）と why（なぜ）を引き出す**（既知は聞かず、曖昧・影響の大きい点に絞って納得まで詰める）。

**スキルを始めたら最初に `${CLAUDE_PROJECT_DIR}/docs/rules/project.md` と `${CLAUDE_PROJECT_DIR}/docs/rules/inception.md` を読む。** 過去のゲートで確定した実践がここにある。自動では読み込まれないので、読むことをこの手順に入れている。

## はじめに：全体フローと現在地

**ルールを読んだら、次にこれを行う。** これから何をどの順で進めるかの全体像と、いまどこにいるか（途中なら再開点）を最初に提示する。ゴールまでの見通しを持てるようにし、途中から再開するとき「どこから続けるか」で迷わないため。

1. `docs/intents/<slug>/` を確認する（無ければ新規 = ステップ 0 から）
2. あれば成果物の**中身**から現在地を判定する:

   | 成果物の状態 | 完了とみなすステップ |
   |---|---|
   | `00_intent.md` がある | 0 起点整理 |
   | `01_current-and-constraints.md` がある | 1 現状・制約 |
   | `02_user-stories.md` に US が書かれている | 2 ユーザーストーリー |
   | `02_user-stories.md` に AC が書かれている | 3 受け入れ条件 |
   | `03_units.md` がある | 4 Unit 分割 |

3. 全体フローと現在地を示してから、再開点のステップへ進む。表示は例えば次のようにする（見た目は適宜整えてよい）:

   ```
   Inception — <slug>
   ✅ 0. 起点整理         — 完了（00_intent.md）
   ✅ 1. 現状・制約        — 完了
   ✅ 2. ユーザーストーリー — 完了
   ✅ 3. 受け入れ条件(AC)   — 完了
   ▶  4. Unit 分割         — ここから再開
   ```

## 成果物の置き場

`docs/intents/<slug>/` に Markdown を作る。`<slug>` は変更の内容を表す kebab-case で、最初に決めてユーザーに確認する。

| ファイル | 中身 |
|---|---|
| `00_intent.md` | 目的・スコープ・参照 |
| `01_current-and-constraints.md` | 触る既存の実装・データ・外部サービスへの依存 |
| `02_user-stories.md` | US + AC（形式は [us-ac-template.md](references/us-ac-template.md)） |
| `03_units.md` | Unit 分割（`unit-splitting` が作る） |
| `questions.md` | 確認した Q&A の記録（`[Q]/[A]`） |
| `memory/step0.md` 〜 `step4.md` | 各ステップ実行中の判断。**ステップごとに 1 ファイル** |

`00_intent.md` の見出しは次に揃える。

```markdown
## なぜ作るか（Why）
## 解決する課題
## スコープ（In / Out）
## 完了の定義
```

用語と設計判断は、この変更をまたいで残る**リポジトリ共有の資産**として `docs/intents/<slug>/` の外に置く。対話で確定したらその場で記録し、各ステップ末の承認ゲートで残すものを決める（書式・運用は [glossary-and-adr.md](references/glossary-and-adr.md)）:

- `docs/glossary.md` — このリポジトリ固有の用語（ユビキタス言語）
- `docs/adr/` — 後戻りしにくい設計判断の記録（ADR）

## ステップ

### 0. 起点整理

- **狙い**: この変更で「何を・誰のために・どこまで」作るかを最初に固め、後段の土台にする
- **やること**: 依頼元（会話・Issue・既存の `docs/intents/`）を読み、目的・スコープ(In/Out)・参照リンクを `00_intent.md` に書く
- **完了基準**: 目的とスコープが 1 画面で読めて、ユーザーが「これで合っている」と言える
- **承認ゲート**: 下記の共通手順。memory は `memory/step0.md`

### 1. 現状・制約の把握

- **狙い**: 作る前に「既存の何に影響するか」を知り、手戻りを防ぐ
- **やること**: 触る既存の実装・コンテンツ・外部サービスへの依存を調べ `01_current-and-constraints.md` に書く。`CLAUDE.md` と `docs/adr/` に既存の決まりがあれば挙げる。影響が薄ければ短くてよい
- **完了基準**: 依存・制約が洗い出され、未確認は `questions.md` に質問として残っている
- **承認ゲート**: 下記の共通手順。memory は `memory/step1.md`

### 2. ユーザーストーリー

- **狙い**: 変更を「誰が・何をしたくて・なぜか」の単位に分け、作るものを具体化する
- **やること**: [us-ac-template.md](references/us-ac-template.md) の形式で US を `02_user-stories.md` に書く。入力が仕様に踏み込んでいないかは [対話ガイド](references/dialogue-guide.md) の **What/Why ガード**（7 番）で判定し、踏み込んでいれば要求レベルへの書き換えを提案する（拒否されたら受け入れる）
- **完了基準**: 主要な利用シーンが US として並び、抜けがない
- **承認ゲート**: 下記の共通手順。memory は `memory/step2.md`

### 3. 受け入れ条件（AC）

- **狙い**: 「どうなったら完成か」を、後でテストできる形で決める
- **やること**: 各 US に AC を Gherkin（Given/When/Then）で足す。[us-ac-template.md](references/us-ac-template.md) の 6 観点で抜けを確認する。仕様が未確定なら**推測で埋めず** `questions.md` に残して確認する。AC が実装語彙（コンポーネント名・CSS クラス・ファイル名など）に踏み込んでいないかは **What/Why ガード**（7 番）で判定し、要件レベルへ引き戻す提案をする（拒否されたら受け入れる）
- **完了基準**: 各 US に AC があり、6 観点の抜けを確認済み
- **承認ゲート**: 下記の共通手順。memory は `memory/step3.md`。AC を書く過程で語の定義が固まりやすいので、用語の揺れの提示では新語の登録要否を必ず確認する

### 4. Unit 分割

- **狙い**: 1 回の Construction で回せる大きさに割り、作る順序を決める
- **やること**: `Skill(unit-splitting)` を呼ぶ。分割の観点・フロー・完了基準は unit-splitting 側が持つのでここでは繰り返さない
- **完了基準**: 各 US がどれかの Unit に入り、`03_units.md` に依存と順序が書かれている
- **承認ゲート**: 委譲から戻ったら下記の共通手順。memory は `memory/step4.md`。Unit の境界は後段が前提にするため後戻りしにくく、**ADR 候補が最も出やすいステップ**

### 任意ステップ

変更の性質に応じて足す: ペルソナ定義 / 画面リスト / モック（見た目の検証が重い変更のとき）。

## 承認ゲート

ステップ 0〜4 の各末尾で行う。5 ステップとも同じ手順。

①成果物サマリー → ②記録の振り分け → ③AskUserQuestion で **承認 / 修正指示**。修正指示ならそのステップ内で直して再ゲート。

②は learn 候補 → ADR 候補 → 用語の揺れ の順に提示する。**候補がゼロでも**「今回、用語集・ADR・ルールに残すことはありますか」を 1 問聞く（省くと記録の要否が自己判定に戻り、書かれないまま流れる）。コマンドと振り分けの詳細は `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` の「承認ゲートでの振り分け」。

```bash
bash .claude/scripts/memory-candidates.sh docs/intents/<slug>/memory/step<N>.md
bash .claude/scripts/glossary-drift.sh docs/intents/<slug>/<このステップの成果物>
```

用語の揺れは**そのステップで書いた成果物だけ**を対象にする。ディレクトリ全体を渡すと、既に書き終えた分の同じ指摘が毎ゲート出て埋もれる。

実行中の解釈・逸脱・トレードオフ・疑問は、その都度そのステップの `memory/step<N>.md` に追記しておく（書くこと自体に承認は要らない）。ファイルが無ければ作り、既にあれば消さずに足す。

**ステップをまたいで引き継ぐ用途には使わない。** 未解決の疑問と矛盾は、そのステップを終える前に解消する。持ち越すものは `questions.md` に残すか、ルールへ上げる。

Construction には②の前にセンサー結果の提示が入るが、Inception の成果物は対話で詰めるものでセンサーを持たないため、ここでは省く。

## 完了

ステップ 4 まで終わったら、成果物の所在（`docs/intents/<slug>/`）と、未解決のまま残した `questions.md` の項目を報告して終わる。

## 参照ファイル

| ファイル | 用途 |
|---|---|
| [references/dialogue-guide.md](references/dialogue-guide.md) | what/why を引き出す対話の型 + ステップ別に詰める点 |
| [references/us-ac-template.md](references/us-ac-template.md) | US / AC の書き方と6観点チェックリスト |
| [references/glossary-and-adr.md](references/glossary-and-adr.md) | 用語集・ADR の Inception 固有の点（いつ書くか・ADR が出やすいところ） |
| `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md` | memory・ADR・用語集の書式と、承認ゲートでの振り分け手順 |
| `${CLAUDE_PROJECT_DIR}/docs/rules/inception.md` | Inception の各ステップに効く実践（起動時に読む） |
