# Sensors（成果物の品質チェック）

各ステージが成果物を生成したあと、承認ゲートの前に走らせる機械的チェック。

## 設計方針

- **アルゴリズムで解決できることはアルゴリズムで**: 判定は Bash の grep で行い、AI の主観に依存させない
- **警告のみ（参考）**: センサーの WARN は承認ゲートを**ブロックしない**。結果を承認ゲートのサマリーに含め、修正するか続行するかはユーザーが決める
- **ステージごとに宣言**: 各ステージ SKILL.md がどのセンサーを走らせるかを明記する（下表）

## どのステージで何を走らせるか

| ステージ | センサー |
|---|---|
| explore / design | `required-sections` + `upstream-coverage` |
| test-design | `required-sections` + `upstream-coverage` + `completeness` |
| implement / verify / review | `required-sections` |

## 実行のしかた

シェルの状態（関数・変数）は Bash 呼び出し間で保持されない。**各センサーは下記の自己完結スニペットを1回の Bash 実行にコピペし、`FILE` / リストを成果物に合わせて埋める**。必須見出しは [artifact-schemas.md](artifact-schemas.md) から取る。macOS の bash 3.2 でも動くよう bash4 専用機能（`mapfile` 等）は使わない。

**生成しなかった任意成果物にはセンサーを走らせない**（UI を含まない変更の `components.md` 等。存在しないファイルに `required-sections` を回すとファイル不在で誤判定する）。実際に生成した成果物だけを対象にする。

**複数行の値は `for x in $var` で回さない。** スニペットを貼り付ける先のシェルが zsh だと、変数展開で単語分割が起きないため全行が 1 つの文字列にまとまる。さらに `grep -F` は改行区切りを「複数パターンのいずれか」と解釈するので、**1つでも当たれば全部当たったことになり、取りこぼしを見逃す**。下の 3 つのセンサーがどれも `while IFS= read -r` + heredoc を使っているのはこのため。センサーを足すときも同じ形にする。

---

## required-sections

成果物に必須 H2 見出しが揃っているかを照合し、欠落を報告する。`REQUIRED` には artifact-schemas.md の見出しテキスト（`## ` を除いたもの）を改行区切りで入れる。条件付き見出しは含めない。

```bash
FILE="docs/intents/<slug>/units/<unit>/explore/constraints.md"
REQUIRED="技術的制約
命名規約・コーディング規約
やってはいけないこと"

missing=""
while IFS= read -r h; do
  [ -z "$h" ] && continue
  grep -qE "^##[[:space:]]+${h}([[:space:]]|\$)" "$FILE" || missing="${missing}  - ## ${h}\n"
done <<EOF
$REQUIRED
EOF

if [ -z "$missing" ]; then
  echo "required-sections: PASS ($FILE)"
else
  echo "required-sections: WARN — 欠落見出し ($FILE):"
  printf '%b' "$missing"
fi
```

- `^##[[:space:]]+<text>([[:space:]]|$)` で「H2 行のテキストが一致」を見る。`処理フロー` が `処理フロー詳細` を誤検出しないよう末尾を境界で縛る
- 見出しテキストに ASCII の正規表現メタ文字（`(` `)` `*` 等）が含まれる場合のみエスケープが要る。このスキルの定義見出しは該当しない

## upstream-coverage

そのステージが consumes 宣言した上流成果物が、本文で言及されているかを確認する。`UPSTREAM` にはステージの consumes（成果物キー名やファイル名）を改行区切りで入れる。

```bash
FILE="docs/intents/<slug>/units/<unit>/design/logic-model.md"
UPSTREAM="user-stories
intent
constraints
design-decisions"

missing=""
while IFS= read -r u; do
  [ -z "$u" ] && continue
  grep -qiF "$u" "$FILE" || missing="${missing}  - ${u}\n"
done <<EOF
$UPSTREAM
EOF

if [ -z "$missing" ]; then
  echo "upstream-coverage: PASS ($FILE)"
else
  echo "upstream-coverage: WARN — 本文で未言及の上流成果物 ($FILE):"
  printf '%b' "$missing"
fi
```

- `grep -qiF` は大文字小文字を無視した固定文字列マッチ。緩い参考チェックであり、言及があるかだけを見る（内容の妥当性までは見ない）

## completeness（test-design）

US / AC の各 US がテスト設計で言及されているかを照合する。`US_FILE` は US / AC ファイル、`TD_DIR` はテスト設計の出力ディレクトリ（ファイルが US 別に分割されても拾えるようディレクトリを再帰検索する）。

```bash
US_FILE="docs/intents/<slug>/02_user-stories.md"
TD_DIR="docs/intents/<slug>/units/<unit>/test-design"

ids=$(grep -oE 'US-[0-9]+' "$US_FILE" | sort -u)
missing=""
while IFS= read -r id; do
  [ -z "$id" ] && continue
  grep -rqF "$id" "$TD_DIR" || missing="${missing}  - ${id}\n"
done <<EOF
$ids
EOF

if [ -z "$missing" ]; then
  echo "completeness: PASS (全 US がテスト設計で言及されている)"
else
  echo "completeness: WARN — テスト設計で未言及の US:"
  printf '%b' "$missing"
fi
```

- これは **US 単位の代用チェック（参考）**。「AC の各項目（Gherkin シナリオ）に対応するテスト観点があるか」の厳密な照合は、テスト設計が観点を言い換えるため機械的には難しい。AC の 1 項目ずつを見るのは Stage 6 の `ac-check-report.md` の役目で、このセンサーは「US の取りこぼし」を素早く見つける軽いチェックに留まる
