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
 function abs(value){return value<0n?-value:value}
 // Identidad = referencia bancaria estable + fecha + importe en valor absoluto. El libro guarda los gastos en positivo y el banco
 // los envía en negativo; el concepto, el rol y el vínculo a fijo son clasificación del usuario y no son un conflicto contable.
 function same(a,b){return !!(a&&b&&abs(a.amountCents)===abs(b.amountCents)&&a.date===b.date)}
 // La misma transacción puede llegar como identidad del conector («fxbank9770:[proveedor,banco,cuenta,ref]») o como UUID
 // antigua de la ref estable. Se compara siempre por la ref estable del proveedor, para no duplicar cargos ya contabilizados.
 function canonicalRef(value){
  var text=String(value||'').trim();
  if(text.indexOf('fxbank9770:')===0){try{var parts=JSON.parse(text.slice('fxbank9770:'.length));if(Array.isArray(parts)&&parts.length)return String(parts[parts.length-1]).trim()}catch(_e){}}
  return text;
 }
 function canonicalSet(values){
  var set=new Set();
  setOf(values).forEach(function(value){set.add(canonicalRef(value))});
  return set;
 }
 function identitiesOf(row){
  var keys=['bankRef','bancoIdentity','bancoRef','bancoStableRef','bancoLegacyId'];
  return keys.map(function(k){return row&&row[k]?canonicalRef(row[k]):''}).filter(Boolean);
 }
 // Reglas de clasificación del HTML (guardadas en la nube por el propio usuario). Sin nombres fijos en el código:
 // una regla casa si todas sus palabras aparecen en el concepto; gana la más larga; la más nueva sustituye a la igual;
 // «olvidar» anula. Solo «propio» y «puente» son traspasos: no cuentan como gasto ni como ingreso.
 function ruleWords(text){
  return String(text||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(Boolean);
 }
 function classifyTransfer(concept,amountCents,rules){
  if(!Array.isArray(rules)||!rules.length||amountCents===null||amountCents===undefined)return null;
  var words=ruleWords(concept), direction=amountCents<0n?'out':'in', latest=new Map();
  rules.forEach(function(rule){
   if(!rule||!Array.isArray(rule.t)||!rule.t.length)return;
   var need=rule.t.map(function(w){return String(w).toLowerCase()}).sort(), key=need.join(' ');
   var previous=latest.get(key);
   if(!previous||Number(rule.ts||0)>Number(previous.rule.ts||0))latest.set(key,{rule:rule,need:need});
  });
  var best=null;
  latest.forEach(function(entry){
   if(!entry.need.every(function(w){return words.indexOf(w)>=0}))return;
   var dir=entry.rule.dir||'*';
   if(dir!=='*'&&dir!==direction)return;
   if(!best||entry.need.length>best.need.length)best=entry;
  });
  if(!best||best.rule.tipo==='olvidar')return null;
  return best.rule.tipo==='propio'||best.rule.tipo==='puente'?best.rule.tipo:null;
 }
 function planImport(existing,incoming,tombstones,resolutions,rules){
  var existingRows=Array.isArray(existing)?existing:[], incomingRows=Array.isArray(incoming)?incoming:[], choices=resolutions&&typeof resolutions==='object'?resolutions:{};
  var existingMap=new Map(), additions=[], duplicates=[], blocked=[], conflicts=[], invalid=[], resolved=[], classified=[];
  existingRows.forEach(function(row){
   var item=normalize(row);
   if(!item.ok)return;
   identitiesOf(row).concat([canonicalRef(item.record.bankRef)]).forEach(function(key){if(!existingMap.has(key))existingMap.set(key,item.record)});
  });
  var deleted=canonicalSet(tombstones&&tombstones.deletedBankRefs), excluded=canonicalSet(tombstones&&tombstones.excludedBankRefs);
  incomingRows.forEach(function(row){
   var item=normalize(row);
   if(!item.ok){invalid.push(item);return}
   var record=item.record;
   var key=canonicalRef(record.bankRef);
   if(deleted.has(key)||excluded.has(key)){blocked.push({bankRef:record.bankRef,reason:deleted.has(key)?'TOMBSTONE':'EXCLUDED'});return}
   var previous=existingMap.get(canonicalRef(record.bankRef));
   if(previous){
    if(same(previous,record)){duplicates.push(record.bankRef);return}
    var choice=choices[record.bankRef];
    if(choice==='keep-existing'){resolved.push({bankRef:record.bankRef,decision:choice,existing:previous,incoming:record});return}
    if(choice==='propose-incoming'){resolved.push({bankRef:record.bankRef,decision:choice,existing:previous,incoming:record});return}
    conflicts.push({bankRef:record.bankRef,existing:previous,incoming:record});return
   }
   if(additions.some(function(row){return row.bankRef===record.bankRef})){duplicates.push(record.bankRef);return}
   var kind=classifyTransfer(record.concept,record.amountCents,rules);
   if(kind){classified.push({bankRef:record.bankRef,kind:kind,record:record});return}
   additions.push(record);
  });
  return {ok:invalid.length===0&&conflicts.length===0,additions:additions,duplicates:[...new Set(duplicates)],blocked:blocked,conflicts:conflicts,invalid:invalid,resolved:resolved,classified:classified,stableIds:additions.map(function(row){return row.bankRef})};
 }
 var api={version:'1.3.0',source:'original-bank-connector',cents:cents,isSyntheticBankRef:isSyntheticBankRef,stableId:stableId,canonicalRef:canonicalRef,normalize:normalize,planImport:planImport,classifyTransfer:classifyTransfer};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.FluxiaEliteBankAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
