# Geòlas — project notes (distilled long-term knowledge)

Decisions made deliberately, so a future session doesn't re-litigate or
"inherit by accident". Code is the source of truth; this records the *why*.

## Decisions

- **Internal port: 8006.** Unique on the Pi (Ceòl :8001/:8003, Òrain :8004).
  Confirm free before binding (don't trust the list — infra doc lesson).
- **Public exposure: `/geolas/` path handler on the 443 Funnel**, added with
  `--set-path` (additive). No own Funnel port — the three-port limit is full.
- **Tailscale strips the prefix** → backend is prefix-naïve (no `root_path`),
  frontend is prefix-aware (relative URLs, `<base href>` set at runtime).
- **DB commit behaviour: AUTO-COMMIT** via the `_db()` context manager (Òrain's
  pattern), chosen on purpose rather than inheriting Ceòl's non-committing auth
  pattern. `PRAGMA foreign_keys = ON` so deleting a site cascades to its
  samples/formations/photos.
- **BGS geology: snapshot on save, re-fetchable.** Stored in columns on the
  `sites` row plus a `geology_fetched_at` timestamp. A failed lookup does NOT
  block the save — the site is stored with null geology and a `geology_error`
  is surfaced; user can re-fetch later.
- **Photos: HEIC→JPEG on upload** via pillow-heif. If the library is missing,
  the file is stored as-is (graceful degrade); `/api/health` reports
  `heic_supported`. Stored files get a uuid name; the original name is kept in
  the DB. Files live under `GEOLAS_DATA_DIR/uploads`.
- **Place search proxied through the backend** (`/api/geocode`) rather than
  called from the browser, which keeps the frontend free of any cross-origin
  concern and keeps all outbound calls server-side.
- **Leaflet vendored locally** in `static/vendor/` (js + css + images), not from
  a CDN — self-contained on the Pi, and its URLs stay relative/prefix-safe.
  Map tiles come from OSM at runtime (unavoidable for any web map without a
  paid tile provider).

## Data model

`sites` (name, lat, lon, notes, bedrock_*, superficial_*, geology_fetched_at,
timestamps) → has many `samples` (label, rock_type, notes), `formations`
(name, description), `photos` (filename, original, caption). Children cascade
on site delete; photo files are removed from disk too.

## Known gaps / cautions

- **Live BGS path untested end-to-end** from this build's container (egress
  allowlist blocked ogc.bgs.ac.uk). Logic is the GroundTruth prototype's, and
  is unit-tested with a mock. Verify against the real service on first deploy;
  the `describe()` candidate-key lists may need widening if field names differ.
- **Single-user, no auth.** If auth is ever added, use **bcrypt directly**, not
  passlib (passlib 1.7.4 breaks against bcrypt 5.x on the Pi's Python 3.13 —
  infra doc lesson).
- **Container here is Python 3.12; the Pi is 3.13.5.** Code avoids version-
  specific syntax. `sqlite3.unlink(missing_ok=True)` etc. are fine on both.

## The drift habit applies here

`drift-report.sh` is customised for this layout (backend/*.py, static/* incl.
manifest, the scaffolding files, and the three status docs). `static/vendor/`
and `data/` are deliberately NOT tracked. Run the report at the start of any
code session before editing.
