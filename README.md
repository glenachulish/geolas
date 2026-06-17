# Geòlas — geology field notebook

A personal geology notebook: record field **sites** (a point on the map), and
against each one keep **samples**, **formations**, **notes**, and **photos**.
When you save a site, Geòlas reads the **bedrock and superficial geology** for
that point from the British Geological Survey and stores a snapshot you can
re-fetch on demand.

Mobile-friendly, runs on the Raspberry Pi over Tailscale alongside Ceòl and
Òrain.

## Stack

- **Backend:** FastAPI + uvicorn, SQLite (single file), `httpx` for the BGS +
  geocoding calls, Pillow + pillow-heif for photo handling.
- **Frontend:** vanilla JS / HTML / CSS, no build step. Leaflet (vendored
  locally in `static/vendor/`) for the map, OpenStreetMap tiles.
- **Geology:** BGS Bedrock & Superficial Geology OneGeology WMS (1:625k, Open
  Government Licence), queried server-side via `GetFeatureInfo`.
- **Place search:** OpenStreetMap Nominatim, proxied through the backend.

## Layout

```
backend/main.py          the entire API + static mount
static/index.html        app shell
static/styles.css        the field-notebook design
static/app.js            all front-end logic (prefix-aware)
static/vendor/           vendored Leaflet (js/css/images) — not edited, not tracked
static/icons/icon.svg    app/PWA icon (strata motif)
requirements.txt
geolas.service           systemd unit for the Pi
drift-report.sh          project-knowledge sync check (see DRIFT-REPORT-HABIT.md)
drift-compare.sh
DEPLOY.md                Pi deployment steps
```

## Running locally

```
pip install -r requirements.txt
GEOLAS_DATA_DIR=./data uvicorn backend.main:app --reload --port 8006
```

Open http://127.0.0.1:8006/ — works at `/` locally and at `/geolas/` on the Pi
because every front-end URL is relative (see "Prefix-awareness" below).

## Prefix-awareness (important)

On the Pi, Geòlas is served under `/geolas/` on the shared Tailscale Funnel.
Tailscale **strips** that prefix before the request reaches the backend, so:

- **Backend is prefix-naïve** — routes are plain (`/api/...`), no `root_path`.
- **Frontend is prefix-aware** — `app.js` derives a `<base href>` from the
  current URL and builds every API/asset URL relative to it. No leading-slash
  absolute URLs anywhere.

This is the contract in `PI-INFRASTRUCTURE.md`; building to it from day one
means Geòlas never needs migrating.

## Data & privacy

Everything lives under `GEOLAS_DATA_DIR` (`./data` locally,
`/home/pi/Geolas/data` on the Pi): `geolas.db` and `uploads/`. **Never** upload
that directory to the Claude project or commit it — it holds your field data
and photos.

## Attribution

Contains British Geological Survey materials © UKRI, via the BGS OneGeology
1:625,000 WMS (Open Government Licence). Place search and map tiles ©
OpenStreetMap contributors.
