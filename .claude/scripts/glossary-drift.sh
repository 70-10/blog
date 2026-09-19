#!/usr/bin/env bash
# docs/glossary.md の「避ける別名」が成果物で使われていないかを検出する。
#
# 使い方: bash .claude/scripts/glossary-drift.sh <対象パス>...
#   ディレクトリを渡した場合は配下の *.md を対象にする。
#
# 標準出力: <ファイル>:<行番号>: <使われている別名> → <統一語>
# 終了コード: 0 = 実行できた（検出ゼロでも 0）/ 2 = 引数やファイルの誤り
#
# 検出できる範囲はここまで。「成果物に出てきた新しい語が用語集に未登録である」ことは
# 検出しない（日本語の未知語の切り出しは形態素解析なしにはできない）。新語を登録するかは
# 承認ゲートでの人の判断に残る。docs/recording-conventions.md「機械で見つかる範囲」を参照。
#
# 日本語には語境界が無く、別名が統一語の一部になっていることがある
# （例: 別名「アシスト設定」は統一語「AIアシスト設定」に含まれる）。そのため各行から
# 統一語をすべて取り除いてから別名を探し、正しく統一語を使っている箇所を拾わない。
#
# macOS の bash 3.2 で動かす。

set -u

# 用語集はリポジトリルート基準で解決する。cd はしない（引数の相対パスは呼び出し元の
# カレントディレクトリを基準にしたいため）。
ROOT=$(cd "$(dirname "$0")/../.." && pwd) || exit 2
GLOSSARY="$ROOT/docs/glossary.md"

if [ "$#" -eq 0 ]; then
  echo "使い方: $0 <対象パス>..." >&2
  exit 2
fi
if [ ! -f "$GLOSSARY" ]; then
  echo "用語集が無い: $GLOSSARY" >&2
  exit 2
fi

# 対象ファイルを集める。用語集そのものは対象外
# （定義本文で「なぜその別名を避けるか」を説明するために別名を引用しているため）。
targets=""
for p in "$@"; do
  if [ -d "$p" ]; then
    found=$(find "$p" -type f -name '*.md' 2>/dev/null)
  elif [ -f "$p" ]; then
    found="$p"
  else
    echo "対象が見つからない: $p" >&2
    continue
  fi
  targets="$targets
$found"
done

filtered=""
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in */glossary.md|glossary.md) continue ;; esac
  filtered="$filtered
$f"
done <<EOF
$targets
EOF

filtered=$(printf '%s\n' "$filtered" | grep -v '^$')
[ -z "$filtered" ] && exit 0

# shellcheck disable=SC2086
printf '%s\n' "$filtered" | tr '\n' '\0' | xargs -0 awk -v glossary="$GLOSSARY" '
function strip_literal(s, t,   p, out) {
  out = ""
  while ((p = index(s, t)) > 0) {
    out = out substr(s, 1, p - 1)
    s = substr(s, p + length(t))
  }
  return out s
}

BEGIN {
  nt = 0; na = 0
  while ((getline line < glossary) > 0) {
    if (substr(line, 1, 2) == "**") {
      body = substr(line, 3)
      p = index(body, "**")
      if (p > 0) {
        term = substr(body, 1, p - 1)
        terms[++nt] = term
      }
      continue
    }
    if (index(line, "避ける別名:") == 1) {
      rest = line
      sub(/^避ける別名:[ 　]*/, "", rest)
      n = split(rest, a, ",")
      for (i = 1; i <= n; i++) {
        al = a[i]
        gsub(/^[ 　]+|[ 　]+$/, "", al)
        if (al != "" && term != "") { na++; alias[na] = al; canon[na] = term }
      }
    }
  }
  close(glossary)

  # 長い統一語から先に取り除く（短い語の部分一致で取りこぼさないため）
  for (i = 2; i <= nt; i++) {
    v = terms[i]
    for (j = i - 1; j >= 1 && length(terms[j]) < length(v); j--) terms[j + 1] = terms[j]
    terms[j + 1] = v
  }
}

index($0, "避ける別名:") == 1 { next }

{
  line = $0
  for (i = 1; i <= nt; i++) line = strip_literal(line, terms[i])
  if (line == "") next
  for (i = 1; i <= na; i++) {
    if (index(line, alias[i]) > 0) {
      key = FILENAME ":" FNR ":" alias[i]
      if (!(key in seen)) {
        seen[key] = 1
        printf "%s:%d: %s → %s\n", FILENAME, FNR, alias[i], canon[i]
      }
    }
  }
}
'
