/* Fluxia BETA v97.52-LAB: PWA aislada bajo /lab/, shell inmediata tras primera instalación.
 * El despliegue de LAB jamás controla /Fluxia-v20/ (ESTABLE). */
const CACHE='fluxia-lab-shell-v97.52';
const ENTRY='./index.html';
const ROOT=new URL('./',self.registration.scope).pathname;
const INDEX=new URL(ENTRY,self.registration.scope).pathname;
self.addEventListener('install',e=>e.waitUntil((async()=>{
 try{const r=await fetch(ENTRY,{cache:'no-store'});if(r.ok){const c=await caches.open(CACHE);await c.put(ENTRY,r.clone());}}catch(_){}
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const ks=await caches.keys();
 await Promise.all(ks.filter(k=>k.startsWith('fluxia-lab-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 const q=e.request;if(q.method!=='GET'||q.mode!=='navigate')return;
 const u=new URL(q.url);if(u.origin!==self.location.origin||(u.pathname!==ROOT&&u.pathname!==INDEX))return;
 e.respondWith((async()=>{
  const c=await caches.open(CACHE);const old=await c.match(ENTRY);
  const refresh=fetch(ENTRY,{cache:'no-store'}).then(async r=>{if(r.ok)await c.put(ENTRY,r.clone());return r;}).catch(()=>null);
  if(old){e.waitUntil(refresh);return old;}
  return (await refresh)||Response.error();
 })());
});