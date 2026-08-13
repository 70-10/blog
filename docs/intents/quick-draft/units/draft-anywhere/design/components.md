# 画面の作り — draft-anywhere

上流は [00_intent.md](../../../00_intent.md)、[02_user-stories.md](../../../02_user-stories.md)（US-01 / US-03）、[explore/constraints.md](../explore/constraints.md)、[explore/design-decisions.md](../explore/design-decisions.md)。

処理の順序は [logic-model.md](logic-model.md)、判定は [rules.md](rules.md)。

## コンポーネント階層

### 枠組み

**Vite + React + Tailwind 4 の SPA。** Astro は使わない。

| 選択                | 理由                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Astro ではなく Vite | 管理画面は入力を受け続ける画面で、静的な生成が要らない。ブログの Astro 設定を別プロジェクトに持ち込むと噛み合わない |
| React               | リポジトリに既にある（`OgpImage.tsx` で React 19 を使っている）。新しい枠組みを増やさない                           |
| Tailwind 4          | 同じくリポジトリに既にある。ブログと同じ書き方が使える                                                              |
| react-router        | 「残した下書きを開き直せる」を URL で表す。`/drafts/<id>` を直接開けると再読み込みでも失われない                    |

**Astro コンポーネントは作らない。** ブログ側（`.astro`）と管理画面（`.tsx`）は別プロジェクトで、共有しない。

### 階層

- `App`
  - `Layout` — ヘッダーと、通信中・エラーの表示枠
  - `DraftListPage`（経路 `/`）— 最小の一覧
    - `NewDraftButton` — 「新しく書く」
    - `DraftListItem` — 1 件（タイトルか「（無題）」＋ 更新時刻）
  - `DraftEditorPage`（経路 `/drafts/:id`）— 編集画面
    - `TitleInput` — 1 行の入力
    - `BodyEditor` — 複数行の入力
    - `SaveStatus` — 「保存しました」「中身が空なので保存していません」など

`/drafts/new` は作らない。「新しく書く」は `DraftEditorPage` を id なしで開き、**最初の自動保存で id が決まってから URL を差し替える**（[logic-model.md](logic-model.md) の「新しく書き始める」）。

### 各コンポーネントの受け取るもの

| コンポーネント    | 受け取るもの                                   | 出すもの                           |
| ----------------- | ---------------------------------------------- | ---------------------------------- |
| `DraftListPage`   | —（自分で一覧を取る）                          | 一覧、または「下書きはありません」 |
| `DraftListItem`   | `DraftSummary`（`id` / `title` / `updatedAt`） | 1 行のリンク                       |
| `DraftEditorPage` | 経路の `id`（無ければ新規）                    | 入力欄と保存の状態                 |
| `TitleInput`      | `value`、`onChange`                            | 1 行の入力欄                       |
| `BodyEditor`      | `value`、`onChange`                            | 複数行の入力欄                     |
| `SaveStatus`      | `status`（下の「保存の状態」）                 | 短い案内                           |

**`BodyEditor` は素の `textarea`。** Markdown の色分けや装飾ボタンは作らない。US-01 が求めるのは「着想を書き残せる」ことで、[03_units.md](../../../03_units.md) の Unit 1 も「編集画面（自動保存）」までしか含まない。プレビューは Unit 3 の担当。

### 裏側（Pages Functions）

コンポーネントではないが、画面と対になるので並べる。経路はファイルの位置で決まる。

| ファイル                        | 経路                          | 受け持ち                             |
| ------------------------------- | ----------------------------- | ------------------------------------ |
| `functions/api/drafts/index.ts` | `GET` / `POST /api/drafts`    | 一覧、作成                           |
| `functions/api/drafts/[id].ts`  | `GET` / `PUT /api/drafts/:id` | 1 件取得、更新                       |
| `functions/api/_middleware.ts`  | `/api/` 以下すべて            | **JWT の検証**（API の全経路で共通） |

**JWT の検証を各経路に書かない。** 1 か所に置くことで、経路を足したときに検証を忘れる余地をなくす。Unit 2 以降が `functions/api/` の下に経路を足しても自動で掛かる。

