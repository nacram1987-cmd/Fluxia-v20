'use strict';
/* Actual rendering and canonical spending regression; synthetic data only. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=process.argv[2]||'lab/v97.73.html',html=fs.readFileSync(file,'utf8'),old=fs.readFileSync('lab/v97.72.html','utf8');
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const a=scripts(old),b=scripts(html);
assert.equal(a.length,168);assert.equal(b.length,168);
const diffs=b.map((t,i)=>t!==a[i].replaceAll('v97.72','v97.73').replaceAll('9772','9773')?i:-1).filter(i=>i>=0);
assert.deepEqual(diffs,[29]);
const acorn=require('../auditorias/qa-v97.66/node_modules/acorn');
b.forEach((script,i)=>{try{acorn.parse(script,{ecmaVersion:'latest'})}catch(e){throw Error('Script '+i+' parse error: '+e.message)}});
for(const id of ['gvStatGastadoMes','gvStatMes','gvStatFijosPagados','gvStatTotal'])assert(html.includes('id="'+id+'"'),'Missing UI '+id);
const start=html.indexOf('function fx9769SpentState(mes)'),end=html.indexOf('function fx9769RenderHistory(',start);
assert(start>0&&end>start,'Missing canonical financial read-only selector');
const source=html.slice(start,end);
function getState({paid=false,bank=false,amount=73,variable=30}={}){
 const ctx={Map,Math,Number,String,Array,console,movimientos:bank?[{id:'bank73',mes:'octubre',cuentaComoFijo:true,vinculoFijoId:'f',bancoRef:'bank73',importe:amount,fecha:'2026-10-12'}]:[],hoyISO:()=> '2026-10-13',fijosDe:()=>[{id:'f',mes:'octubre',nombre:'Endesa',importe:70,pagadoEl:paid?'2026-10-12':null}],financiacionesActivas:()=>[],fechaPago:(_tipo,f)=>f.pagadoEl||null,variablesTotal:()=>variable};vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.fx9769SpentState('octubre');
}
let pending=getState();assert.equal(pending.variables,30);assert.equal(pending.paid,0);assert.equal(pending.pending,70);assert.equal(pending.total,30);
let actual=getState({paid:true,bank:true});assert.equal(actual.variables,30);assert.equal(actual.paid,73);assert.equal(actual.total,103);
let manual=getState({paid:true,bank:false});assert.equal(manual.paid,70);assert.equal(manual.total,100);
const renderStart=html.indexOf('var _gvQuickTotal=_gvResumen.totalMes;'),renderEnd=html.indexOf('}catch(_gvQuickError){}',renderStart);
assert(renderStart>=0&&renderEnd>renderStart,'Missing Variables render updater');
const snippet=html.slice(renderStart,renderEnd);
const values={},ctx={mes:'octubre',_gvResumen:{totalMes:30,totalPlan:220},document:{getElementById:id=>values[id]||(values[id]={textContent:'—'})},eur:(n)=>Number(n).toFixed(2)+' €',fx9769SpentState:()=>actual};
vm.createContext(ctx);vm.runInContext(snippet,ctx);
assert.equal(values.gvStatMes.textContent,'30.00 €');assert.equal(values.gvStatFijosPagados.textContent,'73.00 €');assert.equal(values.gvStatGastadoMes.textContent,'103.00 €');assert.equal(values.gvStatTotal.textContent,'220.00 €');
ctx.fx9769SpentState=()=>pending;vm.runInContext(snippet,ctx);assert.equal(values.gvStatGastadoMes.textContent,'30.00 €');assert.equal(values.gvStatFijosPagados.textContent,'0.00 €');
assert(!html.slice(html.indexOf('id="gvStatGastadoMes"')-100,html.indexOf('id="gvStatGastadoMes"')+100).includes('Disponible'),'Do not confuse availability with realized spending');
console.log(JSON.stringify({file,pass:true,scripts:168,changedScripts:diffs,pending30:pending.total,bankLinked103:actual.total,manual100:manual.total,values}));
