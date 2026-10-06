/* Fluxia v96.04-LAB */
const CACHE='fluxia-lab-v96.04-LAB';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
