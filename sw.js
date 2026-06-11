const CACHE = 'planner-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/components.css',
  './css/themes.css',
  './js/router.js',
  './js/api.js',
  './js/db.js',
  './js/state.js',
  './js/parser.js',
  './js/srs.js',
  './views/inbox.html',
  './views/calendar.html',
  './views/gantt.html',
  './views/areas.html',
  './views/time-limits.html',
  './views/settings.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() => cached);
    })
  );
});