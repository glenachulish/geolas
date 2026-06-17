#!/usr/bin/env bash
# drift report — one line per source file Claude might edit:
# size in bytes, sha256 first-8-chars, and the path. Run at the start of a
# session and paste into chat; Claude diffs against project knowledge and
# refuses to edit any file whose size doesn't match.
set -euo pipefail
cd "$(dirname "$0")"   # always run from the project root, wherever called from

print_file() {
  local p="$1"
  [ -f "$p" ] || return 0            # skip silently if the glob matched nothing
  local bytes hash
  bytes=$(wc -c < "$p" | tr -d ' ')
  hash=$(shasum -a 256 "$p" | cut -c1-8)
  printf "%-44s %8s  %s\n" "$p" "$bytes" "$hash"
}

echo "===== DRIFT REPORT — $(date '+%Y-%m-%d %H:%M:%S') ====="

# Backend code
for f in backend/*.py; do print_file "$f"; done

# Frontend (root) — html/js/css + manifest
for f in static/*.html static/*.js static/*.css static/*.webmanifest; do print_file "$f"; done
# Frontend views (if any added later)
for f in static/views/*.js; do print_file "$f"; done

# Deploy scaffolding worth tracking
print_file requirements.txt
print_file geolas.service

# Status / notes docs (tracked because Claude reads them too)
print_file GEOLAS_CLAUDE.md
print_file GEOLAS_TODO.md
print_file GEOLAS_PROJECT_NOTES.md

# NOTE: deliberately NOT tracked — never upload these:
#   data/ (geolas.db + uploaded photos), static/vendor/ (vendored Leaflet,
#   large + not edited), .venv/, .git/. Excluded by simply not naming them.

echo "===== END ====="
