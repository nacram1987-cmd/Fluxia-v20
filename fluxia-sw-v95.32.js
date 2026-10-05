/* Fluxia v95.32 · estable BETA · network-first */
const VERSION='v95.32';
const CACHE_NAME='fluxia-stable-'+VERSION;
const ENTRY='/Fluxia-v20/index.html';
const MANIFEST='/Fluxia-v20/manifest.webmanifest';
const SHELL=[ENTRY,MANIFEST,'/Fluxia-v20/icon-192.png','/Fluxia-v20/icon-512.png','/Fluxia-v20/apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ns=>Promise.all(ns.filter(n=>n.startsWith('fluxia-stable-')&&n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin)return;const ok=u.pathname===ENTRY||u.pathname===MANIFEST||SHELL.includes(u.pathname);if(!ok)return;e.respondWith(fetch(r,{cache:'no-store'}).then(resp=>{if(resp&&resp.ok)caches.open(CACHE_NAME).then(c=>c.put(r,resp.clone())).catch(()=>{});return resp;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match(ENTRY,{ignoreSearch:true}))));});
