/* Fluxia LAB v97.26 · service worker ligero; no cachea el HTML de la app. */
const VERSION='v97.26-LAB';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('fluxia-shell-')&&key!==('fluxia-shell-'+VERSION)).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
