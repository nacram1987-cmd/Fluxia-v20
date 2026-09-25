/* Fluxia stable-fix · SW que solo limpia caches y se desregistra */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.registration.unregister();
    }).then(function(){
      return self.clients.matchAll({type:'window'});
    }).then(function(clients){
      clients.forEach(function(c){ try{ c.navigate(c.url); }catch(e){} });
    })
  );
});
self.addEventListener('fetch', function(e){
  // Network only — nunca servir HTML cacheado
  e.respondWith(fetch(e.request));
});
