const CACHE='fluxia-v95.91-LAB';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('fluxia-v')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
