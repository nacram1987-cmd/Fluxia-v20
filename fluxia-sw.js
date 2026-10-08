const CACHE_VERSION='fluxia-shell-v97.36-router';
const ENTRY='./index.html?v=97.31-lab-ghpages';
const CORE=['./index.html','./manifest.webmanifest','./fluxia-icon.png'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache=>cache.addAll(CORE).catch(()=>{}))
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

async function freshIndex(){
  try{
    const res=await fetch('./index.html?v=97.31-lab-ghpages-'+Date.now(),{cache:'no-store'});
    if(res&&res.ok){
      const cache=await caches.open(CACHE_VERSION);
      await cache.put('./index.html',res.clone());
    }
    return res;
  }catch(_){
    return null;
  }
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);
  // LAB previews must bypass the production PWA shell and its index cache.
  if (/\/lab-v97-[\d-]+\.html$/.test(url.pathname)) return;
  if(req.mode==='navigate'){
    // Never rewrite a standalone LAB or any noncanonical document to the production index.
    if (!/(?:\/|\/index\.html)$/.test(url.pathname)) {
      event.respondWith(fetch(req,{cache:'no-store'}));
      return;
    }
    event.respondWith((async()=>{
      const fresh=await freshIndex();
      if(fresh&&fresh.ok)return fresh;
      const cache=await caches.open(CACHE_VERSION);
      const cached=await cache.match('./index.html');
      return cached||fetch(req);
    })());
    return;
  }
  if(url.origin===self.location.origin){
    event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match(req)));
  }
});
