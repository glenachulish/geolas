"""
Geòlas — personal geology notebook backend.

Design decisions recorded here on purpose (see GEOLAS_CLAUDE.md "don't inherit
by accident"):

  * PREFIX-NAIVE backend. Tailscale Funnel STRIPS the /geolas path prefix before
    proxying (proven via Òrain — see PI-INFRASTRUCTURE.md), so from this app's
    own point of view it lives at "/". We therefore do NOT set root_path and do
    NOT pass --root-path. Routes are plain: /api/sites, /api/health, etc.
    The FRONTEND is the layer that must be prefix-aware (relative URLs), not this.

  * SQLite with EXPLICIT auto-commit. _db() returns a connection used via a
    context manager that commits on clean exit and rolls back on error. This is
    Òrain's pattern, chosen deliberately rather than Ceòl's no-auto-commit auth
    pattern.

  * Own data directory via GEOLAS_DATA_DIR so the DB + photo uploads never
    collide with Ceòl/Òrain on the shared Pi. Defaults to ./data for local dev.

  * Single-user to start. No auth, so none of the passlib/bcrypt trap from the
    infra doc applies yet.
"""
from __future__ import annotations

import io
import os
import sqlite3
import time
import uuid
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator, Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# --- HEIC support ---------------------------------------------------------
# pillow-heif registers a HEIF/HEIC opener into Pillow. If it isn't installed
# we degrade gracefully: HEIC uploads are stored as-is rather than crashing.
from PIL import Image  # noqa: E402

try:
    import pillow_heif  # type: ignore

    pillow_heif.register_heif_opener()
    HEIC_SUPPORTED = True
except Exception:  # pragma: no cover - depends on Pi having the wheel
    HEIC_SUPPORTED = False


# --- paths ----------------------------------------------------------------
DATA_DIR = Path(os.environ.get("GEOLAS_DATA_DIR", "data")).resolve()
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "geolas.db"
STATIC_DIR = (Path(__file__).resolve().parent.parent / "static").resolve()

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# --- BGS WMS --------------------------------------------------------------
# Same endpoint + layers proven in the GroundTruth prototype (GeologyExplorer.jsx).
BGS_OWS = (
    "https://ogc.bgs.ac.uk/cgi-bin/"
    "BGS_Bedrock_and_Superficial_Geology/ows"
)
BGS_LAYERS = {
    "bedrock": "GBR_BGS_625k_BLT",       # bedrock lithostratigraphy
    "superficial": "GBR_BGS_625k_SLT",   # superficial lithostratigraphy
}


