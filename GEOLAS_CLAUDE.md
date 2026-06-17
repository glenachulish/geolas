# Geòlas – Geology Notebook (CLAUDE.md)

_Created 16 Jun 2026. This file lives in the repo root AND in project
knowledge. If they disagree, the repo copy wins. If this file disagrees
with the code, the code wins — see "Source truth" below._

## What this is
A personal geology app: recording sites, samples, formations, notes, and
images (field photos, maps). Mobile-friendly PWA served by the same
Raspberry Pi over Tailscale, sibling to Ceòl and Òrain. Callum is not a
coder: Claude writes all code; Callum runs Terminal commands and deploys.

## Source truth — read this first
- **Never trust snapshots or session notes over live code.** A fresh
  session can clone the real branch inside its container:
  `git clone --depth 1 --branch main https://github.com/glenachulish/geolas.git`
- Project knowledge holds session notes, the TODO, and this file — NOT
  live source. Inspect code in the clone; test patches before delivery.
- Invisible to a clone (gitignored): `.env` (secrets — never upload),
  `data/` (database + uploaded photos/maps), `.backups/`.

## Architecture (as built, first session 17 Jun 2026)
- **Backend**: FastAPI, `backend/main.py` (single file). Serves API +
  frontend (StaticFiles mount) + uploaded photos via `/api/photos/{id}/file`.
  Upload save pattern: uuid filename on disk under `GEOLAS_DATA_DIR/uploads`,
  original name kept in the DB. HEIC→JPEG converted on upload (pillow-heif);
  degrades to store-as-is if the lib is missing.
- **Database**: SQLite, single-user. Tables: sites, samples, formations,
  photos (notes are a column on sites, not a table). Commit behaviour:
  **AUTO-COMMIT** via the `_db()` context manager (Òrain's pattern, chosen
  deliberately — NOT Ceòl's no-auto-commit). `PRAGMA foreign_keys = ON`;
  children cascade on site delete and photo files are unlinked from disk.
- **Frontend**: vanilla JS/HTML/CSS, no build step. Map view IS included:
  **Leaflet, vendored locally** in `static/vendor/` (a deliberate dependency
  decision, flagged and agreed — not smuggled), OSM tiles at runtime.

## Key paths & endpoints (settled, first session)
- Mac dev root: `/Users/callummaclellan/Geolas`
- GitHub repo + branch: `https://github.com/glenachulish/geolas.git`, `main`
- Pi service name: `geolas` (unique — NOT `ceol`)
- Internal port: **8006** (Ceòl :8001/:8003, Òrain :8004). CONFIRM free on the
  Pi before first bind — `sudo ss -ltnp | grep :8006` (infra-doc lesson: trust
  running processes, not the list).
- Funnel exposure: path handler **`/geolas`** on the shared **443** Funnel,
  added with `sudo tailscale funnel --bg --https=443 --set-path=/geolas
  http://127.0.0.1:8006` (`--set-path` is additive — leaves Ceòl `/` and Òrain
  `/orain` intact). Tailscale STRIPS the prefix → backend prefix-naïve (no
  root_path), frontend prefix-aware (relative URLs). Full steps in `DEPLOY.md`.
- Data dir env var: **`GEOLAS_DATA_DIR`** (set in `geolas.service`) so its DB +
  photo uploads never collide with the other apps.

## Patch & deploy conventions (same discipline as Ceòl)
- Python direct-replace patch scripts (never `git am`): backup first,
  verify each anchor appears exactly once, `node --check` for JS,
  idempotent via a marker string, delivered to `~/Downloads/`.
- Instructions for Callum: plain language, WHY before HOW, single
  self-contained copy-paste blocks (zsh chokes on multi-line pastes).
- Standard deploy (always Mac AND Pi) — fill in real paths/branch/service:
  1. run patch script locally
  2. `cd /Users/callummaclellan/Geolas && git add -A && git commit -m '...' && git push origin main`
  3. `ssh -t pi@ceol-pi.local 'cd ~/Geolas && git pull origin main && sudo systemctl restart geolas'`
     (`-t` is required so sudo can prompt; never pipe the password)

## Environment quirks (shared with the Pi)
- Pi OS Bookworm: pip needs `--break-system-packages`; no `sqlite3` CLI —
  use `python3 -c` with the sqlite3 module.
- Photo uploads: HEIC from iPhone may need conversion; decide and record.
- Pi log: `ssh pi@ceol-pi.local 'sudo journalctl -u geolas -n 50 --no-pager'`

## Where status lives
- `GEOLAS_TODO.md` — current outstanding work.
- `GEOLAS_PROJECT_NOTES.md` — distilled long-term knowledge.
- `SESSION_*.md` — per-session history; historical record, not current truth.
- `PI-INFRASTRUCTURE.md` — shared Pi/Tailscale/Funnel reference.
