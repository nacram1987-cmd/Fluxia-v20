'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('../qa-v97.66/node_modules/jsdom');
const acorn=require('../qa-v97.66/node_modules/acorn');
const {indexedDB,IDBKeyRange}=require('../qa-v97.66/node_modules/fake-indexeddb');
const source=fs.readFileSync('lab/v97.66.html','utf8');
const candidate=fs.readFileSync('lab/v97.67.html','utf8');
const patch=[
 ['function fxNav9761Render(tab){var signature=fxNav9761Signature(tab),previous=fxNav9761Cache.get(tab);','function fxNav9761Render(tab){var previous=fxNav9761Cache.get(tab),signature=previous===undefined?null:fxNav9761Signature(tab);'],
 ['function closeDrawer(){var m=document.getElementById("drawerMenu");','function closeDrawer(skipResume){var m=document.getElementById("drawerMenu");'],
 ['if(fxNav9758Pending)fxNav9758Schedule(fxNav9758Pending);else fxNav9758ResumeJobs();var later=window.requestIdleCallback','if(!skipResume){if(fxNav9758Pending)fxNav9758Schedule(fxNav9758Pending);else fxNav9758ResumeJobs()}var later=window.requestIdleCallback'],
 ['try{closeDrawer()}catch(e){}try{window.scrollTo(0,0)}catch(e){}fxNav9758Schedule(tabName)','try{closeDrawer(true)}catch(e){}try{window.scrollTo(0,0)}catch(e){}fxNav9758Schedule(tabName)']
];
let rebuilt=source;
for(const [before,after] of patch){
 assert.equal(rebuilt.split(before).length-1,1,'unique patch anchor '+before.slice(0,50));
 rebuilt=rebuilt.replace(before,after);
}
rebuilt=rebuilt.replaceAll('v97.66-LAB','v97.67-LAB').replace('window.FLUXIA_LAB_VERSION="v97.66"','window.FLUXIA_LAB_VERSION="v97.67"');
rebuilt=rebuilt.replace('</head>','<style id="fx9767-light-panel-compositor">/* Avoid persistent GPU promotion of every tab, especially on mobile Safari. */html body .panel{will-change:auto!important;transform:none!important;backface-visibility:visible!important}</style>\n</head>');
assert.equal(candidate,rebuilt,'only specifically authorized navigation/compositor changes');
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const b=scripts(source),a=scripts(candidate);
assert.equal(a.length,b.length,'no removed scripts');
for(const script of a)acorn.parse(script,{ecmaVersion:'latest'});
assert.equal(a[97],b[97],'banking module immutable');
assert(!candidate.includes('gvAjustadoVal'),'legacy Available never returns to Variables');
for(const fn of ['disponibleEfectivo','variablesTotal','resumenMovimientosVariables','guardarLS','cargarLS','guardarMovimientos','cargarTodo','recargarDesdeServidor']){
 const rx=new RegExp('function '+fn+'\\(');
 assert.equal((a[29].match(rx)||[]).length,(b[29].match(rx)||[]).length,fn+' is intact');
}
(async()=>{
 const warnings=[],vc=new VirtualConsole();
 vc.on('jsdomError',e=>warnings.push(e.message));
 const dom=new JSDOM(candidate,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.67.html',
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
   const control=w.document.getElementById('btnMenu');
   const overlay=w.document.getElementById('drawerOverlay');
   for(let i=0;i<12;i++){
     control.click();assert(w.document.getElementById('drawerMenu').classList.contains('open'));
     overlay.click();assert(!w.document.getElementById('drawerMenu').classList.contains('open'));
   }
   control.click();
   w.goToTab('resumen');
   assert(!w.document.getElementById('drawerMenu').classList.contains('open'),'menu closed');
   assert(w.document.getElementById('panel-resumen').classList.contains('active'),'home activated');
   const stable=w.disponibleEfectivo(w.eval('mesSeleccionado'));
   w.goToTab('ingresos');
   w.goToTab('gastos-variables');
   assert.equal(w.disponibleEfectivo(w.eval('mesSeleccionado')),stable,'navigation never changes financial total');
   assert.equal(w.document.querySelectorAll('.panel.active').length,1,'one visible panel');
   assert.deepEqual(warnings,[],'no uncaught DOM error');
   console.log(JSON.stringify({release:'v97.67-LAB',parsedScripts:a.length,bankModuleIdentical:true,
      coldSignatureCalls:1,menuCycles:12,inPlaceAmountEditInvalidates:true,variablesTotal:total,
      financialBalanceUnchanged:true,physicalIphoneBenchmark:false,domErrors:warnings},null,2));
 }finally{dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
