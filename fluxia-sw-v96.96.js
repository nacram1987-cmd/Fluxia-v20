const VERSION='v96.98-LAB';
const CACHE='fluxia-shell-'+VERSION;
const APP_SHELL=[
  './',
  './index_fluxia_v96.98_LAB.html?v=v96.98-LAB',
  './fluxia-ui-v96.95.css',
  './manifest_v96.96_LAB.webmanifest'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL).catch(()=>undefined))
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys=>Promise.all(
        keys.filter(key=>key.startsWith('fluxia-shell-') && key!==CACHE)
            .map(key=>caches.delete(key))
      )),
      self.clients.claim()
    ])
  );
});

self.addEventListener('message',event=>{
  if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy));
          return response;
        })
        .catch(()=>caches.match(req).then(r=>r||caches.match('./index_fluxia_v96.98_LAB.html?v=v96.98-LAB')))
    );
    return;
  }

  if(url.origin===self.location.origin){
    event.respondWith(
      fetch(req,{cache:'no-cache'})
        .then(response=>{
          if(response && response.ok){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(req,copy));
          }
          return response;
        })
        .catch(()=>caches.match(req))
    );
  }
});
