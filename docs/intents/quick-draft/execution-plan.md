# quick-draft — 実行計画

4 つの Unit を最後まで実装するための計画。**この文書だけを読んで動けるように書いてある。** 実行するセッションは、この計画が立った会話を知らない前提。

## 背景

このブログは記事を `src/content/posts/*.md` に置き、`main` へ push すると Cloudflare Pages が公開する。つまり**記事を書くには PC でリポジトリを開いて Markdown を用意する必要がある**。書く人はそこに困っていた。外出先で思いついても書き残せず、PC があっても書き始めるまでに「ターミナルを開く → リポジトリへ移動 → `git pull` → `pnpm create-post`」の 4 手順を通る必要がある。

Inception で「どこからでも下書きを書いて公開する」を [00_intent.md](00_intent.md) にまとめ、[02_user-stories.md](02_user-stories.md) に US 5 本と受け入れ条件を、[03_units.md](03_units.md) に 4 つの Unit を書いた。

実現の方法は 4 つの ADR で決まっている。**実装に入る前にこの 4 つを読むこと。**

| ADR                                                                          | 決めたこと                                                                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [0003](../../adr/0003-articles-stay-as-markdown-in-this-repository.md)       | 記事の正はこのリポジトリ内の Markdown。外部の記事管理サービスは使わない                                        |
| [0004](../../adr/0004-treat-idea-to-publish-as-one-change.md)                | 着想から公開までを 1 つの変更として扱う                                                                        |
| [0006](../../adr/0006-build-our-own-admin-screen-for-writing.md)             | **記事を書く画面を自分で作り、公開までその中で完結させる。** GitHub をそのまま使う案・外部のメモアプリ案は却下 |
| [0007](../../adr/0007-unattended-runs-move-recording-decisions-to-review.md) | 無人実行では記録の判断を承認ゲートからレビューへ移す                                                           |

## 進め方

**4 つの Unit を 1 つずつ、順番に。** 並行して作れる Unit は無い（どれも同じ管理画面と同じ裏側を触るため）。

1 つの Unit につき 1 つの PR を作り、**人がレビューしてマージしてから次の Unit へ進む**。Unit N の成果が `main` に入っていないと Unit N+1 が始められない。

各 Unit は `construction-unattended`（無人モード）で回す。承認ゲートで止まらず、人の判断が要る状況では `[B]`（Blocked）で終わる。**止まったら人が決めて再開する**（下の「止まったとき」）。

| 順  | Unit                             | slug                     | 作るもの                                                         |
| --- | -------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| 1   | 下書きを残せるようにする         | `draft-anywhere`         | 認証 / 読み書きの裏側 / 編集画面 / 下書きの保存の形 / 最小の一覧 |
| 2   | 下書きを記事にして公開する       | `publish-from-draft`     | 校正を実行する場所 / 公開と取り消し                              |
| 3   | 公開前に出来ばえを確認する       | `preview-before-publish` | プレビューの描画                                                 |
| 4   | 溜まった下書きを見返して整理する | `organize-drafts`        | 一覧（冒頭の抜粋つき）/ まとめる・捨てる                         |

Unit 4 は Unit 2・3 より先に回してもよい（依存は Unit 1 だけ）。同時には回さない。

**worktree は使わない。** 直列に 1 つずつ回すので隔離する値打ちがなく、worktree ごとに `pnpm install` が要るぶん手数が増える。ブランチを切るだけで十分。

**workflow スクリプトも書かない。** ブランチ・push・PR 作成は `construction-unattended` の責務外なので誰かが担う必要があるが、直列で分岐も並列も無いなら実行するセッションが下の手順どおり進めれば足りる。スクリプトを作ると保守する対象が 1 つ増える。

---

## ステップ 0: 土台を `main` に入れる（**最初に必ず**）

**`main` には `.claude/skills/` が 1 ファイルも無い。** `git switch main` するとスキルが作業ツリーから消え、`construction-unattended` を呼べなくなる。

ブランチ `chore/ai-dlc-setup` に 6 コミットあり、そこにスキル群・`docs/` 一式が入っている。**これを先に `main` へ入れる。**

```bash
git switch chore/ai-dlc-setup
git push -u origin chore/ai-dlc-setup
gh pr create --base main --title "chore: set up AI-DLC skills and quick-draft inception artifacts" --body "<本文>"
```

PR 本文は base ↔ head の差分視点で書く（[docs/rules/project.md](../../rules/project.md)）。`git diff --name-status main..chore/ai-dlc-setup` で実差分を確認してから書く。

**マージするのは人。** マージ後、`main` を最新にしてから Unit 1 へ進む。

