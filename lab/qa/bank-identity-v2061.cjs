'use strict';
// v2.0.61: un cargo del banco que ya está en el libro se reconoce aunque su referencia llegue en otra forma
// (identidad del conector «fxbank9770:[…]» frente a la UUID antigua). Nunca se duplica ni se resucita.
const assert = require('node:assert/strict');
const adapter = require('./load-umd.cjs')('../js/fluxia-elite-bank-adapter-v1.js');

const uuid = '6ad15e51-8b5f-a8ca-9616-12ee2e43268a';
const fx = 'fxbank9770:["enablebanking","revolut","cc258e8945c871fd4de41be7584f3cff7552bb1dc3dbbd7bcd217c42fbbc1f1d","' + uuid + '"]';

// 1. libro con UUID antigua + identidad del conector; el banco envía la identidad del conector
let p = adapter.planImport(
  [{ bancoRef: uuid, bancoIdentity: fx, fecha: '2026-10-15', importe: -22, concepto: 'Paripe', origen: 'banco' }],
  [{ bankRef: fx, fechaOperacion: '2026-10-15', importe: -22, concepto: 'Paripe' }], {}, {});
assert.equal(p.additions.length, 0, 'no se duplica un cargo ya contabilizado');
assert.equal(p.duplicates.length, 1);

// 2. al revés: el libro guarda la identidad del conector y el banco envía la UUID
p = adapter.planImport([{ bancoRef: fx, fecha: '2026-10-15', importe: -22 }],
  [{ bankRef: uuid, fechaOperacion: '2026-10-15', importe: -22 }], {}, {});
assert.equal(p.additions.length, 0);
assert.equal(p.duplicates.length, 1);

// 3. un cargo distinto sí es nuevo
p = adapter.planImport([{ bancoRef: 'otra', fecha: '2026-10-15', importe: -22 }],
  [{ bankRef: fx, fechaOperacion: '2026-10-15', importe: -22 }], {}, {});
assert.equal(p.additions.length, 1, 'un cargo sin apunte sigue siendo nuevo');

// 4. misma referencia pero otra fecha: conflicto, no duplicado silencioso
p = adapter.planImport([{ bancoRef: fx, fecha: '2026-10-15', importe: -22 }],
  [{ bankRef: fx, fechaOperacion: '2026-10-16', importe: -22 }], {}, {});
assert.equal(p.conflicts.length, 1);
assert.equal(p.additions.length, 0);

// 5. un borrado explícito sigue bloqueando la resurrección
p = adapter.planImport([], [{ bankRef: fx, fechaOperacion: '2026-10-15', importe: -22 }], { deletedBankRefs: [uuid] }, {});
assert.equal(p.additions.length, 0, 'una lápida por UUID bloquea la identidad del conector');
assert.equal(p.blocked.length, 1);

console.log('PASS v2.0.61: identidad bancaria por referencia estable (sin duplicados, conflictos ni resurrección)');
