'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),acorn=require('../auditorias/qa-v97.66/node_modules/acorn');
const {JSDOM,VirtualConsole}=require('../auditorias/qa-v97.66/node_modules/jsdom');
const {IDBFactory,IDBKeyRange}=require('../auditorias/qa-v97.66/node_modules/fake-indexeddb');
const file=process.argv[2]||'AUDITORIA_ELITE/candidate/v97.70.html';
const html=fs.readFileSync(file,'utf8'),base=fs.readFileSync('lab/v97.69.html','utf8');
const blocks=h=>[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const b=blocks(base),a=blocks(html);assert.equal(a.length,b.length);
for(let i=0;i<a.length;i++){acorn.parse(a[i],{ecmaVersion:'latest'});if(i!==97)assert.equal(a[i].replaceAll('v97.70','v97.69'),b[i],'non-bank script unchanged '+i)}
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.70.html',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('synthetic offline')};w.scrollTo=()=>{};w.confirm=()=>false;w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null;}});
(async()=>{const w=dom.window;try{
 await new Promise(r=>setTimeout(r,1600));
 const setup=()=>w.eval(`mesSeleccionado=MES_ACTUAL_REAL;movimientos=[{id:'v',mes:mesSeleccionado,fecha:hoyISO(),concepto:'Variable',importe:30}];window.movimientos=movimientos;ingresosItems=[{id:'i',mes:mesSeleccionado,concepto:'Nómina',importe:1000,pagadoEl:hoyISO()}];window.ingresosItems=ingresosItems;gastosFijosItems=[{id:'f',mes:mesSeleccionado,nombre:'Endesa',importe:70}];window.gastosFijosItems=gastosFijosItems;provisiones=[];usosProvisiones=[];financiaciones=[];gastosCompartidos=[];`);
 setup();const month=w.eval('mesSeleccionado'),date=w.hoyISO();
 assert.equal(w.disponibleEfectivo(month),900,'fixed budget pending plus variable');
 assert.equal(w.fx9769SpentState(month).total,30,'pending fixed not realized');
 w.eval(`gastosFijosItems[0].pagadoEl=hoyISO();movimientos.push({id:'bank',mes:mesSeleccionado,fecha:hoyISO(),concepto:'Endesa',importe:73,bancoRef:'bank-73',cuentaComoFijo:true,vinculoFijoId:'f'})`);
 assert.equal(w.variablesTotal(month),30);assert.equal(w.disponibleEfectivo(month),897);assert.equal(w.fx9769SpentState(month).total,103);
 w.eval(`provisiones=[{id:'p',nombre:'Hucha',importeMensual:50,aportaciones:{}}]`);
 assert.equal(w.provisionesParaDisponible(month),50);
 for(const amount of [20,50,80]){w.eval(`provisiones[0].aportaciones[mesSeleccionado]=[{id:'apt',fecha:hoyISO(),importe:${amount}}]`);assert.equal(w.provisionesParaDisponible(month),Math.max(50,amount));assert.equal(w.disponibleEfectivo(month),897-Math.max(50,amount))}
 const past=w.eval('MESES.find(x=>x!==mesSeleccionado)');assert(past);
 w.eval(`provisiones[0].aportaciones[${JSON.stringify(past)}]=[{id:'past',fecha:'2026-09-01',importe:120}]`);assert.equal(w.disponibleEfectivo(month),817,'historic contributions do not alter current excess');
 w.eval(`movimientos.push({id:'own',mes:mesSeleccionado,fecha:hoyISO(),concepto:'Traspaso',importe:500,esTraspasoPropio:true});ingresosItems.push({id:'own-in',mes:mesSeleccionado,importe:500,esTraspasoPropio:true})`);assert.equal(w.disponibleEfectivo(month),817,'own transfer neutral');
 const before=w.eval('JSON.stringify({movimientos,ingresosItems,gastosFijosItems,provisiones,usosProvisiones,financiaciones,gastosCompartidos})');
 for(let i=0;i<20;i++){w.goToTab('gastos-variables');w.goToTab('fijos');w.goToTab('resumen');w.document.getElementById('btnMenu').click();assert(w.document.getElementById('drawerMenu').classList.contains('open'));w.document.getElementById('drawerOverlay').click()}
 assert.equal(w.eval('JSON.stringify({movimientos,ingresosItems,gastosFijosItems,provisiones,usosProvisiones,financiaciones,gastosCompartidos})'),before);assert.equal(w.disponibleEfectivo(month),817);
 // Real merge/tombstone engine, without any server write.
 const engine=w.FluxiaSync954;assert(engine);
 const list='v2_movimientos',old={id:'deleted',importe:25,_fxUpdatedAt:10};engine.registerDelete(list,old);
 const store=w.eval('Almacen');const tomb=store.getItem('v2_sync_tombstones'),explicit=store.getItem('v2_explicit_deletions');
 for(let i=0;i<10;i++){const merged=engine.mergeCloudValue(list,'[]',JSON.stringify([old]),tomb,tomb,null,null,explicit,explicit);assert.equal(JSON.parse(merged).length,0,'deleted record does not revive')}
 const latest={id:'edited',importe:40,_fxUpdatedAt:200},stale={id:'edited',importe:20,_fxUpdatedAt:100};
 assert.equal(JSON.parse(engine.mergeCloudValue(list,JSON.stringify([stale]),JSON.stringify([latest]),null,null))[0].importe,40,'remote newer edit wins');
 assert.equal(JSON.parse(engine.mergeCloudValue(list,JSON.stringify([latest]),'[]',null,null)).length,1,'empty remote cannot erase local');
 w.FLUXIA_PROFILE={id:'qa-A'};w.FluxiaBancoFijos.silenciarComercio?.({id:'qa',importe:15,banco:'QA',concepto:'Apple'});
 // A new isolated document has no financial fixtures.
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({file,scriptCount:a.length,unchangedNonBankScripts:true,availablePending:900,availableLinkedActual:897,provisionBudgetAndExcess:true,historicalCurrentInvariant:true,internalTransferNeutral:true,navigationCycles:20,listsUnchanged:true,deletedReimports:10,newerCloudRevisionWins:true,emptyRemotePreserves:true,cloudNetwork:'NOT EXERCISED',iOS:'NOT VERIFIED',errors},null,2));
 }finally{dom.window.close()}})().catch(e=>{console.error(e);process.exitCode=1});
