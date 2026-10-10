process.chdir(require('path').resolve(__dirname,'../..'));
const fs=require('fs'),assert=require('assert'),acorn=require('acorn');
const {JSDOM,VirtualConsole}=require('jsdom');
const {indexedDB,IDBKeyRange}=require('fake-indexeddb');
const before=fs.readFileSync('v97.65.html','utf8'),after=fs.readFileSync('index.html','utf8');
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const oldScripts=scripts(before),newScripts=scripts(after);assert.equal(oldScripts.length,newScripts.length);
for(const b of newScripts)acorn.parse(b,{ecmaVersion:'latest'});
function ast(s){return acorn.parse(s,{ecmaVersion:'latest'}).body}
function canonical(x){if(Array.isArray(x))return x.map(canonical);if(x&&typeof x==='object'){const r={};for(const k of Object.keys(x))if(!['start','end','raw'].includes(k))r[k]=canonical(x[k]);return r}return x}
const oldAST=ast(oldScripts[29]),newAST=ast(newScripts[29]);
const unchanged=['disponibleEfectivo','variablesTotal','resumenMovimientosVariables','ingresosTotal','gastosFijosTotal','provisionesParaDisponible','guardarLS','cargarLS','guardarMovimientos','cargarTodo','recargarDesdeServidor','goToTab'];
for(const name of unchanged){const a=oldAST.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name),b=newAST.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert(a&&b,name);assert.deepEqual(canonical(b),canonical(a),name)}
// A presentation fix must not touch any other script or financial function.
for(let i=0;i<newScripts.length;i++)if(i!==29)assert.equal(newScripts[i].replaceAll('v97.66','v97.65'),oldScripts[i], 'script '+i);
const oldRender=oldAST.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='renderGastosVariables');
const newRender=newAST.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='renderGastosVariables');
assert(oldRender&&newRender);assert(!after.includes('gvAjustadoVal'));
assert(!newScripts[29].slice(newRender.start,newRender.end).includes('disponibleEfectivo'));
const expectedMain=oldScripts[29].replace('const disponible=disponibleEfectivo(mes);const valEl=document.getElementById("gvAjustadoVal");if(valEl){valEl.textContent=eur(disponible,2);valEl.style.color=disponible>=0?"var(--teal)":"var(--wine)"}','');
assert.equal(newScripts[29],expectedMain.replaceAll('v97.65','v97.66'),'only legacy balance renderer removed');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(after,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/index.html',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.indexedDB=indexedDB;w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('offline QA')};w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null}});
const w=dom.window;
setTimeout(async()=>{try{
 w.eval(`movimientos=Array.from({length:400},(_,i)=>({id:'qa-'+i,mes:mesSeleccionado,fecha:'2026-10-10',concepto:'Prueba '+i,importe:3.5,tipo:'variable',categoria:'Otros'}));window.movimientos=movimientos;`);
 for(let i=0;i<20;i++){w.document.getElementById('btnMenu').click();assert(w.document.getElementById('drawerMenu').classList.contains('open'));w.document.getElementById('drawerOverlay').click();assert(!w.document.getElementById('drawerMenu').classList.contains('open'))}
 Object.defineProperty(w,'pageYOffset',{value:640,configurable:true});let restored=null;w.scrollTo=(x,y)=>{restored=y};w.openDrawer();assert.equal(w.document.body.style.top,'-640px');w.closeDrawer();assert.equal(restored,640);assert.equal(w.document.body.style.top,'');assert.equal(w.document.getElementById('fluxiaHome').tagName,'BUTTON');
 w.goToTab('gastos-variables');w.renderGastosVariables();
 assert.equal(w.document.getElementById('gvCategoriaTotal').textContent,w.eur(1400,2));
 w.goToInternalTab('gv-registro');w.renderGastosVariables();
 const original=w.fluxiaRenderPanel9619;let calls=0;w.fluxiaRenderPanel9619=function(...a){calls++;return original(...a)};
 w.fxNav9761Render('gastos-variables');const coldCalls=calls;
 const node=w.document.getElementById('gvMovimientosView').firstElementChild;
 const t=w.performance.now();w.fxNav9761Render('gastos-variables');const warmMs=w.performance.now()-t;
 assert.equal(calls,coldCalls,'unchanged tab should reuse DOM');assert.equal(w.document.getElementById('gvMovimientosView').firstElementChild,node);
 w.eval(`movimientos[0].importe=4.5`);w.fxNav9761Render('gastos-variables');assert.equal(calls,coldCalls+1,'same-length edit must invalidate');
 const value=w.disponibleEfectivo(w.eval('mesSeleccionado'));w.localStorage.setItem('qa-setting','1');w.fxNav9761Render('gastos-variables');assert.equal(calls,coldCalls+2,'storage changes must invalidate');assert.equal(w.disponibleEfectivo(w.eval('mesSeleccionado')),value);
 w.FLUXIA_PROFILE={...w.FLUXIA_PROFILE,id:'qa-different-user'};w.fxNav9761Render('gastos-variables');assert.equal(calls,coldCalls+3,'profile changes must invalidate');
 let opens=0,homes=0;const open=w.openDrawer,go=w.goToTab;w.openDrawer=function(){opens++;return open()};w.goToTab=function(t){homes++;return go(t)};w.document.querySelector('#btnMenu svg').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert.equal(opens,1);w.document.getElementById('btnMenu').click();assert(!w.document.getElementById('drawerMenu').classList.contains('open'),'menu toggle closes');const logo=w.document.getElementById('fluxiaHome');logo.replaceWith(logo.cloneNode(true));w.document.querySelector('#fluxiaHome svg').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert.equal(homes,1,'one activation from rebuilt logo');
 w.document.getElementById('fluxiaHome').click();assert(w.document.getElementById('panel-resumen').classList.contains('active'));
 for(const mode of ['gv-categoria','gv-registro']){w.goToTab('gastos-variables');w.goToInternalTab(mode);w.renderGastosVariables()}
 // Permanent regression: category/list navigation, changed month, cold/warm reuse and deferred summary.
const bankScriptsIdentical=newScripts[97]===oldScripts[97];
assert(bankScriptsIdentical,'entire bank module unchanged');
const gv=w.document.getElementById('panel-gastos-variables');
assert(!gv.querySelector('.gv-hero,.gv-hero-val,[id*=Disponible]'));
assert(!/te queda este mes|después de fijos|saldo disponible/i.test(gv.textContent));
assert.equal(w.document.querySelectorAll('#gvStatMes').length,1);assert.equal(w.document.querySelectorAll('#gvStatTotal').length,1);
const dataBefore=w.eval('JSON.stringify({movimientos,ingresosItems,gastosFijosItems,provisiones,usosProvisiones})');
const balanceBefore=w.disponibleEfectivo(w.eval('mesSeleccionado'));
const monthBefore=w.eval('mesSeleccionado');
const otherMonth=w.eval('MESES.find(m=>m!==mesSeleccionado)');
assert(otherMonth,'another plan month exists');
let balanceCalls=0;const realBalance=w.disponibleEfectivo;
w.disponibleEfectivo=function(...a){balanceCalls++;return realBalance(...a)};
for(const month of [monthBefore,otherMonth,monthBefore]){
 w.eval('mesSeleccionado='+JSON.stringify(month));
 for(const mode of ['gv-registro','gv-categoria']){
  w.goToTab('gastos-variables');w.goToInternalTab(mode);
  const n=balanceCalls;w.renderGastosVariables();if(w.__fxGVRefreshSummary)w.__fxGVRefreshSummary();
  assert.equal(balanceCalls,n,'Variables renderer and deferred task do not calculate balance');
  assert.equal(w.document.querySelectorAll('.panel.active').length,1);
  const summary=w.resumenMovimientosVariables(month);
  assert.equal(w.document.getElementById('gvStatMes').textContent,w.eur(summary.totalMes,2));
  assert.equal(w.document.getElementById('gvStatTotal').textContent,w.eur(summary.totalPlan,2));
  assert.equal(w.getComputedStyle(w.document.getElementById('panel-resumen')).display,'none','no dashboard bleed');
  await new Promise(resolve=>setTimeout(resolve,70));
  assert(!gv.querySelector('.gv-hero,.gv-hero-val,[id*=Disponible]'));
 }
 w.document.getElementById('fluxiaHome').click();
 assert(w.document.getElementById('panel-resumen').classList.contains('active'));
 w.document.getElementById('fxDashCardVariables').click();
 assert(w.document.getElementById('panel-gastos-variables').classList.contains('active'));
}
w.disponibleEfectivo=realBalance;
assert.equal(w.disponibleEfectivo(monthBefore),balanceBefore,'balance preserved after navigation and month changes');
assert.equal(w.eval('JSON.stringify({movimientos,ingresosItems,gastosFijosItems,provisiones,usosProvisiones})'),dataBefore,'financial lists not changed');
assert.deepEqual(errors,[]);
 console.log(JSON.stringify({parsedScripts:newScripts.length,unchangedFunctions:unchanged,menuCycles:20,variablesRows:400,categoryTotalCorrect:true,unchangedNavigationReusesDOM:true,sameLengthEditInvalidates:true,storageInvalidates:true,profileInvalidates:true,logoNavigates:true,variablesHaveNoAvailableCard:true,noBalanceCalculationInVariables:true,monthAndSubviewRegression:true,financialListsUnchanged:true,entireBankModuleUnchanged:true,warmNavigationSyntheticMs:warmMs,errors},null,2));
 }catch(e){console.error(e);process.exitCode=1}finally{w.close()}},1500);
