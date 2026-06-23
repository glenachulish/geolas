/* =========================================================================
   Geòlas — front-end controller (vanilla JS, no build step).

   PREFIX-AWARENESS (the rule from PI-INFRASTRUCTURE.md):
   The browser address bar carries /geolas/ on the Pi but / locally, because
   Tailscale strips the prefix before the backend sees it. So we must NEVER emit
   a leading-slash absolute URL. We derive a base path from the current location
   ONCE, set <base href> from it, and build every API/asset URL relative to that.
   Served at / or /geolas/, this same file works unchanged.
   ========================================================================= */

// Derive the directory the app is served from, e.g. "/" or "/geolas/".
const BASE = location.pathname.replace(/[^/]*$/, ""); // strip trailing filename
// Set <base> so relative URLs in dynamically-inserted HTML resolve correctly.
const baseEl = document.createElement("base");
baseEl.href = BASE;
document.head.prepend(baseEl);

// All API calls go through here. Note: no leading slash — relative to BASE.
const API = `${BASE}api`;

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    let detail = `${res.status}`;
    try { const j = await res.json(); detail = j.detail || detail; } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

const j = (obj) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

// ---- tiny DOM helpers ----
const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = document.getElementById("view");

let toastTimer;
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = el(`<div id="toast"></div>`); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

function fmtDate(unix) {
  if (!unix) return "never";
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

// =========================================================================
//  LIST VIEW  (map + cards)
// =========================================================================
let map, markerLayer, addMode = false, addMarker = null;
let refLayer = null, locateMarker = null;

async function showList() {
  setNav("notebook");
  addMode = false; addMarker = null;
  view.innerHTML = `
    <div id="map"></div>
    <div class="map-controls">
      <button class="btn btn-sm btn-ghost" id="locate-btn">Locate me</button>
      <button class="btn btn-sm btn-ghost" id="download-area-btn">Download this area</button>
      <label class="ref-toggle"><input type="checkbox" id="ref-toggle" /> Show classic sites</label>
      <span class="map-hint" id="map-hint">Tap “Log a site”, then tap the map to drop a pin — or search a place in the form.</span>
    </div>
    <div class="list-head">
      <h2>Your sites</h2>
      <span class="count-badge" id="count"></span>
    </div>
    <div id="list-body"><div class="loading"><div class="strata-spin"><span></span><span></span><span></span><span></span></div>Reading the notebook…</div></div>
  `;
  initMap();
  document.getElementById("locate-btn").addEventListener("click", locateOnMap);
  document.getElementById("download-area-btn").addEventListener("click", downloadVisibleArea);
  document.getElementById("ref-toggle").addEventListener("change", (e) =>
    toggleReferenceSites(e.target.checked));

  const pending = (await window.GeolasQueue.list()).map((p) => ({
    id: `pending:${p.client_uuid}`,
    name: p.name, lat: p.lat, lon: p.lon, notes: p.notes,
    geology: { bedrock: {}, superficial: {}, fetched_at: null },
    _pending: true,
  }));

  let sites = [];
  try {
    sites = await api("/sites");
  } catch (e) {
    // Offline (or server unreachable): show what we have queued, with a note.
    renderSiteCards(pending, true);
    renderMarkers(pending);
    await refreshSyncBar();
    return;
  }
  const all = [...pending, ...sites];
  renderSiteCards(all, false);
  renderMarkers(all);
  await refreshSyncBar();
}

function initMap() {
  // Centre on Great Britain.
  map = L.map("map", { zoomControl: true }).setView([54.5, -3.2], 5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);

  map.on("click", (e) => {
    if (!addMode) return;
    const { lat, lng } = e.latlng;
    if (addMarker) addMarker.setLatLng(e.latlng);
    else addMarker = L.marker(e.latlng, { icon: pinIcon() }).addTo(map);
    openSiteForm({ lat: +lat.toFixed(5), lon: +lng.toFixed(5) });
  });
}

function pinIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="geolas-pin"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

function refPinIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="geolas-pin geolas-pin-ref"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 16],
  });
}

function locateOnMap() {
  const hint = document.getElementById("map-hint");
  if (!navigator.geolocation) {
    if (hint) hint.textContent = "This device can't share its location.";
    return;
  }
  if (hint) hint.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      map.flyTo([lat, lon], 14, { duration: 0.8 });
      if (locateMarker) locateMarker.setLatLng([lat, lon]);
      else locateMarker = L.circleMarker([lat, lon], {
        radius: 8, color: "#2b66b5", fillColor: "#2b66b5", fillOpacity: 0.6, weight: 2,
      }).addTo(map);
      locateMarker.bindTooltip("You are here", { direction: "top", offset: [0, -8] });
      if (hint) { hint.textContent = "Centred on your location. Tap “Log a site” to record it."; }
    },
    () => { if (hint) hint.textContent = "Location permission denied. Search a place instead."; },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ---- offline map area download ----
// Convert lon/lat to tile x/y at a zoom (standard slippy-map maths).
function lonToTileX(lon, z) { return Math.floor((lon + 180) / 360 * Math.pow(2, z)); }
function latToTileY(lat, z) {
  const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z));
}

function tilesForCurrentView() {
  const b = map.getBounds();
  const z0 = map.getZoom();
  const zMax = Math.min(16, z0 + 3); // cap depth so storage stays sane
  const urls = [];
  for (let z = z0; z <= zMax; z++) {
    const xMin = lonToTileX(b.getWest(), z), xMax = lonToTileX(b.getEast(), z);
    const yMin = latToTileY(b.getNorth(), z), yMax = latToTileY(b.getSouth(), z);
    for (let x = xMin; x <= xMax; x++)
      for (let y = yMin; y <= yMax; y++)
        urls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
  }
  return urls;
}

async function downloadVisibleArea() {
  if (!map) return;
  const urls = tilesForCurrentView();
  const estMB = (urls.length * 0.015).toFixed(1); // ~15 KB/tile rough estimate
  confirmDialog(
    "Download this area for offline use?",
    `About ${urls.length} map tiles (~${estMB} MB) for the current view, down to street level. They'll be cached on this device so the map works here with no signal.`,
    async () => {
      const hint = document.getElementById("map-hint");
      let done = 0, failed = 0;
      // Fetch sequentially-ish in small batches; the service worker caches each
      // tile as it passes through its fetch handler.
      const batch = 6;
      for (let i = 0; i < urls.length; i += batch) {
        const slice = urls.slice(i, i + batch);
        await Promise.all(slice.map((u) =>
          fetch(u, { mode: "no-cors" }).then(() => done++).catch(() => failed++)));
        if (hint) hint.textContent = `Caching map… ${done}/${urls.length}`;
      }
      if (hint) hint.textContent = failed
        ? `Cached ${done} tiles (${failed} failed). This area now works offline.`
        : `Done — ${done} tiles cached. This area now works offline.`;
      toast("Area cached for offline use");
    }
  );
}

