'use strict';
// v2.0.62: las reglas de clasificación guardadas por el usuario convierten cargos nuevos en traspasos (propio o puente),
// sin nombres fijos en el código. Un cargo ya contabilizado nunca se reclasifica ni se duplica.
const assert = require('node:assert/strict');
const adapter = require('./load-umd.cjs')('../js/fluxia-elite-bank-adapter-v1.js');

const rules = [
  { t: ['alfa', 'beta', 'cuenta'], tipo: 'propio', dir: '*', ts: 1 },
  { t: ['gamma', 'beta', 'cuenta'], tipo: 'puente', dir: '*', ts: 2 },
  { t: ['delta', 'zeta'], tipo: 'real', dir: 'out', ts: 3 },
  { t: ['eta'], tipo: 'olvidar', dir: '*', ts: 5 },
  { t: ['eta'], tipo: 'propio', dir: '*', ts: 4 },
];

// 1. salida a la cuenta propia = traspaso propio; entrada = puente
assert.equal(adapter.classifyTransfer('To Alfa Beta cuenta', -10000n, rules), 'propio');
assert.equal(adapter.classifyTransfer('From Gamma Beta cuenta', 10000n, rules), 'puente');

// 2. solo casa la regla cuyas palabras están todas en el concepto
assert.equal(adapter.classifyTransfer('From Gamma Beta cuenta', 10000n, rules), 'puente');

// 3. dirección: una regla solo de salidas no clasifica una entrada
assert.equal(adapter.classifyTransfer('Delta Zeta', 500n, rules), null);
assert.equal(adapter.classifyTransfer('Delta Zeta', -500n, rules), null, 'tipo real no es traspaso');

// 4. «olvidar» más nuevo anula la regla propia más antigua
assert.equal(adapter.classifyTransfer('Eta', -100n, rules), null);

// 5. sin reglas o concepto ajeno: nada
assert.equal(adapter.classifyTransfer('Mercadona', -100n, rules), null);
assert.equal(adapter.classifyTransfer('Alfa Beta cuenta', -100n, []), null);

// 6. planImport: el traspaso sale de «nuevos» y queda clasificado; un cargo ya contabilizado sigue siendo duplicado
const fx = 'fxbank9770:["enablebanking","revolut","acc","stable-1"]';
const plan = adapter.planImport([], [{ bankRef: fx, fechaOperacion: '2026-10-02', importe: -1919, concepto: 'To Alfa Beta cuenta' }], {}, {}, rules);
assert.equal(plan.additions.length, 0, 'no es un gasto nuevo');
assert.equal(plan.classified.length, 1);
assert.equal(plan.classified[0].kind, 'propio');

const ledger = [{ bancoRef: 'stable-2', fecha: '2026-10-02', importe: -1919, concepto: 'Ya contabilizado' }];
const plan2 = adapter.planImport(ledger, [{ bankRef: 'stable-2', fechaOperacion: '2026-10-02', importe: -1919, concepto: 'To Alfa Beta cuenta' }], {}, {}, rules);
assert.equal(plan2.duplicates.length, 1, 'ya contabilizado: duplicado, no traspaso');
assert.equal(plan2.classified.length, 0);

console.log('PASS v2.0.62: reglas del HTML aplicadas como traspasos (propio/puente), con dirección, prioridad y sin duplicar');
