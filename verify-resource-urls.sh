#!/usr/bin/env bash
# verify-resource-urls.sh — check every URL in KB_RESOURCE_LIBRARY resolves.
# Run on the Pi (or any host that can reach the resource domains; the build
# sandbox cannot). Reads static/knowledge-base.js, extracts each id+url, and
# does a redirect-following request, reporting the final status per item.
#
# Usage:   ./verify-resource-urls.sh            # from the repo root
#          ./verify-resource-urls.sh path/to/knowledge-base.js
#
# Exit code is non-zero if any URL does not end in a 2xx, so it can gate a deploy.

set -u
KB="${1:-static/knowledge-base.js}"
[ -f "$KB" ] || { echo "knowledge-base.js not found at: $KB" >&2; exit 2; }

# Extract id<TAB>url for every entry. node is available on the Pi (used by the
# patch tooling); fall back to grep if not.
if command -v node >/dev/null 2>&1; then
  PAIRS=$(node -e '
    const fs=require("fs");
    const s=fs.readFileSync(process.argv[1],"utf8");
    const a=s.indexOf("const KB_RESOURCE_LIBRARY = [");
    const close=s.indexOf("\n];", a);
    const body=s.slice(s.indexOf("[",a)+1, close);
    let A; eval("A=["+body+"]");
    console.log(A.map(e=>e.id+"\t"+e.url).join("\n"));
  ' "$KB")
else
  PAIRS=$(grep -oE 'id:"[^"]+", title:[^,]*, type:"[^"]*", url:"[^"]+"' "$KB" \
          | sed -E 's/id:"([^"]+)".*url:"([^"]+)"/\1\t\2/')
fi

[ -z "$PAIRS" ] && { echo "Could not extract any URLs from $KB" >&2; exit 2; }

total=0; ok=0; bad=0
printf "%-24s %-6s %s\n" "ID" "STATUS" "URL"
printf "%-24s %-6s %s\n" "------------------------" "------" "---"
FAILED=""
while IFS=$'\t' read -r id url; do
  [ -z "$id" ] && continue
  total=$((total+1))
  code=$(curl -sS -L -m 30 -o /dev/null -w "%{http_code}" \
         -A "Mozilla/5.0 (geolas-link-check)" "$url" 2>/dev/null)
  if [ "${code:0:1}" = "2" ]; then
    ok=$((ok+1)); mark="OK"
  else
    bad=$((bad+1)); mark="$code"; FAILED="$FAILED\n  $id  ($code)  $url"
  fi
  printf "%-24s %-6s %s\n" "$id" "$mark" "$url"
done <<< "$PAIRS"

echo ""
echo "Checked $total URLs:  $ok OK,  $bad need attention."
if [ "$bad" -gt 0 ]; then
  echo -e "Needs attention (status != 2xx):$FAILED"
  echo ""
  echo "A non-2xx may be a moved file (fix the URL) or a server that blocks HEAD/"
  echo "bots (open it in a browser to confirm). Fix or drop, then re-run."
  exit 1
fi
echo "All resource URLs resolved."