function toggleReferenceSites(on) {
  if (!map) return;
  if (on) {
    if (!refLayer) {
      refLayer = L.layerGroup();
      (window.REFERENCE_SITES || []).forEach((s) => {
        const m = L.marker([s.lat, s.lon], { icon: refPinIcon() });
        const popup = `<div class="ref-popup"><strong>${esc(s.name)}</strong>`
          + `<p>${esc(s.note)}</p>`
          + `<button class="btn btn-sm btn-primary ref-adopt" data-name="${esc(s.name)}" data-lat="${s.lat}" data-lon="${s.lon}">Log this site</button></div>`;
        m.bindPopup(popup);
        refLayer.addLayer(m);
      });
    }
    refLayer.addTo(map);
  } else if (refLayer) {
    map.removeLayer(refLayer);
  }
}

// Delegated handler: "Log this site" button inside a reference popup.
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".ref-adopt");
  if (!btn) return;
  if (map) map.closePopup();
  armAddMode();
  openSiteForm({
    lat: +parseFloat(btn.dataset.lat).toFixed(5),
    lon: +parseFloat(btn.dataset.lon).toFixed(5),
    name: btn.dataset.name,
  });
});

function pendingPinIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="geolas-pin geolas-pin-pending"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

function renderMarkers(sites) {
  if (!markerLayer) return;
  markerLayer.clearLayers();
  sites.forEach((s) => {
    const m = L.marker([s.lat, s.lon], { icon: s._pending ? pendingPinIcon() : pinIcon() });
    m.bindTooltip(s._pending ? `${s.name} (not synced)` : s.name,
      { direction: "top", offset: [0, -16] });
    if (!s._pending) m.on("click", () => showDetail(s.id));
    markerLayer.addLayer(m);
  });
}

// Derive a named geographical area from coordinates. Sites carry only lat/lon,
// so areas are inferred here rather than stored. Ordered roughly north→south;
// the first matching test wins. Boundaries are deliberately coarse — enough to
// cluster the field notebook sensibly, not a substitute for a real gazetteer.
const REGION_ORDER = [
  "Northern & Western Isles",
  "Northern Highlands",
  "Grampian Highlands",
  "Central Belt",
  "Southern Uplands",
  "Northern England",
  "Wales",
  "Central & Southern England",
  "Northern Ireland",
  "Republic of Ireland",
  "Elsewhere",
];

function regionFor(lat, lon) {
  // Ireland (whole island): west of ~-5.4, between ~51.3 and ~55.45 lat. The
  // latitude floor keeps the far southwest of England (Cornwall ~50.1) out.
  if (lon < -5.4 && lat >= 51.3 && lat < 55.45) {
    // NI roughly north of 54.0 and east of -8.2; rest is ROI.
    if (lat >= 54.0 && lon >= -8.2) return "Northern Ireland";
    return "Republic of Ireland";
  }
  // Scottish islands: Hebrides, Orkney, Shetland (west/north, offshore).
  if (lat >= 58.7) return "Northern & Western Isles";              // Orkney/Shetland
  if (lon < -6.1 && lat >= 56.4) return "Northern & Western Isles"; // Outer/Inner Hebrides, Skye
  // Scottish mainland bands.
  if (lat >= 57.2) return "Northern Highlands";        // Sutherland, Assynt, Wester Ross
  if (lat >= 56.2) return "Grampian Highlands";        // Cairngorms, Glencoe, Aberdeenshire
  if (lat >= 55.8) return "Central Belt";              // Glasgow–Edinburgh corridor
  if (lat >= 54.9) return "Southern Uplands";          // Borders, Galloway
  // Wales: a bounding box, tested before the England latitude bands so the
  // two don't collide (they sit side by side, not in stacked latitude bands).
  if (lat >= 51.3 && lat <= 53.5 && lon >= -5.5 && lon <= -2.65) return "Wales";
  // England.
  if (lat >= 53.0) return "Northern England";          // Lakes, Pennines, Yorkshire
  if (lat < 53.0) return "Central & Southern England";
  return "Elsewhere";
}

// Build a single site card (shared by grouped + flat rendering).
function buildSiteCard(s) {
  const bed = s.geology?.bedrock?.name;
  const sup = s.geology?.superficial?.name;
  const rock = s._pending
    ? `<em>Geology fills in when you sync</em>`
    : bed
      ? `<strong>Bedrock:</strong> ${esc(bed)}` + (sup ? `<br><strong>Surface:</strong> ${esc(sup)}` : "")
      : `<em>No geology snapshot yet</em>`;
  const badge = s._pending ? `<span class="pending-badge">Not synced</span>` : "";
  const card = el(`
    <button class="site-card${s._pending ? " site-card-pending" : ""}" type="button">
      <span class="site-card-spine" aria-hidden="true"></span>
      <span class="site-card-body">
        <h3>${esc(s.name)}${badge}</h3>
        <span class="coords">${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</span>
        <p class="rock">${rock}</p>
      </span>
    </button>`);
  if (s._pending) {
    card.addEventListener("click", () =>
      toast(navigator.onLine ? "Tap “Sync now” to upload this site" : "This site syncs when you’re back online"));
  } else {
    card.addEventListener("click", () => showDetail(s.id));
  }
  return card;
}

function renderSiteCards(sites, offline) {
  const synced = sites.filter((s) => !s._pending).length;
  const pending = sites.length - synced;
  document.getElementById("count").textContent =
    `${synced} site${synced === 1 ? "" : "s"}` + (pending ? ` · ${pending} unsynced` : "");
  const body = document.getElementById("list-body");
  if (!sites.length) {
    body.innerHTML = `
      <div class="empty">
        <hr class="strata-rule" />
        <h2>No sites logged yet</h2>
        <p>Drop a pin on the map or use “Log a site” to record your first field stop.<br>
        Geòlas reads the bedrock and superficial geology from the British Geological Survey when you save.</p>
      </div>`;
    return;
  }
  body.innerHTML = "";
  if (offline) {
    body.appendChild(el(`<div class="banner banner-info">You're offline — showing sites saved on this device. Synced sites will reappear when you're back online.</div>`));
  }

  // Bucket sites by derived area. Pending sites get their own bucket up top.
  const buckets = new Map();
  for (const s of sites) {
    const key = s._pending ? "Not yet synced" : regionFor(s.lat, s.lon);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(s);
  }

  // Emit groups: pending first, then named regions in N→S order, then any
  // leftover keys (shouldn't happen, but stays robust if REGION_ORDER drifts).
  const ordered = [];
  if (buckets.has("Not yet synced")) ordered.push("Not yet synced");
  for (const r of REGION_ORDER) if (buckets.has(r)) ordered.push(r);
  for (const k of buckets.keys()) if (!ordered.includes(k)) ordered.push(k);

  for (const area of ordered) {
    const group = buckets.get(area);
    const n = group.length;
    // Each area is a native <details> so it collapses/expands with no JS state
    // to track. Starts collapsed (no `open` attribute); the summary is the
    // clickable heading. The grid is built once and lives inside.
    const details = el(`
      <details class="area">
        <summary class="area-head">
          <svg class="area-chevron" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path d="M2 3.5 L5.5 7 L9 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <h3>${esc(area)}</h3>
          <span class="area-count">${n} site${n === 1 ? "" : "s"}</span>
        </summary>
      </details>`);
    const grid = el(`<div class="site-grid"></div>`);
    group.forEach((s) => grid.appendChild(buildSiteCard(s)));
    details.appendChild(grid);
    body.appendChild(details);
  }
}

