/* Bridge from stale v95.44 LAB worker to v95.47 */
const TARGET='/Fluxia-v20/index_fluxia_v95.47_LAB.html?v=v95.47-LAB&from=sw-95.44';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ns=>Promise.all(ns.filter(n=>/^fluxia-lab-/.test(n)).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){const u=new URL(e.request.url);if(u.pathname.endsWith('/index_fluxia_v95.44_LAB.html')||u.pathname.endsWith('/index_fluxia_v95.46_LAB.html'))e.respondWith(Promise.resolve(Response.redirect(TARGET,302)));}});
