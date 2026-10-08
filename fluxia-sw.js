const CACHE_VERSION='fluxia-shell-v97.31-ghpages-20261008d';
const ENTRY='./index.html?v=97.31-lab-ghpages';
const CORE=['./index.html','./manifest.webmanifest','./fluxia-icon.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION).then(cache=>cache.addAll(CORE).catch(()=>{})));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()){
      if((key.startsWith('fluxia-shell-')||key.startsWith('fluxia-root-'))&&key!==CACHE_VERSION) await caches.delete(key);
    }
    if(self.registration.navigationPreload){try{await self.registration.navigationPreload.enable();}catch(_){} }
    await self.clients.claim();
  })());
});

async function freshIndex(){
  try{
    const res=await fetch('./index.html?v=97.31-lab-ghpages-'+Date.now(),{cache:'no-store'});
    if(res&&res.ok){const cache=await caches.open(CACHE_VERSION);await cache.put('./index.html',res.clone());}
    return res;
  }catch(_){return null;}
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    const refresh=freshIndex();
    event.waitUntil(refresh.then(()=>{}).catch(()=>{}));
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_VERSION);
      const cached=await cache.match('./index.html');
      if(cached){
        const fresh=await Promise.race([refresh,new Promise(resolve=>setTimeout(()=>resolve(null),1200))]);
        return fresh&&fresh.ok?fresh:cached;
      }
      return (await refresh)||fetch(req);
    })());
    return;
  }
  if(url.origin===self.location.origin)event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match(req)));
});