function armAddMode() {
  addMode = true;
  const hint = document.getElementById("map-hint");
  if (hint) {
    hint.textContent = "Pin armed — tap anywhere on the map to set the location.";
    hint.classList.add("armed");
  }
}

// =========================================================================
//  SITE FORM (modal)
// =========================================================================
function openSiteForm(prefill = {}) {
  const m = el(`
    <div class="modal-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Log a site">
        <div class="modal-head">
          <h2>Log a site</h2>
          <p>Set the location, then save. Geology is read from the BGS at save.</p>
        </div>
        <div class="modal-body">
          <div class="field">
            <label for="f-name">Site name</label>
            <input id="f-name" autocomplete="off" placeholder="e.g. Siccar Point" value="${esc(prefill.name ?? "")}" />
          </div>
          <div class="field">
            <label for="f-search">Find a place (optional)</label>
            <input id="f-search" autocomplete="off" placeholder="Postcode, town or landmark…" />
            <span class="field-hint" id="search-hint">Searching sets the coordinates below.</span>
          </div>
          <div class="field-row">
            <div class="field"><label for="f-lat">Latitude</label><input id="f-lat" inputmode="decimal" value="${prefill.lat ?? ""}" /></div>
            <div class="field"><label for="f-lon">Longitude</label><input id="f-lon" inputmode="decimal" value="${prefill.lon ?? ""}" /></div>
          </div>
          <div class="field">
            <label for="f-notes">Notes</label>
            <textarea id="f-notes" placeholder="What you saw, weather, access…"></textarea>
          </div>
          <div class="checkbox-row">
            <input type="checkbox" id="f-fetch" checked />
            <label for="f-fetch">Read BGS geology for this point when I save</label>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" id="f-cancel" type="button">Cancel</button>
            <button class="btn btn-primary" id="f-save" type="button">Save site</button>
          </div>
        </div>
      </div>
    </div>`);
  document.body.appendChild(m);
  const close = () => m.remove();
  m.addEventListener("click", (e) => { if (e.target === m) close(); });
  m.querySelector("#f-cancel").addEventListener("click", close);
  m.querySelector("#f-name").focus();

  // place search → fills lat/lon
  let searchTimer;
  const searchInput = m.querySelector("#f-search");
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    clearTimeout(searchTimer);
    runGeocode();
  });
  async function runGeocode() {
    const q = searchInput.value.trim();
    if (!q) return;
    const hint = m.querySelector("#search-hint");
    hint.textContent = "Searching…";
    try {
      const results = await api(`/geocode?q=${encodeURIComponent(q)}`);
      if (!results.length) { hint.textContent = "No match — try a postcode or nearby town."; return; }
      const r = results[0];
      m.querySelector("#f-lat").value = r.lat.toFixed(5);
      m.querySelector("#f-lon").value = r.lon.toFixed(5);
      if (!m.querySelector("#f-name").value) m.querySelector("#f-name").value = r.label.split(",")[0];
      hint.textContent = r.label;
    } catch (e) { hint.textContent = `Lookup failed: ${e.message}`; }
  }

  m.querySelector("#f-save").addEventListener("click", async () => {
    const name = m.querySelector("#f-name").value.trim();
    const lat = parseFloat(m.querySelector("#f-lat").value);
    const lon = parseFloat(m.querySelector("#f-lon").value);
    if (!name) { toast("Give the site a name"); return; }
    if (Number.isNaN(lat) || Number.isNaN(lon)) { toast("Set a location (tap the map or search)"); return; }
    const notes = m.querySelector("#f-notes").value;
    const fetch_geology = m.querySelector("#f-fetch").checked;
    const saveBtn = m.querySelector("#f-save");
    saveBtn.disabled = true;

    // If the browser knows it's offline, don't even attempt the network —
    // queue immediately. (navigator.onLine is a hint, not a guarantee, so we
    // also catch a failed fetch below.)
    if (!navigator.onLine) {
      await queueSiteOffline({ name, lat, lon, notes, fetch_geology });
      close();
      toast("Saved offline — tap “Sync now” when you have signal");
      showList();
      return;
    }

    saveBtn.textContent = "Reading geology…";
    try {
      const site = await api("/sites", j({ name, lat, lon, notes, fetch_geology }));
      close();
      if (site.geology_error) toast("Saved — but BGS lookup failed; re-fetch later");
      else toast("Site saved");
      showDetail(site.id);
    } catch (e) {
      // Network failed despite onLine — treat as offline and queue rather than
      // lose the field note.
      await queueSiteOffline({ name, lat, lon, notes, fetch_geology });
      close();
      toast("Couldn’t reach the server — saved offline to sync later");
      showList();
    }
  });
}

async function queueSiteOffline(data) {
  try {
    await window.GeolasQueue.enqueueSite(data);
  } catch (e) {
    toast(`Couldn’t save offline: ${e.message}`);
  }
}

