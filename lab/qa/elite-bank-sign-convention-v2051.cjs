'use strict';
// v2.0.51: un cargo ya contabilizado no es «conflicto» solo por el signo del importe, el texto del concepto o el rol.
const assert = require('node:assert/strict');
const loadUmd = require('./load-umd.cjs');
const adapter = loadUmd('../js/fluxia-elite-bank-adapter-v1.js');
const ledger = { id: 'r1', bancoRef: 'b-1', importe: 18.79, fecha: '2026-10-12', concepto: 'Tabaco', origen: 'banco' }; // el libro guarda el gasto en positivo
const incoming = { bankRef: 'b-1', importe: -18.79, fecha: '2026-10-12', concepto: 'E S Vistagiralda', source: 'original-bank-connector' };
let plan = adapter.planImport([ledger], [incoming], {}, {});
assert.equal(plan.conflicts.length, 0, 'signo opuesto + concepto editado = ya contabilizado');
assert.equal(plan.duplicates.length, 1);
assert.equal(plan.ok, true);
// vinculado a un fijo: el rol del libro es «fixed-linked» y el del banco «bank-movement»
plan = adapter.planImport([{ ...ledger, cuentaComoFijo: true, vinculoFijoId: 'f1' }], [incoming], {}, {});
assert.equal(plan.conflicts.length, 0); assert.equal(plan.duplicates.length, 1);
// importe distinto: sigue siendo conflicto real
plan = adapter.planImport([ledger], [{ ...incoming, importe: -19.79 }], {}, {});
assert.equal(plan.conflicts.length, 1); assert.equal(plan.ok, false);
// fecha distinta: sigue siendo conflicto real
plan = adapter.planImport([ledger], [{ ...incoming, fecha: '2026-10-13' }], {}, {});
assert.equal(plan.conflicts.length, 1);
// otra referencia bancaria: es un cargo nuevo, no un duplicado
plan = adapter.planImport([ledger], [{ ...incoming, bankRef: 'b-2' }], {}, {});
assert.equal(plan.additions.length, 1); assert.equal(plan.duplicates.length, 0);
console.log('PASS v2.0.51: signo y clasificación no generan conflictos; importe o fecha distintos sí');
