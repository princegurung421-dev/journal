// Service Worker for Prince's Learning Journal PWA
// Strategy:
//   - Core app files are pre-cached during install so the app opens offline.
//   - Static assets (HTML/CSS/JS/images/fonts): cache-first, fall back to network.
//   - API calls (/api/...): network-first, so data stays fresh online and
//     falls back to the last cached response when offline.
//   - Navigations that fail offline fall back to a cached page.

const CACHE_NAME = 'learning-journal-v5';

// Local files that MUST be available offline. Kept separate from third-party
// URLs so a single failed CDN request can never break the whole install.
const CORE_ASSETS = [
    './',
    './index.html',
    './about.html',
    './journal.html',
    './projects.html',
    './reflections.html',
    './tictactoe.html',
    './manifest.json',
    './css/style.css',
    './js/clock.js',
    './js/location.js',
    './js/theme.js',
    './js/tictactoe.js',
    './js/db.js',
    './js/journal.js',
    './js/reflections.js',
    './js/reflection-form.js',
    './js/network-status.js',
    './js/thirdparty.js',
    './images/profile.jpeg',
    './images/icon-192.png',
    './images/icon-512.png',
    './images/icon-maskable-512.png',
    './images/apple-touch-icon.png',
    './images/favicon-64.png'
];

// Nice-to-have third-party assets. Cached best-effort (failures are ignored).
const THIRD_PARTY_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Outfit:wght@300;400;500;600;700&display=swap'
];

// Install: pre-cache core assets, then activate immediately.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(CORE_ASSETS);
            // Best-effort: don't let a CDN failure break installation.
            await Promise.allSettled(
                THIRD_PARTY_ASSETS.map((url) => cache.add(url))
            );
            self.skipWaiting();
        })
    );
});

// Activate: remove old caches and take control of open pages.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(
                names.filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: choose a strategy based on the request.
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Only handle GET requests (POST/DELETE go straight to the network).
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // API: network-first so data is fresh, cache as offline fallback.
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Page navigations: try network, fall back to cache, then to index.html.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached || caches.match('./index.html');
                })
        );
        return;
    }

    // Everything else (CSS/JS/images/fonts): cache-first, then network.
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                // Cache same-origin successful responses for next time.
                if (response.ok && url.origin === self.location.origin) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            });
        })
    );
});
