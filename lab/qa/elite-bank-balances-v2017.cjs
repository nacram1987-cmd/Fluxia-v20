'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={module:{exports:{}},globalThis:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/fluxia-elite-bank-connector-v1.js'),'utf8'),sandbox);
const api=sandbox.module.exports;
const map=new Map(),storage={getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};
const result=api.saveBalances('user-a','personal',{checkedAt:'2026-10-15T18:00:00.000Z',complete:false,expected:3,errors:['CaixaBank: HUB046'],saldos:[
 {banco:'Revolut',nombre:'Cuenta principal',iban:'ES75 1234 5678 9876 6227',tipo:'ITAV',importe:39.38,moneda:'EUR',fecha:'2026-10-15'},
 {banco:'CaixaBank',nombre:'Cuenta histórica',iban:'ES10 9999 1111 1952',tipo:'CLBD',importe:0.74,moneda:'EUR',fecha:'2026-09-28',desactualizado:true}
]},storage);
assert.equal(result.rows.length,2);
assert.equal(result.rows[0].iban,'•••• 6227');
assert(!JSON.stringify(result).includes('1234 5678 9876 6227'));
assert.deepEqual(JSON.parse(JSON.stringify(api.availableBalanceTotals(result.rows))),{EUR:39.38});
assert.equal(api.readBalances('user-a','personal',storage).errors[0],'CaixaBank: HUB046');
assert.equal(api.readBalances('user-a','shared',storage),null);
assert.equal(api.readBalances('user-b','personal',storage),null);
const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
assert.match(html,/ELITE_SAFARI_VERSION='2\.0\.17'/);
assert(html.includes("runBankConnector('saldos'"));
assert(html.includes("if(action==='bandeja')"));
assert(html.includes("connector.call('saldos'"));
assert(html.includes('Sincronizar bancos'));
assert(html.includes('Disponible en bancos'));
assert(html.includes('total parcial'));
console.log('PASS fresh available bank balances are summed by currency; stale and cross-profile data stay separate');
