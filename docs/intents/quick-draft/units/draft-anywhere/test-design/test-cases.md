# テストケース — draft-anywhere

上流は [02_user-stories.md](../../../02_user-stories.md)（US-01 / US-03 と、その受け入れ条件 = acceptance-criteria）、[00_intent.md](../../../00_intent.md)、設計は [design/logic-model.md](../design/logic-model.md) / [design/rules.md](../design/rules.md) / [design/data-model.md](../design/data-model.md) / [design/components.md](../design/components.md)。

テストコードはここでは書かない。Stage 4 が赤いテストから書き始めるための一覧。

## テスト観点

確かめ方を 4 つに分ける。**「実際に動かして確かめる」に置いたものは、[人がリポジトリの外で用意するもの](../explore/open-questions.md)が揃うまで実施できない。**

| 記号 | 確かめ方               | 何で確かめるか                                         |
| ---- | ---------------------- | ------------------------------------------------------ |
| U    | 単体テスト             | Vitest（`pnpm test:run`）                              |
| B    | ビルドで確かめる       | `pnpm build:local` と `dist/` の中身                   |
| E    | 既存テストが通ること   | 既存の 13 ファイルがそのまま通る                       |
| M    | 実際に動かして確かめる | Stage 6 の動作検証。**デプロイと Access の設定が要る** |

### T0（U）: テストの土台が動くこと — **実装の最初にこれをやる**

`packages/admin` のテストが本体の `pnpm test:run` と `pnpm typecheck` で動くことを、**中身を作る前に**確かめる。

| 確かめること                                                 | なぜ先にやるか                                                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `packages/admin` の `.test.ts` が `pnpm test:run` に拾われる | `vitest.config.ts` に `test.exclude` が無いので拾われる見込みだが、確かめていない                                 |
| `.tsx` を `// @vitest-environment jsdom` で描画できる        | **根の `vitest.config.ts` は Astro の `getViteConfig()` を包んでいる。** React の TSX を jsdom で通した先例が無い |
| `typecheck.enabled: true` の下で `packages/admin` の型が通る | 型エラーはテスト実行でも落ちる                                                                                    |
| `@` の別名がぶつからない                                     | 根の設定は `@` を**ブログの** `src/` に向けている                                                                 |

**通らなければ `packages/admin/vitest.config.ts` を別に置く。** 何を足すかは実際に出たエラーで決まるので、ここでは決めない。アプリを作り終えてから分かると手戻りが大きいので、**捨てて構わない 1 ファイルで先に確かめる**。

### T1（U）: 下書きを作るか作らないかの判定

[design/rules.md](../design/rules.md) の「下書きを作るか作らないか」の 4 通り。**空は前後の空白を落として長さ 0**。

判定は `shared/` に置いて画面と裏側の両方から使う（[design/components.md](../design/components.md)）。**判定が 2 か所にあると、画面を通ったのに 422 が返る食い違いが起きる**ので、テストも 1 組だけ書く。

### T2（U）: frontmatter の組み立てと分解

- 組み立てたものを分解すると元に戻る（往復）
- **本文に一切手を入れない。** frontmatter の区切りに見える行（`---`）を本文が含んでいても壊れない
- タイトルが空文字でも項目として書き出される（[design/data-model.md](../design/data-model.md)）
- 校正に反する記述・絵文字・極端に長い行を含む本文がそのまま戻る

### T3（U）: 識別子の検査

`crypto.randomUUID()` が作る形に一致するかだけを見る。**経路の値をファイルのパスに使う**ので、`../` を含む値や空文字を弾けることを確かめる（[design/rules.md](../design/rules.md) のバリデーション）。

### T4（U）: JWT の検証

鍵の組をテストの中で作り、JWKS の取得をモックする。

- 正しく署名され `iss` / `aud` / `exp` が合う JWT を通す
- 署名が違う / `aud` が違う / `exp` が切れている / ヘッダーが無い → いずれも 401
- **キャッシュに無い鍵 ID なら JWKS を取り直して 1 回だけ再検証する**（鍵は 6 週ごとに入れ替わる）
- 取り直しても見つからなければ 401

