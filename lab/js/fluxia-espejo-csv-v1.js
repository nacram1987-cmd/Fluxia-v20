/* Fluxia Élite · HTML Mother CSV parity inspector v1.
   Pure, bounded, deterministic. No network access, no writes, no account data persistence.
   CSV is a reference snapshot, NEVER ledger truth or a banking transaction feed. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FluxiaCSVParity=api;
})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const MAX_BYTES=5*1024*1024,MAX_RECORDS=10000,MAX_FIELD=600;
 function normal(v){return String(v==null?'':v).trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim()}
 function integerCents(value){
  const raw=String(value??'').trim().replace(/€/g,'').replace(/\s/g,'');
  if(!/^-?\d{1,10}(?:[.,]\d{1,2})?$/.test(raw))throw Error('Importe incorrecto: '+raw.slice(0,25));
  const neg=raw[0]==='-'?-1:1;
  const [whole,fraction='']=(neg===-1?raw.slice(1):raw).replace(',','.').split('.');
  const cents=neg*(Number(whole)*100+Number(fraction.padEnd(2,'0')||0));
  if(!Number.isSafeInteger(cents))throw Error('Importe fuera de rango');return cents
 }
 function validDate(value){
  const m=/^(20\d{2})-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.exec(String(value||'').trim());
  if(!m)return false;
  const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
  return d.getUTCFullYear()===+m[1]&&d.getUTCMonth()===+m[2]-1&&d.getUTCDate()===+m[3]
 }
 function scanCSV(text){
  if(typeof text!=='string'||text.length===0||text.length>MAX_BYTES)throw Error('CSV vacío o demasiado grande (máximo 5 MB)');
  const rows=[];let row=[],buffer='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
   const ch=text[i],next=text[i+1];
   if(ch==='"'){
    if(quoted&&next==='"'){buffer+='"';i++}
    else if(!quoted&&buffer===''){quoted=true}
    else if(quoted){quoted=false}
    else throw Error('Formato de comillas incorrecto en CSV')
   }else if(!quoted&&ch===';'){row.push(buffer);buffer='';if(row.length>12)throw Error('Columnas CSV inesperadas')}
   else if(!quoted&&(ch==='\n'||ch==='\r')){
    if(ch==='\r'&&next==='\n')i++;
    row.push(buffer);buffer='';
    if(row.some(v=>v.trim()))rows.push(row);
    row=[];if(rows.length>MAX_RECORDS+1)throw Error('Demasiados movimientos en el CSV')
   }else{buffer+=ch;if(buffer.length>MAX_FIELD)throw Error('Campo CSV excesivamente largo')}
  }
  if(quoted)throw Error('Comillas del CSV sin cerrar');
  if(row.length||buffer){row.push(buffer);if(row.some(v=>v.trim()))rows.push(row)}
  return rows
 }
 function parse(text,month){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Periodo solicitado incorrecto');
  const lines=scanCSV(text);
  if(!lines.length)throw Error('CSV sin encabezado');
  const head=lines.shift().map(normal);
  const required=['fecha','concepto','categoria','importe','origen'];
  for(const name of required)if(!head.includes(name))throw Error('Falta la columna '+name);
  if(new Set(head).size!==head.length)throw Error('Encabezados duplicados');
  const at=k=>head.indexOf(k),records=[],invalid=[],outOfMonth=[];
  lines.forEach((fields,i)=>{
   const rownum=i+2;
   if(fields.length!==head.length){invalid.push({line:rownum,error:'Número incorrecto de columnas'});return}
   const date=fields[at('fecha')].trim(),concept=fields[at('concepto')].trim();
   if(!validDate(date)||!concept){invalid.push({line:rownum,error:'Fecha o concepto no válidos'});return}
   let cents;try{cents=integerCents(fields[at('importe')])}catch(e){invalid.push({line:rownum,error:e.message});return}
   const item={line:rownum,fecha:date,concepto:concept,categoria:fields[at('categoria')].trim(),origen:fields[at('origen')].trim(),cents,importe:cents/100};
   if(date.slice(0,7)!==month)outOfMonth.push(item);
   else records.push(item)
  });
  const group=new Map();
  for(const x of records){const key=signature(x);const g=group.get(key)||{count:0,item:x};g.count++;group.set(key,g)}
  const repeated=[...group.values()].filter(x=>x.count>1);
  return {month,records,lines:lines.length,invalid,outOfMonth,repeats:repeated,repeatedExtra:repeated.reduce((n,g)=>n+g.count-1,0),cents:records.reduce((n,x)=>n+x.cents,0)}
 }
 function signature(x){return [x.fecha,normal(x.concepto),normal(x.categoria),Number(x.cents),normal(x.origen)].join('\u001f')}
 function csvCategoryTotals(parsed){
  const by=new Map();
  for(const x of parsed.records){const k=x.categoria||'Sin categoría';let y=by.get(k);if(!y){y={name:k,count:0,cents:0};by.set(k,y)}y.count++;y.cents+=x.cents}
  return [...by.values()].sort((a,b)=>b.cents-a.cents||a.name.localeCompare(b.name,'es'))
 }
 function originalVariable(x){
  if(!x||x.cuentaComoFijo||x.vinculoFijoId||x.excluido||x.excluidoDisponible||x.esTraspasoPropio)return false;
  if(['reponer_hucha','traspaso','traspaso_efectivo','puente','gasto_efectivo'].includes(x.tipoInterno)||x.origen==='efectivo')return false;
  const title=normal(x.concepto||x.descripcion||x.detalle);
  if(x.origen==='banco'&&/\b(cajero|atm|reintegro|retirada de efectivo|disposicion de efectivo|cash withdrawal|withdrawal)\b/.test(title))return false;
  return true
 }
 function applicable(x,month){
  const spanish=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][Number(month.slice(5))-1];
  if(typeof x.mes==='string'&&x.mes.trim()&&normal(x.mes)!==spanish&&normal(x.mes)!==normal(spanish+' '+month.slice(0,4)))return false;
  const d=String(x.fecha||x.fechaCargo||x.fechaPago||'').slice(0,10);
  // Month-only legacy record without dated year is still a candidate (not proof of posting).
  if(validDate(d))return d.slice(0,7)===month;
  return normal(x.mes)===spanish
 }
 function compare(parsed,cloudRows){
  if(!parsed||!Array.isArray(parsed.records)||!Array.isArray(cloudRows))throw Error('Fuente de comparación incorrecta');
  const pool=new Map();let inspected=0;
  for(const obj of cloudRows){
   if(!originalVariable(obj)||!applicable(obj,parsed.month))continue;
   const amount=typeof obj.importe==='number'?obj.importe:NaN;
   if(!Number.isFinite(amount))continue;
   const d=String(obj.fecha||obj.fechaCargo||obj.fechaPago||'').slice(0,10);
   if(!validDate(d))continue;
   const cents=Math.round(amount*100);
   if(!Number.isSafeInteger(cents))continue;
   const sig=signature({fecha:d,concepto:obj.concepto||obj.nombre||'',categoria:obj.categoria||'',origen:obj.origen||'',cents});
   pool.set(sig,(pool.get(sig)||0)+1);inspected++
  }
  let matching=0;const missing=[];
  for(const x of parsed.records){const sig=signature(x),qty=pool.get(sig)||0;if(qty>0){pool.set(sig,qty-1);matching++}else missing.push(x)}
  const extraCloud=[...pool.values()].reduce((s,n)=>s+n,0);
  return {matching,missing,extraCloud,inspected,expected:parsed.records.length,covered:missing.length===0&&extraCloud===0&&parsed.invalid.length===0&&parsed.outOfMonth.length===0}
 }
 return Object.freeze({parse,compare,csvCategoryTotals,integerCents,validDate,signature,originalVariable,applicable})
});