// =========================================================================
//  DETAIL VIEW
// =========================================================================
async function showDetail(id) {
  view.innerHTML = `<div class="loading"><div class="strata-spin"><span></span><span></span><span></span><span></span></div>Opening site…</div>`;
  let site;
  try { site = await api(`/sites/${id}`); }
  catch (e) { view.innerHTML = `<div class="banner banner-error">Couldn’t open site: ${esc(e.message)}</div>`; return; }

  const g = site.geology || {};
  const bed = g.bedrock || {}, sup = g.superficial || {};

  view.innerHTML = `
    <div class="detail-top"><button class="back-link" id="back">← All sites</button></div>
    <h1 class="detail-title">${esc(site.name)}</h1>
    <div class="detail-coords">${site.lat.toFixed(5)}, ${site.lon.toFixed(5)}</div>

    <div class="geo-cards">
      ${geoCard("Surface", "Superficial deposits", sup, "No superficial deposits mapped — bedrock at or near surface.")}
      ${geoCard("Below", "Bedrock", bed, "No bedrock unit returned for this point.")}
    </div>
    <div class="geo-fetched">
      <span>BGS snapshot: ${g.fetched_at ? "read " + fmtDate(g.fetched_at) : "not fetched yet"}</span>
      <button class="btn btn-sm btn-ghost" id="refetch">Re-fetch geology</button>
    </div>

    ${explainerHtml(site)}

    <hr class="strata-rule" />

    <section class="section">
      <div class="section-head"><h3>Notes</h3><button class="btn btn-sm btn-ghost" id="edit-notes">Edit</button></div>
      <div class="notes-body" id="notes-body">${site.notes ? esc(site.notes) : `<span class="notes-empty">No notes yet.</span>`}</div>
    </section>

    <section class="section">
      <div class="section-head"><h3>Samples</h3><button class="btn btn-sm btn-ghost" id="add-sample">Add sample</button></div>
      <div class="rows" id="samples"></div>
    </section>

    <section class="section">
      <div class="section-head"><h3>Formations</h3><button class="btn btn-sm btn-ghost" id="add-formation">Add formation</button></div>
      <div class="rows" id="formations"></div>
    </section>

    <section class="section">
      <div class="section-head"><h3>Photos</h3><button class="btn btn-sm btn-ghost" id="add-photo">Add photo</button></div>
      <div class="photo-grid" id="photos"></div>
      <input type="file" id="photo-input" accept="image/*,.heic,.heif" hidden />
    </section>

    <section class="section">
      <div class="section-head"><h3>Links</h3><button class="btn btn-sm btn-ghost" id="add-link">Add link</button></div>
      <div class="rows" id="links"></div>
    </section>

    <section class="section">
      <div class="section-head"><h3>Documents</h3><button class="btn btn-sm btn-ghost" id="add-document">Add document</button></div>
      <div class="rows" id="documents"></div>
      <input type="file" id="document-input" accept=".pdf,.docx,.txt" hidden />
    </section>

    <hr class="strata-rule" />
    <div class="modal-actions" style="justify-content:flex-start">
      <button class="btn btn-danger" id="delete-site">Delete this site</button>
    </div>
  `;

  document.getElementById("back").addEventListener("click", showList);
  renderSamples(site);
  renderFormations(site);
  renderPhotos(site);
  renderLinks(site);
  renderDocuments(site);

  // explainer links into the library
  view.querySelectorAll(".explain [data-region]").forEach((b) =>
    b.addEventListener("click", () => showLibrary("area")));
  document.getElementById("explain-glossary")?.addEventListener("click", () => showLibrary("process"));

  document.getElementById("refetch").addEventListener("click", async (ev) => {
    ev.target.disabled = true; ev.target.textContent = "Reading…";
    try { await api(`/sites/${id}/refetch-geology`, { method: "POST" }); toast("Geology refreshed"); showDetail(id); }
    catch (e) { ev.target.disabled = false; ev.target.textContent = "Re-fetch geology"; toast(`Failed: ${e.message}`); }
  });

  document.getElementById("edit-notes").addEventListener("click", () => editNotes(site));

  document.getElementById("add-sample").addEventListener("click", () =>
    simpleForm("Add sample", [
      { id: "label", label: "Label", placeholder: "e.g. GS-001" },
      { id: "rock_type", label: "Rock type", placeholder: "e.g. greywacke" },
      { id: "notes", label: "Notes", type: "textarea" },
    ], async (vals) => {
      if (!vals.label) { toast("Sample needs a label"); return false; }
      await api(`/sites/${id}/samples`, j(vals)); toast("Sample added"); showDetail(id); return true;
    }));

  document.getElementById("add-formation").addEventListener("click", () =>
    simpleForm("Add formation", [
      { id: "name", label: "Name", placeholder: "e.g. Aberlady Formation" },
      { id: "description", label: "Description", type: "textarea" },
    ], async (vals) => {
      if (!vals.name) { toast("Formation needs a name"); return false; }
      await api(`/sites/${id}/formations`, j(vals)); toast("Formation added"); showDetail(id); return true;
    }));

  const photoInput = document.getElementById("photo-input");
  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    toast("Uploading photo…");
    try { await api(`/sites/${id}/photos`, { method: "POST", body: fd }); toast("Photo added"); showDetail(id); }
    catch (e) { toast(`Upload failed: ${e.message}`); }
    finally { photoInput.value = ""; }
  });
  document.getElementById("add-photo").addEventListener("click", () => {
    // Two ways to add a photo: upload a file, or hot-link a photo already
    // online (e.g. BGS GeoScenic, Geograph). URL photos only show when online.
    photoChoice(
      () => photoInput.click(),
      () => simpleForm("Add photo by URL", [
        { id: "url", label: "Image URL", placeholder: "https://…/photo.jpg" },
        { id: "caption", label: "Caption", placeholder: "optional" },
      ], async (vals) => {
        if (!vals.url) { toast("Need an image URL"); return false; }
        await api(`/sites/${id}/photo-url`, j({ url: vals.url, caption: vals.caption || "" }));
        toast("Photo added"); showDetail(id); return true;
      })
    );
  });

  document.getElementById("add-link").addEventListener("click", () =>
    simpleForm("Add link", [
      { id: "title", label: "Title", placeholder: "e.g. BGS Lexicon entry" },
      { id: "url", label: "URL", placeholder: "https://…" },
      { id: "note", label: "Note", type: "textarea" },
    ], async (vals) => {
      if (!vals.title || !vals.url) { toast("Link needs a title and URL"); return false; }
      await api(`/sites/${id}/links`, j(vals)); toast("Link added"); showDetail(id); return true;
    }));

  const docInput = document.getElementById("document-input");
  document.getElementById("add-document").addEventListener("click", () => docInput.click());
  docInput.addEventListener("change", async () => {
    const file = docInput.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name);
    toast("Uploading document…");
    try { await api(`/sites/${id}/documents`, { method: "POST", body: fd }); toast("Document added"); showDetail(id); }
    catch (e) { toast(`Upload failed: ${e.message}`); }
    docInput.value = "";
  });

  document.getElementById("delete-site").addEventListener("click", () => {
    confirmDialog(`Delete “${site.name}”?`, "This removes the site, its samples, formations and photos. This can’t be undone.", async () => {
      await api(`/sites/${id}`, { method: "DELETE" }); toast("Site deleted"); showList();
    });
  });
}

function geoCard(kind, tag, unit, empty) {
  const cls = kind === "Surface" ? "geo-card-surface" : "geo-card-bedrock";
  if (!unit || !unit.name) {
    return `<div class="geo-card ${cls}"><div class="geo-kind">${kind}</div><div class="geo-name" style="font-size:15px;font-family:var(--font-body);font-weight:600">${esc(tag)}</div><p class="geo-empty">${empty}</p></div>`;
  }
  const meta = [];
  if (unit.age) meta.push(`<div><dt>Age</dt><dd>${esc(unit.age)}</dd></div>`);
  if (unit.lithology && unit.lithology !== unit.name) meta.push(`<div><dt>Lithology</dt><dd>${esc(unit.lithology)}</dd></div>`);
  return `<div class="geo-card ${cls}">
      <div class="geo-kind">${kind} · ${esc(tag)}</div>
      <div class="geo-name">${esc(unit.name)}</div>
      ${meta.length ? `<dl class="geo-meta">${meta.join("")}</dl>` : ""}
    </div>`;
}

// Decode a site's BGS result into plain language using the knowledge base.
function explainerHtml(site) {
  const g = site.geology || {};
  const bed = g.bedrock || {}, sup = g.superficial || {};
  const text = [bed.name, bed.lithology, sup.name, sup.lithology].filter(Boolean).join(" ");
  if (!text) return ""; // nothing fetched yet (e.g. unsynced offline site)
  const terms = window.KB.matchGlossary(text);
  const region = nearestRegion(site.lat, site.lon);
  if (!terms.length && !region) return "";

  let inner = `<div class="section-head"><h3>What this means</h3></div>`;
  if (terms.length) {
    inner += `<dl class="explain-terms">` + terms.slice(0, 5).map((t) =>
      `<div><dt>${esc(t.term)}</dt><dd>${esc(t.def)}</dd></div>`).join("") + `</dl>`;
  }
  if (region) {
    inner += `<p class="explain-region">This point sits in the <button class="link-btn" data-region="${esc(region.id)}">${esc(region.name)}</button> region. <span class="explain-region-blurb">${esc(region.blurb)}</span></p>`;
  }
  inner += `<p class="explain-foot"><button class="link-btn" id="explain-glossary">Open the full glossary →</button></p>`;
  return `<section class="section explain">${inner}</section>`;
}