**ヘッダーの中身だけを見て通す実装になっていないこと**を、署名が違う JWT で確かめる。ここが抜けると別人になりすませる。

### T5（U）: 裏側の API

GitHub への `fetch` をモックする。**本物の GitHub を叩かない。**

- 一覧: ディレクトリの一覧 → 1 件ずつ取得 → `updatedAt` の新しい順
- 一覧: ディレクトリが無い（404）→ **空の配列。エラーにしない**
- 作成: `id` が作られ、`PUT` の本文に `[CI Skip]` で始まるコミットメッセージが入る
- 作成: 両方が空 → 422。**GitHub を呼ばない**
- 更新: `sha` を渡す。`updatedAt` が進む
- 更新: GitHub が 409 → **上書きせずに 409 を返す**
- パスが `src/content/drafts/<id>.md` になる

### T6（U）: 自動保存の仕掛け

jsdom と偽の時計（`vi.useFakeTimers()`）を使う。

- 入力してから 3 秒たつと 1 回だけ保存する
- 3 秒たつ前に続けて入力すると待ちが引き直され、**保存は 1 回だけ**
- 前回保存した内容と同じなら保存しない
- 両方が空になったら保存せず、`empty` の案内を出す（[design/rules.md](../design/rules.md) の「空になったとき」）
- フォーカスが外れたとき・タブが隠れたときは待たずに保存する
- 保存中に次の合図が来たら、**並べて送らず**終わってから判定し直す
- 409 が返ったら `conflict` の案内を出す

### T7（U）: 一覧の画面

- 下書きが無いとき「下書きはありません」を出す。**エラーにしない**
- タイトルが空の下書きを「（無題）」と出す
- `updatedAt` の新しい順に並ぶ

### T8（B）: 下書きがあってもビルドが通り、生成物に出ない

**`src/content/drafts/` が空のままビルドしても何も証明できない。** 下書きを置いた状態で確かめる。Stage 5 が次の手順で行う。

1. `src/content/drafts/` に 2 件を書く
   - タイトルつき: 本文に目印の文字列（例 `DRAFT_MARKER_A`）を入れる
   - **タイトルが空文字**: 本文に別の目印（例 `DRAFT_MARKER_B`）を入れる。**記事のスキーマなら落ちる形**をわざと置く
2. `pnpm build:local` を走らせ、**exit 0** であること
3. `dist/` を目印で検索して **1 件も出ないこと**
4. `dist/rss.xml` と `dist/index.html` に目印が無いこと
5. `dist/posts/<id>/` が作られていないこと
6. 2 件を消す

**フィクスチャをリポジトリに残さない。** 残すと管理画面の一覧に偽の下書きが出続ける。CI で毎回守る仕組みを置くかどうかは Unit 4 の「下書きの増減の前後で生成物が変わらない」で決める（[memory.md](memory.md) の Open questions）。

### T9（E）: 既存の記事とテストが変わらない

- 既存の 13 テストファイルがそのまま通る。**1 つも直さない**（[design/logic-model.md](../design/logic-model.md) の「既存の設定ファイルへの変更」の通り、既存の実装に触らないため）
- とくに `tools/create-post/index.test.ts` が通ること。**落ちたら `pnpm create-post` を壊したということ**（US-03）
- `src/lib/repositories/posts.test.ts` が通ること。`getPosts()` に手を入れていない証拠になる
- ビルドの生成物のうち記事に関わる部分が、この Unit の前後で変わらない

### T10（M）: 実際に動かして確かめる

**単体テストでは確かめられないもの。** デプロイと Access の設定が要る。

