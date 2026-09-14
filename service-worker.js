const CACHE_VERSION = 'ahc-v3';

const CORE_ASSETS = [
  '/', '/index.html', '/fleet.html', '/travel.html', '/contact.html',
  '/offline.html', '/css/style.css', '/js/main.js', '/manifest.webmanifest',
  '/assets/fonts/heading.ttf', '/assets/fonts/body.ttf',
  '/assets/images/logo-original.png', '/assets/video/hero-poster.jpg',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png'
];

const HTML_OR_CODE_PATTERN = /(^\/$|\.html$|\.css$|\.js$)/i;
const MEDIA_PATTERN = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|mp4|webm|mov)$/i;

function isSameOrigin(request) { return new URL(request.url).origin === self.location.origin; }
function isHTMLOrCode(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate' || HTML_OR_CODE_PATTERN.test(url.pathname);
}
function isMedia(request) { const url = new URL(request.url); return MEDIA_PATTERN.test(url.pathname); }

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) return offlinePage;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) { return cache.addAll(CORE_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (!isSameOrigin(request)) return;
  const url = new URL(request.url);
  if (url.pathname === '/service-worker.js') {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }
  if (request.headers.has('range')) { event.respondWith(fetch(request)); return; }
  if (isHTMLOrCode(request)) { event.respondWith(networkFirst(request)); return; }
  if (isMedia(request)) { event.respondWith(cacheFirst(request)); return; }
  event.respondWith(networkFirst(request));
});