// Crude nearest-region by bounding latitude/longitude bands — good enough to
// point the reader at the right regional chapter. Not a substitute for the
// real geological boundaries, just a helpful "you're roughly here".
function nearestRegion(lat, lon) {
  const R = window.KB.regions.reduce((m, r) => (m[r.id] = r, m), {});
  if (lat >= 59.5) return R["orkney-shetland"];      // Shetland
  if (lat >= 58.7 && lon > -4.5) return R["orkney-shetland"]; // Orkney
  if (lon <= -6.0) return R["hebrides"];             // Western Isles / inner Hebrides
  if (lat >= 57.0 && lon <= -3.9) return R["northern-highlands"];
  if (lat >= 56.3) return R["grampian-argyll"];
  if (lat >= 55.6) return R["midland-valley"];
  return R["southern-uplands"];
}

function renderSamples(site) {
  const box = document.getElementById("samples");
  if (!site.samples.length) { box.innerHTML = `<p class="row-empty">No samples recorded.</p>`; return; }
  box.innerHTML = "";
  site.samples.forEach((s) => {
    const row = el(`<div class="row">
      <div class="row-main">
        <div class="row-title">${esc(s.label)}</div>
        ${s.rock_type ? `<div class="row-sub">${esc(s.rock_type)}</div>` : ""}
        ${s.notes ? `<div class="row-note">${esc(s.notes)}</div>` : ""}
      </div>
      <button class="btn btn-sm btn-danger">Delete</button>
    </div>`);
    row.querySelector("button").addEventListener("click", async () => {
      await api(`/samples/${s.id}`, { method: "DELETE" }); toast("Sample removed"); showDetail(site.id);
    });
    box.appendChild(row);
  });
}

function renderFormations(site) {
  const box = document.getElementById("formations");
  if (!site.formations.length) { box.innerHTML = `<p class="row-empty">No formations recorded.</p>`; return; }
  box.innerHTML = "";
  site.formations.forEach((f) => {
    const row = el(`<div class="row">
      <div class="row-main">
        <div class="row-title">${esc(f.name)}</div>
        ${f.description ? `<div class="row-note">${esc(f.description)}</div>` : ""}
      </div>
      <button class="btn btn-sm btn-danger">Delete</button>
    </div>`);
    row.querySelector("button").addEventListener("click", async () => {
      await api(`/formations/${f.id}`, { method: "DELETE" }); toast("Formation removed"); showDetail(site.id);
    });
    box.appendChild(row);
  });
}

function renderPhotos(site) {
  const box = document.getElementById("photos");
  if (!site.photos.length) { box.innerHTML = `<p class="row-empty">No photos yet.</p>`; return; }
  box.innerHTML = "";
  site.photos.forEach((p) => {
    // File photos are served by the backend; URL photos hot-link the remote
    // image directly (only visible online, by design).
    const isUrl = !!p.url && !p.filename;
    const src = isUrl ? p.url : `${API}/photos/${p.id}/file`;
    const cap = p.caption || p.original || "";
    const source = isUrl
      ? `<a class="photo-src" href="${esc(p.url)}" target="_blank" rel="noopener">source ↗</a>`
      : "";
    const card = el(`<figure class="photo">
      <button class="photo-del" title="Delete photo">×</button>
      <img src="${esc(src)}" alt="${esc(cap)}" loading="lazy" referrerpolicy="no-referrer" />
      ${(cap || source) ? `<figcaption class="cap">${esc(cap)} ${source}</figcaption>` : ""}
    </figure>`);
    card.querySelector(".photo-del").addEventListener("click", async () => {
      await api(`/photos/${p.id}`, { method: "DELETE" }); toast("Photo removed"); showDetail(site.id);
    });
    box.appendChild(card);
  });
}

function renderLinks(site) {
  const box = document.getElementById("links");
  const links = site.links || [];
  if (!links.length) { box.innerHTML = `<p class="row-empty">No links yet.</p>`; return; }
  box.innerHTML = "";
  links.forEach((l) => {
    const row = el(`<div class="row">
      <div class="row-main">
        <div class="row-title"><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.title)}</a></div>
        <div class="row-sub row-link-url">${esc(l.url)}</div>
        ${l.note ? `<div class="row-note">${esc(l.note)}</div>` : ""}
      </div>
      <button class="btn btn-sm btn-danger">Delete</button>
    </div>`);
    row.querySelector("button").addEventListener("click", async () => {
      await api(`/site-resources/${l.id}`, { method: "DELETE" }); toast("Link removed"); showDetail(site.id);
    });
    box.appendChild(row);
  });
}

function renderDocuments(site) {
  const box = document.getElementById("documents");
  const docs = site.documents || [];
  if (!docs.length) { box.innerHTML = `<p class="row-empty">No documents yet.</p>`; return; }
  box.innerHTML = "";
  docs.forEach((d) => {
    // relative URL — prefix-safe, like photo files
    const href = `${API}/site-resources/${d.id}/file`;
    const row = el(`<div class="row">
      <div class="row-main">
        <div class="row-title"><a href="${href}" target="_blank" rel="noopener noreferrer">${esc(d.title || d.original)}</a></div>
        ${d.original && d.original !== d.title ? `<div class="row-sub">${esc(d.original)}</div>` : ""}
        ${d.note ? `<div class="row-note">${esc(d.note)}</div>` : ""}
      </div>
      <button class="btn btn-sm btn-danger">Delete</button>
    </div>`);
    row.querySelector("button").addEventListener("click", async () => {
      await api(`/site-resources/${d.id}`, { method: "DELETE" }); toast("Document removed"); showDetail(site.id);
    });
    box.appendChild(row);
  });
}

function editNotes(site) {
  simpleForm("Edit notes", [
    { id: "notes", label: "Notes", type: "textarea", value: site.notes },
  ], async (vals) => {
    await api(`/sites/${site.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: vals.notes }) });
    toast("Notes saved"); showDetail(site.id); return true;
  });
}

// generic small modal form
function simpleForm(title, fields, onSubmit) {
  const fieldHtml = fields.map((f) => {
    if (f.html !== undefined) {
      return `<div class="field"><label>${esc(f.label)}</label>${f.html}</div>`;
    }
    const v = esc(f.value ?? "");
    const input = f.type === "textarea"
      ? `<textarea id="sf-${f.id}" placeholder="${esc(f.placeholder ?? "")}">${v}</textarea>`
      : `<input id="sf-${f.id}" autocomplete="off" placeholder="${esc(f.placeholder ?? "")}" value="${v}" />`;
    return `<div class="field"><label for="sf-${f.id}">${esc(f.label)}</label>${input}</div>`;
  }).join("");
  const m = el(`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>${esc(title)}</h2></div>
      <div class="modal-body">${fieldHtml}
        <div class="modal-actions">
          <button class="btn btn-ghost" id="sf-cancel" type="button">Cancel</button>
          <button class="btn btn-primary" id="sf-save" type="button">Save</button>
        </div>
      </div></div></div>`);
  document.body.appendChild(m);
  const close = () => m.remove();
  m.addEventListener("click", (e) => { if (e.target === m) close(); });
  m.querySelector("#sf-cancel").addEventListener("click", close);
  const first = m.querySelector("input, textarea"); if (first) first.focus();
  m.querySelector("#sf-save").addEventListener("click", async () => {
    const vals = {};
    fields.forEach((f) => {
      if (f.html !== undefined) return;            // non-input field, no value
      const node = m.querySelector(`#sf-${f.id}`);
      if (node) vals[f.id] = node.value.trim();
    });
    try { const ok = await onSubmit(vals, m); if (ok !== false) close(); }
    catch (e) { toast(`Failed: ${e.message}`); }
  });
}

