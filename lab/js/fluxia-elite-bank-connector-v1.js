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
 function statusStorageKey(owner,profile){return 'fluxia_elite_bank_status_v1:'+encodeURIComponent(String(owner||''))+':'+encodeURIComponent(String(profile||''))}
 function readStatus(owner,profile,storage){try{const value=JSON.parse((storage||globalThis.localStorage).getItem(statusStorageKey(owner,profile))||'null');return value&&typeof value==='object'?value:null}catch{return null}}
 function saveStatus(owner,profile,status,storage){const target=storage||globalThis.localStorage,clean={message:String(status?.message||''),action:String(status?.action||''),checkedAt:String(status?.checkedAt||''),ok:!!status?.ok};target.setItem(statusStorageKey(owner,profile),JSON.stringify(clean));return clean}
 function maskIban(value){const raw=String(value||'').replace(/\s/g,'');return raw?('•••• '+raw.slice(-4)):''}
 function normalizeBalances(rows,checkedAt){
  return (Array.isArray(rows)?rows:[]).map(row=>{
   const tipo=String(row?.tipo||row?.balance_type||'').toUpperCase();
   const importe=Number(row?.importe??row?.saldo);
   if(!Number.isFinite(importe))return null;
   return {banco:String(row?.banco||''),nombre:String(row?.nombre||''),iban:maskIban(row?.iban),tipo,importe:Math.round(importe*100)/100,moneda:String(row?.moneda||'EUR').toUpperCase(),fecha:String(row?.fecha||row?.reference_date||row?.dateTime||checkedAt||'').slice(0,10),desactualizado:!!(row?.desactualizado||row?.stale),disponible:row?.disponible===true||['ITAV','CLAV','FWAV'].includes(tipo)}
  }).filter(Boolean)
 }
 function balancesStorageKey(owner,profile){return 'fluxia_elite_bank_balances_v1:'+encodeURIComponent(String(owner||''))+':'+encodeURIComponent(String(profile||''))}
 function readBalances(owner,profile,storage){try{const value=JSON.parse((storage||globalThis.localStorage).getItem(balancesStorageKey(owner,profile))||'null');return value&&typeof value==='object'?value:null}catch{return null}}
 function saveBalances(owner,profile,value,storage){
  const target=storage||globalThis.localStorage,checkedAt=String(value?.checkedAt||new Date().toISOString());
  const clean={rows:normalizeBalances(value?.saldos||value?.rows,checkedAt),checkedAt,complete:!!value?.complete,expected:Number.isFinite(Number(value?.expected))?Number(value.expected):0,errors:(Array.isArray(value?.errors)?value.errors:[]).map(String)};
  target.setItem(balancesStorageKey(owner,profile),JSON.stringify(clean));return clean
 }
 function availableBalanceTotals(rows){
  const totals={};
  for(const row of normalizeBalances(rows))if(row.disponible&&!row.desactualizado){const currency=row.moneda;totals[currency]=Math.round(((totals[currency]||0)+row.importe)*100)/100}
  return totals
 }
 const api={version:'1.4.0',source:'Fluxia-banco',configure,call,normalizeRows,mergeRows,bankIdentity,inboxStorageKey,readInbox,saveInbox,statusStorageKey,readStatus,saveStatus,maskIban,normalizeBalances,balancesStorageKey,readBalances,saveBalances,availableBalanceTotals};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaEliteBankConnector=api;
})(typeof globalThis!=='undefined'?globalThis:this);
