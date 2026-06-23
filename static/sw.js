/* Geòlas service worker.
   Strategy:
   - APP SHELL (html/css/js/leaflet/icons): cache-first, so the app launches
     with no signal. Bumped by changing CACHE_VERSION on each deploy.
   - MAP TILES (tile.openstreetmap.org): cache-first into a separate, capped
     cache, so a region you've viewed is available offline.
   - API (/api/...): network-first, falling back to cache for GETs so you can
     read previously-loaded sites offline. Never caches mutations.

   PREFIX NOTE: this app may be served at /geolas/. The service worker is
   registered with a scope derived at runtime, and all shell URLs here are
   RELATIVE to the SW's own location, so it works at / or /geolas/ alike.
*/

const CACHE_VERSION = "geolas-v12";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const API_CACHE = `${CACHE_VERSION}-api`;
// Tile cache is deliberately NOT version-stamped: a code deploy must not wipe
// map areas the user downloaded for offline field use. It persists across
// versions and is only trimmed by size (or cleared by the user).
const TILE_CACHE = "geolas-tiles";
const MAX_TILES = 5000; // allow real offline areas (street-level download)

// Shell files, relative to the SW scope.
const SHELL = [
  "",                    // the start_url (directory index)
  "index.html",
  "deep-time.html",
  "app.js",
  "styles.css",
  "reference-sites.js",
  "knowledge-base.js",
  "offline-queue.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "vendor/leaflet.js",
  "vendor/leaflet.css",
  "vendor/react.production.min.js",
  "vendor/react-dom.production.min.js",
  "vendor/babel.min.js",
  "vendor/images/layers.png",
  "vendor/images/layers-2x.png",
  "vendor/images/marker-icon.png",
  "vendor/images/marker-icon-2x.png",
  "vendor/images/marker-shadow.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => null)
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          // delete old VERSIONED caches, but never the persistent tile cache
          .filter((k) => k !== TILE_CACHE && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isTileRequest(url) {
  return url.hostname.endsWith("tile.openstreetmap.org");
}

async function trimTileCache() {
  const cache = await caches.open(TILE_CACHE);
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) {
    // FIFO-ish: delete the oldest overflow.
    const remove = keys.length - MAX_TILES;
    for (let i = 0; i < remove; i++) await cache.delete(keys[i]);
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET; mutations always go straight to network.
  if (req.method !== "GET") return;

  // Map tiles: cache-first into the capped tile cache.
  if (isTileRequest(url)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const resp = await fetch(req);
          // Tiles are cross-origin: a normal <img> load or a no-cors prefetch
          // yields an OPAQUE response (status 0, ok=false). Cache those too —
          // otherwise nothing would ever be stored and offline maps wouldn't work.
          if (resp.ok || resp.type === "opaque") { cache.put(req, resp.clone()); trimTileCache(); }
          return resp;
        } catch (e) {
          return hit || Response.error();
        }
      })
    );
    return;
  }

  // API GETs: network-first, fall back to cache (read sites offline).
  if (url.pathname.includes("/api/")) {
    event.respondWith(
      (async () => {
        try {
          const resp = await fetch(req);
          if (resp.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(req, resp.clone());
          }
          return resp;
        } catch (e) {
          const cached = await caches.match(req);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ detail: "offline", offline: true }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        }
      })()
    );
    return;
  }

  // Everything else (the shell): cache-first, fall back to network.
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).catch(() => {
      // Last resort for navigations: serve the cached index.
      if (req.mode === "navigate") return caches.match("index.html");
      return Response.error();
    }))
  );
});
