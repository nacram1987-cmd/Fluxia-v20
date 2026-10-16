(function(root){
 'use strict';
 /* Fluxia Élite · motor de conciliación v2.0.25 (SOLO LECTURA, determinista, sin red, sin escrituras).
  *
  * Qué hace: céntimos exactos, fechas en Europa/Madrid, libro mayor por registro, comparación
  * HTML ↔ Élite por ID estable, conciliación bancaria sin fusionar ambiguos, simulación de doble
  * sincronización, huellas SHA-256 y evaluación de los criterios de certificación [a]–[h].
  *
  * Qué NO hace: no calcula el Disponible (la fórmula vive una sola vez en el HTML:
  * availableComputeFrom) ni escribe en Supabase. Una prueba sintética nunca certifica datos reales.
  */
 var TZ='Europe/Madrid';
 var VERSION='1.0.0';
 var VOLATILE_FIELDS={_fxUpdatedAt:true};
 var MODULE_ORDER=['ingresos','fijos','variables','financiaciones','compartidos','huchas','usos'];
 var AMOUNT_KEYS=['importe','cuota','importeMensual','total','importeInicial','amount','valor'];

 /* ───────── utilidades ───────── */
 function isObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
 function canonicalJson(value){
  if(typeof value==='bigint')return JSON.stringify(value.toString()+'n');
  if(value===null||typeof value!=='object'){var s=JSON.stringify(value);return s===undefined?'null':s}
  if(Array.isArray(value))return '['+value.map(canonicalJson).join(',')+']';
  var keys=Object.keys(value).filter(function(k){return !VOLATILE_FIELDS[k]&&value[k]!==undefined}).sort();
  return '{'+keys.map(function(k){return JSON.stringify(k)+':'+canonicalJson(value[k])}).join(',')+'}';
 }
 var K256=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 function utf8Bytes(text){
  if(typeof TextEncoder!=='undefined')return Array.prototype.slice.call(new TextEncoder().encode(text));
  var out=[],s=unescape(encodeURIComponent(text));for(var i=0;i<s.length;i++)out.push(s.charCodeAt(i));return out;
 }
 function sha256Hex(message){
  var bytes=utf8Bytes(String(message)),bitLen=bytes.length*8;
  bytes.push(0x80);while(bytes.length%64!==56)bytes.push(0);
  var hi=Math.floor(bitLen/0x100000000),lo=bitLen>>>0;
  bytes.push((hi>>>24)&255,(hi>>>16)&255,(hi>>>8)&255,hi&255,(lo>>>24)&255,(lo>>>16)&255,(lo>>>8)&255,lo&255);
  var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],W=new Array(64);
  function rotr(x,n){return (x>>>n)|(x<<(32-n))}
  for(var off=0;off<bytes.length;off+=64){
   for(var t=0;t<16;t++)W[t]=((bytes[off+4*t]<<24)|(bytes[off+4*t+1]<<16)|(bytes[off+4*t+2]<<8)|bytes[off+4*t+3])>>>0;
   for(t=16;t<64;t++){var s0=rotr(W[t-15],7)^rotr(W[t-15],18)^(W[t-15]>>>3),s1=rotr(W[t-2],17)^rotr(W[t-2],19)^(W[t-2]>>>10);W[t]=(W[t-16]+s0+W[t-7]+s1)>>>0}
   var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
   for(t=0;t<64;t++){
    var S1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(h+S1+ch+K256[t]+W[t])>>>0;
    var S0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(S0+maj)>>>0;
    h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
   }
   H[0]=(H[0]+a)>>>0;H[1]=(H[1]+b)>>>0;H[2]=(H[2]+c)>>>0;H[3]=(H[3]+d)>>>0;H[4]=(H[4]+e)>>>0;H[5]=(H[5]+f)>>>0;H[6]=(H[6]+g)>>>0;H[7]=(H[7]+h)>>>0;
  }
  return H.map(function(x){return ('00000000'+x.toString(16)).slice(-8)}).join('');
 }
 function checksum(value){return sha256Hex(canonicalJson(value))}
 function pseudonym(ownerId,id){return 'ref:'+sha256Hex('fluxia-pseudo|'+String(ownerId||'')+'|'+String(id||'')).slice(0,10)}
 function normalizeText(v){return String(v==null?'':v).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}

 /* ───────── dinero exacto ───────── */
 // Devuelve {cents:BigInt|null, exact:boolean, reason}. Un número con fracciones de céntimo reales
 // (p. ej. 1,005) NO se redondea en silencio: exact=false. Solo se tolera el ruido binario ≤1e-6.
 function centsDetail(value){
  if(typeof value==='bigint')return {cents:value,exact:true};
  if(typeof value==='number'){
   if(!isFinite(value))return {cents:null,exact:false,reason:'NO_FINITO'};
   var n=value*100,r=Math.round(n);
   if(Math.abs(n-r)<=1e-6)return {cents:BigInt(r),exact:true};
   return {cents:BigInt(r),exact:false,reason:'FRACCION_DE_CENTIMO'};
  }
  if(typeof value==='string'){
   var t=value.trim().replace(/\s/g,'');
   if(!t)return {cents:null,exact:false,reason:'VACIO'};
   // «1.234» es ambiguo (¿1,234 o 1234?): nunca se adivina. Con coma decimal o con 2+ grupos sí es formato ES.
   if(/^-?\d{1,3}\.\d{3}$/.test(t))return {cents:null,exact:false,reason:'FORMATO_AMBIGUO'};
   if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t))t=t.replace(/\./g,'').replace(',','.');
   else if(/^-?\d+,\d+$/.test(t))t=t.replace(',','.');
   var m=/^(-?)(\d+)(?:\.(\d+))?$/.exec(t);
   if(!m)return {cents:null,exact:false,reason:'FORMATO_NO_NUMERICO'};
   var frac=m[3]||'',main=BigInt(m[2])*100n,two=BigInt((frac+'00').slice(0,2)),rest=frac.slice(2),res=main+two;
   var exact=/^0*$/.test(rest);
   return {cents:m[1]==='-'?-res:res,exact:exact,reason:exact?undefined:'FRACCION_DE_CENTIMO'};
  }
  return {cents:null,exact:false,reason:'TIPO_NO_SOPORTADO'};
 }
 function formatCents(c){
  if(typeof c!=='bigint')return '—';
  var neg=c<0n,abs=neg?-c:c,units=(abs/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'),dec=('0'+(abs%100n).toString()).slice(-2);
  return (neg?'-':'')+units+','+dec+' €';
 }
 function amountOfRow(row){
  if(!isObject(row))return {cents:null,exact:false,reason:'REGISTRO_INVALIDO'};
  for(var i=0;i<AMOUNT_KEYS.length;i++){var v=row[AMOUNT_KEYS[i]];if(v!==undefined&&v!==null&&v!=='')return centsDetail(v)}
  return {cents:null,exact:false,reason:'SIN_IMPORTE'};
 }

 /* ───────── fechas Europa/Madrid ───────── */
 var dtf=null;
 function madridParts(instant){
  var d=instant instanceof Date?instant:new Date(instant);
  if(isNaN(d.getTime()))return null;
  if(!dtf)dtf=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  var p={};dtf.formatToParts(d).forEach(function(x){p[x.type]=x.value});
  return {date:p.year+'-'+p.month+'-'+p.day,month:p.year+'-'+p.month,year:Number(p.year),time:p.hour+':'+p.minute+':'+p.second};
 }
 // 'YYYY-MM-DD' y 'DD/MM/YYYY' son fechas contables ya locales; un instante con 'Z' u offset se
 // convierte a Europa/Madrid (31/10 23:30Z ya es 01/11 en Madrid). Sin offset: se toma la fecha escrita.
 function madridDate(value){
  if(value instanceof Date)return (madridParts(value)||{}).date||null;
  if(typeof value!=='string')return null;
  var s=value.trim(),m;
  if((m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s)))return validYmd(+m[1],+m[2],+m[3])?s:null;
  if((m=/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})$/.exec(s)))return validYmd(+m[3],+m[2],+m[1])?m[3]+'-'+m[2]+'-'+m[1]:null;
  if(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/.test(s)){var p=madridParts(s.replace(' ','T'));return p?p.date:null}
  if((m=/^(\d{4})-(\d{2})-(\d{2})[T ]\d{2}:\d{2}/.exec(s)))return validYmd(+m[1],+m[2],+m[3])?m[1]+'-'+m[2]+'-'+m[3]:null;
  return null;
 }
 function validYmd(y,mo,d){
  if(y<2000||y>2100||mo<1||mo>12||d<1||d>31)return false;
  var c=new Date(Date.UTC(y,mo-1,d));return c.getUTCFullYear()===y&&c.getUTCMonth()===mo-1&&c.getUTCDate()===d;
 }
 function madridMonth(value){var d=madridDate(value);return d?d.slice(0,7):null}
 function madridToday(cutoff){var p=madridParts(cutoff);return p?p.date:null}

 /* ───────── libro mayor ───────── */
 // Una entrada = un registro con identidad única, fuente, fecha, mes, importe en céntimos,
 // naturaleza, estado, impacto en Disponible (BigInt, con signo) y regla aplicada.
 function ledgerEntry(e){
  return {module:e.module,id:String(e.id==null?'':e.id),index:e.index==null?-1:e.index,source:e.source||'',date:e.date||null,month:e.month||null,
   cents:typeof e.cents==='bigint'?e.cents:null,nature:e.nature||'',status:e.status||'',impactCents:typeof e.impactCents==='bigint'?e.impactCents:0n,rule:e.rule||'',flags:e.flags||[]};
 }
 function sortLedger(entries){
  return entries.slice().sort(function(a,b){
   var ma=MODULE_ORDER.indexOf(a.module),mb=MODULE_ORDER.indexOf(b.module);
   if(ma!==mb)return ma-mb;
   if((a.date||'')!==(b.date||''))return (a.date||'')<(b.date||'')?-1:1;
   if(a.id!==b.id)return a.id<b.id?-1:1;
   return a.index-b.index;
  });
 }
 function summarizeLedger(entries){
  var byModule={},total=0n;
  entries.forEach(function(e){
   var m=byModule[e.module]||(byModule[e.module]={count:0,impactCents:0n});
   m.count++;m.impactCents+=e.impactCents;total+=e.impactCents;
  });
  return {byModule:byModule,totalCents:total,count:entries.length};
 }
 function verifyLedger(entries,expectedCents){
  var s=summarizeLedger(entries),delta=s.totalCents-expectedCents;
  return {ok:delta===0n,deltaCents:delta,totalCents:s.totalCents,byModule:s.byModule};
 }
 function ledgerKey(e){return e.module+'|'+e.id}
 // Compara dos libros (HTML vs Élite): delta por módulo, global y por registro.
 function compareLedgers(htmlLedger,eliteLedger,opts){
  opts=opts||{};var ownerId=opts.ownerId||'';
  var a=summarizeLedger(htmlLedger),b=summarizeLedger(eliteLedger),mods={};
  Object.keys(a.byModule).concat(Object.keys(b.byModule)).forEach(function(m){
   if(mods[m])return;
   var x=a.byModule[m]||{count:0,impactCents:0n},y=b.byModule[m]||{count:0,impactCents:0n};
   mods[m]={module:m,htmlCount:x.count,eliteCount:y.count,htmlCents:x.impactCents,eliteCents:y.impactCents,deltaCents:y.impactCents-x.impactCents};
  });
  var ha=groupByKey(htmlLedger),eb=groupByKey(eliteLedger),diffs=[];
  Object.keys(ha).concat(Object.keys(eb)).filter(function(k,i,arr){return arr.indexOf(k)===i}).sort().forEach(function(k){
   var x=ha[k],y=eb[k],sx=sumImpact(x),sy=sumImpact(y);
   if(x&&y&&sx===sy&&x.length===y.length)return;
   var ref=(x||y)[0],ruleH=x?x[0].rule:'',ruleE=y?y[0].rule:'';
   diffs.push({module:ref.module,ref:opts.raw?ref.id:pseudonym(ownerId,ref.id),date:ref.date,htmlCents:x?sx:null,eliteCents:y?sy:null,deltaCents:(y?sy:0n)-(x?sx:0n),
    cause:!x?'SOLO_EN_NUBE_ELITE':!y?'SOLO_EN_HTML':x.length!==y.length?'REGISTRO_REPETIDO_EN_UN_LADO':'IMPACTO_DISTINTO',
    evidence:x&&y?'HTML: '+ruleH+' · Élite: '+ruleE:'regla '+ref.rule,action:!x?'Comprobar si el HTML ya lo descartó o si la nube conserva un registro antiguo':!y?'Sincronizar el registro del HTML con la nube (escritura autorizada)':'Comparar campos del registro en ambas fuentes'});
  });
  return {modules:mods,htmlTotalCents:a.totalCents,eliteTotalCents:b.totalCents,deltaCents:b.totalCents-a.totalCents,diffs:diffs};
 }
 // Registros descartados/archivados en un lado que siguen contando en el otro (resurrección).
 function crossTombstoneConflicts(htmlLedger,eliteLedger){
  var a=groupByKey(htmlLedger||[]),b=groupByKey(eliteLedger||[]),n=0;
  function dead(list){return !!list&&list.some(function(e){return e.flags.indexOf('DESCARTADO')>=0})}
  function live(list){return !!list&&list.some(function(e){return e.impactCents!==0n})}
  Object.keys(a).concat(Object.keys(b)).filter(function(k,i,arr){return arr.indexOf(k)===i}).forEach(function(k){if((dead(a[k])&&live(b[k]))||(dead(b[k])&&live(a[k])))n++});
  return n;
 }
 function groupByKey(list){var o={};list.forEach(function(e){var k=ledgerKey(e);(o[k]||(o[k]=[])).push(e)});return o}
 function sumImpact(list){return list?list.reduce(function(t,e){return t+e.impactCents},0n):0n}

 /* ───────── comparación de colecciones HTML ↔ Élite ───────── */
 function rowId(row){
  if(!isObject(row))return '';
  var v=row.id!=null&&String(row.id).trim()?row.id:row.movimientoId!=null&&String(row.movimientoId).trim()?row.movimientoId:row.bancoRef;
  return v==null?'':String(v).trim();
 }
 function differingFields(a,b){
  var keys={};Object.keys(a||{}).concat(Object.keys(b||{})).forEach(function(k){if(!VOLATILE_FIELDS[k])keys[k]=true});
  return Object.keys(keys).sort().filter(function(k){return canonicalJson(a?a[k]:undefined)!==canonicalJson(b?b[k]:undefined)});
 }
 function classifyCause(fields,htmlRow,eliteRow){
  var amount=fields.filter(function(f){return AMOUNT_KEYS.indexOf(f)>=0||f==='repuesto'||f==='aportaciones'});
  var date=fields.filter(function(f){return /^(fecha|mes|periodo|inicio|fin|fechaPrevista|pagadoEl)/.test(f)});
  var state=fields.filter(function(f){return /^(estado|pagado|paid|cobrado|pendiente)$/.test(f)});
  var link=fields.filter(function(f){return /(vinculo|fijoId|pagoFijo|cuentaComoFijo|bancoRef|bancoIdentity|provisionId|huchaId)/i.test(f)});
  var excl=fields.filter(function(f){return /(excluid|archiv|papelera|elimin|deleted|rechaz|descart)/i.test(f)});
  var parts=[];
  if(amount.length)parts.push('IMPORTE_DISTINTO');
  if(date.length)parts.push('FECHA_O_MES_DISTINTO');
  if(state.length)parts.push('ESTADO_DISTINTO');
  if(link.length)parts.push('VINCULO_DISTINTO');
  if(excl.length)parts.push('EXCLUSION_DISTINTA');
  if(!parts.length)parts.push('CAMPOS_DISTINTOS');
  var hu=Date.parse(htmlRow&&htmlRow._fxUpdatedAt),eu=Date.parse(eliteRow&&eliteRow._fxUpdatedAt),hint='';
  if(isFinite(hu)&&isFinite(eu)&&hu!==eu)hint=hu>eu?' · la nube parece más antigua que el HTML':' · la nube parece más reciente que el HTML';
  return parts.join('+')+hint;
 }
 function compareCollections(o){
  var ownerId=o.ownerId||'',moduleId=o.module,htmlRows=o.htmlRows,eliteRows=o.eliteRows,inPeriod=o.inPeriod||function(){return true};
  if(!Array.isArray(htmlRows)||!Array.isArray(eliteRows))return {module:moduleId,state:'NO_VERIFICADO',reason:!Array.isArray(htmlRows)?'Falta la fuente HTML':'Falta la fuente Élite',diffs:[],missing:0,unexpected:0,mismatches:0,unidentified:0,duplicates:0,unexplained:0,htmlCount:Array.isArray(htmlRows)?htmlRows.length:null,eliteCount:Array.isArray(eliteRows)?eliteRows.length:null,htmlSumCents:null,eliteSumCents:null,deltaCents:null};
  var hMap=new Map(),eMap=new Map(),unidentified=0,duplicates=0;
  function index(rows,map){rows.forEach(function(row){var id=rowId(row);if(!id){unidentified++;return}if(map.has(id))duplicates++;else map.set(id,row)})}
  index(htmlRows,hMap);index(eliteRows,eMap);
  var diffs=[],missing=0,unexpected=0,mismatches=0,hSum=0n,eSum=0n,badAmounts=0;
  function sumOf(rows,which){var t=0n;rows.forEach(function(r){if(!inPeriod(r))return;var d=amountOfRow(r);if(d.cents!==null)t+=d.cents;else if(d.reason!=='SIN_IMPORTE')badAmounts++});return t}
  hSum=sumOf(htmlRows);eSum=sumOf(eliteRows);
  function pack(row,cause,evidence,action,hRow,eRow,fields){
   var h=hRow?amountOfRow(hRow).cents:null,e=eRow?amountOfRow(eRow).cents:null;
   return {module:moduleId,ref:o.raw?rowId(row):pseudonym(ownerId,rowId(row)),date:madridDate(String(row.fecha||row.fechaOperacion||row.fechaPrevista||''))||(row.mes||row.periodo||null),
    htmlCents:h,eliteCents:e,deltaCents:(e===null?0n:e)-(h===null?0n:h),cause:cause,evidence:evidence,action:action,fields:fields||[],inPeriod:!!inPeriod(row)};
  }
  hMap.forEach(function(row,id){
   var other=eMap.get(id);
   if(!other){missing++;diffs.push(pack(row,'FALTA_EN_ELITE','ID presente en HTML y ausente en nube','Revisar si la nube no recibió el registro o si Élite lo filtró',row,null));return}
   var fields=differingFields(row,other);
   if(fields.length){mismatches++;diffs.push(pack(row,classifyCause(fields,row,other),'mismo ID, campos distintos: '+fields.slice(0,6).join(', '),'Decidir qué fuente es la vigente y sincronizar con autorización',row,other,fields))}
  });
  eMap.forEach(function(row,id){if(!hMap.has(id)){unexpected++;diffs.push(pack(row,'EXTRA_EN_ELITE','ID presente en nube y ausente en el HTML','Comprobar si el HTML lo descartó (papelera) o si es un registro huérfano',null,row))}});
  diffs.sort(function(a,b){return (a.module+a.ref)<(b.module+b.ref)?-1:1});
  var blocking=diffs.filter(function(d){return d.inPeriod}).length;
  var state=unidentified||duplicates?'IDENTIDAD_INSUFICIENTE':diffs.length?'DIFERENCIAS':'COINCIDE';
  return {module:moduleId,state:state,htmlCount:htmlRows.length,eliteCount:eliteRows.length,htmlSumCents:hSum,eliteSumCents:eSum,deltaCents:eSum-hSum,missing:missing,unexpected:unexpected,mismatches:mismatches,unidentified:unidentified,duplicates:duplicates,badAmounts:badAmounts,diffs:diffs,unexplained:blocking+unidentified+duplicates};
 }

 /* ───────── sospechas de duplicado (nunca se fusionan) ───────── */
 function fingerprint(row,opts){
  var date=madridDate(String(row.fechaOperacion||row.fecha||row.date||'')),c=amountOfRow(row).cents;
  if(!date||c===null)return '';
  return [date,c.toString(),normalizeText(row.concepto||row.descripcion||row.detalle||row.nombre||''),normalizeText(row.origen||'')].join('|');
 }
 // Dos cargos con la misma huella son SOSPECHOSOS salvo que ambos tengan identidad bancaria estable
 // distinta (prueba de que son transacciones distintas). Cargos con fecha distinta nunca coinciden.
 function findSuspiciousDuplicates(rows,o){
  o=o||{};var stable=o.stableId||function(){return ''},ownerId=o.ownerId||'',reviewed=o.reviewed||{};
  var groups={};
  rows.forEach(function(row,index){
   if(!isObject(row)||(o.skip&&o.skip(row)))return;
   var fp=fingerprint(row);if(!fp)return;
   (groups[fp]||(groups[fp]=[])).push({row:row,index:index,id:rowId(row),stable:stable(row)});
  });
  var out=[];
  Object.keys(groups).sort().forEach(function(fp){
   var g=groups[fp];if(g.length<2)return;
   var stables=g.map(function(x){return x.stable});
   var allStable=stables.every(Boolean)&&new Set(stables).size===stables.length;
   if(allStable)return;
   // Mismo identificador bancario estable en todas las filas: lo clasifica classifyBankRefGroups (no admite «son distintas»).
   if(o.excludeSameBankRef===true&&stables.every(Boolean)&&new Set(stables).size===1)return;
   var key=g.map(function(x){return x.id||('#'+x.index)}).sort().join('+');
   out.push({key:key,fingerprint:sha256Hex(fp).slice(0,10),count:g.length,ids:g.map(function(x){return o.raw?(x.id||('#'+x.index)):pseudonym(ownerId,x.id||('#'+x.index))}),
    rawKey:o.raw?key:undefined,centsEach:amountOfRow(g[0].row).cents,date:madridDate(String(g[0].row.fechaOperacion||g[0].row.fecha||'')),bothCounted:true,
    reviewedDistinct:!!(reviewed[key]&&reviewed[key].decision==='distinct'),
    cause:'MISMA_FECHA_IMPORTE_Y_CONCEPTO_SIN_ID_BANCARIO_ESTABLE_DISTINTO',
    action:'No se fusiona ni se borra. Comprueba el banco y márcalos como distintos solo si lo son.'});
  });
  return out;
 }
 // Mismo identificador bancario estable en dos módulos distintos (p. ej. Ingresos y Variables).
 function findCrossModuleBankCollisions(modulesRows,stableId){
  var seen=new Map(),collisions=[];
  Object.keys(modulesRows).sort().forEach(function(m){
   (modulesRows[m]||[]).forEach(function(row){
    if(!isObject(row))return;var id=stableId(row);if(!id)return;
    var prev=seen.get(id);
    if(prev&&prev.module!==m)collisions.push({id:id,modules:[prev.module,m]});
    else if(!prev)seen.set(id,{module:m});
   });
  });
  return collisions;
 }

 /* ───────── bancoRef repetido: clasificación con evidencia (jamás se fusiona ni se borra) ───────── */
 // Regla del HTML estable: bancoRef es la identidad del cargo bancario. ingresosDe() cuenta una sola vez
 // por bancoRef; FluxiaSalud.reportDuplicados lista los repetidos y limpiarDuplicadosBancoRef solo se ejecuta a mano
 // (la llamada tras sincronizar está neutralizada). Los gastos con el mismo bancoRef se CUENTAN todos en el HTML.
 // Por eso aquí se cuentan igual, se señalan y bloquean «VERIFICADO» hasta que la fuente deje de repetirlos.
 var HTML_CREATED_ID=/^(1[5-9]\d{11})_\d+$/; // uid() del HTML = Date.now()+'_'+contador
 function recordCreatedMs(row){var m=HTML_CREATED_ID.exec(String(row&&row.id==null?'':row.id));return m?Number(m[1]):null}
 function economicKey(row){
  var c=amountOfRow(row).cents;
  return {date:madridDate(String(row.fecha||row.fechaOperacion||row.date||'')),cents:c===null?null:c.toString(),concept:normalizeText(row.concepto||row.descripcion||row.detalle||''),bank:normalizeText(row.banco||''),origin:normalizeText(row.origen||'')};
 }
 function classifyBankRefGroups(rows,o){
  o=o||{};var stable=o.stableId||function(r){return r&&r.bancoRef!=null?String(r.bancoRef).trim():''},ownerId=o.ownerId||'';
  var history=Array.isArray(o.history)?o.history:[],inbox=Array.isArray(o.inbox)?o.inbox:null;
  var skip=o.skip||function(){return false},ref=function(v){return o.raw?String(v):pseudonym(ownerId,v)};
  var byRef={};
  (rows||[]).forEach(function(row,index){
   if(!isObject(row)||skip(row))return;
   var key=String(row.bancoRef==null?'':row.bancoRef).trim();if(!key)return;
   (byRef[key]||(byRef[key]=[])).push({row:row,index:index,id:rowId(row),stable:stable(row)});
  });
  var groups=[];
  Object.keys(byRef).sort().forEach(function(key){
   var g=byRef[key];if(g.length<2)return;
   var evidence=[],reasons=[],eco=g.map(function(x){return economicKey(x.row)}),base=eco[0];
   var differing=['date','cents','concept','bank','origin'].filter(function(f){return eco.some(function(e){return e[f]!==base[f]})});
   var ids=g.map(function(x){return x.id});
   var sameInternalId=ids.some(function(id,i){return !!id&&ids.indexOf(id)!==i});
   var stableEverywhere=g.every(function(x){return !!x.stable})&&new Set(g.map(function(x){return x.stable})).size===1;
   var klass,confidence=null;
   if(!stableEverywhere){klass='IDENTIDAD_INSUFICIENTE';reasons.push('REFERENCIA_NO_ESTABLE');evidence.push('La referencia repetida no es una identidad bancaria estable del proveedor (sintética o derivada): no prueba que sea el mismo cargo.')}
   else if(differing.length){klass='IDENTIDAD_INSUFICIENTE';reasons.push('CAMPOS_DISTINTOS:'+differing.join(','));evidence.push('Mismo identificador bancario pero difieren '+differing.join(', ')+': conflicto de identidad, no se puede decidir por importe o concepto.')}
   else if(sameInternalId){klass='IDENTIDAD_INSUFICIENTE';reasons.push('ID_DE_REGISTRO_REPETIDO');evidence.push('El propio identificador interno del registro está repetido: la fuente es incoherente.')}
   else{
    klass='REIMPORTACION';
    evidence.push('Misma referencia bancaria estable, fecha, importe, concepto, banco y origen con identificadores de registro distintos: por la regla del HTML (bancoRef = identidad del cargo) es el mismo cargo bancario registrado '+g.length+' veces.');
    var strong=false;
    if(inbox){
     var inInbox=inbox.filter(function(r){var id=r&&(r.bankRef!=null?r.bankRef:stable(r));return String(id==null?'':id).trim()===(g[0].stable||key)}).length;
     if(inInbox===1){strong=true;evidence.push('La bandeja del proveedor lista este identificador una sola vez: el banco informa de un único cargo.')}
     else if(inInbox>1)evidence.push('La bandeja del proveedor lista este identificador '+inInbox+' veces: sin prueba de reimportación por esta vía.');
     else evidence.push('La bandeja del proveedor no contiene este identificador (ventana de consulta anterior): sin prueba por esta vía.');
    }
    history.forEach(function(snap){
     if(!snap||!Array.isArray(snap.rows))return;
     var label=String(snap.label||'copia'),taken=Date.parse(snap.takenAt);
     var inSnap=snap.rows.filter(function(r){return isObject(r)&&String(r.bancoRef==null?'':r.bancoRef).trim()===key});
     var snapIds=new Set(inSnap.map(rowId));
     var absent=g.filter(function(x){return !snapIds.has(x.id)});
     if(inSnap.length===1&&absent.length){
      var later=absent.filter(function(x){var c=recordCreatedMs(x.row);return c!==null&&isFinite(taken)&&c>taken});
      if(later.length){strong=true;evidence.push('En «'+label+'» solo había 1 fila con esta referencia; '+later.length+' fila(s) actual(es) se crearon después de esa copia (identificador con marca de tiempo posterior): apareció tras una nueva importación.')}
      else evidence.push('En «'+label+'» solo había 1 fila con esta referencia y '+absent.length+' fila(s) actual(es) no figuran en ella (sin marca de tiempo que fije cuándo se crearon).');
     }else if(inSnap.length>=2)evidence.push('«'+label+'» ya contenía '+inSnap.length+' filas con esta referencia: la repetición no es posterior a esa copia.');
     else if(!inSnap.length)evidence.push('«'+label+'» no contiene esta referencia.');
    });
    confidence=strong?'CONFIRMADA_CON_EVIDENCIA_INDEPENDIENTE':'POR_REGLA_DEL_HTML';
   }
   var cEach=eco[0].cents===null?null:BigInt(eco[0].cents);
   groups.push({key:o.raw?key:undefined,ref:ref(key),count:g.length,ids:ids.map(function(id,i){return o.raw?(id||('#'+g[i].index)):pseudonym(ownerId,id||('#'+g[i].index))}),
    class:klass,confidence:confidence,reasons:reasons,evidence:evidence,date:base.date,centsEach:cEach,
    surplusCents:klass==='REIMPORTACION'&&cEach!==null?cEach*BigInt(g.length-1):null,
    bothCounted:true,canMarkDistinct:false,
    cause:klass==='REIMPORTACION'?'MISMO_BANCOREF_REGISTRADO_VARIAS_VECES':'IDENTIDAD_BANCARIA_INSUFICIENTE_PARA_DECIDIR',
    action:'No se fusiona ni se borra aquí. Resuélvelo en el HTML estable (herramienta manual FluxiaSalud.limpiarDuplicadosBancoRef, tras comprobar el banco) o aclara la identidad; Élite releerá la nube. Un mismo identificador bancario no puede marcarse como «transacciones distintas».'});
  });
  // Cargos idénticos con identificadores bancarios estables DISTINTOS: transacciones legítimas distintas (informativo).
  var legit=[],fps={};
  (rows||[]).forEach(function(row,index){
   if(!isObject(row)||skip(row))return;var fp=fingerprint(row),s=stable(row);if(!fp||!s)return;
   (fps[fp]||(fps[fp]=[])).push({row:row,index:index,id:rowId(row),stable:s});
  });
  Object.keys(fps).sort().forEach(function(fp){
   var g=fps[fp];if(g.length<2)return;
   var distinct=Array.from(new Set(g.map(function(x){return x.stable})));if(distinct.length<2)return;
   legit.push({class:'DOS_CARGOS_LEGITIMOS',count:distinct.length,refs:distinct.map(ref),centsEach:amountOfRow(g[0].row).cents,date:madridDate(String(g[0].row.fechaOperacion||g[0].row.fecha||'')),
    evidence:['Mismo día, importe y concepto pero '+distinct.length+' identificadores bancarios estables distintos: transacciones distintas del proveedor.'],bothCounted:true,blocking:false});
  });
  var surplus=groups.reduce(function(t,x){return t+(x.surplusCents||0n)},0n);
  return {groups:groups,legit:legit,summary:{groups:groups.length,reimportacion:groups.filter(function(x){return x.class==='REIMPORTACION'}).length,
   reimportacionConfirmada:groups.filter(function(x){return x.confidence==='CONFIRMADA_CON_EVIDENCIA_INDEPENDIENTE'}).length,
   identidadInsuficiente:groups.filter(function(x){return x.class==='IDENTIDAD_INSUFICIENTE'}).length,dosCargosLegitimos:legit.length,
   surplusCents:surplus,blocking:groups.length}};
 }

 /* ───────── conciliación bancaria ───────── */
 // ledgerRows = [{module:'variables'|'ingresos', row}]. Convención de signo: en el libro un gasto es positivo
 // (y una devolución negativa); en la bandeja del proveedor un cargo es negativo. Por eso el cargo del
 // banco se compara con el importe del libro cambiado de signo en Variables y tal cual en Ingresos.
 // identityOf(row) debe devolver SOLO una identidad bancaria estable (nunca el id interno del registro).
 function reconcileBank(o){
  var adapter=o.adapter,ownerId=o.ownerId||'';
  if(!adapter||typeof adapter.stableId!=='function'||typeof adapter.normalize!=='function')return {ok:false,reason:'ADAPTADOR_BANCARIO_AUSENTE',summary:null};
  var identityOf=o.identityOf||adapter.stableId;
  var inbox=Array.isArray(o.inbox)?o.inbox:null,entries=(Array.isArray(o.ledgerRows)?o.ledgerRows:[]).filter(function(x){return x&&isObject(x.row)}),period=o.period,tomb=o.tombstones||{};
  var deleted=new Set((tomb.deletedBankRefs||[]).concat(tomb.excludedBankRefs||[]).map(String));
  var ref=function(id){return o.raw?id:pseudonym(ownerId,id)};
  var sign=function(x){return x.module==='ingresos'?1n:-1n};
  var isBank=function(x){return x.row.origen==='banco'||!!x.row.bancoRef||!!x.row.bancoIdentity||!!x.row.bankRef};
  var ledgerById=new Map(),ledgerDup=[],ledgerNoId=0,ledgerBank=entries.filter(isBank);
  ledgerBank.forEach(function(x){var id=identityOf(x.row);if(!id){ledgerNoId++;return}if(ledgerById.has(id))ledgerDup.push(id);else ledgerById.set(id,x)});
  var res={exact:[],idConflicts:[],pending:[],tombstoned:[],invalid:[],inboxDuplicates:[],ledgerOnly:[],suspiciousManual:[]};
  var inboxIds=new Set(),inboxRecords=[];
  (inbox||[]).forEach(function(row){
   var n=adapter.normalize(row);
   if(!n.ok){res.invalid.push({ref:ref(n.bankRef||''),reason:n.reason});return}
   var rec=n.record;
   if(inboxIds.has(rec.bankRef)){res.inboxDuplicates.push(ref(rec.bankRef));return}
   inboxIds.add(rec.bankRef);inboxRecords.push(rec);
   if(deleted.has(rec.bankRef)){res.tombstoned.push(ref(rec.bankRef));return}
   var led=ledgerById.get(rec.bankRef);
   if(!led){
    if(madridMonth(rec.date)===period)res.pending.push({ref:ref(rec.bankRef),date:rec.date,cents:rec.amountCents});
    return;
   }
   var ln=adapter.normalize(Object.assign({},led.row,{bankRef:rec.bankRef})),ledgerCents=ln.ok?ln.record.amountCents*sign(led):null;
   if(ln.ok&&ledgerCents===rec.amountCents&&madridDate(ln.record.date)===madridDate(rec.date))res.exact.push(ref(rec.bankRef));
   else res.idConflicts.push({ref:ref(rec.bankRef),inboxCents:rec.amountCents,ledgerCents:ledgerCents,inboxDate:rec.date,ledgerDate:ln.ok?ln.record.date:null});
  });
  ledgerById.forEach(function(x,id){if(!inboxIds.has(id)&&!deleted.has(id))res.ledgerOnly.push(ref(id))});
  // Coincidencias manual↔banco por día e importe (sin ID compartido): se listan, jamás se fusionan.
  var manual=entries.filter(function(x){return !isBank(x)&&x.row.origen!=='efectivo'&&madridMonth(String(x.row.fecha||''))===period});
  inboxRecords.forEach(function(rec){
   if(deleted.has(rec.bankRef)||ledgerById.has(rec.bankRef))return;
   var abs=rec.amountCents<0n?-rec.amountCents:rec.amountCents,d=madridDate(rec.date);
   manual.forEach(function(x){
    var c=amountOfRow(x.row).cents;if(c===null)return;if(c<0n)c=-c;
    if(c===abs&&madridDate(String(x.row.fecha||''))===d)res.suspiciousManual.push({bankRef:ref(rec.bankRef),manualRef:ref(rowId(x.row)||'#'),cents:c,date:d,cause:'MISMO_DIA_E_IMPORTE_QUE_UN_REGISTRO_MANUAL'});
   });
  });
  var checked=o.status&&o.status.checkedAt?Date.parse(o.status.checkedAt):NaN,cut=o.cutoff?Date.parse(o.cutoff):NaN,maxAge=(o.maxAgeHours||24)*3600000;
  var syncFresh=!!(o.status&&o.status.ok===true&&isFinite(checked)&&isFinite(cut)&&cut-checked>=-5*60000&&cut-checked<=maxAge);
  var summary={inboxCount:inbox?inbox.length:null,ledgerBankCount:ledgerBank.length,exact:res.exact.length,idConflicts:res.idConflicts.length,pending:res.pending.length,tombstoned:res.tombstoned.length,invalid:res.invalid.length,
   inboxDuplicates:res.inboxDuplicates.length,ledgerDuplicates:ledgerDup.length,ledgerWithoutStableId:ledgerNoId,ledgerOnly:res.ledgerOnly.length,suspiciousManual:res.suspiciousManual.length,syncFresh:syncFresh,
   lastCheckedAt:o.status&&o.status.checkedAt||null,statusOk:!!(o.status&&o.status.ok)};
  var blockers=[];
  if(!inbox&&ledgerBank.length)blockers.push('Hay cargos bancarios en el libro pero no hay bandeja del proveedor para contrastarlos');
  if(summary.idConflicts)blockers.push(summary.idConflicts+' cargos con el mismo ID y importe, signo o fecha distintos');
  if(summary.pending)blockers.push(summary.pending+' movimientos del banco del periodo aún sin conciliar con el libro');
  if(summary.invalid)blockers.push(summary.invalid+' movimientos del proveedor sin identidad estable');
  if(summary.inboxDuplicates||summary.ledgerDuplicates)blockers.push('IDs bancarios repetidos ('+(summary.inboxDuplicates+summary.ledgerDuplicates)+')');
  if(summary.ledgerWithoutStableId)blockers.push(summary.ledgerWithoutStableId+' cargos bancarios del libro sin ID estable');
  if(summary.suspiciousManual)blockers.push(summary.suspiciousManual+' posibles coincidencias manual/banco sin resolver');
  return {ok:true,summary:summary,detail:res,blockers:blockers,reconciled:blockers.length===0&&!!inbox};
 }
 // Doble sincronización: la segunda pasada no puede añadir ni resucitar nada.
 function simulateDoubleSync(o){
  var adapter=o.adapter,existing=(o.existing||[]).slice(),incoming=o.incoming||[],tomb=o.tombstones||{};
  var p1=adapter.planImport(existing,incoming,tomb,o.resolutions),applied=existing.concat(p1.additions.map(function(r){return r.raw}));
  var p2=adapter.planImport(applied,incoming,tomb,o.resolutions);
  var dead=new Set((tomb.deletedBankRefs||[]).concat(tomb.excludedBankRefs||[]).map(String));
  var resurrected=p1.additions.concat(p2.additions).filter(function(r){return dead.has(r.bankRef)}).map(function(r){return r.bankRef});
  return {ok:p2.additions.length===0&&resurrected.length===0&&p2.conflicts.length===p1.conflicts.length,firstAdditions:p1.additions.length,secondAdditions:p2.additions.length,secondDuplicates:p2.duplicates.length,blocked:p1.blocked.length,resurrected:resurrected};
 }

 /* ───────── certificado [a]–[h] ───────── */
 function gate(id,label,pass,detail,action){return {id:id,label:label,pass:pass,state:pass===true?'VERIFICADO':pass===false?'BLOQUEADO':'NO_VERIFICADO',detail:detail||'',action:action||null}}
 function evaluateCertification(input){
  input=input||{};
  var calc=input.calc||null,src=input.sources||{},cmp=input.comparison||null,hu=input.hucha||{},bank=input.bank||null,inc=input.income||{},cn=input.cents||{},ps=input.persistence||{},ev=input.evidence||{};
  var gates=[],canCalc=!!(calc&&calc.ok);
  // [a]
  var aPass=src.cloudComplete===true&&src.cloudProfileMatches===true&&canCalc&&!(calc.blockers&&calc.blockers.length);
  gates.push(gate('a','Fuente canónica completa y del mismo perfil',src.cloudComplete==null?null:aPass,
   aPass?'Seis colecciones y usos de huchas cargados del mismo perfil':(src.missingCollections&&src.missingCollections.length?'Faltan: '+src.missingCollections.join(', '):(calc&&calc.blockers&&calc.blockers[0])||'Colecciones canónicas incompletas o de otro perfil'),'reload-cloud'));
  // [b]
  var bPass=null,bDetail='Falta la copia HTML del mismo perfil y corte: sin ella no se puede cotejar';
  if(src.htmlSnapshot&&src.htmlSnapshot.present){
   if(!src.htmlSnapshot.sameProfile)bPass=false,bDetail='La copia HTML pertenece a otro perfil';
   else if(!src.htmlSnapshot.fresh)bPass=false,bDetail='La copia HTML tiene más de 48 h: no representa el corte actual';
   else if(!cmp||!cmp.done)bPass=null,bDetail='Comparación por ID aún no ejecutada';
   else{
    var allZero=cmp.deltaCents===0n&&cmp.unexplainedCount===0&&cmp.modules.every(function(m){return m.state!=='NO_VERIFICADO'&&m.deltaCents===0n});
    bPass=allZero;
    bDetail=allZero?'Delta global 0,00 € y 0 diferencias sin explicar en '+cmp.modules.length+' módulos':
     'Delta global '+formatCents(cmp.deltaCents)+' · '+cmp.unexplainedCount+' diferencias sin explicar'+(cmp.modules.some(function(m){return m.state==='NO_VERIFICADO'})?' · módulos sin fuente HTML: '+cmp.modules.filter(function(m){return m.state==='NO_VERIFICADO'}).map(function(m){return m.module}).join(', '):'');
   }
  }
  gates.push(gate('b','Módulos reconciliados con el HTML (Δ = 0,00 € y sin diferencias sin explicar)',bPass,bDetail,'load-html-backup'));
  // [c] Los usos del HTML estable NO guardan ID de hucha: provisionUsadoTotal los atribuye por igualdad EXACTA de nombre (u.provision===p.nombre).
  // Sin un ID verificable no hay vínculo que certificar: se distingue (a) nombre exacto = misma atribución que haría el HTML, pero sin ID,
  // de (b) nombre que solo coincide tras normalizar = el HTML NO lo atribuiría a esa hucha (discrepancia real). Ninguno se certifica.
  var nonHtml=hu.nonHtmlLinks||0,provisional=hu.provisionalLinks||0,exactLinks=Math.max(0,provisional-nonHtml);
  var cPass=hu.known===false?null:(provisional===0&&hu.unresolvedRescues===0&&hu.issues===0&&hu.conflicts===0&&hu.usesEqual!==false&&hu.usesEqual!==null&&hu.usesEqual!==undefined);
  var cDetail=cPass===true?'Rescates, usos, reposiciones y aportaciones enlazados por ID y coincidentes con el HTML':
   (nonHtml?nonHtml+' rescate(s) cuyo nombre solo coincide tras normalizar tildes/mayúsculas: el HTML no los atribuiría a esa hucha (discrepancia). ':'')+(exactLinks?exactLinks+' rescate(s) vinculados solo por nombre único (el HTML tampoco guarda ID en los usos): sin ID verificable no se certifican. ':'')+(hu.unresolvedRescues?hu.unresolvedRescues+' rescate(s) sin hucha verificable. ':'')+((hu.issues||hu.conflicts)?'Incidencias/conflictos en historial de huchas. ':'')+(hu.usesEqual==null?'Usos de huchas sin cotejar con el HTML.':hu.usesEqual===false?'Los usos de huchas difieren del HTML.':'');
  gates.push(gate('c','Rescates, usos, reposiciones y aportaciones trazados sin ambigüedad',cPass,cDetail.trim(),'review-huchas'));
  // [d]
  var dPass=null,dDetail='Sin conciliación bancaria: no consta sincronización ni delimitación explícita';
  if(bank){
   if(bank.blockers&&bank.blockers.length&&!bank.summary){dPass=false;dDetail=bank.blockers.slice(0,3).join(' · ')}
   else if(bank.scopeNone){dPass=true;dDetail='Delimitación explícita declarada: este perfil no usa movimientos bancarios en el periodo (sin cargos bancarios en libro ni bandeja)'}
   else if(bank.summary&&bank.reconciled&&bank.summary.syncFresh){dPass=true;dDetail=bank.summary.exact+' cargos con ID estable conciliados; sincronización del '+(bank.summary.lastCheckedAt||'—')}
   else if(bank.summary&&bank.reconciled&&!bank.summary.syncFresh){dPass=false;dDetail='Conciliado, pero la sincronización bancaria no consta como reciente respecto al corte'}
   else if(bank.blockers&&bank.blockers.length){dPass=false;dDetail=bank.blockers.slice(0,3).join(' · ')}
   else if(bank.reason){dPass=null;dDetail=bank.reason}
  }
  gates.push(gate('d','Bancos comprobados con IDs estables (o delimitación explícita)',dPass,dDetail,'sync-banks'));
  // [e]
  var ePass=inc.known===false?null:(inc.suspiciousDuplicates===0&&inc.crossModuleCollisions===0);
  gates.push(gate('e','Ingresos previstos/cobrados separados (pensiones solo si cobradas)',ePass,ePass===true?'Pensiones sin cobrar y futuros fuera; '+(inc.unconfirmedCounted||0)+' ingresos contabilizados por la regla del HTML sin marca de cobro (informativo)':(inc.suspiciousDuplicates||0)+' posibles ingresos duplicados · '+(inc.crossModuleCollisions||0)+' IDs bancarios compartidos entre módulos','review-income'));
  // [f]
  var fPass=cn.known===false?null:(cn.engineLoaded===true&&cn.subCentIssues===0&&!cn.dateIssues&&cn.ledgerExplained===true);
  gates.push(gate('f','Cálculo en céntimos exactos y reglas preservadas',fPass,fPass===true?'Motor cent-exact cargado; libro mayor explica el total al céntimo (Δ 0,00 €)':[cn.engineLoaded===false?'motor cent-exact no cargado':'',cn.subCentIssues?cn.subCentIssues+' importes con fracciones de céntimo':'',cn.dateIssues?cn.dateIssues+' fechas fuera del periodo en Europa/Madrid o posteriores al corte':'',cn.ledgerExplained===false?'el libro mayor no explica el total ('+formatCents(cn.ledgerDeltaCents)+')':''].filter(Boolean).join(' · '),'review-cents'));
  // [g]
  var gPass=ps.known===false?null:(ps.identityConsistent===true&&ps.tombstonedCounted===0&&ps.liveRevalidation!==false&&(ps.doubleSyncOk!==false));
  var gDetail=gPass===true?'Identidad coherente, sin registros descartados contabilizados'+(ps.liveRevalidation===true?', nube revalidada':' (revalidación en vivo no ejecutada)')+(ps.doubleSyncOk===true?', doble sincronización sin cambios':''):
   [ps.identityConsistent===false?'identidad de fuentes incoherente':'',ps.tombstonedCounted?ps.tombstonedCounted+' registros descartados/archivados contabilizados':'',ps.liveRevalidation===false?'la nube cambió respecto al corte':'',ps.doubleSyncOk===false?'la doble sincronización no es idempotente':''].filter(Boolean).join(' · ');
  gates.push(gate('g','Persistencia multiusuario, restauración y no-resurrección',gPass,gDetail,'revalidate-cloud'));
  // [h]
  var hPass=ev.cutoff&&ev.certificateHash&&ev.checksums&&Object.keys(ev.checksums).length>0&&src.cloudUnchangedSinceSnapshot!==false;
  gates.push(gate('h','Evidencia: fecha de corte, origen y checksum',hPass?true:(ev.cutoff?false:null),hPass?'Corte '+ev.cutoff+' · huella '+String(ev.certificateHash).slice(0,12):(src.cloudUnchangedSinceSnapshot===false?'La nube cambió después de la copia HTML: corte no común':'Sin corte o sin huellas'),'load-html-backup'));
  var failing=gates.filter(function(g){return g.pass===false}),unknown=gates.filter(function(g){return g.pass===null});
  var certified=failing.length===0&&unknown.length===0&&canCalc&&!calc.provisional;
  var status=certified?'VERIFICADO':canCalc?'PROVISIONAL':'PENDIENTE';
  var blockers=[];
  gates.forEach(function(g){if(g.pass!==true)blockers.push('['+g.id+'] '+g.label+': '+(g.pass===null?'No verificado — ':'')+g.detail)});
  return {status:status,certified:certified,
   dataSufficientToCalculate:canCalc,
   dataSufficientToCertify:unknown.length===0&&src.htmlSnapshot&&src.htmlSnapshot.present===true&&!!bank,
   bankSyncUpToDate:!!(bank&&(bank.scopeNone?false:bank.summary&&bank.summary.syncFresh)),
   gates:gates,blockers:blockers,failing:failing.length,unknown:unknown.length};
 }

 /* ───────── evidencia exportable ───────── */
 // Informe público/seudonimizado: solo recuentos, huellas, deltas y referencias seudónimas.
 function publicReport(r){
  return JSON.parse(JSON.stringify({format:'fluxia-elite-reconciliation-public-v1',version:VERSION,generatedAt:r.generatedAt,period:r.period,cutoff:r.cutoff,timezone:TZ,
   owner:pseudonym('owner',r.ownerId),profile:pseudonym('profile',r.profileId),status:r.status,flags:r.flags,availableCents:r.availableCents,
   modules:r.modules,gates:r.gates&&r.gates.map(function(g){return {id:g.id,state:g.state,detail:g.detail.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{23}/gi,'«id»')}}),
   checksums:r.checksums,certificateHash:r.certificateHash,diffCount:r.diffCount,bankRefGroups:r.bankRefSummary||null,notice:'Sin importes por registro ni identificadores reales. No sustituye al informe privado.'},function(k,v){return typeof v==='bigint'?v.toString():v}));
 }
 function certificateHash(parts){return sha256Hex(canonicalJson(parts))}

 var api={version:VERSION,timezone:TZ,canonicalJson:canonicalJson,sha256Hex:sha256Hex,checksum:checksum,pseudonym:pseudonym,normalizeText:normalizeText,
  centsDetail:centsDetail,formatCents:formatCents,amountOfRow:amountOfRow,madridParts:madridParts,madridDate:madridDate,madridMonth:madridMonth,madridToday:madridToday,
  ledgerEntry:ledgerEntry,sortLedger:sortLedger,summarizeLedger:summarizeLedger,verifyLedger:verifyLedger,compareLedgers:compareLedgers,crossTombstoneConflicts:crossTombstoneConflicts,
  rowId:rowId,compareCollections:compareCollections,fingerprint:fingerprint,findSuspiciousDuplicates:findSuspiciousDuplicates,findCrossModuleBankCollisions:findCrossModuleBankCollisions,classifyBankRefGroups:classifyBankRefGroups,recordCreatedMs:recordCreatedMs,
  reconcileBank:reconcileBank,simulateDoubleSync:simulateDoubleSync,evaluateCertification:evaluateCertification,publicReport:publicReport,certificateHash:certificateHash,MODULE_ORDER:MODULE_ORDER};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.FluxiaEliteReconciliation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
