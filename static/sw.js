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

const CACHE_VERSION = "geolas-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const TILE_CACHE = `${CACHE_VERSION}-tiles`;
const API_CACHE = `${CACHE_VERSION}-api`;
const MAX_TILES = 600; // rough cap; ~ a few zoom levels of a region

// Shell files, relative to the SW scope.
const SHELL = [
  "",                    // the start_url (directory index)
  "index.html",
  "app.js",
  "styles.css",
  "reference-sites.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "vendor/leaflet.js",
  "vendor/leaflet.css",
  "vendor/images/layers.png",
  "vendor/images/layers-2x.png",
  "vendor/images/marker-icon.png",
  "vendor/images/marker-icon-2x.png",
  "vendor/images/marker-shadow.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // addAll is atomic-ish; if one fails the install fails, so use individual
      // puts that tolerate a missing optional file.
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
          .filter((k) => !k.startsWith(CACHE_VERSION))
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
          if (resp.ok) { cache.put(req, resp.clone()); trimTileCache(); }
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
