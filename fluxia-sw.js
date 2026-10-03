/**
 * Fluxia Service Worker v94.79-LAB
 * Gestiona caché, actualizaciones y modo offline
 */

const VERSION = 'v94.79-LAB';
const CACHE_NAME = `fluxia-${VERSION}`;
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './fluxia-canal.json',
  './fluxia-sw.js'
];

/**
 * EVENTO: install
 * Cachea los assets críticos cuando se instala el SW
 */
self.addEventListener('install', event => {
  console.log(`[Fluxia SW v94.79] Installing Service Worker version: ${VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[Fluxia SW v94.79] Caching assets for ${CACHE_NAME}`);
        return cache.addAll(PRECACHE_ASSETS).catch(err => {
          console.warn('[Fluxia SW v94.79] Some assets failed to cache:', err);
          // Continuar aunque fallen algunos
        });
      })
      .then(() => {
        console.log('[Fluxia SW v94.79] Install complete');
        return self.skipWaiting();
      })
  );
});

/**
 * EVENTO: activate
 * Limpia cachés viejas cuando se activa la nueva versión
 */
self.addEventListener('activate', event => {
  console.log(`[Fluxia SW v94.79] Activating Service Worker version: ${VERSION}`);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            const isFluxiaCache = cacheName.startsWith('fluxia-');
            const isOldVersion = cacheName !== CACHE_NAME;
            return isFluxiaCache && isOldVersion;
          })
          .map(cacheName => {
            console.log(`[Fluxia SW v94.79] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      console.log('[Fluxia SW v94.79] Activation complete');
      return self.clients.claim();
    })
  );
});

/**
 * EVENTO: fetch
 * Strategy: Network-first con fallback a caché
 * (primero intenta red, si falla usa caché local)
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests a otros dominios (except CDN)
  if (url.origin !== location.origin && 
      !url.hostname.includes('cdnjs.cloudflare.com') &&
      !url.hostname.includes('cdn.jsdelivr.net')) {
    return;
  }

  // Para index.html, manifest y canal: network-first
  if (
    request.url.includes('index.html') ||
    request.url.includes('manifest.webmanifest') ||
    request.url.includes('fluxia-canal.json')
  ) {
    return event.respondWith(
      fetch(request)
        .then(response => {
          // Cachear la respuesta si es exitosa
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(err => {
          // Si falla la red, usar caché
          console.log(`[Fluxia SW v94.79] Network failed for ${request.url}, using cache`);
          return caches.match(request);
        })
    );
  }

  // Para otros recursos: cache-first
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then(response => {
            // No cachear si no es exitosa
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cachear la respuesta
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch(err => {
            // Fallback a página offline si existe
            console.warn(`[Fluxia SW v94.79] Fetch failed for ${request.url}:`, err);
            // Podrías retornar una página offline aquí
            // return caches.match('./offline.html');
          });
      })
  );
});

/**
 * EVENTO: message
 * Comunica con clientes (pestañas abiertas)
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Fluxia SW v94.79] SKIP_WAITING received, claiming clients');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log(`[Fluxia SW v94.79] Update check: Current version is ${VERSION}`);
    event.ports[0].postMessage({
      version: VERSION,
      cache: CACHE_NAME,
      status: 'ready'
    });
  }
});

/**
 * UTILIDAD: Limpiar caché antiguas periódicamente
 */
setInterval(() => {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.open(cacheName).then(cache => {
        cache.keys().then(requests => {
          requests.forEach(request => {
            // Limpiar recursos que no se han usado en 30 días
            // (simplificado: limpiar cada recurso >30MB)
            fetch(request).catch(() => {
              cache.delete(request);
            });
          });
        });
      });
    });
  });
}, 24 * 60 * 60 * 1000); // Cada 24 horas

console.log(`[Fluxia SW v94.79] Service Worker loaded: ${VERSION}`);
