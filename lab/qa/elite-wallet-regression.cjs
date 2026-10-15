'use strict';
// Pure wallet regression from HTML mother: NEVER derive Disponible by adding cash balance.
const assert=require('node:assert/strict');
const wallet=require('./load-umd.cjs')('../js/fluxia-elite-wallet-v1.js');
let counter=0;
const run=(title,fn)=>{fn();console.log('PASS',++counter,title)};
const source={saldo:70,movimientos:[
 {id:'deposit',fecha:'2026-10-01T12:00:00Z',importe:100,tipo:'entrada',concepto:'Cajero'},
 {id:'expense',fecha:'2026-10-07T12:00:00Z',importe:20,tipo:'salida',concepto:'Pan',gastoId:'expense-variable'},
 {id:'hucha',fecha:'2026-10-12',importe:10,tipo:'salida_provision',concepto:'Agua',usoProvisionId:'uso-agua',provision:'Agua'}
]};
const before=JSON.stringify(source),a=wallet.inspect(source),month=wallet.month(a,'2026-10');
run('historical snapshot readable',()=>assert.equal(a.ok,true));
run('historic balance is 70 euros, not 100 deposited',()=>assert.equal(a.saldoCents,7000));
run('month contains 3 movements',()=>assert.equal(month.count,3));
run('deposit counted only inside wallet',()=>assert.equal(month.entradasCents,10000));
run('cash expense tracked once',()=>assert.equal(month.gastosCents,2000));
run('hucha payment separate from variable expense',()=>assert.equal(month.usosProvisionCents,1000));
run('no double linkage when both IDs exist',()=>assert.equal(wallet.linkConflicts(a,[{id:'expense-variable'}],[{id:'uso-agua'}]).length,0));
run('missing expense link flagged for review, not auto repaired',()=>assert.equal(wallet.linkConflicts(a,[],[{id:'uso-agua'}]).length,1));
run('missing provision use flagged for review',()=>assert.equal(wallet.linkConflicts(a,[{id:'expense-variable'}],[]).length,1));
run('no input mutation',()=>assert.equal(JSON.stringify(source),before));
run('September excludes October movements',()=>assert.equal(wallet.month(a,'2026-09').count,0));
run('missing wallet is unknown, not zero',()=>assert.equal(wallet.inspect(null).ok,false));
run('zero historical balance is valid snapshot but not live',()=>assert.equal(wallet.inspect({saldo:0,movimientos:[]}).ok,true));
run('invalid untyped balance cannot be coerced',()=>assert.equal(wallet.inspect({saldo:'0',movimientos:[]}).ok,false));
run('negative financial transactions flagged',()=>assert(wallet.inspect({saldo:0,movimientos:[{id:'x',importe:-12,tipo:'salida',fecha:'2026-10-01'}]}).warnings.length>0));
run('duplicate wallet movement IDs flagged',()=>assert(wallet.inspect({saldo:0,movimientos:[{id:'same',importe:10,tipo:'entrada'},{id:'same',importe:20,tipo:'salida'}]}).warnings.length>0));
run('unknown posting type cannot be treated as entry',()=>assert.equal(wallet.inspect({saldo:0,movimientos:[{id:'u',importe:10,tipo:'otro'}]}).movements[0].clase,'desconocido'));
run('strict month requires canonical YYYY-MM',()=>assert.equal(wallet.month(a,'octubre'),null));
run('money cents safe range',()=>assert.equal(wallet.cents(Number.POSITIVE_INFINITY),null));
run('snapshot does not expose wallet as bank Disponible',()=>assert.equal(typeof a.disponible,'undefined'));

const cashHTML={saldo:60,movimientos:[...source.movimientos,
 {id:'cash-added',fecha:'2026-10-15',importe:20,tipo:'entrada',concepto:'Dinero añadido'},
 {id:'cash-spent',fecha:'2026-10-15',importe:30,tipo:'salida',concepto:'Gasto en mano'}]};
const cashCompare=wallet.compareMovements(cashHTML,source);
run('cash HTML copy surfaces added and spent movements',()=>assert.equal(cashCompare.htmlOnly.length,2));
run('cash movement history does not invent or hide the net balance difference',()=>assert.equal(cashCompare.balanceDeltaCents,-1000));
run('same IDs with a changed amount remain a discrepancy',()=>{const x=wallet.compareMovements(source,{...source,movimientos:source.movimientos.map(m=>m.id==='deposit'?{...m,importe:99}:m)});assert.equal(x.different[0].changed.includes('cents'),true)});
run('an absent cloud wallet cannot be certified as parity',()=>assert.equal(wallet.compareMovements(source,null).ready,false));
run('duplicate movement IDs block equivalence',()=>{const x=wallet.compareMovements({saldo:0,movimientos:[{id:'d',importe:1,tipo:'entrada'},{id:'d',importe:1,tipo:'entrada'}]},{saldo:0,movimientos:[{id:'d',importe:1,tipo:'entrada'}]});assert.equal(x.duplicates.length,1);assert.equal(x.equivalent,false)});
console.log('RESULT',counter,'/ 25 wallet invariants');
