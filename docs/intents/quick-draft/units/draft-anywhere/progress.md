# Construction Progress — quick-draft / draft-anywhere

## モード

unattended

## ステージ

- [B] explore
- [ ] design
- [ ] test-design
- [ ] implement
- [ ] verify
- [ ] review

## Stage 1: explore

**結果**: `[B]`（中断）。理由と要る判断は [blocked.md](blocked.md)。

### 成果物

| ファイル                                                   | 中身                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [explore/constraints.md](explore/constraints.md)           | 既存コードから来る制約 6 件、規約、やってはいけないこと 6 件                          |
| [explore/design-decisions.md](explore/design-decisions.md) | 効く ADR 4 件、既存コードが置いている設計判断 6 件、触る見込みのファイル 8 件         |
| [explore/test-strategy.md](explore/test-strategy.md)       | 既存テスト 13 ファイルの構造と書き方、守り方の分類、既存テストへの影響                |
| [explore/open-questions.md](explore/open-questions.md)     | 未解決 3 件（Q1 は design で解決可、Q2 は中断の理由、Q3 は Q2 に従属）、解消済み 8 件 |
| [explore/memory.md](explore/memory.md)                     | 解釈 2・逸脱 3・トレードオフ 2・未解決 2                                              |

### 分かったことのうち大きいもの

- **`getPosts()` が下書きを公開対象から外す唯一の口。** 一覧・記事ページ・タグページ・RSS・OGP 画像の 5 つがすべてここを通る
- **コレクションのスキーマが本文だけの下書きを拒む。** `title` / `publishDate` / `tags` が必須なので、下書きを `src/content/posts/` に置くなら必須を外すことになり、緩和が既存 97 記事にも効く
- **新しいパッケージのテストは何もしなくても `pnpm test:run` に入る。** `vitest.config.ts` に `test.exclude` の指定がない
- **依存を足すならロックファイルを一緒にコミットする。** CI が `git diff --exit-code pnpm-lock.yaml` で見ている

### センサー

| センサー          | 結果                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| required-sections | PASS（4 ファイルとも）                                                                  |
| upstream-coverage | PASS（4 ファイルとも）                                                                  |
| glossary-drift    | 成果物は揺れなし。`explore/memory.md` の 1 件は検出された語を名指しした記録なので残した |

### 記録

[records.md](records.md) に振り分けの結果がある。ルール 3 件・用語集 1 件を書き、ADR は書いていない（判断がまだ無いため）。
