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
