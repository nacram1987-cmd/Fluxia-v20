const VERSION='v96.99-MIGRATION';
const CACHE='fluxia-migrate-'+VERSION;
const ENTRY='./?v=v96.99-LAB';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([
 caches.keys().then(keys=>Promise.all(keys.filter(k=>/fluxia/i.test(k)).map(k=>caches.delete(k)))),
 self.clients.claim(),
 self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>Promise.all(cs.map(c=>c.navigate(ENTRY).catch(()=>undefined))))
]));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(ENTRY,{cache:'no-store',redirect:'follow'}).catch(()=>fetch(e.request,{cache:'no-store'})));
   return;
 }
 e.respondWith(fetch(e.request,{cache:'no-cache'}).catch(()=>caches.match(e.request)));
});