const VERSION='v96.98-LAB';
const CACHE='fluxia-root-'+VERSION;
const ENTRY='./index.html?v=v96.98-LAB';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.add(ENTRY).catch(()=>undefined)));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match(ENTRY))));
  return;
 }
 const u=new URL(e.request.url);
 if(u.origin===self.location.origin)e.respondWith(fetch(e.request,{cache:'no-cache'}).catch(()=>caches.match(e.request)));
});