const CACHE_VERSION='fluxia-shell-v97.6';
const ENTRY='./index.html';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('fluxia-shell-')&&key!==CACHE_VERSION)await caches.delete(key);}await self.clients.claim();})());});
self.addEventListener('fetch',event=>{const r=event.request;if(r.mode==='navigate'){event.respondWith((async()=>{try{return await fetch(r,{cache:'no-store'});}catch(e){return (await caches.match(r))||(await caches.match(ENTRY))||Response.error();}})());return;}event.respondWith(fetch(r).catch(()=>caches.match(r)));});
