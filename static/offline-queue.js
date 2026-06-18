/* Geòlas offline queue.
   When the network is down, new sites (and their photos) are written here to
   IndexedDB with a client-generated UUID and a "pending" flag, and shown in the
   UI immediately. On "Sync now", each queued item is POSTed to the Pi; the
   backend de-dupes on client_uuid so a retry can't create duplicates. Geology
   is fetched by the server at sync time (the phone can't reach BGS offline),
   so a synced site's rock identification fills in once it lands.

   This module is plain (non-module) JS so app.js (a module) and the rest can
   use it via window.GeolasQueue. All storage is local to the browser.
*/
(function () {
  const DB_NAME = "geolas-offline";
  const DB_VERSION = 2;
  const STORE = "pending_sites";
  const RES_STORE = "pending_resources";

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "client_uuid" });
        }
        if (!db.objectStoreNames.contains(RES_STORE)) {
          db.createObjectStore(RES_STORE, { keyPath: "client_uuid" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // tx(store, mode, fn) — operate on a named object store.
  async function tx(storeName, mode, fn) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeName, mode);
      const store = t.objectStore(storeName);
      let result;
      Promise.resolve(fn(store)).then((r) => { result = r; });
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // Photos are stored as Blobs inside the queued record. IndexedDB handles
  // Blobs natively, so a multi-MB field photo survives a browser restart.
  async function enqueueSite({ name, lat, lon, notes, fetch_geology, photos }) {
    const rec = {
      client_uuid: uuid(),
      name, lat, lon, notes: notes || "",
      fetch_geology: fetch_geology !== false,
      photos: photos || [],          // [{blob, filename, caption}]
      created_at: Date.now(),
      status: "pending",
    };
    await tx(STORE, "readwrite", (store) => store.put(rec));
    return rec;
  }

  async function list() {
    return tx(STORE, "readonly", (store) =>
      new Promise((res) => {
        const out = [];
        store.openCursor().onsuccess = (e) => {
          const cur = e.target.result;
          if (cur) { out.push(cur.value); cur.continue(); }
          else res(out.sort((a, b) => a.created_at - b.created_at));
        };
      })
    );
  }

  async function remove(client_uuid) {
    return tx(STORE, "readwrite", (store) => store.delete(client_uuid));
  }

  async function count() {
    return (await list()).length;
  }

  async function pendingBytes() {
    const items = await list();
    let bytes = 0;
    for (const it of items)
      for (const p of it.photos || []) bytes += (p.blob && p.blob.size) || 0;
    return bytes;
  }

  // Sync a single queued site: create it (idempotent on client_uuid), then
  // upload its photos to the returned site id. Returns the created site.
  async function syncOne(apiBase, rec) {
    const createResp = await fetch(`${apiBase}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: rec.name, lat: rec.lat, lon: rec.lon,
        notes: rec.notes, fetch_geology: rec.fetch_geology,
        client_uuid: rec.client_uuid,
      }),
    });
    if (!createResp.ok) throw new Error(`create failed (${createResp.status})`);
    const site = await createResp.json();

    // Upload any queued photos. If the site was de-duplicated (already synced
    // on a previous attempt) we still try the photos; duplicate photos are a
    // lesser evil than lost ones, and a half-finished sync should complete.
    for (const p of rec.photos || []) {
      const fd = new FormData();
      fd.append("file", p.blob, p.filename || "photo.jpg");
      fd.append("caption", p.caption || "");
      const pr = await fetch(`${apiBase}/sites/${site.id}/photos`, {
        method: "POST", body: fd,
      });
      if (!pr.ok) throw new Error(`photo upload failed (${pr.status})`);
    }
    return site;
  }

  // ---- resources (user-added library links) ----
  async function enqueueResource({ category, title, url, note }) {
    const rec = {
      client_uuid: uuid(),
      category, title, url, note: note || "",
      created_at: Date.now(),
      status: "pending",
    };
    await tx(RES_STORE, "readwrite", (store) => store.put(rec));
    return rec;
  }

  async function listResources() {
    return tx(RES_STORE, "readonly", (store) =>
      new Promise((res) => {
        const out = [];
        store.openCursor().onsuccess = (e) => {
          const cur = e.target.result;
          if (cur) { out.push(cur.value); cur.continue(); }
          else res(out.sort((a, b) => a.created_at - b.created_at));
        };
      })
    );
  }

  async function removeResource(client_uuid) {
    return tx(RES_STORE, "readwrite", (store) => store.delete(client_uuid));
  }

  // total pending items across both stores (for the sync bar count)
  async function totalPending() {
    const [s, r] = await Promise.all([list(), listResources()]);
    return s.length + r.length;
  }

  // Sync all queued items. Calls onProgress(done, total) as it goes.
  // Removes each from the queue only after it fully succeeds, so a failure
  // mid-way leaves the rest queued for the next attempt.
  async function syncAll(apiBase, onProgress) {
    const sites = await list();
    const resources = await listResources();
    const total = sites.length + resources.length;
    let done = 0, failed = 0;
    const errors = [];

    for (const rec of sites) {
      try {
        await syncOne(apiBase, rec);
        await remove(rec.client_uuid);
        done++;
      } catch (e) {
        failed++;
        errors.push(`${rec.name}: ${e.message}`);
      }
      if (onProgress) onProgress(done + failed, total);
    }

    for (const rec of resources) {
      try {
        const resp = await fetch(`${apiBase}/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: rec.category, title: rec.title, url: rec.url,
            note: rec.note, client_uuid: rec.client_uuid,
          }),
        });
        if (!resp.ok) throw new Error(`create failed (${resp.status})`);
        await removeResource(rec.client_uuid);
        done++;
      } catch (e) {
        failed++;
        errors.push(`${rec.title}: ${e.message}`);
      }
      if (onProgress) onProgress(done + failed, total);
    }

    return { done, failed, total, errors };
  }

  window.GeolasQueue = {
    enqueueSite, list, remove, count, pendingBytes, syncAll, uuid,
    enqueueResource, listResources, removeResource, totalPending,
  };
})();
