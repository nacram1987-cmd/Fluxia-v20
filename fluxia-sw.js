/* Fluxia PWA v97.64: root shell. LAB keeps its own scope and cache. */
const CACHE_VERSION='fluxia-shell-v97.64-pwa';
const ENTRY='./index.html';
const PATH=new URL(ENTRY,self.registration.scope).pathname;
const ROOT=new URL('./',self.registration.scope).pathname;
self.addEventListener('install',event=>event.waitUntil((async()=>{
  // Activate only after a fresh shell is available; failed updates keep the old worker.
  const response=await fetch(ENTRY,{cache:'no-store'});
  if(!response.ok)throw new Error('PWA shell unavailable');
  const cache=await caches.open(CACHE_VERSION);
  await cache.put(ENTRY,response.clone());
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>(key.startsWith('fluxia-shell-')||key.startsWith('fluxia-root-'))&&key!==CACHE_VERSION).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.mode!=='navigate')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||(url.pathname!==ROOT&&url.pathname!==PATH))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_VERSION);
    const refresh=fetch(ENTRY,{cache:'no-store'}).then(async response=>{
      if(response.ok)await cache.put(ENTRY,response.clone());
      return response.ok?response:null;
    }).catch(()=>null);
    event.waitUntil(refresh);
    const cached=await cache.match(ENTRY);
    return cached||(await refresh)||Response.error();
  })());
});
