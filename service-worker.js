const CACHE_VERSION = 'ahc-v1';
const CORE_ASSETS = [
  '/index.html',
  '/fleet.html',
  '/travel.html',
  '/contact.html',
  '/offline.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.webmanifest',
  '/assets/fonts/heading.ttf',
  '/assets/fonts/body.ttf',
  '/assets/images/logo-original.png',
  '/assets/video/hero-poster.jpg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // Network-first for navigation requests (HTML pages), falling back to cache/offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        var resClone = res.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, resClone); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) { return cached || caches.match('/offline.html'); });
      })
    );
    return;
  }

  // Cache-first for static assets (images, fonts, video, css, js)
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res.ok && (req.url.indexOf('/assets/') !== -1 || req.url.indexOf('/css/') !== -1 || req.url.indexOf('/js/') !== -1)) {
          var resClone = res.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, resClone); });
        }
        return res;
      }).catch(function () {
        // fallback for images: nothing special, let it fail gracefully
      });
    })
  );
});