---

## Unit を 1 つ回す手順

4 回繰り返す。`<unit-slug>` は上の表のもの。

### 1. ブランチを切る

```bash
git switch main && git pull
git switch -c intent/quick-draft/unit/<unit-slug>
```

ブランチ名の形は [docs/rules/project.md](../../rules/project.md) が定める。

### 2. Construction を回す

```
/construction-unattended quick-draft <unit-slug>
```

6 ステージ（explore → design → test-design → implement → verify → review）を承認なしで通す。**検証（テスト・lint・型チェック・ビルド）は Stage 5 がやる**ので、ここで自分で走らせる必要はない。

成果物は `docs/intents/quick-draft/units/<unit-slug>/` に出る。

| 置き場                              | 中身                                                               |
| ----------------------------------- | ------------------------------------------------------------------ |
| `progress.md`                       | 6 ステージの進み具合と、無人モードであること                       |
| `explore/` `design/` `test-design/` | 制約・設計・テストケース                                           |
| `implementation/`                   | 実装計画とコードサマリー                                           |
| `verification/`                     | `build-results.md` / `test-results.md`（Stage 5 の検証結果）       |
| `review/`                           | コードレビュー・ドキュメント照合・AC 受け入れチェックの 3 レポート |
| `records.md`                        | 記録の取捨選択の入口（書いたもの / 書かなかった候補と理由）        |
| `blocked.md`                        | `[B]` で終わったときだけ                                           |

実装コードは成果物ディレクトリではなくリポジトリ本体（`src/` `tools/` 等）に入る。

### 3. 結果を見る

| progress の状態  | 進み方                 |
| ---------------- | ---------------------- |
| 全ステージ `[x]` | 4 へ                   |
| どこかが `[B]`   | 下の「止まったとき」へ |

### 4. 検証の結果を確かめる

**まず Stage 5 の記録を読む。** `verification/build-results.md` と `verification/test-results.md` に、実行したコマンドと結果が書かれている。

**そのうえで自分で 4 つを走らせ直す。**

```bash
pnpm test:run
pnpm lint
pnpm typecheck
pnpm build:local
```

4 つとも exit 0 になること。**記録を読むだけで済ませないのは、書かれた結果は実施の証明ではないから。** Stage 5 のあとに Stage 6（review）がコードを直すこともあるので、最後の状態で通ることを確かめる意味もある。

`pnpm build:local` は OGP 画像の生成を飛ばす。本番と同じビルドを見たいときは `pnpm build`（97 記事ぶんの画像を作るので重い）。

**注意**: ログに `Error: Input file contains unsupported image format` が出ることがあるが、これは既存の挙動で exit 0 で完了する。エラー表示だけで失敗と判断しない。

### 5. 残った成果物をコミットする

**コミットを打つのは `implement`（Stage 4）だけ。** そのあとに Stage 5 が `verification/`、Stage 6 が `review/` を書くので、**これらは未コミットで残る**。`construction` は「コミット・PR 等はプロジェクト運用に委ねる」と明記していて、拾うのは呼んだ側の仕事。

```bash
git status --short --untracked-files=all
```

残っていればコミットする。Conventional Commits で、`docs(<unit-slug>): record verification and review results` のような形。

### 6. push して PR を作る

```bash
git push -u origin intent/quick-draft/unit/<unit-slug>
gh pr create --base main --title "<Conventional Commits 形式>" --body "<本文>"
```

PR の形は結果で分ける（[docs/rules/project.md](../../rules/project.md)）。

- 最後まで通せた → 通常の PR
- `[B]` のまま出す → **Draft**（`main` に必須レビューも必須チェックも無いので、中断したものが誤ってマージされるのを防ぐ）

**PR 本文に必ず入れるもの**

- Unit の概要と含む US（[03_units.md](03_units.md) から）
- **`docs/intents/quick-draft/units/<unit-slug>/records.md` への導線。** 無人実行では記録の取捨選択が PR レビューに移っている。この一覧を読んで、要らない ADR・用語・ルールを消すのがレビューの仕事（[ADR 0007](../../adr/0007-unattended-runs-move-recording-decisions-to-review.md)）
- 検証の結果（実行したもの・実行できなかったものとその理由）
- `[B]` なら `blocked.md` への導線と、何の判断が要るか

### 7. 人がレビューしてマージする

`records.md` を読んで記録を取捨選択し、コードをレビューしてマージする。**ここは自動化しない。**

マージしたら次の Unit へ。

---

## 止まったとき（`[B]`）の進め方

