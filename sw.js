const CACHE_VERSION='fluxia-shell-v97.17';
const ENTRY='./index.html';

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    try{
      const cache=await caches.open(CACHE_VERSION);
      const r=await fetch(ENTRY,{cache:'no-store'});
      if(r&&r.ok) await cache.put(ENTRY,r.clone());
    }catch(e){}
    await self.skipWaiting();
  })());
});

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
  if(/^\/(auth|v1|health)(\/|$)/.test(u.pathname)) return;

  if(r.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_VERSION);
      const cached=(await cache.match(ENTRY))||(await cache.match(r));
      const fresh=fetch(r,{cache:'no-store'}).then(async response=>{
        if(response&&response.ok) await cache.put(ENTRY,response.clone());
        return response;
      }).catch(()=>null);
      if(cached){ event.waitUntil(fresh); return cached; }
      return (await fresh)||Response.error();
    })());
    return;
  }
  event.respondWith(fetch(r).catch(()=>caches.match(r)));
});
