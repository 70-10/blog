# プロジェクトの実践

このリポジトリ全体に効く実践。フェーズによらず効く。承認ゲートで確定したものがここに積まれる。

昇格の既定はこのファイル。そのフェーズでしか効かないと判断したものだけ [inception.md](inception.md) か [construction.md](construction.md) へ置く。書き方と手順は [記録の書式](../recording-conventions.md) の「ルールの置き場」にある。

話題ごとの見出し（`## 進め方`、`## テストの構え`、`## 書き方` など）を作り、その下に箇条書きで足す。近いテーマの見出しが既にあれば新しく作らずそこへ追記する。

---

## Git

- **ブランチ名は `intent/<intent-slug>/unit/<unit-slug>`。** 例: `intent/quick-draft/unit/draft-anywhere`。どの Intent のどの Unit の作業かが名前だけで分かる
- **コミットメッセージは Conventional Commits**（`<type>(<scope>): <subject>`、type は `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`）。記事の追加だけは既存の `Add post/<slug>` を残す
- **管理画面が自動で打つコミットは `[CI Skip]` を先頭に置き、型はその後ろに来る**（`[CI Skip] chore(draft): update <id>`）。Cloudflare Pages はこの印が先頭にあるときだけデプロイを飛ばすため。**人が打つコミットではこの形を使わない**
- **PR は結果で分ける。** Unit を最後まで通せたら通常の PR、`[B]` で中断したら Draft。`main` に必須レビューも必須チェックも無いため、中断したものが誤ってマージされるのを防ぐ
- **PR 本文は base ↔ head の差分視点で書く。** ブランチ内の作業の経緯は書かない。無人実行のときは `records.md`（記録の取捨選択の入口）への導線を必ず入れ、中断したなら `blocked.md` も添える

## 記録

- **`glossary-drift.sh` の指摘は部分一致。** 避ける別名として使っていない語（引用・別の意味での用法）も当たる。統一語に置き換えるのが誤りになる場合は、その語を使わない書き方へ言い換えて外す