**置き場は `functions/api/_middleware.ts`。`functions/_middleware.ts` にはしない。** Cloudflare のドキュメントは「アプリケーション全体、静的なファイルの前でも動かしたいなら `functions/_middleware.js` を作る」と書いている。つまり根に置くと画面そのもの（`index.html` や JavaScript のファイル）にも掛かり、**JWT が無いことを理由に画面が出なくなる**。画面を守るのは Cloudflare Access の役目で、この検証が守るのは API だけ（[Pages Functions のミドルウェア](https://developers.cloudflare.com/pages/functions/middleware/)）。

### 共有する部分

`packages/admin/shared/` に置き、画面と裏側の両方から読む。

| 中身                                   | なぜ共有するか                                           |
| -------------------------------------- | -------------------------------------------------------- |
| `Draft` / `DraftSummary` 型            | 画面と裏側で形がずれると通信で壊れる                     |
| frontmatter の組み立てと分解           | 同じ形式を 2 か所に書くとずれる。**テストもここに 1 組** |
| 空の判定（前後の空白を落として長さ 0） | 画面と裏側で判定が違うと、画面を通ったのに 422 になる    |

## 状態管理

### 置き場

**ライブラリを入れない。** React の `useState` と `useEffect` で足りる。

| 状態             | 持つ場所          | 中身                                              |
| ---------------- | ----------------- | ------------------------------------------------- |
| `title` / `body` | `DraftEditorPage` | 打っている途中の値                                |
| `saved`          | `DraftEditorPage` | 最後に保存した `title` / `body`。差分の判定に使う |
| `sha`            | `DraftEditorPage` | GitHub の `sha`。保存のたびに差し替える           |
| `status`         | `DraftEditorPage` | 保存の状態（下の表）                              |
| 一覧             | `DraftListPage`   | `DraftSummary[]`。開いたときに取る                |

**下書きの状態を画面が持ち続けない。** 実体は GitHub にあり、画面が持つのは編集中の写しだけ（[logic-model.md](logic-model.md) の「値がどこからどこへ動くか」）。

### 保存の状態

| `status`   | いつ                              | 出す文                                             |
| ---------- | --------------------------------- | -------------------------------------------------- |
| `idle`     | 変更がない                        | 何も出さない                                       |
| `pending`  | 変更があり、まだ 3 秒たっていない | 「未保存」                                         |
| `saving`   | 保存の要求を送っている            | 「保存しています」                                 |
| `saved`    | 保存できた                        | 「保存しました」＋ 時刻                            |
| `empty`    | 両方が空で保存を見送った          | 「中身が空なので保存していません」                 |
| `conflict` | 409 が返った                      | 「他のところで変わっています。読み直してください」 |
| `error`    | それ以外の失敗                    | 「保存できませんでした」＋ 再試行                  |

**`empty` を黙って `idle` にしない。** 保存されていないことが分からないと、書いたものが消えたと思われる（[rules.md](rules.md) の「空になったとき」）。

### 自動保存の仕掛け

- `title` / `body` が変わったら 3 秒の待ちを引き直す。**打っている間は発火しない**
- 加えて次のときは待たずに発火する
  - 入力欄からフォーカスが外れたとき
  - タブが隠れたとき（`visibilitychange`）
- **保存の要求は同時に 1 つだけ。** 送っている間に次の合図が来たら、終わってからもう一度判定する。並べて送ると `sha` がずれて 409 になる
- 送る前に「前回保存した内容と同じか」を見る。同じなら送らない

**タブを閉じるときの保存に頼らない。** `beforeunload` での通信は届く保証がないので、`visibilitychange` を主に使う。3 秒の待ちがあるので、最悪でも直前の 3 秒分しか失われない。

### PC からの手数（US-03）

US-03 の受け入れ条件は「本文に最初の一文字を打てるまでの操作の数が 4 未満」。

| 手数 | 操作                               |
| ---- | ---------------------------------- |
| 1    | 管理画面を開く（ブックマークから） |
| 2    | 「新しく書く」を選ぶ               |

**2 手。** 今の 4 手（ターミナルを開く → リポジトリへ移動 → `git pull` → `pnpm create-post`）より少ない。

Access のログインは、通ったあとしばらく Cookie が残るので毎回は挟まらない。**ただし Cookie が切れていれば手数が増える。** 数え方は「ログイン済みの状態から」とする。Access のセッションの長さは設定によるので、[verification](../verification/) で実際に数える。

### 画面の作りで持たないもの

Unit 1 では作らない。順に Unit 2 / Unit 3 / Unit 4 の担当（[03_units.md](../../../03_units.md)）。

- 公開・取り消しのボタン
- プレビュー
- 下書きをまとめる・捨てる
- 本文の冒頭の抜粋つきの一覧
- タグの入力欄（下書きの段階ではタグを決めない）
