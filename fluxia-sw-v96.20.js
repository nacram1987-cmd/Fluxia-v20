const BUILD='v96.20-LAB';
const CACHE='fluxia-lab-v96.20-LAB';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>/^fluxia(?:-lab|-v|-shell)/i.test(k)&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.mode==='navigate'||r.destination==='document'){
    e.respondWith(fetch(r,{cache:'no-store'}));
  }
});