| 確かめること                                             | なぜテストにできないか                              |
| -------------------------------------------------------- | --------------------------------------------------- |
| PC が手元にない状態でスマホから管理画面を開ける          | 実際の端末と公開 URL が要る                         |
| **自分だけが入れる**（別のアドレスでは入れない）         | Cloudflare Access の判定はアプリの外                |
| 本文に最初の一文字を打つまでの手数が 4 未満（US-03）     | 人が数える。Access のログインが残っているかにも依る |
| 下書きが実際に GitHub に入り、開き直すと同じ本文が出る   | 本物の GitHub と トークンが要る                     |
| 下書きの保存で Cloudflare Pages のデプロイが走らないこと | `[CI Skip]` が効くかは実際の push でしか分からない  |

**Stage 6 の `ac-check-report.md` には、実施できなかったものを「未実施」と理由つきで書く。** コードを読んで満たしていそうだから合格、とはしない。

### 書かないと決めた観点

| 観点                                         | 書かない理由                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 画面の見た目・レイアウト                     | 読む人に見える画面ではない。US-01 / US-03 に表示の受け入れ条件が無い（「観点のスキップ」を参照） |
| Cloudflare Access 自体の振る舞い             | 自分で作る部分ではない。アプリが確かめるのは JWT の検証まで（T4）                                |
| GitHub Contents API 自体の振る舞い           | 外部サービス。モックで境界を切る（T5）                                                           |
| 入力の上限（1,000 文字・1 MB）の境界         | 受け入れ条件が定めた数ではなく、実装で見直す余地がある。**上限があること**だけ T5 で確かめる     |
| 公開・取り消し・プレビュー・まとめる・捨てる | Unit 2 / Unit 3 / Unit 4 の担当                                                                  |

## テストケース一覧

単体テスト（U）にするものだけを並べる。名前は英語、`Positive` / `Edge` / `Negative` に分け、各ケースに `// Arrange` `// Act` `// Assert` を入れる（`CLAUDE.md` と `src/lib/repositories/posts.test.ts` の形）。

### `packages/admin/shared/draft.test.ts`

| #   | 分類     | ケース名                                                        | 入力                                 | 期待                       |
| --- | -------- | --------------------------------------------------------------- | ------------------------------------ | -------------------------- |
| 1   | Positive | should keep a draft with both title and body                    | title あり / body あり               | 保存できると判定する       |
| 2   | Positive | should keep a draft with only a title                           | title あり / body 空                 | 保存できると判定する       |
| 3   | Positive | should keep a draft with only a body                            | title 空 / body あり                 | 保存できると判定する       |
| 4   | Negative | should reject a draft with neither title nor body               | 両方空                               | 保存できないと判定する     |
| 5   | Edge     | should treat whitespace-only input as empty                     | 空白と改行だけ                       | 保存できないと判定する     |
| 6   | Positive | should round-trip a draft through serialize and parse           | title / body / createdAt / updatedAt | 分解した結果が元と一致する |
| 7   | Edge     | should keep body untouched when it contains a frontmatter fence | body に `---` の行を含む             | body が一字も変わらない    |
| 8   | Edge     | should write an empty title as an explicit field                | title 空                             | `title: ""` が書き出される |
| 9   | Edge     | should keep text that violates the prose linter                 | 校正に反する記述を含む body          | body が一字も変わらない    |

### `packages/admin/shared/id.test.ts`

| #   | 分類     | ケース名                                        | 入力                        | 期待  |
| --- | -------- | ----------------------------------------------- | --------------------------- | ----- |
| 10  | Positive | should accept an id produced by randomUUID      | `crypto.randomUUID()` の値  | true  |
| 11  | Negative | should reject an id containing a path traversal | `../../src/content/posts/x` | false |
| 12  | Negative | should reject an empty id                       | 空文字                      | false |
| 13  | Negative | should reject an id with unexpected characters  | `abc.md`                    | false |

### `packages/admin/functions/api/_middleware.test.ts`

