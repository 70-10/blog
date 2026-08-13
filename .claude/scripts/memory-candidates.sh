#!/usr/bin/env bash
# memory.md から learn 候補を取り出す。
#
# 使い方: bash .claude/scripts/memory-candidates.sh <memory.md のパス>
#
# 標準出力: 見出しつきの候補（そのまま承認ゲートで提示できる形）
# 標準エラー: 書式が docs/recording-conventions.md から外れている箇所の WARN
# 終了コード: 0 = 実行できた（候補ゼロでも 0）/ 2 = 引数やファイルの誤り
#
# memory.md はステージごとに 1 ファイルなので、ステージを指定する引数は持たない。
# 渡されたファイルの中身がそのままそのステージの候補になる。
#
# Open questions は出力しない。仕様の未確定であって再利用できる決まりではないため
# （docs/recording-conventions.md「Open questions の扱い」）。
#
# macOS の bash 3.2 で動かす。

set -u

FILE="${1:-}"

if [ -z "$FILE" ]; then
  echo "使い方: $0 <memory.md のパス>" >&2
  exit 2
fi
if [ ! -f "$FILE" ]; then
  echo "ファイルが無い: $FILE" >&2
  exit 2
fi

# --- 書式の逸脱を集めて標準エラーへ ---
warnings=$(awk '
  # 抽出側の classify() と同じ前方一致で見分ける。派生見出し（「Interpretations（追記）」など）は
  # 4分類に寄せられるので、振り分けられない見出しとは別のメッセージにする。
  function derives(h) {
    return (index(h, "Interpretations") == 1 || index(h, "Deviations") == 1 \
         || index(h, "Tradeoffs") == 1 || index(h, "Open questions") == 1)
  }
  /^## / {
    h = substr($0, 4)
    if (h == "Interpretations" || h == "Deviations" || h == "Tradeoffs" || h == "Open questions") {
      next
    }
    if (derives(h)) {
      print "  派生見出し（4分類には寄せられるが、見出しは4つに固定する）: " $0
    } else {
      print "  未知の見出し（4分類に振り分けられない）: " $0
    }
    next
  }
  # ステージタグは廃止された。ファイルのパスがステージを表すので、残っていれば移行漏れ。
  /^- / {
    if ($0 ~ /\[(step[0-4]|explore|design|test-design|implement|verify|review)\]/) {
      print "  廃止されたステージタグが残っている: " substr($0, 1, 70)
    }
  }
' "$FILE")

if [ -n "$warnings" ]; then
  {
    echo "WARN: $FILE は docs/recording-conventions.md の書式から外れています。"
    echo "      該当エントリも候補には含めますが、分類の絞り込みは効きません。"
    printf '%s\n' "$warnings"
  } >&2
fi

# --- 候補の抽出 ---
awk '
  function flush() {
    if (buf != "") {
      if (!printed_h) { print ""; print "## " cur; printed_h = 1 }
      printf "%s", buf
    }
    buf = ""
  }
  # 見出しを4分類に寄せる。派生見出し（「Interpretations（追記）」など）は前方一致で拾い、
  # どれにも当たらない見出し（ステージ名を見出しにした旧形式など）は分類不明として残す。
  # Open questions とその派生だけは候補にしない。
  function classify(h) {
    if (index(h, "Interpretations") == 1) return "Interpretations"
    if (index(h, "Deviations") == 1) return "Deviations"
    if (index(h, "Tradeoffs") == 1) return "Tradeoffs"
    if (index(h, "Open questions") == 1) return ""
    return "（分類不明: " h "）"
  }
  /^## / {
    flush()
    cur = classify(substr($0, 4))
    printed_h = 0
    keep_section = (cur != "")
    open = 0
    next
  }
  /^- / {
    flush()
    if (!keep_section) { open = 0; next }
    buf = $0 "\n"
    open = 1
    next
  }
  # 継続行（"- " で始まらない行）は直前のエントリにぶら下げる
  {
    if (open && buf != "") buf = buf $0 "\n"
  }
  END { flush() }
' "$FILE"