`construction-unattended` は、**外部に見える約束に関わる判断**が要るときに `[B]` で終わる。条件は 3 つ（[references/unattended.md](../../../.claude/skills/construction/references/unattended.md)）。

1. 仕様・Unit の境界・受け入れ条件に関わる不明点が出た
2. Unit のスコープ外の変更が必要になった
3. 検証が通らず、`construction-verify` の失敗対応（最大 2 回）でも直らなかった

止まると `docs/intents/quick-draft/units/<unit-slug>/blocked.md` に「何の判断が要るか・なぜ進めないか・どこまでやったか」が書かれる。

**進め方**

1. `blocked.md` を読む
2. 判断が要ることを人に確認する。選択肢と得失を並べてから聞く
3. 決まったことを、効く場所に書く
   - 後戻りしにくい判断なら `docs/adr/` に ADR
   - 語が固まったなら [docs/glossary.md](../../glossary.md)
   - 進め方の決まりなら [docs/rules/](../../rules/)
   - それ以外は該当ステージの `memory.md`
4. `progress.md` の `[B]` を `[ ]` に戻し、`/construction-unattended quick-draft <unit-slug>` を再実行する

**中断が長引くなら Draft PR を先に出してよい。** 途中までの成果が残るし、`main` に入らない。

---

## Unit ごとの注意点

### Unit 1 `draft-anywhere` — **止まる見込みが高い**

一番重い。[03_units.md](03_units.md) の 8 項目のうち 5 つがここに乗る（画面の土台・認証・公開 URL へのデプロイ・読み書き・エディタ）。

**未解決が 2 件ある。**

| 未解決                                                                       | 性質                                                            |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 下書きをどんな形でリポジトリに持つか（別ディレクトリか、フラグと絞り込みか） | 内部の作り。design で決めてよい                                 |
| **管理画面をどこで動かし、認証をどう作るか**                                 | 公開 URL と認証方式は外部に見える。**`[B]` になる見込みが高い** |

技術構成は白紙。**過去に `tools/admin` として React + react-router + Vite + Tailwind + Cloudflare Pages の骨組みを作った PR があったが、クローズして捨てた**（骨組み 90 行、通信処理なし）。捨てた理由は、そのフェーズ分け（画面の骨組み → OAuth → GitHub Contents API）が Unit 分割と別の軸で、両方を持つと二重管理になるため。内容は `origin/worktree-admin`（コミット `13a7e32`）に残してあるので、参考にはできる。**採用が決まっているわけではない。**

**触ることになる既存ファイル**