| #   | 分類     | ケース名                                                     | 入力                   | 期待                              |
| --- | -------- | ------------------------------------------------------------ | ---------------------- | --------------------------------- |
| 14  | Positive | should pass a request with a valid access token              | 正しい JWT             | 次の処理へ進む                    |
| 15  | Negative | should reject a request without the access header            | ヘッダー無し           | 401                               |
| 16  | Negative | should reject a token with an invalid signature              | 別の鍵で署名した JWT   | 401                               |
| 17  | Negative | should reject a token with a mismatched audience             | `aud` が違う JWT       | 401                               |
| 18  | Negative | should reject an expired token                               | `exp` が過去の JWT     | 401                               |
| 19  | Edge     | should refetch the key set when the key id is unknown        | キャッシュに無い `kid` | 取り直して 1 回だけ再検証し、通る |
| 20  | Negative | should reject when the key is still missing after refetching | 取り直しても無い `kid` | 401                               |

### `packages/admin/functions/api/drafts/index.test.ts`

| #   | 分類     | ケース名                                                         | 入力                       | 期待                                |
| --- | -------- | ---------------------------------------------------------------- | -------------------------- | ----------------------------------- |
| 21  | Positive | should list drafts sorted by updated time descending             | 3 件（更新時刻がばらばら） | 新しい順の `DraftSummary[]`         |
| 22  | Edge     | should return an empty list when the drafts directory is missing | GitHub が 404              | `[]`。**エラーにしない**            |
| 23  | Positive | should create a draft and return its id                          | title / body あり          | `id` が返り、`PUT` が 1 回呼ばれる  |
| 24  | Positive | should prefix the commit message with the build skip flag        | 同上                       | メッセージが `[CI Skip]` で始まる   |
| 25  | Positive | should write the draft under the drafts directory                | 同上                       | パスが `src/content/drafts/<id>.md` |
| 26  | Negative | should not call GitHub when both title and body are empty        | 両方空                     | 422。**`fetch` が呼ばれない**       |
| 27  | Negative | should reject a title longer than the limit                      | 1,001 文字の title         | 400                                 |

### `packages/admin/functions/api/drafts/[id].test.ts`

| #   | 分類     | ケース名                                           | 入力               | 期待                                         |
| --- | -------- | -------------------------------------------------- | ------------------ | -------------------------------------------- |
| 28  | Positive | should return the stored title and body            | 保存済みの下書き   | title / body / sha が返る                    |
| 29  | Edge     | should return not found for an unknown id          | GitHub が 404      | 404                                          |
| 30  | Positive | should update a draft and advance the updated time | title / body / sha | `updatedAt` が進み、`createdAt` は変わらない |
| 31  | Negative | should not overwrite when the sha does not match   | GitHub が 409      | 409。**再試行しない**                        |
| 32  | Negative | should reject a request with a malformed id        | `../x`             | 400。**`fetch` が呼ばれない**                |

### `packages/admin/src/routes/DraftEditorPage.test.tsx`

`// @vitest-environment jsdom` と `vi.useFakeTimers()` を使う。

| #   | 分類     | ケース名                                                 | 入力                       | 期待                         |
| --- | -------- | -------------------------------------------------------- | -------------------------- | ---------------------------- |
| 33  | Positive | should save once after the input settles                 | 入力 → 3 秒                | 保存が 1 回                  |
| 34  | Edge     | should restart the timer while the user keeps typing     | 1 秒ごとに 3 回入力 → 3 秒 | 保存が 1 回                  |
| 35  | Edge     | should not save when the content is unchanged            | 保存後に同じ値へ戻す       | 保存が呼ばれない             |
| 36  | Edge     | should save immediately when the tab becomes hidden      | 入力 → `visibilitychange`  | 待たずに保存                 |
| 37  | Edge     | should save immediately when the input loses focus       | 入力 → blur                | 待たずに保存                 |
| 38  | Negative | should skip saving and report an empty draft             | 全部消す                   | 保存されず `empty` の案内    |
| 39  | Edge     | should not send concurrent saves                         | 保存中に次の合図           | 送信が同時に 2 つにならない  |
| 40  | Negative | should report a conflict when the server returns 409     | 裏側が 409                 | `conflict` の案内            |
| 41  | Positive | should switch the url to the new id after the first save | 新規で入力 → 保存          | URL が `/drafts/<id>` になる |

