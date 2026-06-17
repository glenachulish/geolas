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
- [ ] Confirm internal port 8006 is free on the Pi (DEPLOY.md step 0)
- [ ] Verify BGS lookups work from the Pi/browser — the container couldn't reach
      ogc.bgs.ac.uk (egress allowlist), so the live BGS path is UNTESTED end-to-end.
      The parsing logic is from the working GroundTruth prototype + mocked in tests.
- [ ] After adding the `/geolas` Funnel path, curl Ceòl and Òrain to confirm they're untouched

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
