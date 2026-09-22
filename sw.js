/* Fluxia · funcionamiento sin conexión
 * - La app (HTML): primero la red, para recibir siempre la última versión; si no hay red, la copia guardada.
 * - Iconos y tipografías: primero la copia guardada (no cambian).
 * - La API (/auth, /v1, /health) nunca se guarda: son tus datos y deben ir siempre al servidor.
 */
const CACHE = 'fluxia-v19';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Nunca interceptar la API
  if (url.origin === self.location.origin && /^\/(auth|v1|health)(\/|$)/.test(url.pathname)) return;

  // Tipografías de Google: copia guardada primero
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res;
    })));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Páginas: red primero (actualizaciones), copia si no hay conexión
  if (req.mode === 'navigate' || /\.html$/.test(url.pathname) || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copia)); }
        return res;
      }).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Resto de archivos propios: copia primero, se actualiza por detrás
  e.respondWith(caches.match(req).then(hit => {
    const red = fetch(req).then(res => {
      if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => hit);
    return hit || red;
  }));
});
