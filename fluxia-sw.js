const VERSION = 'v94.88.4-LAB';
const CACHE_NAME = `fluxia-${VERSION}`;
const PRECACHE_ASSETS = ['./', './index.html', './manifest.webmanifest', './fluxia-canal.json'];

self.addEventListener('install', event => {
  console.log(`[Fluxia SW ${VERSION}] Installing`);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[Fluxia SW] Cache error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log(`[Fluxia SW ${VERSION}] Activating`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames
        .filter(name => name.startsWith('fluxia-') && name !== CACHE_NAME)
        .map(name => {
          console.log(`[Fluxia SW] Deleting old cache: ${name}`);
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && !url.hostname.includes('cdnjs')) return;
  if (url.pathname.includes('index.html') || url.pathname.includes('manifest') || url.pathname.includes('canal')) {
    return event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(err => console.warn('[Fluxia SW] Fetch failed:', err));
    })
  );
});
console.log(`[Fluxia SW] loaded: ${VERSION}`);
