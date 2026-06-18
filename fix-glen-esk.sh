#!/usr/bin/env bash
# fix-glen-esk.sh — one-line fix: ags-glen-esk URL was missing the /2018/10/
# path segment (404). Idempotent: safe to run more than once.
# Run from the repo root: /Users/callummaclellan/Geolas
set -euo pipefail

F="static/knowledge-base.js"
OLD='url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/Barrows-Zones-in-Glen-Esk.pdf"'
NEW='url:"https://www.aberdeengeolsoc.org.uk/wp-content/uploads/2018/10/Barrows-Zones-in-Glen-Esk.pdf"'

[ -f "$F" ] || { echo "Run me from the repo root (can't see $F)"; exit 2; }

# Already fixed?
if grep -qF "$NEW" "$F"; then
  echo "Already fixed — Glen Esk URL has the 2018/10 path. Nothing to do."
  exit 0
fi

# Anchor must appear exactly once
n=$(grep -cF "$OLD" "$F")
[ "$n" = "1" ] || { echo "Expected the old URL exactly once, found $n. Aborting."; exit 1; }

cp "$F" "$F.bak-glenesk"
# Use a temp file + python for a literal, no-regex replace
python3 - "$F" "$OLD" "$NEW" <<'PY'
import sys
f,old,new=sys.argv[1],sys.argv[2],sys.argv[3]
s=open(f).read()
assert s.count(old)==1
open(f,"w").write(s.replace(old,new))
PY

node --check "$F" && echo "node --check OK"
grep -qF "$NEW" "$F" && echo "Glen Esk URL fixed. Backup at $F.bak-glenesk"
