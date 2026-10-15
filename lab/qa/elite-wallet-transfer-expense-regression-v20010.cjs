'use strict';
const assert=require('node:assert/strict');
const engine=require('../js/fluxia-elite-financial-engine-v1.js');
// Own-account transfers are never expenses, including cash wallet recharges.
assert.equal(engine.role({origen:'efectivo',tipoInterno:'traspaso_efectivo'}),'transfer');
assert.equal(engine.role({origen:'efectivo',esTraspasoPropio:true}),'transfer');
assert.equal(engine.role({tipoInterno:'reponer_hucha'}),'transfer');
assert.equal(engine.role({tipoInterno:'rescate_hucha',importe:150,cuentaDestino:'Revolut'}),'transfer');
assert.equal(engine.role({tipoInterno:'rescate_provision',importe:150}),'transfer');
assert.equal(engine.role({origen:'efectivo',tipoInterno:'gasto_efectivo'}),'cash');
assert.equal(engine.role({vinculoFijoId:'fix-1',origen:'banco'}),'fixed-linked');
assert.equal(engine.role({archivado:true,origen:'efectivo'}),'excluded');
assert.equal(engine.role({importe:7.5,origen:'banco'}),'variable-real');
// The available calculation uses cents and the original accounting formula.
const r=engine.available({incomeCents:285594n,realExpensesCents:163118n,plannedProvisionsCents:91888n,excessContributionsCents:0n});
assert.equal(r.ok,true);
assert.equal(r.cents,30588n);
assert.equal(engine.available({incomeCents:285594n}).ok,false);
assert.deepEqual(engine.certification({canonical:true,htmlSnapshot:false,variablesCompared:false,bankReconciled:false,huchaReconciled:false,engineRules:true}).certified,false);
console.log('PASS: wallet transfers excluded, fixed-linked excluded, cents arithmetic and certification gate');
