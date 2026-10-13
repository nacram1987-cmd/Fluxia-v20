'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('../qa-v97.66/node_modules/jsdom');
const acorn=require('../qa-v97.66/node_modules/acorn');
const {indexedDB,IDBKeyRange}=require('../qa-v97.66/node_modules/fake-indexeddb');
const source=fs.readFileSync('lab/v97.67.html','utf8');
const candidate=fs.readFileSync('lab/v97.68.html','utf8');
const patch=[
 ["Array.from(panel.querySelectorAll(\"input,select,textarea,details\")).map(function(n){return[n.id,n.value,n.checked,n.open,n.className]})","Array.from(panel.querySelectorAll(\"input,select,textarea,details\"),function(n){return[n.id,n.value,n.checked,n.open,n.className]})"],
 ["document.body.style.top=\"\";window.scrollTo(0,_drawerScrollY)}catch(e){}if(skipResume!==true)","document.body.style.top=\"\";if(skipResume!==true)window.scrollTo(0,_drawerScrollY)}catch(e){}if(skipResume!==true)"],
 ["var later=window.requestIdleCallback||function(cb){return setTimeout(cb,80)};try{later(function(){try{fxGvReanudarLista()}catch(e){}})}catch(e){}}document.getElementById(\"btnMenu\")","if(skipResume!==true){var later=window.requestIdleCallback||function(cb){return setTimeout(cb,80)};try{later(function(){try{fxGvReanudarLista()}catch(e){}})}catch(e){}}}document.getElementById(\"btnMenu\")"]
];
let rebuilt=source;
for(const [before,after] of patch){
 assert.equal(rebuilt.split(before).length-1,1,'unique patch anchor '+before.slice(0,50));
 rebuilt=rebuilt.replace(before,after);
}
rebuilt=rebuilt.replaceAll('v97.67-LAB','v97.68-LAB').replace('window.FLUXIA_LAB_VERSION="v97.67"','window.FLUXIA_LAB_VERSION="v97.68"');
assert.equal(candidate,rebuilt,'only specifically authorized navigation/compositor changes');
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const b=scripts(source),a=scripts(candidate);
assert.equal(a.length,b.length,'no removed scripts');
for(const script of a)acorn.parse(script,{ecmaVersion:'latest'});
assert.equal(a[97],b[97],'banking module immutable');
assert.equal((source.match(/setInterval\(/g)||[]).length,(candidate.match(/setInterval\(/g)||[]).length,'no new interval polling');
assert(!candidate.includes('gvAjustadoVal'),'legacy Available never returns to Variables');
for(const fn of ['disponibleEfectivo','variablesTotal','resumenMovimientosVariables','guardarLS','cargarLS','guardarMovimientos','cargarTodo','recargarDesdeServidor']){
 const rx=new RegExp('function '+fn+'\\(');
 assert.equal((a[29].match(rx)||[]).length,(b[29].match(rx)||[]).length,fn+' is intact');
}
(async()=>{
 const warnings=[],vc=new VirtualConsole();
 vc.on('jsdomError',e=>warnings.push(e.message));
 const dom=new JSDOM(candidate,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html',
   runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
     w.indexedDB=indexedDB;w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('offline synthetic QA')};
     w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});
     w.HTMLCanvasElement.prototype.getContext=()=>null;
   }});
 const w=dom.window;
 try{
   await new Promise(r=>setTimeout(r,1600));
   w.eval('movimientos=Array.from({length:400},(_,i)=>({id:"fx67qa-"+i,mes:mesSeleccionado,fecha:"2026-10-10",concepto:"Prueba "+i,importe:3.5,tipo:"variable",categoria:"Otros"}));window.movimientos=movimientos;');
   const originalSig=w.fxNav9761Signature;
   assert.equal(typeof originalSig,'function');
   let count=0;
   w.fxNav9761Signature=(...args)=>{count++;return originalSig(...args)};
   w.fxNav9761Invalidate();
   w.fxNav9761Render('ingresos');
   assert.equal(count,1,'cold tab computes one financial signature, not two');
   w.fxNav9761Render('ingresos');
   assert.equal(count,2,'warm unchanged tab checks freshness exactly once');
   w.goToTab('gastos-variables');
   w.fxNav9761Invalidate();
   count=0;w.fxNav9761Render('gastos-variables');
   assert.equal(count,1,'cold Variables computes one financial signature');
   w.goToTab('gastos-variables');
   w.fxNav9761Render('gastos-variables');
   const total=w.resumenMovimientosVariables(w.eval('mesSeleccionado')).totalMes;
   assert.equal(total,1400,'Variables expected only synthetic movements');
   assert.equal(w.document.getElementById('gvCategoriaTotal').textContent,w.eur(total,2));
   const prevSig=originalSig('gastos-variables');
   w.eval('movimientos[0].importe=4.5');
   assert.notEqual(originalSig('gastos-variables'),prevSig,'in-place amount edit invalidates');
   w.fxNav9761Render('gastos-variables');
   assert.equal(w.resumenMovimientosVariables(w.eval('mesSeleccionado')).totalMes,1401);
   const scrollCalls=[];w.scrollTo=(x,y)=>scrollCalls.push([x,y]);
   const control=w.document.getElementById('btnMenu');
   const overlay=w.document.getElementById('drawerOverlay');
   const _oldResume=w.fxNav9758ResumeJobs;let resumeCalls=0;
   const _oldSchedule=w.fxNav9758Schedule;let scheduleCalls=0;
   w.fxNav9758ResumeJobs=function(...a){resumeCalls++;return _oldResume(...a)};
   w.fxNav9758Schedule=function(...a){scheduleCalls++;return _oldSchedule(...a)};
   for(let i=0;i<12;i++){
     control.click();assert(w.document.getElementById('drawerMenu').classList.contains('open'));
     const beforeCloseWork=resumeCalls+scheduleCalls;
     overlay.click();assert(!w.document.getElementById('drawerMenu').classList.contains('open'));
     assert(resumeCalls+scheduleCalls>beforeCloseWork,'manual menu close resumes or schedules pending jobs even when called with click Event');
   }
   assert.equal(scrollCalls.length,12,'manual close restores scroll on all 12 events');
   control.click();
   const scrollBeforeNav=scrollCalls.length;
   const resumeBeforeNav=resumeCalls,scheduleBeforeNav=scheduleCalls;
   w.goToTab('resumen');
   assert.deepEqual(scrollCalls.slice(scrollBeforeNav),[[0,0]],'navigation from drawer scrolls once, without restoring discarded position');
   assert.equal(resumeCalls,resumeBeforeNav,'navigation close does not resume stale jobs');
   assert.equal(scheduleCalls,scheduleBeforeNav+1,'navigation schedules destination exactly once');
   assert(!w.document.getElementById('drawerMenu').classList.contains('open'),'menu closed');
   assert(w.document.getElementById('panel-resumen').classList.contains('active'),'home activated');
   const stable=w.disponibleEfectivo(w.eval('mesSeleccionado'));
   w.goToTab('ingresos');
   w.goToTab('gastos-variables');
   assert.equal(w.disponibleEfectivo(w.eval('mesSeleccionado')),stable,'navigation never changes financial total');
   assert.equal(w.document.querySelectorAll('.panel.active').length,1,'one visible panel');
   assert.deepEqual(warnings,[],'no uncaught DOM error');
   console.log(JSON.stringify({release:'v97.68-LAB',parsedScripts:a.length,bankModuleIdentical:true,navigationScrollOperations:1,manualDrawerCloses:12,
      coldSignatureCalls:1,menuCycles:12,inPlaceAmountEditInvalidates:true,variablesTotal:total,
      financialBalanceUnchanged:true,physicalIphoneBenchmark:false,domErrors:warnings},null,2));
 }finally{dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
