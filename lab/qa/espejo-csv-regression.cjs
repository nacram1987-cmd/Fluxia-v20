'use strict';
// npm-free offline regression tests for local CSV comparator. No production data.
const assert=require('node:assert/strict');
const p=require('./load-umd.cjs')('../js/fluxia-espejo-csv-v1.js');
const csv='Fecha;Concepto;Categoría;Importe;Origen\n2026-10-14;"Gasolinera; venta";"Tabaco";7,50;banco\n2026-10-14;"Gasolinera; venta";"Tabaco";7,50;banco\n2026-10-04;"Apple.com/bill";"Entretenimiento";22;banco\n';
let n=0;
function test(name,fn){fn();console.log('PASS',++n,name)}
test('decimal comma parsed as integer cents',()=>assert.equal(p.integerCents('7,50'),750));
test('integer money parsed as integer cents',()=>assert.equal(p.integerCents('22'),2200));
test('bad financial amounts rejected',()=>assert.throws(()=>p.integerCents('7,123')));
test('ISO date validation rejects impossible days',()=>assert.equal(p.validDate('2026-02-30'),false));
test('CSV supports quoted semicolons and repeated merchant',()=>{const x=p.parse(csv,'2026-10');assert.equal(x.records.length,3);assert.equal(x.records[0].concepto,'Gasolinera; venta')});
test('source amount in cents exact',()=>assert.equal(p.parse(csv,'2026-10').cents,3700));
test('repeated tuples marked as candidates, not deleted',()=>{const x=p.parse(csv,'2026-10');assert.equal(x.repeatedExtra,1);assert.equal(x.records.length,3)});
test('categories amount totals',()=>assert.deepEqual(p.csvCategoryTotals(p.parse(csv,'2026-10')).map(x=>x.cents),[2200,1500]));
test('empty and bad schema fail closed',()=>assert.throws(()=>p.parse('Concepto;Importe\nA;1','2026-10')));
test('other months are not silently assigned',()=>{const x=p.parse(csv.replace('2026-10-04','2026-09-04'),'2026-10');assert.equal(x.outOfMonth.length,1);assert.equal(x.records.length,2)});
test('bank-linked fixed excluded',()=>assert.equal(p.originalVariable({mes:'octubre',cuentaComoFijo:true,importe:7.5}),false));
test('ATM withdrawals excluded',()=>assert.equal(p.originalVariable({origen:'banco',concepto:'Retirada efectivo ATM'}),false));
test('historic different month rejected',()=>assert.equal(p.applicable({mes:'septiembre',fecha:'2026-09-01'},'2026-10'),false));
test('a verified 1-of-2 identical tuple counts only once',()=>{const x=p.parse(csv,'2026-10');const r=p.compare(x,[{fecha:'2026-10-14',mes:'octubre',concepto:'Gasolinera; venta',categoria:'Tabaco',importe:7.5,origen:'banco'}]);assert.equal(r.matching,1);assert.equal(r.missing.length,2)});
test('cloud mismatched categories never declared identical',()=>{const x=p.parse(csv,'2026-10');const r=p.compare(x,[{fecha:'2026-10-14',mes:'octubre',concepto:'Gasolinera; venta',categoria:'Combustible',importe:7.5,origen:'banco'}]);assert.equal(r.matching,0)});
test('parity marked complete only on exact record multiset',()=>{const x=p.parse(csv,'2026-10');const r=p.compare(x,x.records.map(y=>({fecha:y.fecha,mes:'octubre',concepto:y.concepto,categoria:y.categoria,importe:y.importe,origen:y.origen})));assert.equal(r.matching,3);assert.equal(r.covered,true)});
console.log('RESULT',n,'CSV comparator synthetic tests passed');
