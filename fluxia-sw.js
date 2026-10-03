/* Fluxia · Service Worker REAL (v93.3). Sustituye a los 4 intentos anteriores (rutas /… con 404 y blob: no permitido).
   Reglas de seguridad:
   - SOLO intercepta GET del mismo origen y de CDNs de librerías/tipografías. NUNCA toca Supabase, Enable Banking,
     Edge Functions ni ninguna petición POST: el banco y la nube pasan siempre directos a la red.
   - HTML: RED PRIMERO (las versiones nuevas llegan siempre) con copia offline de respaldo.
   - No se guarda nada con ?code= / state= (retorno OAuth del banco). */
const VERSION = 'v94.51';
const SHELL = 'fluxia-shell-' + VERSION;
const RUNTIME = 'fluxia-runtime-v1';
const CDN = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(Promise.all([
    caches.open(SHELL).then(function (c) { return c.addAll(['./', 'fluxia-icon.svg', 'manifest.webmanifest']).catch(function () {}); }),
    /* v93.4: librería de gráficos guardada para que Análisis funcione sin internet */
    caches.open(RUNTIME).then(function (c) { return fetch('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js', { mode: 'no-cors' }).then(function (r) { return c.put('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js', r); }).catch(function () {}); })
  ]));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== SHELL && k !== RUNTIME; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

function esOAuth(url) { return /[?&](code|state|error)=/.test(url.search); }
function redPrimero(req, cacheName) {
  return fetch(req).then(function (res) {
    if (res && res.ok && !esOAuth(new URL(req.url))) { var c = res.clone(); caches.open(cacheName).then(function (ca) { ca.put(req, c); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (m) { return m || caches.match('./'); });
  });
}
function rapidoYRefresca(req, cacheName) {
  return caches.open(cacheName).then(function (ca) {
    return ca.match(req).then(function (m) {
      var red = fetch(req).then(function (res) { if (res && (res.ok || res.type === 'opaque')) ca.put(req, res.clone()); return res; }).catch(function () { return m; });
      return m || red;
    });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || /\.html?$/.test(url.pathname) || url.pathname.endsWith('/')) { e.respondWith(redPrimero(req, SHELL)); return; }
    if (/\.(svg|png|webmanifest|json|js|css|woff2?)$/.test(url.pathname)) { e.respondWith(rapidoYRefresca(req, SHELL)); return; }
    return;
  }
  if (CDN.indexOf(url.hostname) >= 0) { e.respondWith(rapidoYRefresca(req, RUNTIME)); return; }
  /* cualquier otro origen (Supabase, banco…): pasa directo */
});

/* Push (cargos bancarios) */
self.addEventListener('push', function (event) {
  var data = { title: 'Fluxia', body: 'Nuevo movimiento', importe: '', concepto: '' };
  try { if (event.data) { data = Object.assign(data, event.data.json()); } } catch (err) { try { data.body = event.data.text(); } catch (e2) {} }
  var cuerpo = data.body || '';
  if (data.concepto && data.importe) cuerpo = data.concepto + ' · ' + data.importe;
  else if (data.concepto) cuerpo = data.concepto;
  else if (data.importe) cuerpo = data.importe + (cuerpo ? ' · ' + cuerpo : '');
  var opts = { body: cuerpo, icon: data.icon || self.registration.scope + 'fluxia-icon-192.png', badge: data.badge || self.registration.scope + 'fluxia-icon-192.png',
    tag: data.tag || 'fluxia-cargo', renotify: true, data: data, vibrate: [120, 60, 120] };
  event.waitUntil(self.registration.showNotification(data.title || 'Fluxia', opts));
});
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) { if (list[i].url && 'focus' in list[i]) return list[i].focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
