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
 function bankIdentity(row){
  if(row?.bankRef)return String(row.bankRef).trim();
  if(row?.idAuthority!=='provider'||!row?.stableRef)return '';
  const bank=String(row.banco||row.bank||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  const account=String(row.accountKey||row.accountId||'');
  if(!bank||!account)return '';
  return 'fxbank9770:'+JSON.stringify(['enablebanking',bank,account,String(row.stableRef)])
 }
 function normalizeRows(rows){return (Array.isArray(rows)?rows:[]).map(row=>({...row,bankRef:bankIdentity(row)||String(row.bankRef||row.mov_id||row.id||row.movimientoId||'').trim(),amount:row.amount??row.importe,concept:row.concept??row.concepto,operationDate:row.operationDate??row.fecha,source:'original-bank-connector'}))}
 function mergeRows(previous,incoming){
  const rows=[],seen=new Set(),duplicates=[];
  [...(Array.isArray(previous)?previous:[]),...(Array.isArray(incoming)?incoming:[])].forEach(row=>{
   const bankRef=String(row?.bankRef||'').trim();
   if(!bankRef){rows.push(row);return}
   if(seen.has(bankRef)){duplicates.push(bankRef);return}
   seen.add(bankRef);rows.push(row);
  });
  return {rows,duplicates:[...new Set(duplicates)]};
 }
 function inboxStorageKey(owner,profile){return 'fluxia_elite_bank_inbox_v2:'+encodeURIComponent(String(owner||''))+':'+encodeURIComponent(String(profile||''))}
 function readInbox(owner,profile,storage){try{const value=JSON.parse((storage||globalThis.localStorage).getItem(inboxStorageKey(owner,profile))||'[]');return Array.isArray(value)?value:[]}catch{return []}}
 function saveInbox(owner,profile,rows,storage){const target=storage||globalThis.localStorage,clean=Array.isArray(rows)?rows:[];target.setItem(inboxStorageKey(owner,profile),JSON.stringify(clean));return clean}
 const api={version:'1.2.0',source:'Fluxia-banco',configure,call,normalizeRows,mergeRows,bankIdentity,inboxStorageKey,readInbox,saveInbox};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaEliteBankConnector=api;
})(typeof globalThis!=='undefined'?globalThis:this);
