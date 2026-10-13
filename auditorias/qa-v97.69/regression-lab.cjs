'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('../qa-v97.66/node_modules/jsdom');
const acorn=require('../qa-v97.66/node_modules/acorn');
const {indexedDB,IDBKeyRange}=require('../qa-v97.66/node_modules/fake-indexeddb');
const before=fs.readFileSync('lab/v97.68.html','utf8');
const after=fs.readFileSync('lab/v97.69.html','utf8');
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const b=scripts(before),a=scripts(after);
assert.equal(a.length,b.length,'No script tag removed or inserted');
for(const js of a)acorn.parse(js,{ecmaVersion:'latest'});
assert.equal(a[97],b[97],'Banking module identical');
assert.equal((before.match(/setInterval\(/g)||[]).length,(after.match(/setInterval\(/g)||[]).length,'No new polling');
for(const id of ['gvStatMes','gvStatTotal','fxDashVariables','fxDashDisponible','fx9769SpentTotal','fx9769History']){
 assert(after.includes('id="'+id+'"'),'Required element '+id);
}
assert(!after.includes('gvAjustadoVal'),'Legacy Disponible must not return to Variables');
for(const fn of ['esMovimientoVariable','variablesTotal','gastosFijosDisponibleTotal','disponibleEfectivo','guardarPago','aplicarVinculo','guardarMovimientos','guardarLS','cargarLS','recargarDesdeServidor']){
 const pat='function '+fn+'(';
 const at=before.indexOf(pat),bt=after.indexOf(pat);
 assert(at>=0&&bt>=0,fn+' exists in both versions');
 const get=s=>s.slice(s.indexOf(pat),s.indexOf(pat)+480);
 assert.equal(get(before),get(after),fn+' initial logic unchanged');
}
assert.equal((after.match(/data-fx9769-next/g)||[]).length,2,'Lazy paging control');
(async()=>{
 const warnings=[],vc=new VirtualConsole();
 vc.on('jsdomError',e=>warnings.push(e.message));
 const dom=new JSDOM(after,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.69.html',
   runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
     w.indexedDB=indexedDB;w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('offline synthetic QA')};
     w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});
     w.HTMLCanvasElement.prototype.getContext=()=>null;
   }});
 const w=dom.window;
 try{
  await new Promise(r=>setTimeout(r,1600));
  w.eval('mesSeleccionado=MES_ACTUAL_REAL;'+
   'const _fxt=hoyISO();'+
   'movimientos=['+
   '{id:"qa-var",mes:mesSeleccionado,fecha:_fxt,concepto:"Mercadona",importe:30,categoria:"Alimentación"},'+
   '{id:"qa-bank",mes:mesSeleccionado,fecha:_fxt,concepto:"Endesa",importe:70,cuentaComoFijo:true,vinculoFijoId:"qa-fijo",bancoRef:"ref-70",origen:"banco"},'+
   '{id:"qa-transfer",mes:mesSeleccionado,fecha:_fxt,concepto:"Transferencia",importe:500,excluidoDisponible:true},'+
   '{id:"qa-old",mes:MESES[0]===mesSeleccionado?MESES[1]:MESES[0],fecha:_fxt,concepto:"Café antiguo",importe:10,categoria:"Bares"}'+
   '];window.movimientos=movimientos;'+
   'gastosFijosItems=[{id:"qa-fijo",mes:mesSeleccionado,nombre:"Endesa",importe:70,pagadoEl:_fxt},{id:"qa-fijo-pend",mes:mesSeleccionado,nombre:"Securitas",importe:35}];'+
   'financiaciones=[];window.gastosFijosItems=gastosFijosItems;window.financiaciones=financiaciones;');
  const mes=w.eval('mesSeleccionado');
  assert.equal(w.variablesTotal(mes),30,'bank fixed and transfers excluded');
  assert.equal(w.resumenMovimientosVariables(mes).totalMes,30,'monthly subtotal');
  assert.equal(w.resumenMovimientosVariables(mes).totalPlan,40,'lifetime plan filters fixed and excluded');
  const d=w.fx9769SpentState(mes);
  assert.equal(d.variables,30);
  assert.equal(d.paid,70);
  assert.equal(d.pending,35);
  assert.equal(d.total,100);
  w.fx9769RenderSpend(mes,n=>w.eur(n,2));
  assert.equal(w.document.getElementById('fx9769SpentTotal').textContent,w.eur(100,2),'correct dashboard total');
  const details=w.document.getElementById('fx9769History'),rows=w.document.getElementById('fx9769HistoryRows');
  assert.equal(rows.childElementCount,0,'history is lazy, no DOM work until opened');
  details.open=true;
  w.fx9769RenderHistory(mes,d);
  assert(rows.textContent.includes('Endesa')&&rows.textContent.includes('Mercadona'),'combined history with fixed + variable');
  assert(!rows.textContent.includes('Securitas'),'pending fixed is not a fictitious movement');
  assert(!rows.textContent.includes('Transferencia'),'excluded transfers hidden');
  assert(rows.textContent.includes('Fijo · Banco · Pagado'),'bank fixed badge');
  const available=w.disponibleEfectivo(mes);
  w.fx9769RenderSpend(mes,n=>w.eur(n,2));
  assert.equal(w.disponibleEfectivo(mes),available,'display-only summary leaves available unchanged');
  w.eval('gastosFijosItems[0].pagadoEl=null');
  const pending=w.fx9769SpentState(mes);
  assert.equal(pending.paid,0,'do not silently mark fixed paid');
  assert.equal(pending.pending,105,'pending fixed kept separate');
  assert.equal(pending.total,30,'recorded-only expenses');
  w.eval('gastosFijosItems[0].pagadoEl=hoyISO();'+
    'movimientos[1].importe=73;movimientos[1].bancoRef="ref-73"');
  assert.equal(w.fx9769SpentState(mes).paid,73,'confirmed actual replaces planned amount');
  assert.equal(w.variablesTotal(mes),30,'no duplicate variable when linked amount changes');
  const stable=w.disponibleEfectivo(mes);
  w.goToTab('gastos-variables');w.fxNav9761Invalidate();w.fxNav9761Render('gastos-variables');
  assert.equal(w.document.getElementById('gvStatMes').textContent,w.eur(30,2),'variable total shown');
  assert.equal(w.document.getElementById('gvStatTotal').textContent,w.eur(40,2),'lifetime variable total shown');
  w.goToTab('resumen');w.goToTab('fijos');w.goToTab('resumen');
  assert.equal(w.disponibleEfectivo(mes),stable,'navigation never changes available');
  const bankCount=(a[97].match(/fetch\(/g)||[]).length;
  assert.deepEqual(warnings,[],'no uncaught DOM errors');
  console.log(JSON.stringify({release:'v97.69-LAB',parsedScripts:a.length,bankModuleIdentical:true,
   variableMonthly:30,variablePlan:40,fixedPaid:73,pendingFixed:35,totalRealized:103,
   excludedTransfer:500,historyLazy:true,financialBalanceUnchanged:true,
   physicalIphoneBenchmark:false,bankFetchStatements:bankCount,domErrors:warnings},null,2));
 }finally{dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
