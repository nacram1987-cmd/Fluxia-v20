'use strict';
// Executes the real import functions extracted from the shipped HTML. Provider,
// classification and UI are deterministic boundaries, not live bank connections.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const acorn=require('../auditorias/qa-v97.66/node_modules/acorn');
function bankHarness(file){
 const html=fs.readFileSync(file,'utf8');
 const source=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)][97][1];
 const wanted=new Set(['aplicarMovs','listaMovs','yaExisteManual','pendienteIgual','validarMovimiento','esImporteValido','huellaCargo','nomBanco','normCat','difDias','fx9770MismoCargo']);
 const functions=[];function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&wanted.has(n.id.name))functions.push(source.slice(n.start,n.end));for(const [k,v]of Object.entries(n))if(k!=='start'&&k!=='end')Array.isArray(v)?v.forEach(walk):walk(v)}walk(acorn.parse(source,{ecmaVersion:'latest'}));
 const ctx={console,Date,Math,Set,Map,JSON,Number,String,Array,performance, movimientos:[],MARCA: 'QA',blocked:new Set(),window:{},localStorage:{getItem:()=>null,setItem:()=>{}},
 clsDiagOut(){},clsDiag(){},clsResultado(){return ''},clsPendQuitar(){},
 procesarIngreso(){return null},ingMarcarVisto(){},corteDeBanco(){return null},leerCorte(){return null},eraDelCorte(){return false},
 esTraspasoPropio(){return false},clasificar(){return {tipo:'real'}},detectarCategoria(){return 'Otros'},
 movimientoBancoVetado(m){return ctx.blocked.has(m.id)},
 registrarGastoVariable(o){const g={...o,id:'qa-'+ctx.movimientos.length,mes:'oct',origen:'manual'};ctx.movimientos.push(g);return g}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(functions.join('\n'),ctx);return ctx;
}
const file=process.argv[2]||'lab/v97.69.html',c=bankHarness(file),ids=new Set();
const cargo=(id,concepto,extra={})=>({id,concepto,fecha:'2026-10-13',importe:-20,banco:'Caixa',...extra});
const findings=[];function test(name,fn){try{fn();findings.push({name,pass:true})}catch(e){findings.push({name,pass:false,error:e.message})}}
function reset(items=[]){c.movimientos=items;ids.clear();c.blocked.clear()}
test('Different merchants, same amount/day: both retained',()=>{reset();c.aplicarMovs([cargo('a','Mercadona'),cargo('b','Farmacia')],ids,'Caixa');assert.equal(c.movimientos.length,2)});
test('Same merchant, two authoritative IDs in same batch: both retained',()=>{reset();c.aplicarMovs([cargo('a','Mercadona'),cargo('b','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,2)});
test('Same merchant, new confirmed ID in later batch: retained',()=>{reset();c.aplicarMovs([cargo('a','Mercadona')],ids,'Caixa');c.aplicarMovs([cargo('b','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,2)});
test('Manual unrelated expense cannot absorb bank payment by amount',()=>{reset([{id:'manual',importe:20,fecha:'2026-10-13',concepto:'Farmacia',origen:'manual'}]);c.aplicarMovs([cargo('a','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,2);assert.equal(c.movimientos[0].bancoRef,undefined)});
test('Pending unrelated merchant cannot absorb confirmed payment',()=>{reset([{id:'pending',importe:20,fecha:'2026-10-13',concepto:'Farmacia',banco:'Caixa',origen:'banco',bancoRef:'p',bancoV:'QA',bancoPendiente:true}]);c.aplicarMovs([cargo('a','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,2);assert.equal(c.movimientos[0].bancoRef,'p')});
test('Unambiguous matching manual record links exactly once',()=>{reset([{id:'manual',importe:20,fecha:'2026-10-13',concepto:'Mercadona',origen:'manual'}]);c.aplicarMovs([cargo('a','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,1);assert.equal(c.movimientos[0].bancoRef,'a')});
test('Unambiguous pending-to-confirmed record links once',()=>{reset([{id:'pending',importe:20,fecha:'2026-10-13',concepto:'Mercadona',banco:'Caixa',origen:'banco',bancoRef:'p',bancoV:'QA',bancoPendiente:true}]);c.aplicarMovs([cargo('a','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,1);assert.equal(c.movimientos[0].bancoRef,'a');assert.equal(c.movimientos[0].bancoPendiente,false)});
test('400 bank records, ten reimports: identity/count/sum unchanged',()=>{reset();const batch=Array.from({length:400},(_,i)=>cargo('bank-'+i,'Merchant '+i));c.aplicarMovs(batch,ids,'Caixa');assert.equal(c.movimientos.length,400);const initial=JSON.stringify(c.movimientos);for(let i=0;i<10;i++){const r=c.aplicarMovs(batch,ids,'Caixa');assert.equal(r.nuevos,0);assert.equal(JSON.stringify(c.movimientos),initial)}assert.equal(c.movimientos.reduce((s,x)=>s+x.importe,0),8000)});
test('Archived bank ID blocked through ten reimports',()=>{reset();c.blocked.add('archived');for(let i=0;i<10;i++)c.aplicarMovs([cargo('archived','Mercadona')],ids,'Caixa');assert.equal(c.movimientos.length,0)});
if(process.argv.includes('--extended'))test('Same raw provider ID across banks cannot hide another account payment',()=>{reset();c.aplicarMovs([cargo('shared-id','Mercadona',{banco:'Caixa'}),cargo('shared-id','Farmacia',{banco:'Revolut'})],ids,'Caixa');assert.equal(c.movimientos.length,2)});
console.log(JSON.stringify({file,boundaries:'deterministic provider/classifier/UI; no live bank, no cloud writes',tests:findings},null,2));
if(findings.some(x=>!x.pass))process.exitCode=1;
module.exports={bankHarness};
