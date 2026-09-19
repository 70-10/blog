# Learn（学習ループ）

ステージ実行中の判断を `memory.md` に記録し、承認ゲートで再利用できるルールに格上げする仕組み。同じ失敗・判断を繰り返さないためのフィードバックループ。

**書式と振り分けを定めるのは `${CLAUDE_PROJECT_DIR}/docs/recording-conventions.md`。** ここには Construction 固有の点だけ書く。

## Construction での置き場

`memory.md` は**ステージごとに 1 ファイル**で、そのステージの成果物ディレクトリに置く。

```
docs/intents/<slug>/units/<unit>/
├── explore/memory.md
├── design/memory.md
├── test-design/memory.md
├── implementation/memory.md
├── verification/memory.md
└── review/memory.md
```

**ステージを表すタグは書かない。** パスがステージを表すので要らない。Unit をまたいでも Intent をまたいでも混ざらないので、絞り込みも要らない。

ファイルはステージ開始時に無ければ作り、あれば上書きしない。承認が済んでも消さない。

## 承認ゲートでの提示

各ステージのゲートで、そのステージのファイルを渡す。

```bash
bash .claude/scripts/memory-candidates.sh docs/intents/<slug>/units/<unit>/<stage>/memory.md
```

Stage 4（implement）はゲートが 2 回あるので 2 回とも行う。スクリプトはファイルの中身を全部出すため 1 回目で振り分け済みのエントリも再び出る。2 回目はタイムスタンプを見て 1 回目以降に追記した分に絞る。

Stage 6（review）は Unit の最後のゲートなので、`explore/` から `verification/` までの `memory.md` を順に通し、残したまま持ち越したエントリを見直して決め切る。

## ステージをまたいで引き継がない

`memory.md` は**そのステージの記録**であって、次のステージへの申し送りではない。未解決の疑問と矛盾は、そのステージを終える前に解消する。持ち越すものは成果物（`open-questions.md` など）に書くか、ルールへ上げる。

## ルールがあふれないように

Construction を回すたびに候補が出るため、放置すると `docs/rules/` が膨らむ。振り分けにユーザー承認を必須にしていること自体が抑えになる。「書くコストが低いから念のため残す」で昇格させず、再発防止に本当に効くものだけを書く。
