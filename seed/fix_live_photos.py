#!/usr/bin/env python3
"""
fix_live_photos.py — replace existing site photos with the corrected URLs
from a seed JSON.

For each site named in the seed file, this:
  1. looks up the live site by name,
  2. deletes every existing photo on that site,
  3. re-adds the photo(s) listed in the seed JSON.

Use it to repair sites that were seeded with bad photo URLs. It is safe to
re-run: it always ends with exactly the photos in the seed file.

  python3 fix_live_photos.py geolas-seed-coastal.json --dry-run
  python3 fix_live_photos.py geolas-seed-coastal.json

Standard library only. Only touches photos — notes, formations and links are
left untouched.
"""

import json
import sys
import time
import urllib.request
import urllib.error

BASE = "https://ceol-pi.tail01672f.ts.net/geolas"
UA = {"User-Agent": "geolas-fix-photos/1.0"}


def _req(method, path, payload=None):
    url = BASE + path
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=dict(UA))
    if data is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode()
        return r.status, (json.loads(body) if body else {})


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    if not args:
        sys.exit("Usage: python3 fix_live_photos.py <seed.json> [--dry-run]")

    seed = json.load(open(args[0]))
    want = {s["name"].strip().lower(): s.get("photos", []) for s in seed["sites"]}

    status, sites = _req("GET", "/api/sites")
    if status != 200:
        sys.exit(f"ABORT: GET /api/sites returned {status}")
    by_name = {s["name"].strip().lower(): s["id"] for s in sites}

    fixed = missing = 0
    for key, photos in want.items():
        if key not in by_name:
            print(f"SKIP (no live site): {key}")
            missing += 1
            continue
        sid = by_name[key]
        # current photos on this site
        _, full = _req("GET", f"/api/sites/{sid}")
        existing = full.get("photos", [])

        if dry:
            print(f"WOULD FIX id {sid}: delete {len(existing)} photo(s), "
                  f"add {len(photos)} — {full['name']}")
            fixed += 1
            continue

        print(f"FIX id {sid}: {full['name']}")
        for p in existing:
            dst, _ = _req("DELETE", f"/api/photos/{p['id']}")
            print(f"    deleted photo {p['id']} ({dst})")
        for p in photos:
            ast, _ = _req("POST", f"/api/sites/{sid}/photo-url",
                          {"url": p["url"], "caption": p.get("caption", "")})
            print(f"    added ({ast}): {p.get('caption','')[:50]}")
        fixed += 1
        time.sleep(0.3)

    print(f"\nDone. fixed={fixed} missing={missing}")


if __name__ == "__main__":
    main()
