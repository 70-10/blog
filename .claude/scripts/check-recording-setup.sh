#!/usr/bin/env bash
# 記録機構（用語集・ADR・learn）が Inception / Construction の両フェーズに
# 組み込まれているかを機械的に判定する。全 PASS で exit 0、1件でも FAIL で exit 1。
#
# 使い方: bash .claude/scripts/check-recording-setup.sh
#
# macOS の bash 3.2 で動かす（mapfile 等 bash4 専用機能を使わない）。

set -u

cd "$(dirname "$0")/../.." || exit 1
ROOT=$(pwd)

FAIL=0
pass() { printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
ng()   { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAIL=1; }

CONV="docs/recording-conventions.md"
INCEPTION=".claude/skills/inception/SKILL.md"
STAGES="explore design test-design implement verify review"

# H2 セクションの本文を取り出す。
# 見出しは前方一致で拾う（「## 承認ゲート（各回共通）」のように修飾が付くことがあるため）。
h2_section() {
  awk -v h="$2" '
    index($0, h) == 1 { f = 1; next }
    /^## / { if (f) exit }
    f
  ' "$1"
}

# H3 の連番ステップ（### N.）の本文を取り出す
step_section() {
  awk -v pat="^### $2\\." '
    $0 ~ pat { f = 1; next }
    /^### / || /^## / { if (f) exit }
    f
  ' "$1"
}

has() { case "$1" in *"$2"*) return 0 ;; *) return 1 ;; esac; }

echo "== 1. 記録の書式を定めるファイル =="
if [ ! -f "$CONV" ]; then
  ng "$CONV が無い"
else
  miss=""
  for sec in "## memory.md" "## ADR" "## 用語集"; do
    grep -qF "$sec" "$CONV" || miss="$miss $sec"
  done
  if [ -z "$miss" ]; then pass "$CONV に3節が揃っている"; else ng "$CONV に欠けている節:$miss"; fi
fi

echo "== 2. 候補検出スクリプト =="
for s in memory-candidates glossary-drift; do
  p=".claude/scripts/$s.sh"
  if [ -x "$p" ]; then pass "$p が実行可能"; else ng "$p が無いか実行権限が無い"; fi
done

echo "== 3. Inception の承認ゲート =="
if [ ! -f "$INCEPTION" ]; then
  ng "$INCEPTION が無い"
else
  if grep -qF "## 承認ゲート" "$INCEPTION"; then
    pass "$INCEPTION に ## 承認ゲート 節がある"
  else
    ng "$INCEPTION に ## 承認ゲート 節が無い"
  fi
  miss=""
  for n in 0 1 2 3 4; do
    sec=$(step_section "$INCEPTION" "$n")
    has "$sec" "承認ゲート" || miss="$miss step$n"
  done
  if [ -z "$miss" ]; then
    pass "ステップ0〜4 すべてが承認ゲートを参照している"
  else
    ng "承認ゲートを参照していないステップ:$miss"
  fi
fi

echo "== 4. Construction 6ステージのゲート3項目 =="
miss=""
for st in $STAGES; do
  f=".claude/skills/construction-$st/SKILL.md"
  if [ ! -f "$f" ]; then miss="$miss $st(ファイル無し)"; continue; fi
  sec=$(h2_section "$f" "## 承認ゲート")
  for kw in learn ADR 用語; do
    has "$sec" "$kw" || miss="$miss $st:$kw"
  done
done
if [ -z "$miss" ]; then
  pass "6ステージすべてのゲートに learn・ADR・用語 が揃っている"
else
  ng "ゲートに不足がある:$miss"
fi

echo "== 5. 候補ゼロでも1問聞く =="
miss=""
n=0
for f in "$INCEPTION" .claude/skills/construction-*/SKILL.md; do
  [ -f "$f" ] || continue
  n=$((n + 1))
  sec=$(h2_section "$f" "## 承認ゲート")
  has "$sec" "候補がゼロでも" || miss="$miss $f"
done
if [ "$n" -eq 0 ]; then
  ng "承認ゲートを持つスキルが1つも無い"
elif [ -z "$miss" ]; then
  pass "全ゲート手順（${n}件）に「候補がゼロでも」の記述がある"
else
  ng "「候補がゼロでも」が無いゲート手順:$miss"
fi

echo "== 6. 個人環境への依存が無い =="
# この判定スクリプト自身は検索語をそのまま持つので対象から外す
hits=$(grep -rn '~/\.claude' .claude/skills/ .claude/scripts/ 2>/dev/null | grep -v '^\.claude/scripts/check-recording-setup\.sh:')
if [ -z "$hits" ]; then
  pass "スキル・スクリプトに ~/.claude への参照が無い"
