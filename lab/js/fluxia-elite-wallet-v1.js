/* Fluxia Élite · cartera dinero en mano read-only audit engine, based on HTML mother v97.
   No storage/network/writes. Snapshot balance is authoritative FOR ITS SNAPSHOT DATE ONLY.
   Never add spending a second time to Variables or treat cash as bank Disponible. */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FluxiaWalletAudit=api;
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const MAX_MOVEMENTS=10000;
 function cents(value){
  if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>100000000) return null;
  const v=Math.round(value*100);
  return Number.isSafeInteger(v)?v:null;
 }
 const outgoing=new Set(['salida','salida_provision']);
 const incoming=new Set(['entrada']);
 function inspect(raw){
  if(raw==null)return {ok:false,reason:'Colección no disponible'};
  if(typeof raw!=='object'||Array.isArray(raw))return {ok:false,reason:'La cartera original no tiene formato de objeto'};
  if(!Array.isArray(raw.movimientos)||raw.movimientos.length>MAX_MOVEMENTS)return {ok:false,reason:'Historial de cartera incorrecto o demasiado grande'};
  const amount=cents(raw.saldo);
  if(amount===null)return {ok:false,reason:'Saldo de la cartera ilegible'};
  const warnings=[],seen=new Set();
  const movements=raw.movimientos.map((m,index)=>{
   const id=String(m?.id??'').trim();
   const date=typeof m?.fecha==='string'?m.fecha.slice(0,10):'';
   const timestamp=/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null;
   const type=String(m?.tipo??'').trim();
   const value=cents(m?.importe);
   const validType=incoming.has(type)||outgoing.has(type);
   if(!id)warnings.push('Movimiento sin identificador en posición '+(index+1));
   else if(seen.has(id))warnings.push('Identificador repetido en cartera; requiere auditoría');
   else seen.add(id);
   if(value===null||value<=0)warnings.push('Importe de cartera no válido en posición '+(index+1));
   if(!validType)warnings.push('Tipo de movimiento de cartera no reconocido en posición '+(index+1));
   return {
    id,index,fecha:timestamp,fechaOriginal:m?.fecha??null,tipo:type,
    cents:value,concepto:String(m?.concepto??'Movimiento').slice(0,160),
    categoria:String(m?.categoria??'').slice(0,100),
    gastoId:m?.gastoId==null?null:String(m.gastoId),
    usoProvisionId:m?.usoProvisionId==null?null:String(m.usoProvisionId),
    provision:m?.provision==null?null:String(m.provision),
    clase:incoming.has(type)?'entrada':outgoing.has(type)?'salida':'desconocido'
   };
  });
  return {ok:true,saldoCents:amount,movements,warnings};
 }
 function month(snapshot,yearMonth){
  if(!snapshot?.ok||!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth))return null;
  const rows=snapshot.movements.filter(m=>m.fecha?.slice(0,7)===yearMonth);
  const total=(predicate)=>rows.filter(predicate).reduce((a,m)=>a+(m.cents||0),0);
  return {records:rows.slice().sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')||b.index-a.index),
   entradasCents:total(m=>m.tipo==='entrada'),
   gastosCents:total(m=>m.tipo==='salida'),
   usosProvisionCents:total(m=>m.tipo==='salida_provision'),
   count:rows.length,
   unknownCount:rows.filter(m=>m.clase==='desconocido'||m.cents===null).length
  }
 }
 function compareMovements(htmlRaw,cloudRaw){
  const html=inspect(htmlRaw),cloud=inspect(cloudRaw);
  if(!html.ok||!cloud.ok)return {ready:false,reason:!html.ok?html.reason:cloud.reason};
  const result={ready:true,equivalent:false,htmlCount:html.movements.length,cloudCount:cloud.movements.length,htmlOnly:[],cloudOnly:[],different:[],duplicates:[],withoutId:0,htmlBalanceCents:html.saldoCents,cloudBalanceCents:cloud.saldoCents,balanceDeltaCents:html.saldoCents-cloud.saldoCents};
  const index=(snapshot,origin)=>{
   const map=new Map();
   for(const movement of snapshot.movements){
    if(!movement.id){result.withoutId++;continue}
    if(map.has(movement.id)){result.duplicates.push({id:movement.id,origin});continue}
    map.set(movement.id,movement)
   }
   return map
  };
  const left=index(html,'HTML'),right=index(cloud,'Supabase');
  const fields=['fecha','tipo','cents','concepto','categoria','gastoId','usoProvisionId','provision'];
  for(const [id,movement] of left){
   if(!right.has(id)){result.htmlOnly.push(movement);continue}
   const other=right.get(id),changed=fields.filter(key=>movement[key]!==other[key]);
   if(changed.length)result.different.push({id,movement,cloudMovement:other,changed})
  }
  for(const [id,movement] of right)if(!left.has(id))result.cloudOnly.push(movement);
  result.equivalent=result.htmlOnly.length===0&&result.cloudOnly.length===0&&result.different.length===0&&result.duplicates.length===0&&result.withoutId===0&&result.balanceDeltaCents===0;
  return result
 }
 function linkConflicts(snapshot,variableRows,usosRows){
  if(!snapshot?.ok)return [];
  const varIds=new Set((Array.isArray(variableRows)?variableRows:[]).map(x=>String(x.id||'')).filter(Boolean));
  const usoIds=new Set((Array.isArray(usosRows)?usosRows:[]).map(x=>String(x.id||'')).filter(Boolean));
  const conflicts=[];
  for(const m of snapshot.movements){
   if(m.tipo==='salida'&&m.gastoId&&!varIds.has(m.gastoId))conflicts.push({id:m.id,kind:'gasto',linkedId:m.gastoId});
   if(m.tipo==='salida_provision'&&m.usoProvisionId&&!usoIds.has(m.usoProvisionId))conflicts.push({id:m.id,kind:'provision',linkedId:m.usoProvisionId});
  }
  return conflicts
 }
 return Object.freeze({inspect,month,linkConflicts,compareMovements,cents});
});