(function(root){
 'use strict';
 const ACTION='/functions/v1/Fluxia-banco';
 let config={base:'',key:'',token:''};
 function configure(next){config={...config,...next};return {configured:!!(config.base&&config.key&&config.token)}}
 async function call(action,body={}){
  if(!config.base||!config.key||!config.token)throw Error('La sesión de nube no está preparada para consultar Bancos.');
  const res=await fetch(config.base+ACTION,{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+config.token,'Content-Type':'application/json'},body:JSON.stringify({accion:action,...body}),credentials:'omit',cache:'no-store',redirect:'error'});
  let data={};try{data=await res.json()}catch{}
  if(!res.ok||data?.success===false)throw Error(data?.error||'El conector bancario devolvió HTTP '+res.status+'.');
  return data;
 }
 function normalizeRows(rows){return (Array.isArray(rows)?rows:[]).map(row=>({...row,bankRef:String(row.bankRef||row.mov_id||row.id||row.movimientoId||'').trim(),amount:row.amount??row.importe,concept:row.concept??row.concepto,operationDate:row.operationDate??row.fecha,source:'original-bank-connector'}))}
 const api={version:'1.0.0',source:'Fluxia-banco',configure,call,normalizeRows};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaEliteBankConnector=api;
})(typeof globalThis!=='undefined'?globalThis:this);
