#!/usr/bin/env bash
# Not `|| true` / 2>/dev/null: PostToolUse passes stderr to the model only on exit 2,
# so swallowing errors (or exiting 1) means the agent never learns lint failed.
set -u

file="$(jq -r '.tool_input.file_path // empty')"

[ -n "${file}" ] && [ -f "${file}" ] || exit 0

# Not the script's own location or $CLAUDE_PROJECT_DIR: in a worktree session those can
# point at the main checkout, whose node_modules and ESLint base path miss the edited file.
root="$(cd "$(dirname "${file}")" && pwd)"
while [ ! -f "${root}/pnpm-workspace.yaml" ]; do
  [ "${root}" = "/" ] && exit 0
  root="$(dirname "${root}")"
done
cd "${root}" || exit 0
bin="${root}/node_modules/.bin"

problems=""

collect() {
  local output
  if ! output="$("$@" 2>&1)"; then
    problems="${problems}${output}"$'\n'
  fi
}

"${bin}/prettier" --write --ignore-unknown --log-level warn "${file}" >/dev/null 2>&1

case "${file##*.}" in
  md)
    "${bin}/textlint" --fix "${file}" >/dev/null 2>&1
    # Only posts are gated (pnpm lint:textlint); other Markdown is English and trips the Japanese rules.
    # Not --fix's exit code: it can be 0 with unfixable errors left.
    case "${file}" in
      "${root}"/src/content/posts/*) collect "${bin}/textlint" "${file}" ;;
    esac
    ;;
  ts | tsx | js | mjs | cjs | astro)
    collect "${bin}/eslint" --fix --no-warn-ignored "${file}"
    ;;
esac

if [ -n "${problems}" ]; then
  printf 'Lint problems remain in %s after auto-fix:\n%s' "${file}" "${problems}" >&2
  exit 2
fi
exit 0