| ファイル                        | なぜ                                                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/content.config.ts`         | スキーマが `title` / `publishDate` / `tags` を必須にしているため、本文だけの下書きはビルドを落とす |
| `src/lib/repositories/posts.ts` | `getPosts()` が絞り込みをしないため、`src/content/posts/` に置いたものは無条件に公開される         |
| `pnpm-workspace.yaml`           | 新しいパッケージを足すなら（`packages/*` と `tools/*` を列挙）                                     |
| `vitest.config.ts`              | 新しいパッケージのテストを本体の実行から外すなら                                                   |

**完了の目安**: PC が手元にない状態で管理画面を開き、自分だけが入れて、着想を下書きとして残せる。本文だけ・タイトルだけでも残せる。両方空なら作られない。残した下書きを開き直せる。下書きがある状態でビルドが通り、記事ページ・一覧・タグページ・RSS・OGP 画像のどこにも下書きが出ない。`pnpm create-post` は今と同じように動く。

### Unit 2 `publish-from-draft`

**校正で公開を止める仕組みが要る。** 受け入れ条件は「校正の指摘があれば公開されず、どこが指摘されたか分かり、本文は自動で書き換わらない」。

既存の事情:

- textlint が走るのは lefthook の pre-commit だけ。対象は `src/content/posts/*.md`（記事だけ）
- CI（`.github/workflows/lint-and-build.yml`）は `pull_request` のときだけ動く。`main` 直 push では動かない
- **`textlint --fix` は残ったエラーの種類によって exit code が変わる。** 検証で確かめた（`sentence-length` と `ja-no-weak-phrase` が残ったケースは exit 0、別のケースは exit 1）。つまり `--fix` 付きの実行は必ず止まる門番にならない。**公開を止めるには `--fix` なしで検査する経路が要る**

**`publishDate` は公開した日にする。** 今の `pnpm create-post` は作成時刻を入れるが、下書きを持つと公開日とずれるため。

**取り消しも要る。** 間違って公開したものを、PC がない場所から戻せること。

### Unit 3 `preview-before-publish`

**受け入れ条件がこの Unit で一番きつい。** 「公開後と同じ見え方を公開前に見られる」。

[ADR 0006](../../adr/0006-build-our-own-admin-screen-for-writing.md) で画面の中で完結させると決めたので、**自作の描画は Astro のビルド結果とは別物になる**。どう一致させるかがこの Unit の設計課題。

参考: Cloudflare Pages のブランチプレビューは有効になっている。ブランチを push すると `https://<branch>.blog-68b.pages.dev` が出る（PR に Cloudflare のボットがコメントする）。これは本番と同じ Astro のビルド結果なので、一致させる手がかりになる。ただし ADR 0006 は画面の中で完結させると決めているので、外の画面へ移らせる作りにするなら ADR の見直しが要る。

**確認の対象**（[02_user-stories.md](02_user-stories.md) の US-05）

| 対象                                                         | 必須度     |
| ------------------------------------------------------------ | ---------- |
| 記事ページでのタイトルの見え方、本文の見え方と改行位置、画像 | Must       |
| トップページの一覧でのタイトルの見え方                       | Must       |
| OGP 画像（タイトルの長さによる崩れ）                         | Should     |
| 記事の日付・タグページ・RSS                                  | **対象外** |

### Unit 4 `organize-drafts`

未解決なし。Unit 1 が作った最小の一覧を、見返して判断できる一覧に育てる。

**「開き直すための一覧」と「見返して判断するための一覧」は求めるものが違う。** 前者は Unit 1 が要るぶんだけ持ち、後者をここで足す。本文の冒頭が出ること、タイトルが決まっていない下書きも見分けられることが要件。

---

## 触ってはいけないもの

[00_intent.md](00_intent.md) の Out。

- **記事の正の置き場を変えること。** 記事はこのリポジトリ内の Markdown のまま（[ADR 0003](../../adr/0003-articles-stay-as-markdown-in-this-repository.md)）
- **`pnpm create-post` の廃止・作り直し。** 今の経路はそのまま残す。目的は入口を増やすこと
- **下書きに画像を含めること。** 下書きはテキストだけでよい
- **下書きの段階での校正。** 校正が働くのは公開のときだけ

加えて、既存の 97 記事の URL・日付・一覧の並び順を変えないこと。

## 完了の判定

**Unit ごと**: `construction-review`（Stage 6）が AC 受け入れチェックを行う。加えて手順 4 の 4 コマンドが exit 0。

**全体**: 次がすべて成立したとき。

- 4 つの PR がマージされている
- [02_user-stories.md](02_user-stories.md) の US-01〜US-05 の受け入れ条件がすべて満たされている
- `bash .claude/scripts/check-recording-setup.sh` が exit 0（記録の仕組みが壊れていない）
- `pnpm test:run` / `pnpm lint` / `pnpm typecheck` / `pnpm build` がすべて exit 0

**US-05 だけ 2 つの Unit に跨る。** Unit 2 が終わった時点では受け入れ条件が全部埋まらず、Unit 3 完了で満たされる。

## 残っている未確認

[questions.md](questions.md) に全部ある。実行中に解けたら、そこへ書き戻す。

| 未確認                                                                                                 | 解く Unit                  |
| ------------------------------------------------------------------------------------------------------ | -------------------------- |
| 下書きをどんな形でリポジトリに持つか                                                                   | Unit 1                     |
| 管理画面をどこで動かし、認証をどう作るか                                                               | Unit 1                     |
| 校正を `--fix` なしで走らせる経路                                                                      | Unit 2                     |
| 画面の中のプレビューを本番のビルド結果とどう一致させるか                                               | Unit 3                     |
| ブランチプレビュー URL が `intent/quick-draft/unit/draft-anywhere` のようなスラッシュ 2 つでどうなるか | 最初の Unit の PR で分かる |

## 知っておくと詰まらないこと

- **`pnpm test:run` が突然 6 件失敗したら、`.claude/worktrees/` に worktree が残っていないか見る。** `vitest.config.ts` に `test.exclude` の指定が無いので、worktree 配下のテストファイルまで拾う。以前これで詰まった
- **lefthook の textlint は記事だけが対象。** `docs/` や `.claude/` の Markdown は通らない。これは意図したもの（`.textlintrc` は読む人向けの記事のための設定なので、規約や手順書に当てない）
- **`main` のブランチ保護は force push 禁止と削除禁止だけ。** 必須ステータスチェックも必須レビューも無いので、Draft にしていない PR は誰でもすぐマージできる
- **CI は `pull_request` のときだけ動く。** `main` 直 push では test / typecheck / lint / build のどれも走らない
