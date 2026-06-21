#!/usr/bin/env python3
"""
seed_geolas.py (v2) — idempotent Geòlas geosite seeder.

Change from v1: resources and photos are now attached PER SITE rather than to
the global library.
  * links  -> POST /api/sites/{id}/links      {title, url, note}
              (the website/society/video category is folded into the title as a
               [Website]/[Society]/[Video] prefix, since site_resources has no
               category column)
  * photos -> POST /api/sites/{id}/photo-url  {url, caption}
              photo URLs are RESTRICTED to upload.wikimedia.org — any other host
              is rejected before sending, so a fragile/hotlink-protected source
              cannot slip in. NB: the server does not fetch or validate the
              image, and this script cannot either — you field-check that each
              photo actually loads in the app.

Idempotent: health-checks /api/health, skips any site whose name already exists
(case-insensitive). For a site it creates, it also POSTs formations, links and
photos. Standard library only.

Usage:
    python3 seed_geolas.py geolas-seed-coastal.json
    python3 seed_geolas.py geolas-seed-coastal.json --dry-run

Backfill mode (--backfill): instead of creating new sites, attach links and
photos to sites that ALREADY exist (matched by name). Used to bring the early
batches — whose resources went to the global library under the v1 seeder — up
to the per-site pattern. Idempotent: skips any link/photo URL already present,
so it is safe to re-run. Formations are NOT touched in backfill mode.
    python3 seed_geolas.py geolas-backfill-adventurous.json --backfill --dry-run
    python3 seed_geolas.py geolas-backfill-adventurous.json --backfill
"""

import json
import sys
import time
import urllib.request
import urllib.error

BASE = "https://ceol-pi.tail01672f.ts.net/geolas"
CATEGORY_PREFIX = {"websites": "[Website]", "societies": "[Society]", "videos": "[Video]"}
# Photo URLs must be from Wikimedia: either a direct upload host, or a
# Special:FilePath redirect (which resolves to the real hashed upload URL).
ALLOWED_PHOTO_HOSTS = ("upload.wikimedia.org", "commons.wikimedia.org")


def _req(method, path, payload=None, timeout=30):
    url = BASE + path
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        body = r.read().decode()
        return r.status, (json.loads(body) if body else {})


def health_check():
    try:
        status, body = _req("GET", "/api/health")
    except Exception as e:
        sys.exit(f"ABORT: cannot reach {BASE}/api/health — {e}")
    if status != 200 or not body.get("ok"):
        sys.exit(f"ABORT: health check failed (status {status}): {body}")
    print(f"Health OK: {body.get('app')} | data_dir={body.get('data_dir')}")


def existing_names():
    status, sites = _req("GET", "/api/sites")
    if status != 200:
        sys.exit(f"ABORT: GET /api/sites returned {status}")
    return {s["name"].strip().lower(): s["id"] for s in sites}, len(sites)


def link_title(resource):
    """Fold website/society/video category into a [Prefix] on the title."""
    prefix = CATEGORY_PREFIX.get(resource.get("category", ""), "")
    title = resource["title"].strip()
    return f"{prefix} {title}".strip()


