/* Fluxia Élite · private local backup wallet inspector.
   No uploads, no writes, no credential retention, fail-closed on profile mismatch.
   Export produced by HTML mother: fluxiaExportarPerfil() {v,when,profile,prefix,keys}. */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FluxiaProfileWalletBackup=api;
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 function inspect(text,expectedProfile){
  if(typeof text!=='string'||!text.length||text.length>8*1024*1024)throw Error('Copia de perfil vacía o demasiado grande (máximo 8 MB)');
  if(!/^usr-[a-f0-9-]{36}$/.test(expectedProfile))throw Error('Perfil activo no verificable');
  let document;try{document=JSON.parse(text)}catch{throw Error('El archivo no es una copia JSON válida')}
  if(document?.v!=='fluxia-perfil-v1'||!document.profile||document.profile.id!==expectedProfile)throw Error('La copia no pertenece al perfil de esta sesión. No se ha importado.');
  if(!document.keys||typeof document.keys!=='object'||Array.isArray(document.keys))throw Error('La copia no contiene el mapa de datos previsto');
  // Only exact same-profile wallet keys, never legacy global keys.
  const keys=[
   'fluxia_user_'+expectedProfile+'__v2_efectivo',
   'planRescate_v2_u_'+expectedProfile+'_efectivo',
   'v2_u_'+expectedProfile+'_efectivo'
  ];
  let raw=null,sourceKey=null;
  for(const key of keys){if(Object.prototype.hasOwnProperty.call(document.keys,key)){raw=document.keys[key];sourceKey=key;break}}
  if(raw===null)throw Error('Esta copia no incluye Dinero en mano bajo una clave aislada de este perfil');
  let wallet;try{wallet=typeof raw==='string'?JSON.parse(raw):raw}catch{throw Error('La cartera del archivo no es JSON válido')}
  if(!wallet||typeof wallet!=='object'||Array.isArray(wallet)||!Array.isArray(wallet.movimientos)||typeof wallet.saldo!=='number')throw Error('La cartera del HTML tiene un formato inválido');
  const when=typeof document.when==='string'&&!Number.isNaN(Date.parse(document.when))?document.when:null;
  return {wallet,when,sourceKey,profileID:expectedProfile}
 }
 return Object.freeze({inspect});
});