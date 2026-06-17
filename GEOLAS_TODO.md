# Geòlas — TODO

## Done (first build, this session)
- [x] FastAPI backend: sites / samples / formations / photos CRUD
- [x] BGS bedrock + superficial geology snapshot on save, with manual re-fetch
- [x] Save-anyway if the BGS lookup fails (field data is never lost to a network blip)
- [x] Photo upload with HEIC→JPEG conversion (degrades gracefully if pillow-heif absent)
- [x] Nominatim place search, proxied through the backend
- [x] Map (vendored Leaflet + OSM tiles): pins for sites, tap-to-add a new site
- [x] Prefix-aware frontend (works at `/` and `/geolas/`); prefix-naïve backend
- [x] systemd unit, requirements, DEPLOY.md, drift scripts
- [x] In-process test suite (29 checks) — all passing

## Before/at first deploy
- [x] Create a NEW GitHub repo: `https://github.com/glenachulish/geolas.git` (branch `main`); URL filled into DEPLOY.md + GEOLAS_CLAUDE.md
- [x] Confirm internal port 8006 is free on the Pi — confirmed, deployed live at /geolas/
- [x] Verify BGS lookups work from the Pi — DONE 2026-06-17: JSON unsupported, switched to
      GML (WMS 1.1.1 + EPSG:4326 + x/y). Arthur's Seat resolves correctly.
- [x] After adding the `/geolas` Funnel path, curl Ceòl and Òrain — Òrain stayed 200; Ceòl `/` is a pre-existing 502 (not ours)

## Done (session 2, 2026-06-17)
- [x] Fix BGS: JSON → GML, correct field mapping (LEX_D/RCS_D/MAX_TIME_D), correct 1.1.1 query
- [x] "Locate me" map control — flies to GPS position, drops a "you are here" marker
- [x] Reference-sites layer — 10 classic Scottish localities, toggle on/off, "Log this site" adopts one

## Done (session 3, 2026-06-17 — PWA / offline)
- [x] Service worker: offline app-shell launch, OSM tile caching (capped ~600), network-first API with cache fallback
- [x] IndexedDB offline queue: log sites with no signal, shown immediately with "Not synced" badge
- [x] "Sync now" button (manual, appears when online with pending items); shows count + MB
- [x] Backend de-dupe: sites carry a client_uuid; retried syncs return the existing row (idempotent)
- [x] DB migration: adds client_uuid to pre-existing databases without crashing on restart
- [x] PWA icons (PNG 180/192/512 + SVG), iOS apple-touch-icon + web-app meta tags
- [ ] FIELD TEST (only Callum can do this): airplane mode → log a site + note → back online → Sync now → confirm one copy lands and geology fills in. THIS IS THE REAL TEST.

## Known offline limits (v1)
- Geology for an offline-logged site is fetched by the SERVER at sync time (the
  phone can't reach BGS offline), so the rock identification fills in on sync, not at save.
- Photos can't be added to a site until it's synced (photos attach to a real
  server site id). Offline v1 captures site + notes; add photos after sync.
- Tile pre-caching of a whole region is NOT done — only tiles you've actually
  viewed are cached. "Download this area" is a future feature.

## Soon
- [ ] Confirm the real BGS field names match what `describe()` expects; widen the
      candidate key lists if the live response differs from the prototype's
- [ ] Export a site (or all sites) to JSON/GeoJSON for backup
- [ ] Search/filter the site list as it grows
- [ ] EXIF lat/lon from a field photo → suggest it as a site location

## Maybe
- [ ] Curated reading/watching matched to rock type (port from GroundTruth's TOPIC_LINKS)
- [ ] Offline tile caching for use in the field with no signal
- [ ] Multi-user + auth (would bring in the passlib/bcrypt trap — use bcrypt directly, per infra doc)

## Done (session 4, 2026-06-17 — knowledge base + area download)
- [x] Confirmed BGS lookups: work for GB (England/Wales/Scotland); NOT Ireland (NI or ROI)
      return no feature from this layer. Ireland = future round, needs other data source.
- [x] 51 SGT geosites on the map (coords + region + SGT link), replacing the old 10
- [x] Library view: by area (6 regions), by process (61-term glossary in 6 clusters),
      by time (timescale), people (10 geologists), media & links
- [x] Per-site explainer: decodes BGS lithology to plain glossary terms + nearest region,
      links into the library. Matcher tested (Arthur's Seat -> mafic family).
- [x] Area-download caching: "Download this area" caches current view to street zoom;
      tile cache made version-independent so deploys don't wipe downloaded areas
- [x] SW bumped to v2; KB + queue + new icons added to shell cache

## Known limits / next round
- [ ] Rest-of-UK + Ireland knowledge base (England/Wales/NI/ROI) — separate scour & build.
      Ireland also needs a non-BGS geology data source (GSI / GSNI).
- [ ] Geosite coords are approximate centroids; a few (Glen Coe, Cairngorms) span large
      areas so an adopted point may read a neighbouring unit — nudge the pin if so.
- [ ] FIELD TEST (only Callum): tap "Download this area", go offline, confirm the map
      still renders at the zoomed-in level for that area.
