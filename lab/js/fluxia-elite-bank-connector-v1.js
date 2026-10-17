(function(root){
 'use strict';
 const ACTION='/functions/v1/Fluxia-banco';
 // v1.5.0: los movimientos se leen con la misma función que el HTML v97.77 (identidad fxbank9770 completa: cuenta y referencia
 // estable); estado y saldos siguen en Fluxia-banco. Las dos usan la misma sesión bancaria (fluxia_banco_sesiones).
 const ACTIONS={bandeja:'/functions/v1/Fluxia-banco-lab9770',movimientos:'/functions/v1/Fluxia-banco-lab9770'};
 function endpoint(action){return ACTIONS[action]||ACTION}
 let config={base:'',key:'',token:''};
 function configure(next){config={...config,...next};return {configured:!!(config.base&&config.key&&config.token)}}
 async function call(action,body={}){
  if(!config.base||!config.key||!config.token)throw Error('La sesión de nube no está preparada para consultar Bancos.');
  const ctrl=typeof AbortController==='function'?new AbortController():null,limit=ACTIONS[action]?45000:20000;
  const timer=ctrl?setTimeout(()=>ctrl.abort(),limit):null;
  try{
   const res=await fetch(config.base+endpoint(action),{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+config.token,'Content-Type':'application/json'},body:JSON.stringify({accion:action,...body}),credentials:'omit',cache:'no-store',redirect:'error',signal:ctrl?ctrl.signal:undefined});
   let data={};try{data=await res.json()}catch{}
   if(!res.ok||data?.success===false)throw Error(data?.error||'El conector bancario devolvió HTTP '+res.status+'.');
   return data;
  }catch(error){
   if(error&&error.name==='AbortError')throw Error('El banco no ha respondido en '+Math.round(limit/1000)+' s. Inténtalo de nuevo.');
   throw error;
  }finally{if(timer)clearTimeout(timer)}
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
 // v1.5.0: bandeja v3 con filas de identidad completa, fecha de lectura por banco y cortes del servidor. La v2 (filas sin cuenta)
 // se deja intacta en el dispositivo y ya no se usa: mezclarla duplicaría cargos con otra identidad.
 function inboxStorageKey(owner,profile){return 'fluxia_elite_bank_inbox_v3:'+encodeURIComponent(String(owner||''))+':'+encodeURIComponent(String(profile||''))}
 function readInboxState(owner,profile,storage){
  try{const value=JSON.parse((storage||globalThis.localStorage).getItem(inboxStorageKey(owner,profile))||'null');
   if(Array.isArray(value))return {rows:value,fetchedAt:{},cortes:{},errors:[]};
   if(value&&typeof value==='object')return {rows:Array.isArray(value.rows)?value.rows:[],fetchedAt:value.fetchedAt&&typeof value.fetchedAt==='object'?value.fetchedAt:{},cortes:value.cortes&&typeof value.cortes==='object'?value.cortes:{},errors:Array.isArray(value.errors)?value.errors:[]};
  }catch{}
  return {rows:[],fetchedAt:{},cortes:{},errors:[]};
 }
 function saveInboxState(owner,profile,state,storage){const target=storage||globalThis.localStorage,clean={rows:Array.isArray(state?.rows)?state.rows:[],fetchedAt:state?.fetchedAt||{},cortes:state?.cortes||{},errors:Array.isArray(state?.errors)?state.errors:[]};target.setItem(inboxStorageKey(owner,profile),JSON.stringify(clean));return clean}
 function readInbox(owner,profile,storage){return readInboxState(owner,profile,storage).rows}
 function saveInbox(owner,profile,rows,storage){const previous=readInboxState(owner,profile,storage);return saveInboxState(owner,profile,{...previous,rows:Array.isArray(rows)?rows:[]},storage).rows}
 function statusStorageKey(owner,profile){return 'fluxia_elite_bank_status_v1:'+encodeURIComponent(String(owner||''))+':'+encodeURIComponent(String(profile||''))}
 function readStatus(owner,profile,storage){try{const value=JSON.parse((storage||globalThis.localStorage).getItem(statusStorageKey(owner,profile))||'null');return value&&typeof value==='object'?value:null}catch{return null}}
 function saveStatus(owner,profile,status,storage){const target=storage||globalThis.localStorage,clean={message:String(status?.message||''),action:String(status?.action||''),checkedAt:String(status?.checkedAt||''),ok:!!status?.ok};target.setItem(statusStorageKey(owner,profile),JSON.stringify(clean));return clean}
 function normalizeConnectionStatus(row,now=Date.now()){
  const bank=String(row?.banco||row?.bank||'');
  const expires=row?.valido_hasta||row?.validUntil||null;
  const until=expires?Date.parse(expires):NaN;
  const expired=row?.caducado===true||(Number.isFinite(until)&&until<=now);
  const hub046=!!(row?.limite_diario||/HUB046|Allowed number of accesses|límite de consultas/i.test(String(row?.ultimo_error||row?.error||'')));
  const hasAccounts=(Array.isArray(row?.cuentas)&&row.cuentas.length>0)||(Array.isArray(row?.account_uids)&&row.account_uids.length>0);
  const connected=!expired&&(row?.permiso_valido===true||(Number.isFinite(until)&&until>now&&hasAccounts));
  return {bank,connected,limited:connected&&hub046,canRefresh:connected&&!hub046&&row?.operativo!==false,expired,accounts:Array.isArray(row?.cuentas)?row.cuentas.length:0,lastSync:row?.ultima_sync_fondo||null,warning:hub046?'Límite temporal de consultas; la conexión sigue vigente y los datos previamente obtenidos permanecen disponibles.':String(row?.ultimo_error||'')};
 }
 function normalizeConnectionStatuses(rows,now=Date.now()){return (Array.isArray(rows)?rows:[]).map(row=>normalizeConnectionStatus(row,now))}
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
 const api={version:'1.5.0',source:'Fluxia-banco',endpoint,configure,call,normalizeRows,mergeRows,bankIdentity,normalizeConnectionStatus,normalizeConnectionStatuses,inboxStorageKey,readInbox,saveInbox,readInboxState,saveInboxState,statusStorageKey,readStatus,saveStatus,maskIban,normalizeBalances,balancesStorageKey,readBalances,saveBalances,availableBalanceTotals};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaEliteBankConnector=api;
})(typeof globalThis!=='undefined'?globalThis:this);
