/* Fluxia v97.39: one canonical shell, network-first with bounded offline fallback.
   No SW may rewrite an independent LAB document to index.html. */
const CACHE_VERSION = 'fluxia-shell-v97.45-canonical-pages';
const ENTRY = './index.html';
const PATH = new URL(ENTRY, self.registration.scope).pathname;
const ROOT = new URL('./', self.registration.scope).pathname;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const res = await fetch(ENTRY, {cache:'no-store'});
      if (res && res.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(ENTRY, res.clone());
      }
    } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key =>
        (key.startsWith('fluxia-shell-') || key.startsWith('fluxia-root-')) && key !== CACHE_VERSION
      ).map(key => caches.delete(key)));
    } catch (_) {}
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode !== 'navigate') return; // Leave APIs and static resources untouched.
  if (url.pathname !== PATH && url.pathname !== ROOT) {
    // Never fall back to index.html for independent LAB pages.
    event.respondWith(fetch(req, {cache:'no-store'}));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const network = fetch(ENTRY, {cache:'no-store'}).then(async res => {
      if (res && res.ok) await cache.put(ENTRY, res.clone());
      return res && res.ok ? res : null;
    }).catch(() => null);
    // A fast connection receives the latest published shell, not a stale PWA.
    const fresh = await Promise.race([network, new Promise(resolve => setTimeout(() => resolve(null), 2500))]);
    if (fresh) return fresh;
    const cached = await cache.match(ENTRY);
    if (cached) {
      event.waitUntil(network); // Refresh offline copy even when the fast path falls back.
      return cached;
    }
    return (await network) || Response.error();
  })());
});