function confirmDialog(title, body, onYes) {
  const m = el(`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>${esc(title)}</h2><p>${esc(body)}</p></div>
      <div class="modal-body"><div class="modal-actions">
        <button class="btn btn-ghost" id="c-no" type="button">Cancel</button>
        <button class="btn btn-danger" id="c-yes" type="button">Delete</button>
      </div></div></div></div>`);
  document.body.appendChild(m);
  const close = () => m.remove();
  m.addEventListener("click", (e) => { if (e.target === m) close(); });
  m.querySelector("#c-no").addEventListener("click", close);
  m.querySelector("#c-yes").addEventListener("click", async () => {
    try { await onYes(); close(); } catch (e) { toast(`Failed: ${e.message}`); }
  });
}

// Small chooser shown when adding a photo: upload a file, or link a URL.
function photoChoice(onFile, onUrl) {
  const m = el(`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head"><h2>Add photo</h2></div>
      <div class="modal-body">
        <div class="modal-actions" style="flex-direction:column;align-items:stretch;gap:.5rem">
          <button class="btn btn-primary" id="pc-file" type="button">Upload a file</button>
          <button class="btn btn-ghost" id="pc-url" type="button">Add by URL</button>
          <button class="btn btn-ghost" id="pc-cancel" type="button">Cancel</button>
        </div>
      </div></div></div>`);
  document.body.appendChild(m);
  const close = () => m.remove();
  m.addEventListener("click", (e) => { if (e.target === m) close(); });
  m.querySelector("#pc-cancel").addEventListener("click", close);
  m.querySelector("#pc-file").addEventListener("click", () => { close(); onFile(); });
  m.querySelector("#pc-url").addEventListener("click", () => { close(); onUrl(); });
}

// ---- offline sync bar ----
async function refreshSyncBar() {
  const bar = document.getElementById("sync-bar");
  const status = document.getElementById("sync-status");
  if (!bar || !window.GeolasQueue) return;
  const n = await window.GeolasQueue.totalPending();
  if (n === 0 && navigator.onLine) { bar.hidden = true; return; }
  bar.hidden = false;
  const btn = document.getElementById("sync-now-btn");
  if (n === 0) {
    status.textContent = navigator.onLine ? "" : "Offline — new entries will be saved on this device";
    btn.hidden = true;
    if (navigator.onLine) bar.hidden = true;
    return;
  }
  const bytes = await window.GeolasQueue.pendingBytes();
  const mb = bytes > 0 ? ` · ${(bytes / 1048576).toFixed(1)} MB` : "";
  status.textContent = `${n} item${n === 1 ? "" : "s"} waiting to sync${mb}`
    + (navigator.onLine ? "" : " · offline");
  btn.hidden = !navigator.onLine; // can only sync when there's signal
}

async function doSync() {
  const btn = document.getElementById("sync-now-btn");
  const status = document.getElementById("sync-status");
  btn.disabled = true;
  const result = await window.GeolasQueue.syncAll(API, (done, total) => {
    status.textContent = `Syncing ${done}/${total}…`;
  });
  btn.disabled = false;
  if (result.failed === 0) {
    toast(`Synced ${result.done} site${result.done === 1 ? "" : "s"}`);
  } else {
    toast(`Synced ${result.done}, ${result.failed} failed — will retry`);
    console.warn("sync errors:", result.errors);
  }
  await refreshSyncBar();
  showList();
}

document.getElementById("sync-now-btn").addEventListener("click", doSync);
window.addEventListener("online", refreshSyncBar);
window.addEventListener("offline", refreshSyncBar);

// =========================================================================
//  LIBRARY VIEW  (by area / process / time / people / resources)
// =========================================================================
function setNav(which) {
  document.getElementById("nav-notebook").classList.toggle("nav-active", which === "notebook");
  document.getElementById("nav-library").classList.toggle("nav-active", which === "library");
}

let libraryTab = "area";

function showLibrary(tab) {
  if (tab) libraryTab = tab;
  setNav("library");
  map = null; // leaving the notebook map behind
  const tabs = [
    ["area", "By area"], ["process", "Glossary"], ["time", "By time"],
    ["people", "People"], ["guides", "Guides"], ["processes", "Processes"],
    ["resources", "Media & links"],
  ];
  view.innerHTML = `
    <div class="lib-head">
      <h2>Geology library</h2>
      <p class="lib-sub">Scotland's geological story — browse by area or through time, look up terms in the glossary, and keep links and resources for each geological process. Tap any classic site on the notebook map to log it.</p>
    </div>
    <div class="lib-tabs">
      ${tabs.map(([k, label]) =>
        `<button class="lib-tab${k === libraryTab ? " lib-tab-active" : ""}" data-tab="${k}">${label}</button>`).join("")}
    </div>
    <div id="lib-body"></div>
  `;
  view.querySelectorAll(".lib-tab").forEach((b) =>
    b.addEventListener("click", () => showLibrary(b.dataset.tab)));
  renderLibraryTab(libraryTab);
  window.scrollTo(0, 0);
}

function renderLibraryTab(tab) {
  const body = document.getElementById("lib-body");
  if (tab === "area") body.innerHTML = libAreaHtml();
  else if (tab === "process") body.innerHTML = libProcessHtml();
  else if (tab === "time") body.innerHTML = libTimeHtml();
  else if (tab === "people") body.innerHTML = libPeopleHtml();
  else if (tab === "guides") body.innerHTML = libGuidesHtml();
  else if (tab === "processes") { renderProcessResourcesTab(); return; }
  else if (tab === "resources") { renderResourcesTab(); return; }
  // wire region expanders
  body.querySelectorAll(".region-card").forEach((card) =>
    card.querySelector(".region-toggle")?.addEventListener("click", () =>
      card.classList.toggle("open")));
}

function libAreaHtml() {
  return `<div class="region-list">` + window.KB.regions.map((r) => `
    <div class="region-card">
      <button class="region-toggle">
        <span class="region-name">${esc(r.name)}</span>
        <span class="region-blurb">${esc(r.blurb)}</span>
      </button>
      <div class="region-detail">
        ${r.story.map((p) => `<p>${esc(p)}</p>`).join("")}
        <a class="lib-source" href="${esc(r.source)}" target="_blank" rel="noopener noreferrer">Read more at the Scottish Geology Trust →</a>
      </div>
    </div>`).join("") + `</div>`;
}

