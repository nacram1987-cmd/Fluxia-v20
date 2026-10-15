(function(root){
 'use strict';
 // Contrato seguro para reutilizar el conector bancario del HTML madre.
 // Este módulo no llama al proveedor ni escribe en Supabase: solo valida y planifica.
 function cents(value){
  if(typeof value==='bigint')return value;
  if(typeof value==='number'&&Number.isFinite(value))return BigInt(Math.round(value*100));
  if(typeof value==='string'&&value.trim()){
   var normalized=value.trim().replace(/\s/g,'').replace(/\.(?=.*\.)/g,'').replace(',','.');
   if(/^-?\d+(?:\.\d+)?$/.test(normalized))return BigInt(Math.round(Number(normalized)*100));
  }
  return null;
 }
 function first(row,keys){for(var i=0;i<keys.length;i++){var value=row&&row[keys[i]];if(value!==undefined&&value!==null&&String(value).trim()!=='')return value}return null}
 function isSyntheticBankRef(value){
  var text=String(value||'').trim();
  return /^[^|]+\|\d{4}-\d{2}-\d{2}\|-?\d+(?:[.,]\d+)?\|.{0,40}$/.test(text);
 }
 function stableId(row){
  var value=first(row,['bankRef','bancoIdentity','bancoRef','providerTransactionId','transactionId','externalId','id','movimientoId']);
  if(value===null)return '';
  var text=String(value).trim();
  return isSyntheticBankRef(text)?'':text;
 }
 function normalizeDate(value){
  if(value===null||value===undefined||String(value).trim()==='')return null;
  var text=String(value).trim();
  var date= /^\d{4}-\d{2}-\d{2}$/.test(text)?new Date(text+'T00:00:00Z'):new Date(text);
  return Number.isNaN(date.getTime())?null:text;
 }
 function normalize(row){
  if(!row||typeof row!=='object')return {ok:false,reason:'INVALID_RECORD'};
  var id=stableId(row), amount=first(row,['importeCents','amountCents','cents','importe','amount','valor']);
  var explicitCents=first(row,['importeCents','amountCents','cents']);
  var amountCents=amount===null?null:(explicitCents!==null&&/^-?\d+$/.test(String(explicitCents).trim())?BigInt(String(explicitCents).trim()):cents(amount));
  var date=normalizeDate(first(row,['fechaOperacion','fecha','date','bookingDate','valueDate']));
  if(!id){var candidate=first(row,['bankRef','bancoRef','providerTransactionId','transactionId','externalId','id','movimientoId']);return {ok:false,reason:isSyntheticBankRef(candidate)?'UNSTABLE_SYNTHETIC_BANK_REF':'MISSING_STABLE_BANK_REF',bankRef:candidate===null?'':String(candidate).trim()};}
  if(amountCents===null||amountCents===0n)return {ok:false,reason:'INVALID_AMOUNT',bankRef:id};
  if(date===null)return {ok:false,reason:'INVALID_OPERATION_DATE',bankRef:id};
  var fixedId=String(first(row,['fijoId','pagoFijoId','vinculoFijoId','fixedId'])||'');
  var role=row.cuentaComoFijo===true||fixedId?'fixed-linked':
   row.esTraspasoPropio===true||row.transfer===true?'transfer':
   row.origen==='efectivo'||row.cash===true?'cash':'bank-movement';
  return {ok:true,record:{bankRef:id,amountCents:amountCents,date:date,concept:String(first(row,['concepto','concept','descripcion','description','merchant'])||''),role:role,fixedId:fixedId,source:'original-bank-connector',raw:row}};
 }
 function setOf(values){
  var set=new Set();
  (Array.isArray(values)?values:[]).forEach(function(value){var id=typeof value==='object'?stableId(value):String(value||'').trim();if(id)set.add(id)});
  return set;
 }
 function same(a,b){return a&&b&&a.amountCents===b.amountCents&&a.date===b.date&&a.role===b.role&&a.fixedId===b.fixedId&&a.concept===b.concept}
 function planImport(existing,incoming,tombstones,resolutions){
  var existingRows=Array.isArray(existing)?existing:[], incomingRows=Array.isArray(incoming)?incoming:[], choices=resolutions&&typeof resolutions==='object'?resolutions:{};
  var existingMap=new Map(), additions=[], duplicates=[], blocked=[], conflicts=[], invalid=[], resolved=[];
  existingRows.forEach(function(row){var item=normalize(row);if(item.ok&&!existingMap.has(item.record.bankRef))existingMap.set(item.record.bankRef,item.record)});
  var deleted=setOf(tombstones&&tombstones.deletedBankRefs), excluded=setOf(tombstones&&tombstones.excludedBankRefs);
  incomingRows.forEach(function(row){
   var item=normalize(row);
   if(!item.ok){invalid.push(item);return}
   var record=item.record;
   if(deleted.has(record.bankRef)||excluded.has(record.bankRef)){blocked.push({bankRef:record.bankRef,reason:deleted.has(record.bankRef)?'TOMBSTONE':'EXCLUDED'});return}
   var previous=existingMap.get(record.bankRef);
   if(previous){
    if(same(previous,record)){duplicates.push(record.bankRef);return}
    var choice=choices[record.bankRef];
    if(choice==='keep-existing'){resolved.push({bankRef:record.bankRef,decision:choice,existing:previous,incoming:record});return}
    if(choice==='propose-incoming'){resolved.push({bankRef:record.bankRef,decision:choice,existing:previous,incoming:record});return}
    conflicts.push({bankRef:record.bankRef,existing:previous,incoming:record});return
   }
   if(additions.some(function(row){return row.bankRef===record.bankRef})){duplicates.push(record.bankRef);return}
   additions.push(record);
  });
  return {ok:invalid.length===0&&conflicts.length===0,additions:additions,duplicates:[...new Set(duplicates)],blocked:blocked,conflicts:conflicts,invalid:invalid,resolved:resolved,stableIds:additions.map(function(row){return row.bankRef})};
 }
 var api={version:'1.1.0',source:'original-bank-connector',cents:cents,isSyntheticBankRef:isSyntheticBankRef,stableId:stableId,normalize:normalize,planImport:planImport};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.FluxiaEliteBankAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
