mostrarCargo(concepto,importeFmt,extra){
 extra=extra||{};var profile=String(window.FLUXIA_PROFILE&&FLUXIA_PROFILE.id||'');if(!profile)return;
 var id=String(extra.id||extra.tag||'');if(!id)return;
 var k='v2_bank_notification_ids9770_'+profile,seen={};
 try{var raw=typeof Almacen!=='undefined'?Almacen.getItem(k):null;if(raw==null)raw=localStorage.getItem(k);seen=JSON.parse(raw||'{}')||{}}catch(_){}
 if(seen[id])return;seen[id]=Date.now();
 try{var json=JSON.stringify(seen);localStorage.setItem(k,json);if(typeof Almacen!=='undefined'&&Almacen.setItem)Almacen.setItem(k,json)}catch(_){return}
 var body=(concepto||'Cargo')+(importeFmt?' · '+importeFmt:'');
 if(document.visibilityState==='visible'){
  if(typeof mostrarToast==='function')mostrarToast('💳 '+body,'var(--teal)',3200);
  return;
 }
 if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
 var opts={body:body,tag:'fluxia-cargo-'+id,renotify:false,data:{url:location.href}};
 if(navigator.serviceWorker&&navigator.serviceWorker.ready)navigator.serviceWorker.ready.then(function(reg){return reg.showNotification('Fluxia',opts)}).catch(function(){});
 else{try{new Notification('Fluxia',opts)}catch(_){}}
}
