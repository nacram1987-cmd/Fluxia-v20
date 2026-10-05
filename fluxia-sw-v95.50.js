/* Fluxia v95.50 LAB · network-first · one LAB worker */
const VERSION='v95.50-LAB';
const CACHE_NAME='fluxia-lab-'+VERSION;
const ENTRY='/Fluxia-v20/index_fluxia_v95.50_LAB.html';
const MANIFEST='/Fluxia-v20/manifest_v95.50_LAB.webmanifest';
const SHELL=[ENTRY,MANIFEST,'/Fluxia-v20/icon-192.png','/Fluxia-v20/icon-512.png','/Fluxia-v20/apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ns=>Promise.all(ns.filter(n=>n.startsWith('fluxia-lab-')&&n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;const ok=u.pathname===ENTRY||u.pathname===MANIFEST||SHELL.includes(u.pathname);if(!ok)return;e.respondWith(fetch(r,{cache:'no-store'}).then(resp=>{if(resp&&resp.ok)caches.open(CACHE_NAME).then(c=>c.put(r,resp.clone())).catch(()=>{});return resp;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match(ENTRY,{ignoreSearch:true}))));});
