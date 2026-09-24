// ═══════════════════════════════════════════════════════════════
// FLUXIA v44 SERVICE WORKER — Offline + Caché estratégico
// ═══════════════════════════════════════════════════════════════
const CACHE_V = 'fluxia-v44-1';
const URLS_CRÍTICAS = [
  '/',
  '/index.html',
  '/fluxia-sw-v44.js',
  'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
];

// 1️⃣ INSTALL: Caché crítica
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_V).then(c => c.addAll(URLS_CRÍTICAS)).catch(err => {
      console.error('[SW] Error en install:', err);
    })
  );
});

// 2️⃣ ACTIVATE: Limpiar cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(ks => {
      return Promise.all(ks.filter(k => k !== CACHE_V).map(k => caches.delete(k)));
    })
  );
});

// 3️⃣ FETCH: Network first, fallback a caché
self.addEventListener('fetch', (e) => {
  const {request} = e;
  
  // GET solamente
  if (request.method !== 'GET') return;
  
  // Evitar scope externo
  if (!request.url.includes(self.location.origin)) return;
  
  // Estrategia: Network first → Caché → Offline
  e.respondWith(
    fetch(request)
      .then(r => {
        if (!r || r.status !== 200 || r.type === 'error') return r;
        const rClone = r.clone();
        caches.open(CACHE_V).then(c => c.put(request, rClone));
        return r;
      })
      .catch(() => {
        return caches.match(request)
          .then(cached => cached || caches.match('/'))
          .catch(() => null);
      })
  );
});

// 4️⃣ MENSAJE: Desde la app para limpiar caché
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
