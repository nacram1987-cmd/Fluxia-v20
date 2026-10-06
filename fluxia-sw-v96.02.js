/* Fluxia v96.02-LAB */
const CACHE='fluxia-lab-v96.02-LAB';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
