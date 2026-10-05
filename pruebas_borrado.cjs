const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/index_fluxia_v95.36_LAB.html','utf8');
let disk={},tick=100;
const c={window:{},Date,LS_PREFIX:'v2_',claveLS:k=>k,console,clearTimeout:()=>{},cache:{},pendiente:{},timers:{},FX_TOMBSTONE:'__FLUXIA_TOMBSTONE_V95_4__',nuestra:()=>true,_respaldar:()=>{},guardarPendiente:()=>{},lsGet:k=>disk[k]??null,lsSet:(k,v)=>disk[k]=v,lsDel:k=>delete disk[k],claves:()=>Object.keys(disk).filter(k=>k.startsWith('v2_')),localStorage:{getItem:k=>disk['raw:'+k]??null,setItem:(k,v)=>disk['raw:'+k]=v},Almacen:{getItem:k=>c.cache[k]??disk[k]??null,setItem:(k,v)=>{disk[k]=v;c.cache[k]=v;}}};
vm.createContext(c);
let a=html.indexOf('window.FluxiaSync954 = (function(){'),b=html.indexOf('\n})();',a)+6;vm.runInContext(html.slice(a,b),c);c.FluxiaSync954=c.window.FluxiaSync954;const sync=c.FluxiaSync954;
a=html.indexOf('  function _reconciliar(remoto, remotoMeta){');b=html.indexOf('\n  /* v95.2 · «Borrar el almacenamiento',a);vm.runInContext(html.slice(a,b),c);
function merged(key,l,r){return JSON.parse(sync.mergeCloudValue(key,JSON.stringify(l),JSON.stringify(r),disk.v2_sync_tombstones,null));}
const charge={id:'charge',fecha:'2026-10-04',importe:100,concepto:'Cargo',_fxUpdatedAt:1};
for(const key of ['v2_movimientos','v2_fijos','v2_usos','v2_provisiones']){
 sync.registerDelete(key,charge);assert.equal(merged(key,[],[{...charge,_fxUpdatedAt:Date.now()+9999999}]).length,0);
 let stale=[{...charge,_fxUpdatedAt:Date.now()+9999999}];sync.prepare(key,stale);assert.equal(merged(key,stale,[]).length,0);
 sync.clearDelete(key,'charge');assert.equal(merged(key,[charge],[]).length,1);sync.registerDelete(key,charge);assert.equal(merged(key,[charge],[]).length,0);
}
// Metadata union before the stale list, despite reversed snapshot order.
sync.registerDelete('v2_movimientos',charge);disk.v2_movimientos='[]';c.cache.v2_movimientos='[]';
c._reconciliar({v2_movimientos:JSON.stringify([{...charge,_fxUpdatedAt:Date.now()+99999}]),v2_sync_tombstones:'{}'},{});assert.equal(JSON.parse(c.cache.v2_movimientos).length,0);assert(sync.isDeleted('v2_movimientos','charge'));
// Missing items are never assumed deleted; new legitimate records remain.
assert.equal(merged('v2_movimientos',[],[{id:'legit'}]).length,1);
const p={id:'pot',aportaciones:{septiembre:[{id:'apt',importe:50,_fxUpdatedAt:1}]}};
sync.registerDelete('v2_provisiones',p.aportaciones.septiembre[0],{nestedParentId:'pot',nestedField:'aportaciones:septiembre'});
assert.equal(merged('v2_provisiones',[],[{...p,aportaciones:{octubre:[{id:'apt',importe:50,_fxUpdatedAt:Date.now()+999999}]}}])[0].aportaciones.octubre.length,0);
sync.clearDelete('v2_provisiones','apt',{nestedParentId:'pot',nestedField:'aportaciones:septiembre'});assert.equal(merged('v2_provisiones',[p],[])[0].aportaciones.septiembre.length,1);
assert.deepEqual(JSON.parse(sync.mergeMetadataRaw('v2_borrados_blacklist','["new"]','["old"]')),['new','old']);
// Real banking deletion module: changed bank ID, restart, manual charge, restore, redelete.
a=html.indexOf('window.FluxiaGVBorrados = (function(){');b=html.indexOf('\n})();',a)+6;vm.runInContext(html.slice(a,b),c);c.FluxiaGVBorrados=c.window.FluxiaGVBorrados;const bank=c.FluxiaGVBorrados;
let mv={id:'app-id',bancoRef:'bank-id',origen:'banco',banco:'Banco Uno',fecha:'2026-10-04',concepto:'Compra comercio',importe:25};
bank.registrar(mv);assert(bank.debeIgnorarBanco({id:'new-bank-id',banco:'Banco Uno',fecha:'2026-10-04',concepto:'Compra comercio',importe:-25},'Banco Uno'));
let oldDelete=disk.fluxia_gv_borrados_v1,oldBl=disk.v2_borrados_blacklist;
assert.equal(bank.purgarListaLocal([mv]).length,0);
c.cache={};c._reconciliar({v2_movimientos:JSON.stringify([mv]),fluxia_gv_borrados_v1:'[]',v2_borrados_blacklist:'[]',v2_sync_tombstones:'{}'},{});assert.equal(bank.purgarListaLocal([mv]).length,0);
let manual={id:'manual',origen:'manual',fecha:'2026-10-04',importe:12,concepto:'Manual'};bank.registrar(manual);assert.equal(bank.purgarListaLocal([manual]).length,0);
assert.equal(bank.purgarListaLocal([{...manual,id:'manual-legit'}]).length,1);
bank.desvetar(mv);assert.equal(bank.purgarListaLocal([mv]).length,1);
// Obsolete cloud metadata cannot cancel an explicit restoration.
c.Almacen.setItem('fluxia_gv_borrados_v1',sync.mergeMetadataRaw('fluxia_gv_borrados_v1',disk.fluxia_gv_borrados_v1,oldDelete));
c.Almacen.setItem('v2_borrados_blacklist',sync.mergeMetadataRaw('v2_borrados_blacklist',disk.v2_borrados_blacklist,oldBl));assert.equal(bank.purgarListaLocal([mv]).length,1);
bank.registrar(mv);assert.equal(bank.purgarListaLocal([mv]).length,0);
console.log('PASS: borrado/reapertura, copia con timestamp posterior, metadatos antes de listas, banco con ID distinto, manual legítimo, aportación trasladada, restauración y nuevo borrado.');
