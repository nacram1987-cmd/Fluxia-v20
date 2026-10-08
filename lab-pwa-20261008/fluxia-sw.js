/* Fluxia LAB: shell cache-first with background refresh; never cache finance/API. */
const CACHE_VERSION='fluxia-shell-lab-20261008-fast2';
const ENTRY='./index.html';
const MANIFEST='./manifest.webmanifest';
const SHELL=[ENTRY,MANIFEST];
const ENTRY_URL=new URL(ENTRY,self.registration.scope).href;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_VERSION);
  await Promise.allSettled(SHELL.map(async path=>{const r=await fetch(path,{cache:'no-store'});if(r.ok)await cache.put(path,r)}));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>(k.startsWith('fluxia-shell-')||k.startsWith('fluxia-root-'))&&k!==CACHE_VERSION).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.mode!=='navigate')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||url.href.split('?')[0]!==ENTRY_URL)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_VERSION);
  const cached=await cache.match(ENTRY);
  const refresh=(async()=>{try{const response=await fetch(req,{cache:'no-store'});if(response.ok&&response.type==='basic')await cache.put(ENTRY,response.clone());return response}catch(_){return null}})();
  if(cached){event.waitUntil(refresh);return cached}
  const response=await refresh;
  return response||new Response('Fluxia no puede iniciar sin conexión.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })());
});
