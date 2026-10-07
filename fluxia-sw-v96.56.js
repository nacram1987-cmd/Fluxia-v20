// Fluxia v96.56-LAB: ámbito exclusivo del HTML LAB, sin purga de cachés.
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('push',function(event){
  var data={title:'Fluxia',body:'Nuevo movimiento',importe:'',concepto:''};
  try{ if(event.data){ var j=event.data.json(); data=Object.assign(data,j); } }catch(err){
    try{ data.body=event.data.text(); }catch(e2){}
  }
  var titulo = data.title || 'Fluxia';
  var cuerpo = data.body || '';
  if(data.concepto && data.importe){ cuerpo = data.concepto + ' · ' + data.importe; }
  else if(data.concepto){ cuerpo = data.concepto + (data.importe?(' · '+data.importe):''); }
  else if(data.importe){ cuerpo = data.importe + (cuerpo?(' · '+cuerpo):''); }
  var opts={
    body:cuerpo,
    icon: data.icon || new URL('./fluxia-icon.svg', self.location.href).href,
    badge: data.badge || new URL('./fluxia-icon.svg', self.location.href).href,
    tag: data.tag || 'fluxia-cargo',
    renotify: true,
    data: data,
    vibrate: [120,60,120]
  };
  event.waitUntil(self.registration.showNotification(titulo, opts));
});
self.addEventListener('notificationclick',function(event){
  event.notification.close();
  var url = self.registration.scope;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){ if(list[i].url && list[i].url.split('?')[0] === self.registration.scope && 'focus' in list[i]) return list[i].focus(); }
    if(clients.openWindow) return clients.openWindow(url);
  }));
});
