/* Fluxia v90.8 · Service Worker Web Push bancario */
const CACHE_NAME = 'fluxia-v90-8-shell';
const APP_SCOPE = new URL('./', self.location.href).href;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; }
    catch (_) { try { data = { body: event.data ? event.data.text() : '' }; } catch (__) {} }

    const title = data.title || '🏦 Fluxia · nuevo movimiento bancario';
    const body = data.body || 'Fluxia ha detectado un nuevo movimiento en tu banco.';
    const tag = data.tag || 'fluxia-bank-movement';
    const url = data.url || APP_SCOPE;
    const badge = Number.isFinite(Number(data.badge)) ? Number(data.badge) : 1;

    // Safari/WebKit exige mostrar la notificación cuando llega el push.
    await self.registration.showNotification(title, {
      body,
      tag,
      renotify: true,
      icon: data.icon || new URL('./apple-touch-icon.png', self.location.href).href,
      badge: data.badgeIcon || new URL('./apple-touch-icon.png', self.location.href).href,
      data: { url, movementId: data.movementId || null, bancoRef: data.bancoRef || null },
      silent: false
    });

    try {
      if ('setAppBadge' in self.registration) await self.registration.setAppBadge(badge);
    } catch (_) {}
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification?.data?.url || APP_SCOPE;
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      if ('focus' in client) {
        try { await client.focus(); } catch (_) {}
        try { client.postMessage({ type: 'fluxia-push-open', data: event.notification?.data || {} }); } catch (_) {}
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});

self.addEventListener('notificationclose', () => {});
