const CACHE='fluxia-lab-v96.57';
const START='./index_fluxia_v96.57_LAB.html?v=v96.57-LAB';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
