# 記録の取捨選択 — quick-draft / draft-anywhere

無人実行なので、承認ゲートで人に聞く代わりにここへ並べる（[ADR 0007](../../../../adr/0007-unattended-runs-move-recording-decisions-to-review.md)）。**要らないものを消すのがレビューの仕事。**

判定の基準は [記録の書式](../../../../recording-conventions.md)。

## Stage 1: explore

### 書いたもの

| 種別   | 置き場                                                          | 中身                                                                                                   |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ルール | [docs/rules/construction.md](../../../../rules/construction.md) | 「explore は選択肢と分かれ目までを書き、選択は design に残す」（新しい見出し `## ステージの役割分担`） |
| ルール | [docs/rules/construction.md](../../../../rules/construction.md) | 「`[B]` にする前に、そのステージで書けるものは書き切ってから止める」（新しい見出し `## 無人実行`）     |
| ルール | [docs/rules/project.md](../../../../rules/project.md)           | 「`glossary-drift.sh` の指摘は部分一致」（新しい見出し `## 記録`）                                     |
| 用語集 | [docs/glossary.md](../../../../glossary.md)                     | **管理画面**（code: admin）を登録。避ける別名: 管理ツール, 執筆画面, エディタ画面, admin 画面, CMS     |

**判断の材料**

- Construction の 2 件をフェーズのファイルに置いたのは、どちらも Construction のステージ構成（explore → design の役割分担、`[B]` の扱い）に固有だから。既定は `project.md` だが、Inception には効かない
- `glossary-drift.sh` の件を `project.md` に置いたのは、Inception の 5 ゲートでも Construction の 7 ゲートでも同じ手順を踏むため
- 「管理画面」を登録したのは、[ADR 0006](../../../../adr/0006-build-our-own-admin-screen-for-writing.md) 以降この語が Unit をまたいで出てくるのに揺れやすいため。無人時は迷ったら書く方針に従った。**要らないと判断したら消してよい**

### 候補に挙げたが書かなかったもの

| 候補                                                    | 種別   | 書かなかった理由                                                                                                                                                                   |
| ------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 管理画面をどこで動かし、認証をどう作るか                | ADR    | **判断そのものがまだ無い。** [blocked.md](blocked.md) で人に返している。決まったら ADR を 1 本書くのが妥当（3 条件を満たす）だが、今書くと誰も決めていない決定を記録することになる |
| `getPosts()` が下書きを外す唯一の口である               | ルール | コードの事実であって実践ではない。`docs/rules/` は実践の置き場。[explore/constraints.md](explore/constraints.md) に書いてある。コードが変われば古くなる                            |
| 無人実行で外部の用意が要る判断は中断する                | ルール | 既に [unattended.md](../../../../../.claude/skills/construction/references/unattended.md) の中断条件 2 が同じことを書いている。二重管理になる                                      |
| 変更対象のファイルを条件付きで書いた（Q1 が未決のため） | ルール | 1 回の作業の事情であって、繰り返し効く決まりではない。上に書いた「explore は選択肢まで」に含まれる                                                                                 |
| Q3（画面のテストをどの環境で走らせるか）                | —      | `Open questions` はルールにも ADR にも上げない（[記録の書式](../../../../recording-conventions.md) の「Open questions の扱い」）。memory に残した                                  |

### 併せて報告すること（記録ではない）

[docs/recording-conventions.md](../../../../recording-conventions.md) の「ルールの置き場」に食い違いがある。「**既定は `project.md`**」と書いた直後に「狭いほうを既定にするのは…」と続くが、`project.md` は 3 つのうち一番広い。[docs/rules/project.md](../../../../rules/project.md) 自身も「昇格の既定はこのファイル」と書いているので、**既定は `project.md`** として振り分けた。どちらが意図かは書いた人にしか分からないので直していない。
