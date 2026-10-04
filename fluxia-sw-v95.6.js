/* Fluxia v95.6-LAB · Service Worker de laboratorio
 * Estrategia: navegación network-first para no congelar HTML antiguo.
 * El canal estable NO se modifica con este archivo.
 */
const VERSION = 'v95.6-LAB';
const CACHE_NAME = 'fluxia-lab-' + VERSION;
const LAB_ENTRY = '/Fluxia-v20/index_fluxia_v95.6_LAB.html';
const LAB_MANIFEST = '/Fluxia-v20/manifest_v95.6_LAB.webmanifest';
const SHELL = [LAB_ENTRY, LAB_MANIFEST];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith('fluxia-lab-') && name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* Este SW pertenece al LAB. Aunque su scope técnico sea el directorio del proyecto,
     no intercepta la puerta estable ni otros HTML del mismo repositorio. */
  const isLabEntry = url.pathname === LAB_ENTRY;
  const isLabAsset = isLabEntry || url.pathname === LAB_MANIFEST;
  if (!isLabAsset) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(resp => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
          }
          return resp;
        })
        .catch(async () => {
          const exact = await caches.match(req, { ignoreSearch: true });
          if (exact) return exact;
          const lab = await caches.match(LAB_ENTRY, { ignoreSearch: true });
          return lab || Response.error();
        })
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
