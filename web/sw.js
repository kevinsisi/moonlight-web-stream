const CACHE_NAME = "moonlight-web-shell-v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./stream.html",
    "./admin.html",
    "./manifest.json",
    "./pwa.js",
    "./styles/standard.css",
    "./styles/moonlight.css",
    "./resources/moonlight.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .catch(() => undefined)
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames
                .filter((cacheName) => cacheName !== CACHE_NAME)
                .map((cacheName) => caches.delete(cacheName))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== "GET" || url.origin !== self.location.origin) {
        return;
    }

    if (url.pathname.startsWith("/api/") || url.pathname.includes("/api/")) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request, "./index.html"));
        return;
    }

    if (["style", "script", "manifest", "worker"].includes(request.destination)) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (request.destination === "image") {
        event.respondWith(cacheFirst(request));
    }
});

async function networkFirst(request, fallbackUrl) {
    const cache = await caches.open(CACHE_NAME);
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (_error) {
        return (await cache.match(request)) || (fallbackUrl ? cache.match(fallbackUrl) : undefined) || Response.error();
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    if (response && response.ok) {
        cache.put(request, response.clone());
    }
    return response;
}
