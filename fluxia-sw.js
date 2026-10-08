/* Fluxia LAB: navegación network-first, offline shell solamente.
   La caché guarda archivos estáticos, NUNCA datos financieros ni respuestas API. */
const CACHE_VERSION='fluxia-shell-lab-20261008';
const ENTRY='./index.html';
const MANIFEST='./manifest.webmanifest';
const SHELL=[ENTRY,MANIFEST];
const NETWORK_WAIT_MS=1200;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache=await caches.open(CACHE_VERSION);
    await Promise.allSettled(SHELL.map(async url => {
      const response=await fetch(url,{cache:'no-store'});
      if(response.ok) await cache.put(url,response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys=await caches.keys();
    await Promise.all(keys.filter(key =>
      (key.startsWith('fluxia-shell-')||key.startsWith('fluxia-root-')) &&
      key!==CACHE_VERSION
    ).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.mode!=='navigate' || request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  // No interceptar rutas ajenas a la aplicación.
  if(!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;

  event.respondWith((async () => {
    try {
      const response=await Promise.race([fetch(request,{cache:'no-store'}), new Promise((_,reject)=>setTimeout(()=>reject(new Error('network timeout')),NETWORK_WAIT_MS))]);
      if(response.ok && response.type==='basic' && url.pathname===new URL(ENTRY,self.registration.scope).pathname) {
        const cache=await caches.open(CACHE_VERSION);
        await cache.put(ENTRY,response.clone());
      }
      return response;
    } catch (_) {
      const cache=await caches.open(CACHE_VERSION);
      return (await cache.match(ENTRY)) ||
        new Response('Fluxia no puede iniciar sin conexión. Vuelve a intentarlo cuando tengas red.',{
          status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}
        });
    }
  })());
});
