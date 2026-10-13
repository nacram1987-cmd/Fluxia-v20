'use strict';
// Red-before/green-after test: fixed amount proposal must survive pending filter
// and already-imported bank charge must be reconsidered without moving money.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scripts=h=>[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
function harness(file,fijos,mov){
 const source=scripts(fs.readFileSync(file,'utf8')).find(x=>x.includes('window.FluxiaBancoFijos=function'));
 assert(source,'fixed matcher controller absent');new vm.Script(source);
 const data=new Map(),banner={style:{},innerHTML:'',querySelectorAll(){return[]}};
 const storage={getItem(k){return data.has(k)?data.get(k):null},setItem(k,v){data.set(k,String(v))},removeItem(k){data.delete(k)}};
 const ctx={console,Date,Math,JSON,Array,String,Number,Promise,Map,Set,window:null,document:{getElementById(k){return k==='fluxiaBancoFijosBanner'?banner:null},createElement(){return banner},querySelector(){return null},addEventListener(){}},setTimeout(){return 0},localStorage:storage,Almacen:{...storage,arrancada:true},FLUXIA_PROFILE:{id:'qa-profile'},mesSeleccionado:'octubre',gastosFijosItems:fijos,financiaciones:[],movimientos:[mov],fijosDe(){return fijos},mesFromFechaISO(){return 'octubre'},financiacionesActivas(){return[]},guardarPago(tipo,fijo,mes,fecha){ctx.payments++;fijo.pagadoEl=fecha},guardarFijos(){},guardarMovimientos(){ctx.saves++},renderGastosVariables(){},renderFijos(){},renderKPIs(){},renderHero(){},mostrarToast(){},payments:0,saves:0};ctx.window=ctx;
 vm.runInNewContext(source,ctx);return{ctx,banner,data,api:ctx.FluxiaBancoFijos};
}
const date='2026-10-12',mov={id:'bank-apple-299',bancoRef:'bank-apple-299',concepto:'Apple.com/bill',banco:'Caixa',origen:'banco',importe:2.99,fecha:date},one=()=>[{id:'fixed-icloud',nombre:'iCloud',importe:2.99,mes:'octubre'}];
// First prove previous production bug was real.
const old=harness('lab/v97.71.html',one(),{...mov});old.api.procesarGastoBanco(old.ctx.movimientos[0]);old.api.pintarBanner();
assert.equal(old.banner.style.display,'none','reference unexpectedly shows amount-only prompt');
// New candidate preserves the prompt after filtering.
const h=harness(process.argv[2]||'lab/v97.72.html',one(),{...mov});
assert.equal(h.api.procesarGastoBanco(h.ctx.movimientos[0]).tipo,'pregunta');
h.api.pintarBanner();assert.equal(h.banner.style.display,'block');assert.match(h.banner.innerHTML,/Apple.com\/bill/);assert.match(h.banner.innerHTML,/Sí, es ese/);
assert.equal(h.ctx.payments,0);assert.equal(h.ctx.movimientos[0].cuentaComoFijo,undefined);
h.api.confirmarPendiente(mov.id);
assert.equal(h.ctx.payments,1);assert.equal(h.ctx.gastosFijosItems[0].pagadoEl,date);assert.equal(h.ctx.movimientos[0].cuentaComoFijo,true);assert.equal(h.ctx.movimientos[0].vinculoFijoId,'fixed-icloud');
h.api.revisarExistentes();assert.equal(h.ctx.payments,1,'review may not count a payment twice');
// Previously imported & marked reviewed but NOT explicitly dismissed: ask once.
const oldSeen=harness('lab/v97.71.html',one(),{...mov});oldSeen.data.set('fluxia_banco_fijos_rev_v1_qa-profile',JSON.stringify([mov.id]));assert.equal(oldSeen.api.revisarExistentes(),0);
const seen=harness(process.argv[2]||'lab/v97.72.html',one(),{...mov});seen.data.set('fluxia_banco_fijos_rev_v1_qa-profile',JSON.stringify([mov.id]));assert.equal(seen.api.revisarExistentes(),1);seen.api.pintarBanner();assert.equal(seen.banner.style.display,'block');assert.equal(seen.api.revisarExistentes(),0,'pending alert must not recur');
// Same amount shared by 2 different fixed expenses: cannot guess.
const two=harness(process.argv[2]||'lab/v97.72.html',[{id:'a',nombre:'Apple Music',importe:2.99,mes:'octubre'},{id:'b',nombre:'iCloud',importe:2.99,mes:'octubre'}],{...mov});assert.equal(two.api.procesarGastoBanco(two.ctx.movimientos[0]).tipo,'ninguno');two.api.pintarBanner();assert.equal(two.banner.style.display,'none');assert.equal(two.ctx.payments,0);
// An explicit 'never again' must win over any retroactive scan.
const excluded=harness(process.argv[2]||'lab/v97.72.html',one(),{...mov});excluded.api.procesarGastoBanco(excluded.ctx.movimientos[0]);excluded.api.nuncaMas(mov.id);assert.equal(excluded.api.revisarExistentes(),0);excluded.api.pintarBanner();assert.equal(excluded.banner.style.display,'none');
console.log(JSON.stringify({redReferenceConfirmed:true,visibleAmountProposal:true,historicAlreadyReviewedPrompt:true,oneFixedPaidOnce:true,ambiguousDoesNotPay:true,neverAgainPreserved:true}));
