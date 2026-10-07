const CACHE_VERSION='fluxia-shell-v97.20';
const ENTRY='./index.html';
const CORE=[ENTRY,'./manifest.webmanifest'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache=>cache.addAll(CORE).catch(()=>{}))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()){
      if((key.startsWith('fluxia-shell-')||key.startsWith('fluxia-root-'))&&key!==CACHE_VERSION){
        await caches.delete(key);
      }
    }
    if(self.registration.navigationPreload){
      try{await self.registration.navigationPreload.enable();}catch(_){}
    }
    await self.clients.claim();
  })());
});

async function networkIndex(){
  try{
    const res=await fetch(ENTRY,{cache:'no-store'});
    if(res&&res.ok){
      const cache=await caches.open(CACHE_VERSION);
      await cache.put(ENTRY,res.clone());
    }
    return res;
  }catch(_){return null;}
}

self.addEventListener('fetch',event=>{
  const r=event.request;
  if(r.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_VERSION);
      const cached=await cache.match(ENTRY);
      const net=networkIndex();
      if(!cached){
        const fresh=await net;
        return fresh||Response.error();
      }
      /* v97.20: la red tiene una ventana corta para entregar la versión más nueva.
         Si tarda, Fluxia arranca desde shell local y la actualización termina detrás. */
      const fast=await Promise.race([
        net,
        new Promise(resolve=>setTimeout(()=>resolve(null),450))
      ]);
      if(fast&&fast.ok)return fast;
      event.waitUntil(net);
      return cached;
    })());
    return;
  }
  if(new URL(r.url).origin===self.location.origin){
    event.respondWith(fetch(r).catch(()=>caches.match(r)));
  }
});
