# Geòlas stage 1 — curated resource library (by region & by process)

Built on a fresh clone of `main` (HEAD at build: `9fbcfb8`). Drift report against
project knowledge was clean — the four touched files matched the live repo
byte-for-byte before editing. **Additive only**; no backend change, no database
migration. The glossary/region prose, the per-site explainer, and the other
library tabs (area / process / time / people) are untouched.

## What changed (4 files)

1. **`static/knowledge-base.js`** — added the 89-entry `KB_RESOURCE_LIBRARY`
   array and a `KB_PROCESSES` list (the six process keys + labels), exposed on
   `window.KB` as `resourceLibrary` and `processes`. Region ids and process keys
   reconcile 1:1 against the live `KB_REGIONS` and `KB_GLOSSARY` cluster
   headings. Existing exports are unchanged.

2. **`static/app.js`** — the **"Media & links"** tab is now a browse with two
   axes, **By region** and **By process**. Each of the six regions / six
   processes is a collapsible card listing every curated guide tagged to it,
   with the guide's `area` shown as a sub-label. Two extra cards: **Your links**
   (your own additions — add/delete unchanged, still works offline with the
   "yours" / "not synced" badges) and **General resources** (the short bundled
   website/society/video lists, so nothing from the old tab is lost). Bundled
   curated items render plain; your items keep the ochre "yours" badge and the
   delete ×, exactly as before.

3. **`static/styles.css`** — styles for the new browse controls and rows, using
   the existing tokens (rust / ochre / ink, the strata identity). No restyle of
   existing components.

4. **`static/sw.js`** — `CACHE_VERSION` bumped `geolas-v3` → `geolas-v4`. No new
   static file is needed: the array lives inside `knowledge-base.js`, which is
   already in the service-worker shell list.

## URL verification — what I did and what's left for you

The build sandbox can't reach the resource domains, so I verified through web
search/fetch and a Pi-side script (below) rather than from the build host.

- **Glasgow (`ggs-*`) — fixed.** All 14 entries pointed at the itineraries
  *index* page as placeholders. I captured each real per-item PDF URL from the
  society's live index and replaced them. None had to be dropped — every one
  resolved to a direct PDF. (Where both a standalone leaflet and a "Glasgow &
  Girvan guide" extract existed, I used the cleaner standalone leaflet.)
- **SGT "Landscape Fashioned by Geology" backbone — confirmed live.** Spot
  checks (Skye, Southwest Scotland, Argyll, Edinburgh & West Lothian) returned
  the exact booklets from the exact URLs in the array.
- **Edinburgh (`lbgc-*`) — confirmed against the society's own download page.**
  The filenames in the array match the live "Geoconservation Leaflets" page's
  download links for every entry visible there.
- **Aberdeen (`ags-*`)** use a stable dated-upload path; not individually
  fetched here.

**Run the full check on the Pi before/after deploy** (it can reach the hosts):

```
cd ~/Geolas && ./verify-resource-urls.sh
```

It extracts every id+url from `knowledge-base.js`, follows redirects, and prints
a per-item status; it exits non-zero if any URL isn't a 2xx, so it can gate the
deploy. Fix or drop anything it flags, then re-run.

## Out of scope for stage 1 (later stages — deliberately NOT built here)

Tagging your *own* resources (nullable `region`/`process` columns), the
`site_resources` table, per-site resource linking, auto-suggest, and tying the
library to map clicks. No DB migration is required for this stage, and none was
added.

## Deploy (standard Mac → GitHub → Pi flow)

This is a frontend + service-worker change only.

1. Unpack the zip over `/Users/callummaclellan/Geolas` (single command in the
   chat message).
2. From the Mac project root:

   ```
   cd /Users/callummaclellan/Geolas && git add -A && git commit -m 'Stage 1: curated resource library, by-region & by-process browse' && git push origin main
   ```

3. On the Pi — pull, (optionally) run the URL check, restart, and curl the
   neighbours per the infra doc:

   ```
   ssh -t pi@ceol-pi.local 'cd ~/Geolas && git pull && ./verify-resource-urls.sh; sudo systemctl restart geolas && systemctl is-active geolas'
   ```

   ```
   ssh pi@ceol-pi.local 'echo "--- ceol ---"; curl -s -o /dev/null -w "%{http_code}\n" https://ceol-pi.tail01672f.ts.net/; echo "--- orain ---"; curl -s -o /dev/null -w "%{http_code}\n" https://ceol-pi.tail01672f.ts.net/orain/; echo "--- geolas ---"; curl -s -o /dev/null -w "%{http_code}\n" https://ceol-pi.tail01672f.ts.net/geolas/'
   ```

   (Ceòl `/` may be a pre-existing 502 — that's the known issue noted in the
   TODO, not caused by this change. Òrain and Geòlas should be healthy.)

## IMPORTANT: hard-refresh past the cached service worker

Because the SW shell is cache-first, the old `v3` shell will keep serving until
`v4` activates. After deploying, on the phone/desktop PWA:

- Open `https://ceol-pi.tail01672f.ts.net/geolas/`, then pull-to-refresh / hard
  reload **twice** (first load installs v4 in the background; second load serves
  it), **or**
- In a desktop browser: DevTools → Application → Service Workers →
  "Update on reload" / "Unregister", then reload.

You'll know v4 is live when "Media & links" shows the **By region / By process**
toggle instead of the three flat lists.

## Field check for you (stage 1)

- Library → Media & links → **By region**: open an area (e.g. Midland Valley is
  the densest), confirm guides list with their locality sub-labels and open.
- Switch to **By process**: confirm the same guides regroup (e.g. Igneous).
- **Your links**: add a link, confirm it appears under "Your links" with the
  "yours" badge and a working delete ×; add one in airplane mode and confirm the
  "not synced" badge, then Sync now.