function libProcessHtml() {
  return Object.entries(window.KB.glossary).map(([cluster, terms]) => `
    <section class="gloss-cluster">
      <h3 class="gloss-h">${esc(cluster)}</h3>
      <dl class="gloss-list">
        ${terms.map((t) => `<div class="gloss-row"><dt>${esc(t.term)}</dt><dd>${esc(t.def)}</dd></div>`).join("")}
      </dl>
    </section>`).join("") +
    `<p class="lib-source-foot">Definitions paraphrased from the <a href="https://www.scottishgeologytrust.org/geology/resources/glossary/" target="_blank" rel="noopener noreferrer">Scottish Geology Trust glossary</a>.</p>`;
}

function libTimeHtml() {
  return `<div class="time-scale">` + window.KB.timescale.map((era) => `
    <div class="era">
      <div class="era-head"><span class="era-name">${esc(era.era)}</span><span class="era-span">${esc(era.span)}</span></div>
      <div class="period-list">
        ${era.periods.map((p) => `
          <div class="period">
            <div class="period-top"><span class="period-name">${esc(p.name)}</span><span class="period-span">${esc(p.span)}</span></div>
            <p class="period-note">${esc(p.note)}</p>
          </div>`).join("")}
      </div>
    </div>`).join("") + `</div>
    <p class="lib-source-foot">Timescale from the <a href="https://www.scottishgeologytrust.org/geology/scotlands-geology/geological-timescale/" target="_blank" rel="noopener noreferrer">Scottish Geology Trust</a>. Ma = millions of years ago.</p>`;
}

function libPeopleHtml() {
  return `<div class="people-list">` + window.KB.people.map((p) => `
    <div class="person">
      <div class="person-top"><span class="person-name">${esc(p.name)}</span><span class="person-dates">${esc(p.dates)}</span></div>
      <p class="person-note">${esc(p.note)}</p>
      <a class="lib-source" href="${esc(window.KB.peopleSource + p.slug + "/")}" target="_blank" rel="noopener noreferrer">Biography →</a>
    </div>`).join("") + `</div>`;
}

// =========================================================================
//  GUIDES  (read-only, browse by area — nested inline-expanding list)
//  Bundled curated resources only, from KB.resourceLibrary (tagged regions[]).
//  Tapping an area expands its guides inline; each row shows the locality
//  (area) and the resource type. No add, no delete, no DB writes.
// =========================================================================
const RES_TYPE_LABEL = {
  "pdf-booklet": "PDF booklet",
  "excursion-guide": "Excursion guide",
  "leaflet": "Leaflet",
  "web-page": "Web page",
  "video": "Video",
};

function libGuidesHtml() {
  const lib = window.KB.resourceLibrary || [];
  const groups = window.KB.regions.map((r) => ({
    name: r.name,
    items: lib.filter((e) => (e.regions || []).includes(r.id)),
  }));
  return `
    <p class="lib-sub res-axis-sub">Curated field guides, booklets and leaflets, grouped by area. Tap an area to see its guides; each opens its publisher's page or PDF.</p>
    <div class="region-list">
      ${groups.map((g) => guideRegionCard(g)).join("")}
    </div>
    <p class="lib-source-foot">Curated guides from the Scottish Geology Trust (SNH/BGS booklets), Edinburgh, Aberdeen &amp; Glasgow geological societies. Descriptions are paraphrased; each guide links to its publisher's original.</p>`;
}

// One area card: an inline-expanding list of the curated guides tagged to it.
function guideRegionCard(g) {
  const n = g.items.length;
  const rows = g.items.map((e) => libResRow(e)).join("");
  return `
    <div class="region-card">
      <button class="region-toggle" ${n ? "" : "disabled"}>
        <span class="region-name">${esc(g.name)}</span>
        <span class="region-blurb">${n} ${n === 1 ? "guide" : "guides"}</span>
      </button>
      <div class="region-detail">
        <ul class="res-list">${rows}</ul>
      </div>
    </div>`;
}

// A bundled curated resource row: title, area + type + source sub-label, no delete.
function libResRow(e) {
  const bits = [];
  if (e.area) bits.push(e.area);
  if (RES_TYPE_LABEL[e.type]) bits.push(RES_TYPE_LABEL[e.type]);
  if (e.source) bits.push(e.source);
  const sub = bits.join(" \u00b7 ");
  return `<li class="res-item">
      <a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">
        <span class="res-t">${esc(e.title)}</span>
        <span class="res-s">${esc(sub)}</span>
        <span class="res-d">${esc(e.desc || "")}</span>
      </a>
    </li>`;
}

// =========================================================================
//  PROCESSES  (Stage 2: editable; resources tagged to geological processes)
//  Global (not per-site), category-free. Bundled starter resources from
//  KB.processLibrary are fixed; the user's own (from /api/process-resources,
//  or queued offline) merge in under each matching process, marked "yours"
//  and removable. A resource can appear under several processes.
// =========================================================================
async function renderProcessResourcesTab() {
  const body = document.getElementById("lib-body");
  body.innerHTML = `<div class="loading"><div class="strata-spin"><span></span><span></span><span></span><span></span></div>Loading resources\u2026</div>`;

  let mine = [];
  try {
    if (navigator.onLine) mine = await api("/process-resources");
  } catch (e) { /* offline or error — fall back to queued only */ }
  let queued = [];
  try { queued = await window.GeolasQueue.listProcessResources(); } catch (e) {}

  const bundled = window.KB.processLibrary || [];
  const inProc = (item, key) => (item.processes || []).includes(key);

  body.innerHTML = window.KB.processes.map((p) => {
    const fixed = bundled.filter((i) => inProc(i, p.key)).map((i) =>
      resRow(i.title, i.url, i.note, null, false));
    const saved = mine.filter((m) => inProc(m, p.key)).map((m) =>
      resRow(m.title, m.url, m.note, m.id, true, false, true));
    const pend = queued.filter((q) => inProc(q, p.key)).map((q) =>
      resRow(q.title, q.url, q.note, null, true, true));
    const rows = fixed.join("") + saved.join("") + pend.join("");
    return `
      <section class="res-block">
        <div class="res-block-head">
          <h3 class="res-h">${esc(p.label)}</h3>
          <button class="btn btn-sm btn-ghost proc-add" data-key="${p.key}" data-label="${esc(p.label)}">+ Add</button>
        </div>
        <ul class="res-list">${rows || `<li class="res-empty">No resources yet — tap “+ Add”.</li>`}</ul>
      </section>`;
  }).join("") +
  `<p class="lib-source-foot">Starter resources point to the British Geological Survey and Scottish Geology Trust; descriptions are paraphrased. Resources marked \u201cyours\u201d are your own additions and can be tagged to more than one process.</p>`;

  body.querySelectorAll(".proc-add").forEach((b) =>
    b.addEventListener("click", () => openProcessResourceForm(b.dataset.key, b.dataset.label)));
  body.querySelectorAll(".res-del").forEach((b) =>
    b.addEventListener("click", () => deleteProcessResource(parseInt(b.dataset.id, 10))));
}

