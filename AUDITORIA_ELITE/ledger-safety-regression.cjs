'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=process.argv[2]||'AUDITORIA_ELITE/candidate/v97.71.html',html=fs.readFileSync(file,'utf8');
function scripts(){return [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1])}
const all=scripts(),trash=all.find(x=>x.includes('function KEY(){return"fluxia_papelera_v2_'));
assert(trash,'Papelera controller missing');assert(trash.includes('autoDiff:function(){return false}'),'automatic list-diff trashing is still active');
assert(!trash.includes('if(prev.autoDiff)prev.autoDiff'),'legacy autoDiff is still chained');
const recovery=all.find(x=>x.includes('function recuperarDePapelera(listas,inf)'));
assert(recovery,'legacy recovery module missing');
assert(!recovery.includes('var pc=recuperarDePapelera(listas,inf)'),'automatic restoration from Papelera is still active');

const store=new Map([['fluxia_papelera_v2_profile',JSON.stringify([{id:'old-trash',tipo:'Gasto variable',key:'v2_movimientos',snapshot:{id:'itv-1',concepto:'ITV',importe:45},when:'2026-10-10'}])]]);
let legacyCalls=0;
const ctx={console,Date,Math,JSON,Array,String,Number,Promise,Map,Set,URL,window:null,FLUXIA_PROFILE:{id:'profile'},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size}},Almacen:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{getElementById:()=>null,querySelector:()=>null,createElement:()=>({style:{},querySelectorAll:()=>[],appendChild(){}})},setTimeout:()=>0};ctx.window=ctx;ctx.FluxiaPapelera={autoDiff(){legacyCalls++}};vm.createContext(ctx);vm.runInContext(trash,ctx);
ctx.FluxiaPapelera.autoDiff('v2_movimientos',[]);
assert.equal(legacyCalls,0,'legacy diff hook ran');assert.equal(JSON.parse(store.get('fluxia_papelera_v2_profile')).length,1,'partial-list save added false trash item');
const gvScript=all.find(x=>x.includes('window._fluxiaRegistrarBorradoGV=function(mv)'));
assert(gvScript,'explicit bank movement delete hook missing');
const hookStart=gvScript.indexOf('window._fluxiaRegistrarBorradoGV=function(mv)'),hookEnd=gvScript.indexOf(';function fluxiaBlacklistParaEdge',hookStart);
assert(hookEnd>hookStart,'explicit delete hook boundary missing');
let explicitArchives=0;const manualArchive=[];const explicitCtx={window:null,FluxiaPapelera:{listar(){return manualArchive},push(tipo,items,key){assert.equal(tipo,'Gasto variable');assert.equal(key,'planRescate_v2_movimientos');explicitArchives++;manualArchive.unshift({key,snapshot:items[0]})}},FluxiaGVBorrados:{registrar(){}},FluxiaBancoFijos:{olvidarCargo(){}}};explicitCtx.window=explicitCtx;
vm.createContext(explicitCtx);vm.runInContext(gvScript.slice(hookStart,hookEnd+1),explicitCtx);
explicitCtx._fluxiaRegistrarBorradoGV({id:'explicit-1',concepto:'Cargo eliminado',importe:12});
explicitCtx._fluxiaRegistrarBorradoGV({id:'explicit-1',concepto:'Cargo eliminado',importe:12});
assert.equal(explicitArchives,1,'explicit delete hook failed to archive once through the real Papelera API');
ctx.FluxiaPapelera.push('Gasto variable',[{id:'explicit-1',concepto:'Cargo eliminado',importe:12}],'planRescate_v2_movimientos');
assert.equal(JSON.parse(store.get('fluxia_papelera_v2_profile')).length,2,'Papelera explicit archival API failed');

function fixedHarness(fijos){
 const data=new Map(),banner={style:{},querySelectorAll:()=>[],set innerHTML(v){this.html=v},get innerHTML(){return this.html}};
 const d={getElementById:id=>id==='fluxiaBancoFijosBanner'?banner:null,createElement:()=>banner,querySelector:()=>null,addEventListener(){}};
 const c={console,Date,Math,JSON,Array,String,Number,Promise,Map,Set,document:d,setTimeout:()=>0,FLUXIA_PROFILE:{id:'qa-profile'},mesSeleccionado:'octubre',gastosFijosItems:fijos,financiaciones:[],movimientos:[],fijosDe:()=>fijos,mesFromFechaISO:()=> 'octubre',financiacionesActivas:()=>[],guardarFijos(){},guardarPago(){throw Error('pending amount match must not mark a fixed as paid')},mostrarToast(){},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)},Almacen:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v))}};c.window=c;vm.createContext(c);
 const source=scripts().find(x=>x.includes('window.FluxiaBancoFijos=function'));
 vm.runInContext(source,c);return c;
}
const single=[{id:'fixed-apple',nombre:'iCloud',importe:2.99,mes:'octubre'}],h1=fixedHarness(single),apple={id:'apple-charge',concepto:'Apple.com/bill',importe:2.99,fecha:'2026-10-12',banco:'Caixa',origen:'banco'};
const a=h1.FluxiaBancoFijos.procesarGastoBanco(apple),pending1=JSON.parse(h1.localStorage.getItem('fluxia_banco_fijos_pend_v1_qa-profile')||'[]');
assert.equal(a.tipo,'pregunta','unknown merchant with a unique exact amount should ask for confirmation');assert.equal(pending1.length,1);assert.equal(pending1[0].modo,'importe');assert.equal(single[0].pagadoEl,undefined);assert.equal(apple.cuentaComoFijo,undefined);
const ambiguous=[{id:'fixed-a',nombre:'Apple Music',importe:2.99,mes:'octubre'},{id:'fixed-b',nombre:'iCloud',importe:2.99,mes:'octubre'}],h2=fixedHarness(ambiguous),a2=h2.FluxiaBancoFijos.procesarGastoBanco(apple),pending2=JSON.parse(h2.localStorage.getItem('fluxia_banco_fijos_pend_v1_qa-profile')||'[]');
assert.equal(a2.tipo,'ninguno','ambiguous equal-amount fixed records must not be selected');assert.equal(pending2.length,0);assert(ambiguous.every(x=>!x.pagadoEl));
const tied=[{id:'fixed-a',nombre:'Apple TV',importe:2.99,mes:'octubre'},{id:'fixed-b',nombre:'Apple TV',importe:2.99,mes:'octubre'}],h3=fixedHarness(tied),a3=h3.FluxiaBancoFijos.procesarGastoBanco({...apple,concepto:'Apple TV'}),pending3=JSON.parse(h3.localStorage.getItem('fluxia_banco_fijos_pend_v1_qa-profile')||'[]');
assert.equal(a3.tipo,'ninguno','tied text matches must never auto-link');assert.equal(pending3.length,0);assert(tied.every(x=>!x.pagadoEl));
console.log(JSON.stringify({file,checks:{partialSaveDoesNotTrash:true,explicitDeleteStillArchived:true,oldTrashDoesNotAutoRestore:true,unknownMerchantUniqueAmountAsks:true,ambiguousAmountDoesNotLink:true,tiedFixedDoesNotAutoLink:true}},null,2));
