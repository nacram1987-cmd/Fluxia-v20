/* Fluxia v96.06 · SW canónico */
const FX_CACHE='fluxia-shell-v96.06';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys()){if(k!==FX_CACHE)await caches.delete(k);}await self.clients.claim();})());});
self.addEventListener('fetch',e=>{const r=e.request;if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match('./index.html')));return;} });
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{};}catch(_){try{d={body:e.data.text()};}catch(__){}}const concepto=d.concepto||d.descripcion||'Cargo';const importe=d.importe||d.importeFmt||'';const body=importe?concepto+' · '+importe:concepto;const key=String(d.event_id||d.id||d.bancoRef||d.tag||body);e.waitUntil(self.registration.showNotification('Fluxia',{body,icon:d.icon||'./fluxia-icon.svg',badge:d.badge||'./fluxia-icon.svg',tag:'fluxia-bank-'+key,renotify:false,data:d}));});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>list[0]?list[0].focus():clients.openWindow('./index.html')));});