function openProcessResourceForm(presetKey, label) {
  const checks = window.KB.processes.map((p) =>
    `<label class="proc-check"><input type="checkbox" name="proc" value="${p.key}"${p.key === presetKey ? " checked" : ""}> ${esc(p.label)}</label>`
  ).join("");
  simpleForm(`Add a ${label} resource`, [
    { id: "title", label: "Title" },
    { id: "url", label: "URL (https://…)" },
    { id: "note", label: "Note (optional)" },
    { id: "_procs", label: "Processes", html: `<div class="proc-checks">${checks}</div>` },
  ], async (vals, formEl) => {
    const title = (vals.title || "").trim();
    const url = (vals.url || "").trim();
    if (!title) { toast("Please give the resource a title"); return false; }
    if (!/^https?:\/\//i.test(url)) { toast("URL must start with http:// or https://"); return false; }
    const processes = Array.from(
      formEl.querySelectorAll('input[name="proc"]:checked')).map((c) => c.value);
    if (!processes.length) { toast("Pick at least one process"); return false; }
    const payload = { title, url, note: (vals.note || "").trim(), processes };
    try {
      if (navigator.onLine) {
        await api("/process-resources", { method: "POST", body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" } });
        toast("Resource added");
      } else {
        await window.GeolasQueue.enqueueProcessResource(payload);
        toast("Saved — will sync when online");
      }
    } catch (e) {
      await window.GeolasQueue.enqueueProcessResource(payload);
      toast("Saved offline — will sync later");
    }
    await refreshSyncBar();
    renderProcessResourcesTab();
    return true;
  });
}

function deleteProcessResource(id) {
  confirmDialog("Remove this resource?", "This removes your saved resource. The bundled starter resources can't be removed.", async () => {
    try {
      await api(`/process-resources/${id}`, { method: "DELETE" });
      toast("Resource removed");
      renderProcessResourcesTab();
    } catch (e) { toast("Couldn't remove: " + e.message); }
  });
}

// =========================================================================
//  MEDIA & LINKS  (editable; restored to its pre-Guides three-category form)
//  Bundled SGT links are fixed; the user's own links (from /api/resources, or
//  queued offline) merge into the same three categories, marked "yours" and
//  removable. Falls back to the offline queue when the network is down.
// =========================================================================
const RES_CATEGORIES = [
  { key: "websites", label: "Useful websites", bundled: "websites" },
  { key: "societies", label: "Geological societies", bundled: "societies" },
  { key: "videos", label: "Videos", bundled: "videos" },
];

async function renderResourcesTab() {
  const body = document.getElementById("lib-body");
  body.innerHTML = `<div class="loading"><div class="strata-spin"><span></span><span></span><span></span><span></span></div>Loading links\u2026</div>`;

  // user links: from the server if online, plus anything still queued offline
  let mine = [];
  try {
    if (navigator.onLine) mine = await api("/resources");
  } catch (e) { /* offline or error — fall back to queued only */ }
  let queued = [];
  try { queued = await window.GeolasQueue.listResources(); } catch (e) {}

  const bundled = window.KB.resources;
  body.innerHTML = RES_CATEGORIES.map((cat) => {
    const fixed = (bundled[cat.bundled] || []).map((i) =>
      resRow(i.t, i.u, i.s, null, false));
    const saved = mine.filter((m) => m.category === cat.key).map((m) =>
      resRow(m.title, m.url, m.note, m.id, true));
    const pend = queued.filter((q) => q.category === cat.key).map((q) =>
      resRow(q.title, q.url, q.note, null, true, true));
    return `
      <section class="res-block">
        <div class="res-block-head">
          <h3 class="res-h">${esc(cat.label)}</h3>
          <button class="btn btn-sm btn-ghost res-add" data-cat="${cat.key}" data-label="${esc(cat.label)}">+ Add</button>
        </div>
        <ul class="res-list">${fixed.join("") + saved.join("") + pend.join("")}</ul>
      </section>`;
  }).join("") +
  `<p class="lib-source-foot">Starter links from the <a href="https://www.scottishgeologytrust.org/geology/resources/online-resources/" target="_blank" rel="noopener noreferrer">Scottish Geology Trust</a>. Links marked \u201cyours\u201d are your own additions.</p>`;

  // wire add buttons
  body.querySelectorAll(".res-add").forEach((b) =>
    b.addEventListener("click", () => openResourceForm(b.dataset.cat, b.dataset.label)));
  // wire delete buttons (server-backed only)
  body.querySelectorAll(".res-del").forEach((b) =>
    b.addEventListener("click", () => deleteResource(parseInt(b.dataset.id, 10))));
}

function resRow(title, url, sub, id, mine, pending) {
  const badge = pending ? `<span class="res-mine res-pending">not synced</span>`
              : mine ? `<span class="res-mine">yours</span>` : "";
  const del = (mine && id) ? `<button class="res-del" data-id="${id}" title="Remove this link" aria-label="Remove">×</button>` : "";
  return `<li class="res-item${mine ? " res-item-mine" : ""}">
      <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">
        <span class="res-t">${esc(title)}${badge}</span>
        ${sub ? `<span class="res-s">${esc(sub)}</span>` : ""}
      </a>${del}
    </li>`;
}

function openResourceForm(category, label) {
  simpleForm(`Add to ${label}`, [
    { id: "title", label: "Title" },
    { id: "url", label: "URL (https://…)" },
    { id: "note", label: "Note (optional)" },
  ], async (vals) => {
    const title = (vals.title || "").trim();
    const url = (vals.url || "").trim();
    if (!title) { toast("Please give the link a title"); return false; }
    if (!/^https?:\/\//i.test(url)) { toast("URL must start with http:// or https://"); return false; }
    const payload = { category, title, url, note: (vals.note || "").trim() };
    try {
      if (navigator.onLine) {
        await api("/resources", { method: "POST", body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" } });
        toast("Link added");
      } else {
        await window.GeolasQueue.enqueueResource(payload);
        toast("Saved — will sync when online");
      }
    } catch (e) {
      // network failed mid-request: queue it
      await window.GeolasQueue.enqueueResource(payload);
      toast("Saved offline — will sync later");
    }
    await refreshSyncBar();
    renderResourcesTab();
    return true;
  });
}

function deleteResource(id) {
  confirmDialog("Remove this link?", "This removes your saved link. The bundled Scottish Geology Trust links can't be removed.", async () => {
    try {
      await api(`/resources/${id}`, { method: "DELETE" });
      toast("Link removed");
      renderResourcesTab();
    } catch (e) { toast("Couldn't remove: " + e.message); }
  });
}

// nav handlers
document.getElementById("nav-notebook").addEventListener("click", () => { setNav("notebook"); showList(); });
document.getElementById("nav-library").addEventListener("click", () => showLibrary());
document.getElementById("brand-home").addEventListener("click", () => { setNav("notebook"); showList(); });
document.getElementById("brand-home").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { setNav("notebook"); showList(); }
});

// ---- boot ----
document.getElementById("new-site-btn").addEventListener("click", () => {
  setNav("notebook");
  if (!map) { showList().then(() => { armAddMode(); openSiteForm(); }); }
  else { armAddMode(); openSiteForm(); }
});

refreshSyncBar();
showList();