def validate(site):
    """Fail fast on bad data before any network writes."""
    for r in site.get("resources", []):
        if r.get("category") not in CATEGORY_PREFIX:
            sys.exit(f"ABORT: bad resource category {r.get('category')!r} in {site['name']}")
    for p in site.get("photos", []):
        u = (p.get("url") or "").strip()
        if not u.startswith("https://"):
            sys.exit(f"ABORT: photo URL must be https in {site['name']}: {u}")
        host = u.split("/", 3)[2] if u.count("/") >= 2 else ""
        if host not in ALLOWED_PHOTO_HOSTS:
            sys.exit(f"ABORT: photo host must be one of {ALLOWED_PHOTO_HOSTS} "
                     f"in {site['name']}: {host}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    dry = "--dry-run" in sys.argv
    backfill = "--backfill" in sys.argv
    if not args:
        sys.exit("Usage: python3 seed_geolas.py <seed.json> [--dry-run] [--backfill]")

    seed = json.load(open(args[0]))
    sites = seed["sites"]
    print(f"Loaded {len(sites)} site(s) from {args[0]}"
          + (" [DRY RUN]" if dry else ""))

    # Validate everything up front, before touching the network.
    for s in sites:
        validate(s)
    print("Pre-flight validation OK (categories + photo hosts).")

    health_check()
    names, count_before = existing_names()
    print(f"Live site count before: {count_before}\n")

    def attach_children(sid, s, with_formations):
        """Attach formations (optional), links and photos to site `sid`.
        Idempotent: skips any link/photo whose URL is already present, so the
        backfill is safe to re-run."""
        existing = {}
        if not with_formations:
            # Backfill: read what's already attached so we don't duplicate.
            st, full = _req("GET", f"/api/sites/{sid}")
            if st == 200:
                existing = {
                    "links": {l.get("url") for l in full.get("links", [])},
                    "photos": {p.get("url") for p in full.get("photos", [])},
                }
        if with_formations:
            for f in s.get("formations", []):
                fst, _ = _req("POST", f"/api/sites/{sid}/formations",
                              {"name": f["name"], "description": f.get("description", "")})
                print(f"    formation ({fst}): {f['name']}")
        for r in s.get("resources", []):
            if r["url"] in existing.get("links", set()):
                print(f"    link      (skip, exists): {link_title(r)}")
                continue
            lst, _ = _req("POST", f"/api/sites/{sid}/links",
                          {"title": link_title(r), "url": r["url"], "note": r.get("note", "")})
            print(f"    link      ({lst}): {link_title(r)}")
        for p in s.get("photos", []):
            if p["url"] in existing.get("photos", set()):
                print(f"    photo     (skip, exists): {p.get('caption', '')[:50]}")
                continue
            pst, _ = _req("POST", f"/api/sites/{sid}/photo-url",
                          {"url": p["url"], "caption": p.get("caption", "")})
            print(f"    photo     ({pst}): {p.get('caption', '')[:50]}")

    created = skipped = backfilled = 0
    for s in sites:
        key = s["name"].strip().lower()
        exists = key in names

        # ---- BACKFILL MODE: attach links/photos to a site that already exists ----
        if backfill:
            if not exists:
                print(f"SKIP  (not found, can't backfill): {s['name']}")
                skipped += 1
                continue
            sid = names[key]
            if dry:
                print(f"WOULD BACKFILL id {sid}: {s['name']}  "
                      f"+{len(s.get('resources', []))}l +{len(s.get('photos', []))}p")
                backfilled += 1
                continue
            print(f"BACKFILL id {sid}: {s['name']}")
            attach_children(sid, s, with_formations=False)
            backfilled += 1
            time.sleep(0.3)
            continue

        # ---- NORMAL MODE: create new sites, skip existing ----
        if exists:
            print(f"SKIP  (exists, id {names[key]}): {s['name']}")
            skipped += 1
            continue
        if dry:
            print(f"WOULD CREATE: {s['name']} ({s['lat']},{s['lon']}) "
                  f"fetch_geology={s.get('fetch_geology', True)}  "
                  f"+{len(s.get('formations', []))}f "
                  f"+{len(s.get('resources', []))}l "
                  f"+{len(s.get('photos', []))}p")
            created += 1
            continue
        status, site = _req("POST", "/api/sites", {
            "name": s["name"], "lat": s["lat"], "lon": s["lon"],
            "notes": s.get("notes", ""),
            "fetch_geology": s.get("fetch_geology", True),
        })
        if status not in (200, 201):
            print(f"  ERROR creating {s['name']}: {status} {site}")
            continue
        sid = site["id"]
        bedrock = (site.get("geology") or {}).get("bedrock", {}).get("name")
        print(f"CREATE id {sid}: {s['name']}"
              + (f"  [BGS: {bedrock}]" if bedrock else "  [no BGS data]"))
        attach_children(sid, s, with_formations=True)
        created += 1
        time.sleep(0.3)

    print(f"\nDone. created={created} backfilled={backfilled} skipped={skipped}")
    if not dry:
        _, count_after = existing_names()
        print(f"Live site count after: {count_after}")


if __name__ == "__main__":
    main()