else
  ng "個人環境への参照がある:"
  printf '%s\n' "$hits" | sed 's/^/          /'
fi

echo "== 7. 移植元の固有語が残っていない =="
# 移植元は会社のプライベートリポジトリ。このリポジトリは公開されるため、
# 社名・システム番号・社内の Intent 名・業務ドメイン用語が混入していないことを確かめる。
# awslabs/aidlc-workflows は AWS Labs の公開リポジトリなので対象に入れない。
# 元ネタとして名前を出す場面がある。
LEAK_TERMS="Solamichi
AI-Assist
SYS-
ai_follow
ai-assist
ai-assist-demo
ocr_input
simple-ocr
system-test:
PVT_
薬局
服薬
患者
お薬手帳"
hits=""
while IFS= read -r term; do
  [ -z "$term" ] && continue
  # この判定スクリプト自身は検索語をそのまま持つので対象から外す
  h=$(grep -rniF "$term" .claude/skills/ .claude/scripts/ docs/ 2>/dev/null \
    | grep -v '^Binary' \
    | grep -v '^\.claude/scripts/check-recording-setup\.sh:')
  [ -n "$h" ] && hits="$hits
$term:
$h"
done <<EOF
$LEAK_TERMS
EOF
if [ -z "$hits" ]; then
  pass "移植元の固有語は1件も残っていない"
else
  ng "移植元の固有語が残っている:"
  printf '%s\n' "$hits" | sed 's/^/          /'
fi

echo "== 8. ADR の実在と必須項目 =="
adrs=$(ls docs/adr/[0-9]*.md 2>/dev/null)
if [ -z "$adrs" ]; then
  ng "docs/adr/ に ADR が1件も無い"
else
  miss=""
  for a in $adrs; do
    for k in "Status:" "発生元:" "却下した代替案:"; do
      grep -qF "$k" "$a" || miss="$miss $(basename "$a"):$k"
    done
  done
  n=$(printf '%s\n' "$adrs" | wc -l | tr -d ' ')
  if [ -z "$miss" ]; then
    pass "ADR ${n}件すべてに Status / 発生元 / 却下した代替案 がある"
  else
    ng "ADR に不足がある:$miss"
  fi
fi

echo "== 9. memory-candidates.sh を両側で確認 =="
# 陽性側（WARN が出ないこと）は docs/intents/ の実データで見る。まだ1件も無い間でも
# 検出器が壊れていないことは確かめられるよう、規約どおりの形とステージ名を見出しにした形を
# その場で作って通す。陰性側（書式から外れたら WARN が出ること）は常にこの方法で見る。
MC=".claude/scripts/memory-candidates.sh"
if [ ! -x "$MC" ]; then
  ng "$MC が無いため両側確認をスキップ"
else
  TMPD=$(mktemp -d) || TMPD=""
  if [ -z "$TMPD" ]; then
    ng "一時ディレクトリを作れず両側確認をスキップ"
  else
    cat > "$TMPD/ok.md" <<'MEOF'
## Interpretations

- 2026-08-10T01:00:00Z 規約どおりの形

## Deviations

## Tradeoffs

- 2026-08-10T02:00:00Z 代替案と選んだ理由

## Open questions
MEOF
    # 逸脱は 2 種類あり、検出のコードも別々なので fixture を分ける。
    # 1 つにまとめるとどちらのブランチで WARN が出たか分からず、片方が壊れても気づけない。
    cat > "$TMPD/legacy-heading.md" <<'MEOF'
## design段階（2026-08-10）

- 2026-08-10 ステージ名を見出しにした旧形式のエントリ
MEOF
    cat > "$TMPD/legacy-tag.md" <<'MEOF'
## Interpretations

- 2026-08-10T01:00:00Z [step0] 廃止されたステージタグが残っているエントリ
MEOF
    w=$(bash "$MC" "$TMPD/ok.md" 2>&1 >/dev/null)
    if [ -z "$w" ]; then
      pass "規約どおりの memory.md では WARN が出ない"
    else
      ng "規約どおりの memory.md で WARN が出る（検出器か規約のどちらかがずれている）"
      printf '%s\n' "$w" | sed 's/^/          /'
    fi

    w=$(bash "$MC" "$TMPD/legacy-heading.md" 2>&1 >/dev/null)
    if [ -n "$w" ]; then
      pass "ステージ名を見出しにした memory.md では WARN が出る"
    else
      ng "ステージ名の見出しを検出できていない"
    fi

    w=$(bash "$MC" "$TMPD/legacy-tag.md" 2>&1 >/dev/null)
    case "$w" in
      *"廃止されたステージタグ"*)
        pass "廃止されたステージタグが残った memory.md では WARN が出る" ;;
      *)
        ng "廃止されたステージタグを検出できていない（移行漏れを見逃す）" ;;
    esac
    rm -rf "$TMPD"
  fi

  # 実データがあるなら、そちらでも WARN が出ないことを確かめる。
  # Construction 側は <stage>/memory.md、Inception 側は memory/step0.md のように
  # ファイル名の形が違うので両方を拾う。-name memory.md だけだと Inception 側を
  # 1 件も見つけず、書式が崩れていても判定が素通りする。
  reals=$(find docs/intents \( -name memory.md -o -path '*/memory/step*.md' \) 2>/dev/null)
  if [ -n "$reals" ]; then
    miss=""
    n=0
    while IFS= read -r m; do
      [ -z "$m" ] && continue
      n=$((n + 1))
      w=$(bash "$MC" "$m" 2>&1 >/dev/null)
      [ -n "$w" ] && miss="$miss $m"
    done <<EOF
