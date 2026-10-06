const BUILD='v96.28-LAB';const CACHE='fluxia-lab-v96.28-LAB';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const k=await caches.keys();
 await Promise.all(k.filter(x=>/^fluxia(?:-lab|-v|-shell)/i.test(x)&&x!==CACHE).map(x=>caches.delete(x)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'||e.request.destination==='document')
   e.respondWith(fetch(e.request,{cache:'no-store'}));
});
