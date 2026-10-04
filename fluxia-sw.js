const VERSION = 'v95.3.0-LAB';
const CACHE_NAME = `fluxia-${VERSION}`;
const URLS_TO_CACHE = [
  '/Fluxia-v20/index.html',
  '/Fluxia-v20/manifest.webmanifest',
  '/Fluxia-v20/fluxia-canal.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log(`[${VERSION}] Cache abierto`);
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.log(`[${VERSION}] Cache parcial (offline ok)`);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => {
          console.log(`[${VERSION}] Limpiando cache antiguo: ${name}`);
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'error') {
          return resp;
        }
        const cache_resp = resp.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, cache_resp);
        });
        return resp;
      }).catch(() => {
        return caches.match('/Fluxia-v20/index.html');
      });
    })
  );
});

console.log(`[Fluxia ${VERSION}] Service Worker activo`);
