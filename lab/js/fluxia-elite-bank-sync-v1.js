(function(root){
 'use strict';
 // Conciliación y sincronización bancaria de Élite con las mismas reglas del HTML v97.77.
 // Ejecuta el núcleo copiado del HTML (fluxia-elite-bank-html-core-v1.js) con el estado de la nube y reproduce, sin escribir nada,
 // el orden de call() + aplicarMovs(): identidad, vetos, libro, cortes, traspasos, reglas y apuntes manuales.
 var AUTO_SYNC_MIN_AGE=12*60*1000, AUTO_SYNC_RETRY=90*1000, AUTO_SYNC_CHECK=60*1000;

 // Claves que el HTML lee de localStorage/Almacen y la clave de nube (perfil moderno) de la que Élite las toma.
 function cloudKeysFor(profileId){
  var pid=String(profileId||'');
  return {
   'v2_borrados_blacklist':'v2_borrados_blacklist',
   'fluxia_gv_borrados_v1':'fluxia_gv_borrados_v1',
   'v2_fluxia_gv_borrados_v1':'v2_fluxia_gv_borrados_v1',
   ['v2_bank_identity_aliases9770_'+pid]:'v2_bank_identity_aliases9770_'+pid,
   'fluxia_banco_clasif_v94':'v2_espejo__fluxia_banco_clasif_v94',
   'fluxia_banco_clasif_item_v9464':'v2_espejo__fluxia_banco_clasif_item_v9464',
   'fluxia_banco_corte_v55':'v2_espejo__fluxia_banco_corte_v55',
   ['fluxia_banco_conexiones_v1_'+pid]:'v2_espejo__fluxia_banco_conexiones_v1_'+pid,
   'fluxia_banco_ing_vistos_v94':'v2_espejo__fluxia_banco_ing_vistos_v94',
   'fluxia_banco_ids':'v2_espejo__fluxia_banco_ids',
   'v2_sync_tombstones':'v2_sync_tombstones',
   'v2_sync_restores':'v2_sync_restores',
   'v2_explicit_deletions':'v2_explicit_deletions'
  };
 }
 function text(value){return value===undefined||value===null?null:(typeof value==='string'?value:JSON.stringify(value))}
 function parse(value,fallback){if(value===undefined||value===null)return fallback;if(typeof value!=='string')return value;try{var x=JSON.parse(value);return x===null?fallback:x}catch(_e){return fallback}}

 // Almacén de solo lectura con las claves del HTML. `cloud` es {clave de nube corta: valor}; `cortes` son las fechas lee_desde del servidor.
 // Los bancos conocidos con su corte solo existen en el dispositivo del HTML: se reconstruyen como hace leerConocidos() sin esa clave
 // (corte global), sin bajar nunca de la fecha de conexión que guarda el servidor para cada banco.
 function buildStore(cloud,profileId,cortes){
  var store={},keys=cloudKeysFor(profileId);
  Object.keys(keys).forEach(function(local){var value=text(cloud&&cloud[keys[local]]);if(value!==null)store[local]=value});
  var global=parse(store.fluxia_banco_corte_v55,null),global_fecha=global&&/^\d{4}-\d{2}-\d{2}$/.test(String(global.fecha||''))?String(global.fecha):'';
  var conexiones=parse(store['fluxia_banco_conexiones_v1_'+String(profileId||'')],[]),known={};
  (Array.isArray(conexiones)?conexiones:[]).forEach(function(c){
   if(!c||!c.banco)return;
   var lee=cortes&&cortes[c.banco]?String(cortes[c.banco]).slice(0,10):'';
   var corte=[global_fecha,/^\d{4}-\d{2}-\d{2}$/.test(lee)?lee:''].filter(Boolean).sort().pop();
   if(corte)known[String(c.banco).trim().toLowerCase()]={banco:c.banco,corte:corte};
  });
  if(Object.keys(known).length)store['fluxia_bancos_conocidos_v62_'+String(profileId||'')]=JSON.stringify(known);
  return store;
 }

 // Port de FluxiaSync954.restored() para ids planos: un borrado recuperado deja de vetar.
 function restoredFrom(store){
  return function(key,id){
   if(id===null||id===undefined)return false;
   var full=String(key).indexOf('v2_')===0?String(key):'v2_'+String(key).replace('v2_',''),q='i:'+String(id);
   var T=parse(store.v2_sync_tombstones,{}),R=parse(store.v2_sync_restores,{}),E=parse(store.v2_explicit_deletions,{});
   var del=Math.max(Number(((T||{})[full]||{})[q]||0),Number((((E||{})[full]||{})[q]||{}).t||0));
   return Number(((R||{})[full]||{})[q]||0)>del;
  };
 }

 function clone(list){try{return JSON.parse(JSON.stringify(Array.isArray(list)?list:[]))}catch(_e){return []}}
 // El HTML vuelve a leer sus listas en cada comprobación (JSON.parse del mapa de alias, la lista negra y los borrados, y JSON.stringify
 // de cada entrada para deduplicar), por cada cargo. Mismo resultado sin repetir el trabajo: se recuerda el texto exacto de las listas
 // que estas funciones solo leen (nunca el corte, que eraDelCorte() modifica) y la serialización de los objetos de esas listas.
 var MEMO_KEYS=['v2_borrados_blacklist','fluxia_gv_borrados_v1','v2_fluxia_gv_borrados_v1','fluxia_banco_clasif_v94','fluxia_banco_clasif_item_v9464','fluxia_banco_ing_vistos_v94'];
 function memoJSON(texts){
  var parsed=new Map(),tracked=new WeakSet(),printed=new WeakMap();
  function track(v){if(!v||typeof v!=='object'||tracked.has(v))return;tracked.add(v);(Array.isArray(v)?v:Object.keys(v).map(function(k){return v[k]})).forEach(track)}
  return {
   parse:function(s,reviver){
    if(!reviver&&typeof s==='string'&&texts.has(s)){if(!parsed.has(s)){var v=JSON.parse(s);parsed.set(s,v);track(v);if(v&&typeof v==='object')printed.set(v,s)}return parsed.get(s)}
    return JSON.parse(s,reviver);
   },
   stringify:function(v,replacer,space){
    if(replacer||space!==undefined||!v||typeof v!=='object'||!tracked.has(v))return JSON.stringify(v,replacer,space);
    if(!printed.has(v))printed.set(v,JSON.stringify(v));
    return printed.get(v);
   }
  };
 }
 // El libro se clona: la clasificación repite sobre la copia los cambios que el HTML hace mientras procesa un lote.
 function createEnv(store,profileId,ledger){
  var overlay={};
  var storage={getItem:function(k){return Object.prototype.hasOwnProperty.call(overlay,k)?overlay[k]:(Object.prototype.hasOwnProperty.call(store,k)?store[k]:null)},setItem:function(k,v){overlay[k]=String(v)},removeItem:function(k){overlay[k]=null}};
  var quiet={log:function(){},warn:function(){},error:function(){}};
  var memo=MEMO_KEYS.concat(['v2_bank_identity_aliases9770_'+String(profileId||''),'fluxia_banco_conexiones_v1_'+String(profileId||'')]).map(function(k){return store[k]}).filter(function(v){return typeof v==='string'});
  return {
   JSON:memoJSON(new Set(memo)),
   window:{FLUXIA_PROFILE:{id:String(profileId||'')},FluxiaSync954:{restored:restoredFrom(store)}},
   localStorage:storage,sessionStorage:{getItem:function(){return null},setItem:function(){},removeItem:function(){}},Almacen:storage,console:quiet,document:{getElementById:function(){return null}},
   movimientos:clone(ledger&&ledger.movimientos),
   ingresosItems:clone(ledger&&ledger.ingresos)
  };
 }

 // Fila tal como la devuelve la Edge Function (sin los campos que añade la bandeja de Élite).
 var SERVER_FIELDS=['id','legacyId','stableRef','idAuthority','provider','accountKey','accountId','accountKeyKind','fecha','importe','concepto','contraparte','banco','moneda','pendiente'];
 function serverRow(row){var out={};SERVER_FIELDS.forEach(function(k){if(row&&row[k]!==undefined)out[k]=row[k]});return out}

 var MOTIVOS={
  'legacy-bank-unknown':'Hay una referencia antigua sin banco en el libro; el HTML no la fusiona',
  'legacy-account-ambiguous':'Varias cuentas encajan con una referencia antigua; el HTML no la fusiona',
  'account-reconsent-needs-review':'La cuenta cambió al reconectar; el HTML pide revisarla',
  'ambiguous-provider-fallback':'El banco no dio referencia estable y hay varios iguales',
  'provider-reference-missing':'El banco no envió referencia'
 };

 function classify(rows,ctx){
  var core=root&&root.FluxiaEliteBankHtmlCore;
  if(!core||typeof core.create!=='function')throw Error('Falta el núcleo bancario del HTML');
  ctx=ctx||{};
  var store=ctx.store||{},env=createEnv(store,ctx.profileId,ctx.ledger),c=core.create(env),W=c.window,ID=W.FluxiaBankIdentity9770,GV=W.FluxiaGVBorrados;
  var items=[];
  function push(m,estado,motivo){
   var imp=Number(m&&m.importe);
   items.push({m:m,estado:estado,motivo:motivo,tipo:imp>0?'ingreso':'gasto',importeCents:Number.isFinite(imp)?Math.round(Math.abs(imp)*100):null,fecha:String(m&&m.fecha||'').slice(0,10),banco:String(m&&m.banco||''),concepto:String(m&&(m.contraparte&&m.contraparte.length>1?m.contraparte:m.concepto)||''),pendiente:!!(m&&m.pendiente)});
  }
  var input=(Array.isArray(rows)?rows:[]).filter(Boolean).map(serverRow);
  // call(): plan de identidad (los conflictos no se importan) y filtro de vetos.
  var plan=ID.plan(input);
  plan.conflicts.forEach(function(x){push(x.movement,'revisar',MOTIVOS[x.reason]||x.reason)});
  var kept=[];
  plan.items.forEach(function(m){
   var vetado=false;try{vetado=GV.debeIgnorarBanco(m,m.banco)||c.movimientoBancoVetado(m,m.banco)}catch(_e){}
   if(vetado)push(m,'descartado','Lo borraste o descartaste en el HTML; no se vuelve a importar');else kept.push(m);
  });
  // aplicarMovs(): mismo orden y mismas funciones, sin importar ni avisar. Los cambios que el HTML hace en su libro durante el lote
  // (refrescar el cargo existente, enlazar un pendiente o un apunte manual, añadir el cargo nuevo) se repiten sobre la copia privada.
  var ids=new Set((parse(store.fluxia_banco_ids,[])||[]).map(String)),hoy=new Date().toISOString().slice(0,10),nuevos=0;
  var vistosIng=c.ingVistos();
  kept.slice().sort(function(x,y){return String(x.fecha).localeCompare(String(y.fecha))}).forEach(function(m){
   try{
    if(GV.debeIgnorarBanco(m,m.banco)||c.movimientoBancoVetado(m,m.banco)){if(m.id)ids.add(m.id);push(m,'descartado','Lo borraste o descartaste en el HTML; no se vuelve a importar');return}
    if(!c.validarMovimiento(m)){push(m,'invalido','Datos del banco no válidos');return}
    var imp=Number(m.importe);
    var existente=imp<0?c.listaMovs().find(function(x){return x&&x.bancoRef===m.id&&x.origen==='banco'}):null;
    if(existente){existente.bancoV=2;if(m.banco)existente.banco=m.banco;if(m.pendiente!==undefined)existente.bancoPendiente=!!m.pendiente;ids.add(m.id);push(m,'en-libro','Ya está en Variables');return}
    if(ids.has(String(m.id))&&!(imp>0)){push(m,'visto','El HTML ya lo procesó en una sincronización anterior');return}
    if(c.movimientoBancoVetado(m)){ids.add(m.id);push(m,'descartado','Lo borraste o descartaste en el HTML; no se vuelve a importar');return}
    if(env.movimientos.some(function(x){return x&&String(x.bancoRef||'')===String(m.id||'')})||c.listaMovs().some(function(x){return x&&String(x.bancoRef)===String(m.id)})){ids.add(String(m.id));push(m,'en-libro','Ya está en el libro');return}
    if(!(imp<0)){
     if(imp>0&&m.pendiente){push(m,'pendiente-banco','Ingreso aún sin asentar por el banco');return}
     // procesarIngreso() decide cobros, nóminas y traspasos de entrada: Élite solo distingue registrado, visto o pendiente de procesar.
     // Como el HTML, todo ingreso asentado marca su id como visto para el resto del lote.
     ids.add(m.id);
     var enIngresos=env.ingresosItems.some(function(x){return x&&(String(x.bancoRef||'')===String(m.id)||(x.bancoIdentity&&x.bancoIdentity===m.bancoIdentity)||(m.legacyId&&String(x.bancoLegacyId||'')===String(m.legacyId)))});
     if(enIngresos){push(m,'en-libro','Ya está en Ingresos');return}
     if(vistosIng.has(String(m.id))||(m.legacyId&&vistosIng.has(String(m.legacyId)))){push(m,'visto','El HTML ya procesó este ingreso');return}
     push(m,'nuevo','Ingreso pendiente de procesar en el HTML');return;
    }
    var importe=Math.round(Math.abs(imp)*100)/100,fecha=String(m.fecha||'').slice(0,10)||hoy;
    var bizum=!!(W.FluxiaEsBizumSaliente9621&&W.FluxiaEsBizumSaliente9621(m));
    var pend=!m.pendiente&&c.pendienteIgual(fecha,importe,m);
    if(pend){ID.stamp(pend,m);pend.bancoPendiente=false;pend.bancoRef=m.id;pend.fecha=fecha;ids.add(m.id);push(m,'en-libro','Enlaza con un cargo pendiente ya apuntado');return}
    var cb=m.banco?c.corteDeBanco(m.banco):null;
    if(cb&&fecha<cb){ids.add(m.id);push(m,'anterior','Anterior al inicio de este banco en Fluxia');return}
    var corte=c.leerCorte();
    if(corte&&(fecha<corte.fecha||c.eraDelCorte(fecha,importe,corte))){ids.add(m.id);push(m,'anterior','Anterior al inicio de este banco en Fluxia');return}
    if(!bizum&&c.esTraspasoPropio(m,importe,fecha,kept)){push(m,'traspaso','Traspaso entre tus cuentas');return}
    if(c.esMovimientoReponerHucha(m)){ids.add(m.id);push(m,'traspaso','Reposición de una hucha');return}
    if(!bizum){var cls=c.clasificar(m,importe,'out',{});if(cls.tipo==='propio'||cls.tipo==='puente'){ids.add(m.id);push(m,'traspaso',cls.tipo==='puente'?'Puente según tus reglas':'Traspaso propio según tus reglas');return}}
    var manual=c.yaExisteManual(fecha,importe,m);
    if(manual){ID.stamp(manual,m);manual.bancoRef=m.id;ids.add(m.id);push(m,'en-libro','Coincide con un apunte manual del mismo importe');return}
    // Lo que haría registrarGastoVariable() + stamp(): el cargo pasa a la copia del libro para el resto del lote.
    var g={id:'elite-nuevo-'+(++nuevos),concepto:(m.contraparte&&m.contraparte.length>1?m.contraparte:m.concepto)||'Pago con tarjeta',categoria:bizum?'Bizums':'Otros',importe:importe,fecha:fecha};
    ID.stamp(g,m);g.origen='banco';g.bancoV=2;g.bancoRef=m.id;g.banco=m.banco||'Banco';if(m.pendiente)g.bancoPendiente=true;
    env.movimientos.push(g);
    ids.add(m.id);push(m,'nuevo',m.pendiente?'Cargo nuevo, aún sin asentar por el banco':'Cargo nuevo: el HTML lo añadirá a Variables al abrirse');
   }catch(error){push(m,'revisar','No se pudo evaluar: '+String(error&&error.message||error).slice(0,80))}
  });
  var counts={};items.forEach(function(x){counts[x.estado]=(counts[x.estado]||0)+1});
  return {items:items,counts:counts,total:items.length};
 }

 // Misma lista negra que fluxiaBlacklistParaEdge() del HTML.
 function blacklistForEdge(store,profileId){
  var core=root&&root.FluxiaEliteBankHtmlCore;if(!core)return [];
  try{var c=core.create(createEnv(store||{},profileId,{}));return c.window.FluxiaGVBorrados.leerBlacklistUnida()}catch(_e){return []}
 }

 function rowKey(row){return String(row&&(row.bankRef||row.id)||'')}
 // Fusiona una lectura con la bandeja guardada: los bancos leídos sin error sustituyen sus filas (así un pendiente que el banco ya asentó
 // no queda duplicado); los bancos con error conservan las suyas, salvo las que la lectura parcial ha vuelto a traer.
 function mergeRead(previous,result,now){
  var prev=previous&&typeof previous==='object'?previous:{},rows=Array.isArray(prev.rows)?prev.rows:[];
  var incoming=Array.isArray(result&&result.movimientos)?result.movimientos:[];
  var avisos=String(result&&(result.avisos||result.errorFondo)||'').split(' · ').filter(Boolean);
  var failed=new Set(avisos.map(function(a){return a.split(':')[0].trim().toLowerCase()}).filter(Boolean));
  var read=new Set(Object.keys(result&&result.por_banco||{}).map(function(b){return b.toLowerCase()}).filter(function(b){return !failed.has(b)}));
  incoming.forEach(function(m){var b=String(m&&m.banco||'').toLowerCase();if(b&&!failed.has(b))read.add(b)});
  var fresh=new Set(incoming.map(rowKey).filter(Boolean));
  var kept=rows.filter(function(r){return !read.has(String(r&&r.banco||'').toLowerCase())&&!fresh.has(rowKey(r))});
  var fetched={};Object.keys(prev.fetchedAt||{}).forEach(function(b){fetched[b]=prev.fetchedAt[b]});
  read.forEach(function(b){fetched[b]=new Date(now||Date.now()).toISOString()});
  var cortes={};Object.keys(prev.cortes||{}).forEach(function(b){cortes[b]=prev.cortes[b]});Object.keys(result&&result.cortes||{}).forEach(function(b){cortes[b]=result.cortes[b]});
  return {rows:kept.concat(incoming),fetchedAt:fetched,cortes:cortes,errors:avisos};
 }

 // Antes de preguntar al servidor: Élite no repite su propia lectura en 12 min, ni un intento en 90 s, ni la comprobación en 1 min.
 function shouldCheck(local,now){
  var s=local||{},own=Date.parse(s.readAt||''),checked=Date.parse(s.checkedAt||'');
  if(Number(s.lastAttemptAt)>0&&now-Number(s.lastAttemptAt)<AUTO_SYNC_RETRY)return {check:false,reason:'intento-reciente'};
  if(Number.isFinite(own)&&now-own<AUTO_SYNC_MIN_AGE)return {check:false,reason:'reciente'};
  if(Number.isFinite(checked)&&now-checked<AUTO_SYNC_CHECK)return {check:false,reason:'comprobado'};
  return {check:true,reason:'comprobar'};
 }

 // Política de lectura al abrir o volver a Élite: nunca en segundo plano ni con temporizadores. La última lectura de cualquier app
 // (HTML o Élite) la guarda el servidor por banco; un banco en su límite diario no cuenta, y la lectura propia de Élite tampoco se repite
 // en 12 min aunque un banco haya fallado (misma cadencia que el HTML).
 function decideAutoSync(connections,now,local){
  var list=Array.isArray(connections)?connections:[];
  if(!list.length)return {read:false,reason:'sin-conexiones'};
  var refreshable=list.filter(function(c){return c&&c.connected&&c.canRefresh});
  if(!refreshable.length)return {read:false,reason:list.some(function(c){return c&&c.limited})?'limite-diario':'sin-permiso'};
  if(local&&local.inFlight)return {read:false,reason:'en-curso'};
  if(local&&Number(local.lastAttemptAt)>0&&now-Number(local.lastAttemptAt)<AUTO_SYNC_RETRY)return {read:false,reason:'intento-reciente'};
  var own=Date.parse(local&&local.readAt||'');
  if(Number.isFinite(own)&&now-own<AUTO_SYNC_MIN_AGE)return {read:false,reason:'reciente',lastSync:own};
  var oldest=Math.min.apply(null,refreshable.map(function(c){var t=Date.parse(c.lastSync||'');return Number.isFinite(t)?t:0}));
  if(now-oldest<AUTO_SYNC_MIN_AGE)return {read:false,reason:'reciente',lastSync:oldest};
  return {read:true,reason:oldest?'caducado':'sin-lectura',lastSync:oldest};
 }

 function ageText(ms){
  if(!Number.isFinite(ms)||ms<0)return '';
  var min=Math.floor(ms/60000);
  if(min<1)return 'hace menos de 1 min';
  if(min<60)return 'hace '+min+' min';
  var h=Math.floor(min/60),rest=min%60;
  if(h<48)return 'hace '+h+' h'+(rest?' '+rest+' min':'');
  return 'hace '+Math.floor(h/24)+' días';
 }

 var api={version:'1.0.0',AUTO_SYNC_MIN_AGE:AUTO_SYNC_MIN_AGE,AUTO_SYNC_RETRY:AUTO_SYNC_RETRY,AUTO_SYNC_CHECK:AUTO_SYNC_CHECK,cloudKeysFor:cloudKeysFor,buildStore:buildStore,createEnv:createEnv,serverRow:serverRow,classify:classify,blacklistForEdge:blacklistForEdge,mergeRead:mergeRead,shouldCheck:shouldCheck,decideAutoSync:decideAutoSync,ageText:ageText};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaEliteBankSync=api;
})(typeof globalThis!=='undefined'?globalThis:this);
