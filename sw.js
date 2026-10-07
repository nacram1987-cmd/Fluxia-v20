/* Fluxia · PWA canónica permanente
 * La PWA siempre abre ./index.html (última LAB publicada).
 * Los HTML numerados quedan como histórico/rollback, no como entrada PWA.
 * API y datos financieros nunca se cachean.
 */
const CACHE = 'fluxia-canonical-v20';
const CANONICAL = './index.html';
const BASE = [CANONICAL, './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(BASE)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Datos/autenticación: siempre servidor, jamás caché.
  if (url.origin === self.location.origin && /^\/(auth|v1|health)(\/|$)/.test(url.pathname)) return;

  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      }))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // PWA: cualquier navegación dentro del scope abre SIEMPRE la entrada canónica.
  // Así una instalación antigua cuyo start_url fuese index_fluxia_vXX_LAB.html
  // recibe la LAB actual sin reinstalar.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(CANONICAL, { cache: 'no-store' }).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(CANONICAL, copy));
        }
        return res;
      }).catch(() => caches.match(CANONICAL).then(r => r || caches.match('./')))
    );
    return;
  }

  // Peticiones HTML no navegacionales: red primero.
  if (/\.html$/.test(url.pathname) || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match(CANONICAL)))
    );
    return;
  }

  // Assets propios: caché rápida + actualización en segundo plano.
  event.respondWith(
    caches.match(req).then(hit => {
      const network = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || network;
    })
  );
});