### `packages/admin/src/routes/DraftListPage.test.tsx`

| #   | 分類     | ケース名                                              | 入力            | 期待                                             |
| --- | -------- | ----------------------------------------------------- | --------------- | ------------------------------------------------ |
| 42  | Positive | should list drafts newest first                       | 3 件            | 新しい順に並ぶ                                   |
| 43  | Edge     | should show a placeholder for a draft without a title | title 空の 1 件 | 「（無題）」が出る                               |
| 44  | Edge     | should show an empty state when there is no draft     | `[]`            | 「下書きはありません」が出る。**エラーにしない** |

**合計 44 ケース。** うち T0（土台の確認）は捨てて構わない 1 ファイルなので数に入れていない。

## トレーサビリティ

### この Unit が受け持つ US

**US-01: PC がない場所で着想を下書きとして残す**

| 受け入れ条件のシナリオ                        | 確かめ方 | 対応                                       |
| --------------------------------------------- | -------- | ------------------------------------------ |
| 正常系 - PC がない場所で本文を書いて残す      | U / M    | 3, 23, 25, 28（保存して取り出せる）/ T10   |
| 正常系 - タイトルが決まっていない             | U        | 3, 8                                       |
| 正常系 - タイトル先行                         | U        | 2                                          |
| 異常系 - 中身が空                             | U        | 4, 5, 26, 38（「残すものがない」が分かる） |
| ビルドと生成物 - 下書きは生成物に出ない       | B        | T8                                         |
| 既存コンテンツへの影響 - 既存記事が変わらない | E        | T9                                         |

**US-03: PC でも少ない手数で書き始める**

| 受け入れ条件のシナリオ                          | 確かめ方 | 対応                                           |
| ----------------------------------------------- | -------- | ---------------------------------------------- |
| 正常系 - 今より少ない手数で本文に手をつけられる | M        | T10（**人が数える**。設計上は 2 手）           |
| 正常系 - 既存の入口がそのまま動く               | E        | T9（`tools/create-post/index.test.ts` が通る） |
| 既存コンテンツへの影響 - 既存記事が変わらない   | E        | T9                                             |

### この Unit が受け持たない US

[03_units.md](../../../03_units.md) の割り振りにより、次はテストを書かない。**ここに挙げるのは、取りこぼしではなく担当外だと示すため。**

| US    | 担当する Unit                                        | この Unit で書かない理由                                                                            |
| ----- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| US-02 | Unit 2 `publish-from-draft`                          | 下書きを記事に書き継ぐ振る舞い。ただし**書き継げる形で保存されていること**は 6・7・9・28 が確かめる |
| US-04 | Unit 4 `organize-drafts`                             | 見返して判断する一覧・まとめる・捨てる。Unit 1 の一覧は「開き直す」ためのものだけ                   |
| US-05 | Unit 2（公開・取り消し・校正）+ Unit 3（公開前確認） | 公開の経路はこの Unit に無い                                                                        |

### 既存テストへの影響

**1 つも直さない。** この Unit は既存の実装に触らないため（[design/logic-model.md](../design/logic-model.md) の「既存の設定ファイルへの変更」）。

| 既存テスト                                  | 影響 | 根拠                                         |
| ------------------------------------------- | ---- | -------------------------------------------- |
| `src/lib/repositories/posts.test.ts`        | 無し | `getPosts()` に手を入れない                  |
| `src/__tests__/pages/rss.xml.test.ts`       | 無し | `getPosts()` の戻りの型が変わらない          |
| `src/__tests__/pages/og/[slug].png.test.ts` | 無し | 同上                                         |
| `tools/create-post/index.test.ts`           | 無し | `tools/create-post/` に触らない              |
| `src/components/*.test.ts`（7 件）          | 無し | 公開側の表示を変えない                       |
| `src/lib/environments.test.ts`              | 無し | 環境変数を足すのは `packages/admin` の側だけ |

**どれか 1 つでも落ちたら、触らないつもりのものに触ったということ。** 直す前にまず何に触ったかを見る。
