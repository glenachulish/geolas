#!/usr/bin/env python3
"""
check_photos.py — verify that photo URLs actually resolve.

Two modes:

  1. Check a seed/backfill JSON before seeding:
       python3 check_photos.py geolas-seed-coastal.json

  2. Check what's already live on the Pi (every site's photos):
       python3 check_photos.py --live

For each photo it follows redirects (so Special:FilePath links resolve to the
real upload.wikimedia.org file) and reports OK / DEAD with the HTTP status.
Standard library only. Nothing is written or changed — read-only.
"""

import json
import sys
import time
import urllib.request
import urllib.error

BASE = "https://ceol-pi.tail01672f.ts.net/geolas"
UA = {"User-Agent": "geolas-photo-check/1.0 (personal field notebook)"}
DELAY = 1.5  # seconds between requests — Wikimedia returns HTTP 429 if hit too fast


def check_url(url):
    """Return (ok, status_or_error). Follows redirects; treats 200 as OK."""
    req = urllib.request.Request(url, method="GET", headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            ctype = r.headers.get("Content-Type", "")
            ok = (r.status == 200) and ctype.startswith("image/")
            return ok, f"{r.status} {ctype.split(';')[0] or '?'}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}"
    except Exception as e:
        return False, f"ERR {type(e).__name__}"


def iter_from_json(path):
    d = json.load(open(path))
    for s in d.get("sites", []):
        for p in s.get("photos", []):
            yield s["name"], p.get("caption", ""), p["url"]


def iter_from_live():
    req = urllib.request.Request(f"{BASE}/api/sites", headers=UA)
    sites = json.load(urllib.request.urlopen(req, timeout=30))
    for s in sites:
        # the list endpoint may omit photos; fetch each site detail
        dreq = urllib.request.Request(f"{BASE}/api/sites/{s['id']}", headers=UA)
        full = json.load(urllib.request.urlopen(dreq, timeout=30))
        for p in full.get("photos", []):
            if p.get("url"):
                yield f"[id {s['id']}] {s['name']}", p.get("caption", ""), p["url"]


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 check_photos.py <seed.json>  |  --live")

    source = iter_from_live() if sys.argv[1] == "--live" else iter_from_json(sys.argv[1])

    total = dead = 0
    dead_list = []
    first = True
    for name, caption, url in source:
        if not first:
            time.sleep(DELAY)
        first = False
        total += 1
        ok, status = check_url(url)
        if not ok and status == "HTTP 429":
            # backed off too little — wait longer and retry once
            time.sleep(5)
            ok, status = check_url(url)
        flag = "OK  " if ok else "DEAD"
        if not ok:
            dead += 1
            dead_list.append((name, url, status))
        print(f"{flag} [{status:>14}] {name}")

    print(f"\n{total} photo(s) checked, {dead} dead.")
    if dead_list:
        print("\nDEAD URLs (paste these back):")
        for name, url, status in dead_list:
            print(f"  - {name}\n      {url}  ({status})")


if __name__ == "__main__":
    main()
