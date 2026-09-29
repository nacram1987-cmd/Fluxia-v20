const CACHE_NAME = 'fluxia-v93.4-cache';

// Archivos críticos que el Service Worker guardará de inicio
const ASSETS_TO_CACHE = [
  './',
  './index_fluxia_v93.4.html',
  './manifest.webmanifest'
];

// 1. Instalación: Forzar la activación inmediata del nuevo Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activación: Limpiar cualquier caché obsoleta de versiones anteriores (ej. v92.9)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Intercepción de peticiones (Network First con respaldo en Caché)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si la red responde correctamente, actualizamos la caché en segundo plano
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Si no hay red, servimos desde la caché local
        return caches.match(event.request);
      })
  );
});