# --- database -------------------------------------------------------------
def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def _db() -> Iterator[sqlite3.Connection]:
    """Connection that AUTO-COMMITS on clean exit, rolls back on error.

    Deliberate (Òrain's pattern). Don't 'fix' this to manual commit without
    updating GEOLAS_CLAUDE.md — code is the source of truth.
    """
    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS sites (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    lat          REAL    NOT NULL,
    lon          REAL    NOT NULL,
    notes        TEXT    NOT NULL DEFAULT '',
    -- BGS snapshot, taken at save, refreshable on demand:
    bedrock_name        TEXT,
    bedrock_age         TEXT,
    bedrock_lithology   TEXT,
    superficial_name    TEXT,
    superficial_age     TEXT,
    superficial_lithology TEXT,
    geology_fetched_at  INTEGER,   -- unix seconds, NULL if never fetched
    client_uuid  TEXT,             -- set by offline-created sites for de-dupe on sync
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS samples (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id    INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    label      TEXT    NOT NULL,
    rock_type  TEXT    NOT NULL DEFAULT '',
    notes      TEXT    NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS formations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id    INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    description TEXT   NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    filename    TEXT    NOT NULL DEFAULT '',   -- stored name on disk (file photos)
    original    TEXT    NOT NULL DEFAULT '',   -- original filename as uploaded
    caption     TEXT    NOT NULL DEFAULT '',
    -- Stage 4: a photo is EITHER a file (filename set, url empty) OR a hot-linked
    -- remote image (url set, filename empty). url renders directly; not proxied.
    url         TEXT    NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_samples_site    ON samples(site_id);
CREATE INDEX IF NOT EXISTS idx_formations_site ON formations(site_id);
CREATE TABLE IF NOT EXISTS resources (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category    TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    note        TEXT    NOT NULL DEFAULT '',
    client_uuid TEXT,
    created_at  INTEGER NOT NULL
);

-- Stage 2: user-editable "Processes" library. Global (not tied to a site),
-- category-free; each resource may carry several process tags (many-to-many
-- via process_resource_tags). Brand-new tables, so purely additive.
CREATE TABLE IF NOT EXISTS process_resources (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    note        TEXT    NOT NULL DEFAULT '',
    client_uuid TEXT,
    created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS process_resource_tags (
    resource_id INTEGER NOT NULL REFERENCES process_resources(id) ON DELETE CASCADE,
    process_key TEXT    NOT NULL,
    PRIMARY KEY (resource_id, process_key)
);

-- Stage 3: per-site attachments. One table, discriminated by `kind`:
--   'link' -> external URL (url set, filename/original empty)
--   'doc'  -> uploaded file stored under UPLOAD_DIR (filename/original set,
--             url empty). Same on-disk store and lifecycle as photos.
-- Purely additive: new CREATE TABLE IF NOT EXISTS, no ALTER on existing tables.
CREATE TABLE IF NOT EXISTS site_resources (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id     INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    kind        TEXT    NOT NULL,            -- 'link' | 'doc'
    title       TEXT    NOT NULL,
    url         TEXT    NOT NULL DEFAULT '', -- links only
    filename    TEXT    NOT NULL DEFAULT '', -- docs only: stored name on disk
    original    TEXT    NOT NULL DEFAULT '', -- docs only: original upload name
    note        TEXT    NOT NULL DEFAULT '',
    created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_samples_site    ON samples(site_id);
CREATE INDEX IF NOT EXISTS idx_formations_site ON formations(site_id);
CREATE INDEX IF NOT EXISTS idx_photos_site     ON photos(site_id);
CREATE INDEX IF NOT EXISTS idx_resources_cat   ON resources(category);
CREATE INDEX IF NOT EXISTS idx_prtags_key      ON process_resource_tags(process_key);
CREATE INDEX IF NOT EXISTS idx_siteres_site    ON site_resources(site_id);
"""


def init_db() -> None:
    with _db() as conn:
        conn.executescript(SCHEMA)
        # Migration: older databases (deployed before offline support) have a
        # sites table without client_uuid. Add it if missing. CREATE TABLE IF
        # NOT EXISTS won't alter an existing table, so do it explicitly.
        cols = {r["name"] for r in conn.execute("PRAGMA table_info(sites)").fetchall()}
        if "client_uuid" not in cols:
            conn.execute("ALTER TABLE sites ADD COLUMN client_uuid TEXT")
        # Stage 4 migration: older databases have a photos table without `url`.
        # Add it if missing (CREATE TABLE IF NOT EXISTS won't alter an existing
        # table). Existing rows default to url='' i.e. file-backed — unchanged.
        photo_cols = {r["name"] for r in conn.execute("PRAGMA table_info(photos)").fetchall()}
        if "url" not in photo_cols:
            conn.execute("ALTER TABLE photos ADD COLUMN url TEXT NOT NULL DEFAULT ''")
        # Create the unique index AFTER the column is guaranteed to exist (on
        # both fresh and migrated DBs). Doing it inside SCHEMA would run before
        # the ALTER on an old DB and crash startup.
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_client_uuid "
            "ON sites(client_uuid) WHERE client_uuid IS NOT NULL"
        )
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_resources_client_uuid "
            "ON resources(client_uuid) WHERE client_uuid IS NOT NULL"
        )
        # Stage 2: process_resources is a brand-new table (no ALTER needed); its
        # de-dupe index follows the same pattern as sites/resources.
        conn.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_process_resources_client_uuid "
            "ON process_resources(client_uuid) WHERE client_uuid IS NOT NULL"
        )


# --- BGS query ------------------------------------------------------------
# IMPORTANT (discovered against the LIVE service 2026-06-17): the BGS MapServer
# does NOT support info_format=application/json — it returns a
# ServiceExceptionReport ("Unsupported INFO_FORMAT value"). The GroundTruth
# prototype's JSON assumption was wrong against this endpoint. What DOES work:
#   - WMS 1.1.1 with srs=EPSG:4326, bbox in lon,lat order, pixel via x/y
#   - info_format=application/vnd.ogc.gml  (structured XML we can parse)
# Real field names confirmed from the live response (Arthur's Seat):
#   LEX_D = unit name, RCS_D = lithology, MAX_TIME_D/MIN_TIME_D = age range,
#   RANK = intrusion/etc. (NOT rcs_d-as-name, which the old code guessed.)
import xml.etree.ElementTree as ET


def _bbox_around(lat: float, lon: float, d: float = 0.02) -> tuple[float, float, float, float]:
    # Returned in lon,lat order for the WMS 1.1.1 EPSG:4326 request.
    return (lon - d, lat - d, lon + d, lat + d)


def _strip_ns(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def _parse_gml_feature(gml_text: str) -> dict[str, str]:
    """Parse the first feature's fields out of a BGS msGMLOutput document.

    Returns a flat {FIELD: value} dict (field names upper-cased as BGS emits
    them). Empty dict if the document has no feature (point off-map / sea).
    """
    try:
        root = ET.fromstring(gml_text)
    except ET.ParseError:
        return {}
    # Find the *_feature element, then collect its simple child fields.
    for el in root.iter():
        if _strip_ns(el.tag).endswith("_feature"):
            fields: dict[str, str] = {}
            for child in el:
                tag = _strip_ns(child.tag)
                # skip geometry/bounds containers
                if tag in ("boundedBy", "Box", "coordinates", "name"):
                    continue
                text = (child.text or "").strip()
                if text:
                    fields[tag.upper()] = text
            if fields:
                return fields
    return {}


def _describe(fields: dict[str, str]) -> dict[str, Optional[str]]:
    """Map BGS GML fields to our {name, age, lithology}.

    Uses the real field names from the live service, with sensible fallbacks
    so it still works if a layer omits one.
    """
    if not fields:
        return {"name": None, "age": None, "lithology": None}

    def pick(*cands: str) -> Optional[str]:
        for c in cands:
            v = fields.get(c)
            if v:
                return v
        return None

    name = pick("LEX_D", "BED_EQ_D", "LEX_RCS", "RCS_D") or "Unnamed unit"

    # Age: prefer a "MAX – MIN" range when both present, else whichever exists.
    max_t = pick("MAX_TIME_D")
    min_t = pick("MIN_TIME_D")
    if max_t and min_t and max_t != min_t:
        age: Optional[str] = f"{max_t.title()} – {min_t.title()}"
    elif max_t or min_t:
        age = (max_t or min_t or "").title() or None
    else:
        age = None

    lithology = pick("RCS_D", "RCS_X", "RCS")
    if lithology:
        lithology = lithology.title()
    rank = pick("RANK")
    if rank and lithology and rank.title() not in lithology:
        lithology = f"{lithology} ({rank.title()})"

    return {
        "name": name.title() if name == name.upper() else name,
        "age": age,
        "lithology": lithology,
    }


async def _query_bgs_layer(client: httpx.AsyncClient, layer: str, lat: float, lon: float) -> dict[str, Optional[str]]:
    minx, miny, maxx, maxy = _bbox_around(lat, lon)
    params = {
        "service": "WMS",
        "version": "1.1.1",
        "request": "GetFeatureInfo",
        "layers": layer,
        "query_layers": layer,
        "srs": "EPSG:4326",                  # 1.1.1 → lon,lat bbox order
        "bbox": f"{minx},{miny},{maxx},{maxy}",
        "width": "201",
        "height": "201",
        "x": "100",                          # 1.1.1 uses x/y, not i/j
        "y": "100",
        "info_format": "application/vnd.ogc.gml",
        "feature_count": "5",
    }
    resp = await client.get(BGS_OWS, params=params, timeout=20.0)
    resp.raise_for_status()
    return _describe(_parse_gml_feature(resp.text))


async def fetch_geology(lat: float, lon: float) -> dict[str, Any]:
    """Query both BGS layers for a point. Raises on network/HTTP failure so the
    caller can decide whether to save without geology."""
    async with httpx.AsyncClient() as client:
        bedrock = await _query_bgs_layer(client, BGS_LAYERS["bedrock"], lat, lon)
        superficial = await _query_bgs_layer(client, BGS_LAYERS["superficial"], lat, lon)
    return {
        "bedrock_name": bedrock["name"],
        "bedrock_age": bedrock["age"],
        "bedrock_lithology": bedrock["lithology"],
        "superficial_name": superficial["name"],
        "superficial_age": superficial["age"],
        "superficial_lithology": superficial["lithology"],
        "geology_fetched_at": int(time.time()),
    }


# --- photo handling -------------------------------------------------------
HEIC_EXTS = {".heic", ".heif"}
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"} | HEIC_EXTS
# Stage 3 site documents. _save_upload already stores arbitrary bytes verbatim
# (its passthrough branch), so no new storage logic is needed — just a guard.
ALLOWED_DOC_EXTS = {".pdf", ".docx", ".txt"}
DOC_MEDIA_TYPES = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
}


def _save_upload(raw: bytes, original_name: str) -> str:
    """Store an uploaded image. HEIC/HEIF is converted to JPEG when support is
    available; everything else is stored as-is. Returns the on-disk filename."""
    ext = Path(original_name).suffix.lower()
    stem = uuid.uuid4().hex

    if ext in HEIC_EXTS and HEIC_SUPPORTED:
        try:
            img = Image.open(io.BytesIO(raw))
            out_name = f"{stem}.jpg"
            img.convert("RGB").save(UPLOAD_DIR / out_name, format="JPEG", quality=88)
            return out_name
        except Exception:
            # Conversion failed — fall back to storing the raw bytes.
            out_name = f"{stem}{ext or '.heic'}"
            (UPLOAD_DIR / out_name).write_bytes(raw)
            return out_name

    out_name = f"{stem}{ext or '.bin'}"
    (UPLOAD_DIR / out_name).write_bytes(raw)
    return out_name


# --- serialisation --------------------------------------------------------
def _site_row(row: sqlite3.Row) -> dict[str, Any]:
    d = dict(row)
    d["geology"] = {
        "bedrock": {
            "name": d.pop("bedrock_name"),
            "age": d.pop("bedrock_age"),
            "lithology": d.pop("bedrock_lithology"),
        },
        "superficial": {
            "name": d.pop("superficial_name"),
            "age": d.pop("superficial_age"),
            "lithology": d.pop("superficial_lithology"),
        },
        "fetched_at": d.pop("geology_fetched_at"),
    }
    return d


# --- request models -------------------------------------------------------
class SiteIn(BaseModel):
    name: str
    lat: float
    lon: float
    notes: str = ""
    fetch_geology: bool = True
    client_uuid: Optional[str] = None  # set by offline-created sites; de-dupes retries


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    notes: Optional[str] = None


class SampleIn(BaseModel):
    label: str
    rock_type: str = ""
    notes: str = ""


class FormationIn(BaseModel):
    name: str
    description: str = ""


VALID_RESOURCE_CATEGORIES = {"websites", "societies", "videos"}


class ResourceIn(BaseModel):
    category: str
    title: str
    url: str
    note: str = ""
    client_uuid: Optional[str] = None


# Stage 2: the six fixed glossary-cluster process keys (1:1 with KB.processes
# on the frontend). The taxonomy is deliberately fixed — see project notes.
VALID_PROCESS_KEYS = {
    "igneous", "sedimentary", "metamorphic", "structure", "glacial", "fossils",
}


class ProcessResourceIn(BaseModel):
    title: str
    url: str
    note: str = ""
    processes: list[str] = []        # zero or more of VALID_PROCESS_KEYS
    client_uuid: Optional[str] = None


class SiteLinkIn(BaseModel):
    title: str
    url: str
    note: str = ""


# --- app ------------------------------------------------------------------
# NOTE: no root_path here, by design (see module docstring).
app = FastAPI(title="Geòlas")

# Initialise the schema at import time so the DB is ready no matter how the app
# is launched (uvicorn, gunicorn, TestClient). Idempotent: CREATE IF NOT EXISTS.
init_db()


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "app": "geolas",
        "heic_supported": HEIC_SUPPORTED,
        "data_dir": str(DATA_DIR),
    }


# ---- sites ----
@app.get("/api/sites")
def list_sites() -> list[dict[str, Any]]:
    with _db() as conn:
        rows = conn.execute(
            "SELECT * FROM sites ORDER BY created_at DESC"
        ).fetchall()
    return [_site_row(r) for r in rows]


@app.get("/api/sites/{site_id}")
def get_site(site_id: int) -> dict[str, Any]:
    with _db() as conn:
        row = conn.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Site not found")
        site = _site_row(row)
        site["samples"] = [dict(r) for r in conn.execute(
            "SELECT * FROM samples WHERE site_id = ? ORDER BY created_at", (site_id,)
        ).fetchall()]
        site["formations"] = [dict(r) for r in conn.execute(
            "SELECT * FROM formations WHERE site_id = ? ORDER BY created_at", (site_id,)
        ).fetchall()]
        site["photos"] = [dict(r) for r in conn.execute(
            "SELECT * FROM photos WHERE site_id = ? ORDER BY created_at", (site_id,)
        ).fetchall()]
        site["links"] = [dict(r) for r in conn.execute(
            "SELECT * FROM site_resources WHERE site_id = ? AND kind = 'link' "
            "ORDER BY created_at", (site_id,)
        ).fetchall()]
        site["documents"] = [dict(r) for r in conn.execute(
            "SELECT * FROM site_resources WHERE site_id = ? AND kind = 'doc' "
            "ORDER BY created_at", (site_id,)
        ).fetchall()]
    return site


@app.post("/api/sites")
async def create_site(site: SiteIn) -> dict[str, Any]:
    now = int(time.time())

    # Idempotency: if this client_uuid already exists, the offline queue is
    # retrying a create that already landed. Return the existing row instead of
    # making a duplicate. (Single-user app, but retries are the real risk.)
    if site.client_uuid:
        with _db() as conn:
            existing = conn.execute(
                "SELECT * FROM sites WHERE client_uuid = ?", (site.client_uuid,)
            ).fetchone()
        if existing:
            result = _site_row(existing)
            result["deduplicated"] = True
            return result

    geology: dict[str, Any] = {
        "bedrock_name": None, "bedrock_age": None, "bedrock_lithology": None,
        "superficial_name": None, "superficial_age": None,
        "superficial_lithology": None, "geology_fetched_at": None,
    }
    geology_error = None
    if site.fetch_geology:
        try:
            geology = await fetch_geology(site.lat, site.lon)
        except Exception as e:
            geology_error = str(e)  # save anyway; user can re-fetch later

    with _db() as conn:
        cur = conn.execute(
            """INSERT INTO sites
               (name, lat, lon, notes,
                bedrock_name, bedrock_age, bedrock_lithology,
                superficial_name, superficial_age, superficial_lithology,
                geology_fetched_at, client_uuid, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (site.name, site.lat, site.lon, site.notes,
             geology["bedrock_name"], geology["bedrock_age"], geology["bedrock_lithology"],
             geology["superficial_name"], geology["superficial_age"], geology["superficial_lithology"],
             geology["geology_fetched_at"], site.client_uuid, now, now),
        )
        new_id = cur.lastrowid
        row = conn.execute("SELECT * FROM sites WHERE id = ?", (new_id,)).fetchone()
    result = _site_row(row)
    if geology_error:
        result["geology_error"] = geology_error
    return result


@app.patch("/api/sites/{site_id}")
def update_site(site_id: int, patch: SiteUpdate) -> dict[str, Any]:
    fields = {k: v for k, v in patch.model_dump(exclude_unset=True).items()}
    if not fields:
        raise HTTPException(400, "No fields to update")
    fields["updated_at"] = int(time.time())
    sets = ", ".join(f"{k} = ?" for k in fields)
    with _db() as conn:
        exists = conn.execute("SELECT 1 FROM sites WHERE id = ?", (site_id,)).fetchone()
        if not exists:
            raise HTTPException(404, "Site not found")
        conn.execute(f"UPDATE sites SET {sets} WHERE id = ?", (*fields.values(), site_id))
        row = conn.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
    return _site_row(row)


@app.post("/api/sites/{site_id}/refetch-geology")
async def refetch_geology(site_id: int) -> dict[str, Any]:
    with _db() as conn:
        row = conn.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Site not found")
    try:
        geology = await fetch_geology(row["lat"], row["lon"])
    except Exception as e:
        raise HTTPException(502, f"BGS lookup failed: {e}")
    with _db() as conn:
        conn.execute(
            """UPDATE sites SET
               bedrock_name=?, bedrock_age=?, bedrock_lithology=?,
               superficial_name=?, superficial_age=?, superficial_lithology=?,
               geology_fetched_at=?, updated_at=?
               WHERE id=?""",
            (geology["bedrock_name"], geology["bedrock_age"], geology["bedrock_lithology"],
             geology["superficial_name"], geology["superficial_age"], geology["superficial_lithology"],
             geology["geology_fetched_at"], int(time.time()), site_id),
        )
        row = conn.execute("SELECT * FROM sites WHERE id = ?", (site_id,)).fetchone()
    return _site_row(row)


@app.delete("/api/sites/{site_id}")
def delete_site(site_id: int) -> dict[str, Any]:
    with _db() as conn:
        # gather photo files first so we can remove them from disk
        photos = conn.execute(
            "SELECT filename FROM photos WHERE site_id = ?", (site_id,)
        ).fetchall()
        deleted = conn.execute("DELETE FROM sites WHERE id = ?", (site_id,)).rowcount
    if not deleted:
        raise HTTPException(404, "Site not found")
    for p in photos:
        try:
            (UPLOAD_DIR / p["filename"]).unlink(missing_ok=True)
        except Exception:
            pass
    return {"ok": True, "deleted": site_id}


# ---- standalone geology lookup (no save) ----
@app.get("/api/geology")
async def geology_lookup(lat: float, lon: float) -> dict[str, Any]:
    try:
        return await fetch_geology(lat, lon)
    except Exception as e:
        raise HTTPException(502, f"BGS lookup failed: {e}")


# ---- place search (proxy Nominatim so the browser stays prefix-clean) ----
@app.get("/api/geocode")
async def geocode(q: str) -> list[dict[str, Any]]:
    url = "https://nominatim.openstreetmap.org/search"
    params = {"format": "json", "limit": "5", "countrycodes": "gb", "q": q}
    headers = {"User-Agent": "Geolas/1.0 (personal geology notebook)"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers, timeout=15.0)
    resp.raise_for_status()
    return [
        {"lat": float(d["lat"]), "lon": float(d["lon"]), "label": d["display_name"]}
        for d in resp.json()
    ]


# ---- samples ----
@app.post("/api/sites/{site_id}/samples")
def add_sample(site_id: int, sample: SampleIn) -> dict[str, Any]:
    with _db() as conn:
        if not conn.execute("SELECT 1 FROM sites WHERE id=?", (site_id,)).fetchone():
            raise HTTPException(404, "Site not found")
        cur = conn.execute(
            "INSERT INTO samples (site_id, label, rock_type, notes, created_at) VALUES (?,?,?,?,?)",
            (site_id, sample.label, sample.rock_type, sample.notes, int(time.time())),
        )
        row = conn.execute("SELECT * FROM samples WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.delete("/api/samples/{sample_id}")
def delete_sample(sample_id: int) -> dict[str, Any]:
    with _db() as conn:
        n = conn.execute("DELETE FROM samples WHERE id=?", (sample_id,)).rowcount
    if not n:
        raise HTTPException(404, "Sample not found")
    return {"ok": True}


# ---- formations ----
@app.post("/api/sites/{site_id}/formations")
def add_formation(site_id: int, formation: FormationIn) -> dict[str, Any]:
    with _db() as conn:
        if not conn.execute("SELECT 1 FROM sites WHERE id=?", (site_id,)).fetchone():
            raise HTTPException(404, "Site not found")
        cur = conn.execute(
            "INSERT INTO formations (site_id, name, description, created_at) VALUES (?,?,?,?)",
            (site_id, formation.name, formation.description, int(time.time())),
        )
        row = conn.execute("SELECT * FROM formations WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.delete("/api/formations/{formation_id}")
def delete_formation(formation_id: int) -> dict[str, Any]:
    with _db() as conn:
        n = conn.execute("DELETE FROM formations WHERE id=?", (formation_id,)).rowcount
    if not n:
        raise HTTPException(404, "Formation not found")
    return {"ok": True}


# ---- resources (user-added library links) ----
@app.get("/api/resources")
def list_resources() -> list[dict[str, Any]]:
    with _db() as conn:
        rows = conn.execute("SELECT * FROM resources ORDER BY created_at").fetchall()
    return [dict(r) for r in rows]


@app.post("/api/resources")
def add_resource(resource: ResourceIn) -> dict[str, Any]:
    if resource.category not in VALID_RESOURCE_CATEGORIES:
        raise HTTPException(400, f"Invalid category: {resource.category}")
    if not resource.title.strip() or not resource.url.strip():
        raise HTTPException(400, "Title and URL are required")

    # Idempotency for offline sync, same pattern as sites.
    if resource.client_uuid:
        with _db() as conn:
            existing = conn.execute(
                "SELECT * FROM resources WHERE client_uuid = ?", (resource.client_uuid,)
            ).fetchone()
        if existing:
            r = dict(existing)
            r["deduplicated"] = True
            return r

    with _db() as conn:
        cur = conn.execute(
            "INSERT INTO resources (category, title, url, note, client_uuid, created_at) "
            "VALUES (?,?,?,?,?,?)",
            (resource.category, resource.title.strip(), resource.url.strip(),
             resource.note.strip(), resource.client_uuid, int(time.time())),
        )
        row = conn.execute("SELECT * FROM resources WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.delete("/api/resources/{resource_id}")
def delete_resource(resource_id: int) -> dict[str, Any]:
    with _db() as conn:
        n = conn.execute("DELETE FROM resources WHERE id=?", (resource_id,)).rowcount
    if not n:
        raise HTTPException(404, "Resource not found")
    return {"ok": True}


# ---- process resources (Stage 2: user-added, tagged to geological processes) ----
def _process_resource_row(conn: sqlite3.Connection, rid: int) -> dict[str, Any]:
    row = dict(conn.execute(
        "SELECT * FROM process_resources WHERE id=?", (rid,)).fetchone())
    tags = conn.execute(
        "SELECT process_key FROM process_resource_tags WHERE resource_id=? "
        "ORDER BY process_key", (rid,)).fetchall()
    row["processes"] = [t["process_key"] for t in tags]
    return row


@app.get("/api/process-resources")
def list_process_resources() -> list[dict[str, Any]]:
    with _db() as conn:
        ids = [r["id"] for r in conn.execute(
            "SELECT id FROM process_resources ORDER BY created_at").fetchall()]
        return [_process_resource_row(conn, rid) for rid in ids]


@app.post("/api/process-resources")
def add_process_resource(resource: ProcessResourceIn) -> dict[str, Any]:
    if not resource.title.strip() or not resource.url.strip():
        raise HTTPException(400, "Title and URL are required")
    keys = list(dict.fromkeys(resource.processes))  # de-dupe, preserve order
    bad = [k for k in keys if k not in VALID_PROCESS_KEYS]
    if bad:
        raise HTTPException(400, f"Invalid process key(s): {', '.join(bad)}")

    # Idempotency for offline sync, same pattern as sites/resources.
    if resource.client_uuid:
        with _db() as conn:
            existing = conn.execute(
                "SELECT id FROM process_resources WHERE client_uuid = ?",
                (resource.client_uuid,)).fetchone()
            if existing:
                r = _process_resource_row(conn, existing["id"])
                r["deduplicated"] = True
                return r

    with _db() as conn:
        cur = conn.execute(
            "INSERT INTO process_resources (title, url, note, client_uuid, created_at) "
            "VALUES (?,?,?,?,?)",
            (resource.title.strip(), resource.url.strip(),
             resource.note.strip(), resource.client_uuid, int(time.time())),
        )
        rid = cur.lastrowid
        for key in keys:
            conn.execute(
                "INSERT OR IGNORE INTO process_resource_tags (resource_id, process_key) "
                "VALUES (?,?)", (rid, key))
        return _process_resource_row(conn, rid)


@app.delete("/api/process-resources/{resource_id}")
def delete_process_resource(resource_id: int) -> dict[str, Any]:
    # tags cascade via the FK (PRAGMA foreign_keys = ON in _db()).
    with _db() as conn:
        n = conn.execute(
            "DELETE FROM process_resources WHERE id=?", (resource_id,)).rowcount
    if not n:
        raise HTTPException(404, "Resource not found")
    return {"ok": True}


# ---- photos ----
@app.post("/api/sites/{site_id}/photos")
async def add_photo(
    site_id: int,
    file: UploadFile = File(...),
    caption: str = Form(""),
) -> dict[str, Any]:
    ext = Path(file.filename or "").suffix.lower()
    if ext and ext not in ALLOWED_IMAGE_EXTS:
        raise HTTPException(400, f"Unsupported image type: {ext}")
    with _db() as conn:
        if not conn.execute("SELECT 1 FROM sites WHERE id=?", (site_id,)).fetchone():
            raise HTTPException(404, "Site not found")
    raw = await file.read()
    stored = _save_upload(raw, file.filename or "upload")
    with _db() as conn:
        cur = conn.execute(
            "INSERT INTO photos (site_id, filename, original, caption, created_at) VALUES (?,?,?,?,?)",
            (site_id, stored, file.filename or "upload", caption, int(time.time())),
        )
        row = conn.execute("SELECT * FROM photos WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


class PhotoUrlIn(BaseModel):
    url: str
    caption: str = ""


@app.post("/api/sites/{site_id}/photo-url")
def add_photo_url(site_id: int, body: PhotoUrlIn) -> dict[str, Any]:
    """Attach a hot-linked remote image to a site. We store the URL and render
    it directly in the gallery — nothing is downloaded to the Pi. Only the URL
    scheme is validated; we do NOT fetch or verify the image (that would only
    work online anyway, and proxying was explicitly out of scope for Stage 4)."""
    url = (body.url or "").strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(400, "Photo URL must start with http:// or https://")
    with _db() as conn:
        if not conn.execute("SELECT 1 FROM sites WHERE id=?", (site_id,)).fetchone():
            raise HTTPException(404, "Site not found")
        cur = conn.execute(
            "INSERT INTO photos (site_id, filename, original, caption, url, created_at) "
            "VALUES (?,?,?,?,?,?)",
            (site_id, "", "", body.caption.strip(), url, int(time.time())),
        )
        row = conn.execute("SELECT * FROM photos WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.delete("/api/photos/{photo_id}")
def delete_photo(photo_id: int) -> dict[str, Any]:
    with _db() as conn:
        row = conn.execute("SELECT filename FROM photos WHERE id=?", (photo_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Photo not found")
        conn.execute("DELETE FROM photos WHERE id=?", (photo_id,))
    # URL-photos have no on-disk file; only unlink when a filename is present.
    if row["filename"]:
        try:
            (UPLOAD_DIR / row["filename"]).unlink(missing_ok=True)
        except Exception:
            pass
    return {"ok": True}


@app.get("/api/photos/{photo_id}/file")
def photo_file(photo_id: int) -> FileResponse:
    with _db() as conn:
        row = conn.execute("SELECT filename FROM photos WHERE id=?", (photo_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Photo not found")
    if not row["filename"]:
        # URL-photo: there is no local file — the client renders row['url'].
        raise HTTPException(409, "This photo is a remote URL; use its url field")
    path = UPLOAD_DIR / row["filename"]
    if not path.exists():
        raise HTTPException(404, "File missing on disk")
    return FileResponse(path)


# ---- per-site attachments: links and documents (Stage 3) ----
@app.post("/api/sites/{site_id}/links")
def add_site_link(site_id: int, link: SiteLinkIn) -> dict[str, Any]:
    if not link.title.strip() or not link.url.strip():
        raise HTTPException(400, "Title and URL are required")
    with _db() as conn:
        if not conn.execute("SELECT 1 FROM sites WHERE id=?", (site_id,)).fetchone():
            raise HTTPException(404, "Site not found")
        cur = conn.execute(
            "INSERT INTO site_resources (site_id, kind, title, url, note, created_at) "
            "VALUES (?,?,?,?,?,?)",
            (site_id, "link", link.title.strip(), link.url.strip(),
             link.note.strip(), int(time.time())),
        )
        row = conn.execute("SELECT * FROM site_resources WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.post("/api/sites/{site_id}/documents")
async def add_site_document(
    site_id: int,
    file: UploadFile = File(...),
    title: str = Form(""),
    note: str = Form(""),
) -> dict[str, Any]:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_DOC_EXTS:
        raise HTTPException(400, f"Unsupported document type: {ext or '(none)'}")
    with _db() as conn:
        if not conn.execute("SELECT 1 FROM sites WHERE id=?", (site_id,)).fetchone():
            raise HTTPException(404, "Site not found")
    raw = await file.read()
    stored = _save_upload(raw, file.filename or "upload")
    original = file.filename or "upload"
    label = title.strip() or original
    with _db() as conn:
        cur = conn.execute(
            "INSERT INTO site_resources "
            "(site_id, kind, title, filename, original, note, created_at) "
            "VALUES (?,?,?,?,?,?,?)",
            (site_id, "doc", label, stored, original, note.strip(), int(time.time())),
        )
        row = conn.execute("SELECT * FROM site_resources WHERE id=?", (cur.lastrowid,)).fetchone()
    return dict(row)


@app.get("/api/site-resources/{resource_id}/file")
def site_resource_file(resource_id: int) -> FileResponse:
    with _db() as conn:
        row = conn.execute(
            "SELECT filename, original FROM site_resources WHERE id=? AND kind='doc'",
            (resource_id,),
        ).fetchone()
    if not row:
        raise HTTPException(404, "Document not found")
    path = UPLOAD_DIR / row["filename"]
    if not path.exists():
        raise HTTPException(404, "File missing on disk")
    ext = Path(row["original"]).suffix.lower()
    media_type = DOC_MEDIA_TYPES.get(ext, "application/octet-stream")
    name = row["original"] or "document"
    # Browsers can render PDFs and plain text inline; everything else (e.g.
    # .docx) has no native viewer, so force a download with its real name.
    # For inline types we still set the filename via Content-Disposition so a
    # "Save as" keeps the original name, but use disposition=inline so a click
    # opens the file in the browser instead of downloading it.
    inline = ext in {".pdf", ".txt"}
    disposition = "inline" if inline else "attachment"
    headers = {
        "Content-Disposition": f'{disposition}; filename="{name}"'
    }
    return FileResponse(path, media_type=media_type, headers=headers)


@app.delete("/api/site-resources/{resource_id}")
def delete_site_resource(resource_id: int) -> dict[str, Any]:
    with _db() as conn:
        row = conn.execute(
            "SELECT kind, filename FROM site_resources WHERE id=?", (resource_id,)
        ).fetchone()
        if not row:
            raise HTTPException(404, "Resource not found")
        conn.execute("DELETE FROM site_resources WHERE id=?", (resource_id,))
    if row["kind"] == "doc" and row["filename"]:
        try:
            (UPLOAD_DIR / row["filename"]).unlink(missing_ok=True)
        except Exception:
            pass
    return {"ok": True}


# --- static frontend ------------------------------------------------------
# Mounted LAST so it doesn't shadow /api routes. html=True serves index.html
# at the mount root. Because Tailscale strips /geolas, this app sees "/" and
# the frontend's own URLs are all relative, so it works at / or /geolas/.
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
