const CACHE = "rideshare-public-v1";
const ASSETS = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("rideshare-public-") && key !== CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function tripsResponse() {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch("/api/udhetimet", { cache: "no-store", credentials: "omit" });
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) throw new Error("Përgjigje e pavlefshme");
    const data = await response.json();
    if (!Array.isArray(data.trips) || !data.trips.every((trip) => trip &&
      ["id", "nisja", "destinacioni", "ora", "vendtakimi"].every((key) => typeof trip[key] === "string") &&
      Number.isInteger(trip.vende) && trip.vende >= 0)) throw new Error("Listë e pavlefshme");
    const trips = data.trips.map(({ id, nisja, destinacioni, ora, vendtakimi, vende }) =>
      ({ id, nisja, destinacioni, ora, vendtakimi, vende }));
    const saved = new Response(JSON.stringify({ trips }), { headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-rideshare-saved-at": new Date().toISOString(),
      "x-rideshare-source": "network",
    } });
    await cache.put("/api/udhetimet", saved.clone());
    return saved;
  } catch {
    const saved = await cache.match("/api/udhetimet");
    if (!saved) return new Response(JSON.stringify({ error: "Nuk ka kopje të ruajtur." }), {
      status: 503, headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
    const headers = new Headers(saved.headers);
    headers.set("x-rideshare-source", "cache");
    return new Response(saved.body, { headers });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname === "/api/udhetimet" && !url.search) {
    event.respondWith(tripsResponse());
  } else if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.open(CACHE)).match("/offline.html")));
  } else if (ASSETS.includes(url.pathname) && !url.search) {
    event.respondWith(caches.open(CACHE).then(async (cache) =>
      (await cache.match(url.pathname)) || fetch(request)));
  }
});
