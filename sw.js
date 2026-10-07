const CACHE_VERSION='fluxia-shell-v97.6-fast';
const ENTRY='./index.html';

self.addEventListener('install',event=>{self.skipWaiting();});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()){
      if(key.startsWith('fluxia-shell-')&&key!==CACHE_VERSION) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const r=event.request;
  if(r.method!=='GET') return;

  const u=new URL(r.url);
  if(u.origin!==self.location.origin) return;

  // Datos/API: no intervenir.
  if(/^\/(auth|v1|health)(\/|$)/.test(u.pathname)) return;

  // Navegación: respetar la página ya abierta. Red primero sin reescribir
  // cada apertura a index.html; fallback a la shell canónica si no hay red.
  if(r.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(r);
        if(response&&response.ok){
          const cache=await caches.open(CACHE_VERSION);
          cache.put(ENTRY,response.clone()).catch(()=>{});
        }
        return response;
      }catch(e){
        return (await caches.match(r))||(await caches.match(ENTRY))||Response.error();
      }
    })());
    return;
  }

  // Assets: comportamiento nativo del navegador para máxima velocidad.
  // Solo fallback a caché si falla la red.
  event.respondWith(fetch(r).catch(()=>caches.match(r)));
});
