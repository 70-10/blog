# Construction Progress — quick-draft / draft-anywhere

## モード

unattended

## ステージ

- [x] explore
- [ ] design
- [ ] test-design
- [ ] implement
- [ ] verify
- [ ] review

## Stage 1: explore

**結果**: 完了。途中で一度 `[B]`（中断）になり、人の判断を受けて再開した。

### 中断と再開

未解決だった「管理画面をどこで動かし、認証をどう作るか」は、公開 URL と認証方式が外部に見える約束であること、リポジトリの外で人が用意するものが要ることから `[B]` にした。判断は [ADR 0008](../../../../adr/0008-admin-runs-as-its-own-pages-project-behind-cloudflare-access.md) で決着。

| 軸                       | 決着                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| 動かす場所               | ブログとは**別の** Cloudflare Pages プロジェクト。サブドメインで開く。プレビューデプロイは止める |
| 「自分だけが入れる」作り | Cloudflare Access。アプリ側は Access が付ける JWT を検証する                                     |
| リポジトリの書き込み     | `70-10/blog` だけに絞った細かい権限のトークンを秘密の値として持ち、Contents API を叩く           |

**人がリポジトリの外で用意するものが 4 つある**（[explore/open-questions.md](explore/open-questions.md)）。**Stage 4（implement）に入る前に揃っている必要がある。**

### 成果物

| ファイル                                                   | 中身                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [explore/constraints.md](explore/constraints.md)           | 既存コードから来る制約 6 件、管理画面の土台の制約 12 件（出典つき）、規約、やってはいけないこと    |
| [explore/design-decisions.md](explore/design-decisions.md) | 効く ADR 5 件、既存コードが置いている設計判断 6 件、触る見込みのファイル 8 件、新しく足すもの 3 件 |
| [explore/test-strategy.md](explore/test-strategy.md)       | 既存テスト 13 ファイルの構造と書き方、守り方の分類、既存テストへの影響                             |
| [explore/open-questions.md](explore/open-questions.md)     | 未解決 2 件（Q1 は design、Q3 は test-design で決まる。人の判断待ちは無し）、解消済み 9 件         |
| [explore/memory.md](explore/memory.md)                     | 解釈 2・逸脱 5・トレードオフ 2・未解決 2                                                           |

### 分かったことのうち大きいもの

- **`getPosts()` が下書きを公開対象から外す唯一の口。** 一覧・記事ページ・タグページ・RSS・OGP 画像の 5 つがすべてここを通る
- **コレクションのスキーマが本文だけの下書きを拒む。** `title` / `publishDate` / `tags` が必須なので、下書きを `src/content/posts/` に置くなら必須を外すことになり、緩和が既存 97 記事にも効く
- **Access の JWT はアプリ側で署名まで検証する。** ヘッダーだけの確認ではなりすませる。公開鍵は 6 週ごとに入れ替わるので埋め込まない
- **`*.pages.dev` は独自ドメインとは別に守る必要がある。** ADR 0008 が別プロジェクトにしたのは露出を 1 か所に閉じ込めるため
- **新しいパッケージのテストは何もしなくても `pnpm test:run` に入る。** `vitest.config.ts` に `test.exclude` の指定がない
- **依存を足すならロックファイルを一緒にコミットする。** CI が `git diff --exit-code pnpm-lock.yaml` で見ている

### センサー

| センサー          | 結果                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| required-sections | PASS（4 ファイルとも）                                                                                    |
| upstream-coverage | PASS（4 ファイルとも）                                                                                    |
| glossary-drift    | 成果物は揺れなし。`explore/memory.md` と `records.md` の各 1 行は検出された語を名指しした記録なので残した |

### 記録

[records.md](records.md) に振り分けの結果がある。ルール 3 件・用語集 1 件・ADR 1 件。
