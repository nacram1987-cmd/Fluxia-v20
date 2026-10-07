const VERSION='v97.1-LAB';
const CACHE='fluxia-root-'+VERSION;
const ENTRY='./index_fluxia_v97.1_LAB.html?v=97.1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.add(ENTRY).catch(()=>undefined)));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('fluxia-root-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match(ENTRY))));
   return;
 }
 const u=new URL(e.request.url);
 if(u.origin!==self.location.origin)return;
 e.respondWith(caches.open(CACHE).then(async c=>{
   const cached=await c.match(e.request);
   const fresh=fetch(e.request,{cache:'no-cache'}).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(()=>cached);
   return cached||fresh;
 }));
});