$reals
EOF
    if [ -z "$miss" ]; then
      pass "docs/intents/ の memory ${n}件は WARN なし"
    else
      ng "書式から外れた memory がある:$miss"
    fi
  fi
fi

echo "== 10. glossary-drift.sh が自己検出しない =="
GD=".claude/scripts/glossary-drift.sh"
if [ ! -x "$GD" ]; then
  ng "$GD が無いため確認をスキップ"
elif [ ! -f docs/glossary.md ]; then
  ng "docs/glossary.md が無い"
else
  out=$(bash "$GD" docs/glossary.md 2>/dev/null)
  if [ -z "$out" ]; then
    pass "docs/glossary.md 自身に対して検出ゼロ（自己検出しない）"
  else
    ng "docs/glossary.md 自身を検出している:"
    printf '%s\n' "$out" | sed 's/^/          /'
  fi
fi

echo "== 11. ファイル参照が実在する =="
# スキルとドキュメントが指すパスを取り出して存在を確かめる。
# ${CLAUDE_PROJECT_DIR} は実行時に展開されるので、ここではリポジトリルートに置き換える。
# 置き換えずに文字列のまま存在を見ると必ず「見つからない」に倒れて判定の意味が無くなる。
targets=$(find .claude/skills .claude/scripts docs -type f \( -name '*.md' -o -name '*.sh' \) 2>/dev/null | grep -v '^docs/intents/')
miss=""
for f in $targets; do
  refs=$(grep -oE '\$\{CLAUDE_PROJECT_DIR\}/[A-Za-z0-9_./-]+' "$f" 2>/dev/null | sort -u)
  for r in $refs; do
    p="${r#\$\{CLAUDE_PROJECT_DIR\}/}"
    [ -e "$ROOT/$p" ] || miss="$miss
          $f -> $p"
  done
  # 同ディレクトリ・下位ディレクトリへの相対リンク（Markdown のみ）
  case "$f" in
    *.md)
      d=$(dirname "$f")
      links=$(grep -oE '\]\([A-Za-z0-9_][A-Za-z0-9_./-]*\.(md|sh)\)' "$f" 2>/dev/null | sed 's/^](//; s/)$//' | sort -u)
      for l in $links; do
        [ -e "$d/$l" ] || miss="$miss
          $f -> $l"
      done
      ;;
  esac
done
if [ -z "$miss" ]; then
  pass "参照はすべて実在するパスを指している"
else
  ng "存在しない参照がある:$miss"
fi

echo "== 12. 昇格先のルールファイルが揃っている =="
# 承認ゲートで「ルールに上げる」を選んだときの行き先。無いと昇格が宙に浮く。
miss=""
for f in project inception construction; do
  [ -f "docs/rules/$f.md" ] || miss="$miss docs/rules/$f.md"
done
if [ -z "$miss" ]; then
  pass "docs/rules/ に project・inception・construction が揃っている"
else
  ng "昇格先が足りない:$miss"
fi

echo "== 13. スキルがルールを読む手順を持っている =="
# docs/rules/ は自動では読まれない。読むことがスキルの手順に書かれていなければ
# ファイルがあっても効かない。
miss=""
if [ -f "$INCEPTION" ]; then
  grep -qF "docs/rules/inception.md" "$INCEPTION" || miss="$miss inception"
else
  miss="$miss inception(ファイル無し)"
fi
for st in $STAGES; do
  f=".claude/skills/construction-$st/SKILL.md"
  if [ ! -f "$f" ]; then miss="$miss $st(ファイル無し)"; continue; fi
  grep -qF "docs/rules/construction.md" "$f" || miss="$miss $st"
done
if [ -z "$miss" ]; then
  pass "inception と 6 ステージがルールの読み込みを手順に持っている"
else
  ng "ルールを読む手順が無い:$miss"
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "すべて PASS"
else
  echo "FAIL あり"
fi
exit "$FAIL"
