'use strict';
// v2.0.60: el efectivo gastado cuenta como variable del mes (igual que el HTML); sacar dinero del cajero y meter
// efectivo no cuentan; una cuota de financiación pagada en el mes se ve como pagada. Funciones reales del HTML.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { loadEliteFunctions, line, between } = require('./lib/elite-html-functions.cjs');

const { html, context, api } = loadEliteFunctions({});
// funciones de presentación/clasificación que no entran en la carga base
vm.runInContext([
  between(html, 'function isFixedLinkedMovement(row){', '\nfunction financialRecordRole('),
  between(html, 'function financialRecordRole(row){', '\nfunction variableVisibleInPeriod('),
  between(html, 'function variableVisibleInPeriod(row,ym){', '\nfunction monthRecords('),
  line(html, 'const rowIsPaid='),
  line(html, 'function availableVariableCounts(row)'),
].join('\n'), context, { filename: 'efectivo-variables' });
const variableVisibleInPeriod = vm.runInContext('variableVisibleInPeriod', context);
const availableVariableCounts = vm.runInContext('availableVariableCounts', context);
const rowIsPaid = vm.runInContext('rowIsPaid', context);

const base = { mes: 'octubre', contable: '2026-10', ym: '2026-10' };
const rows = [
  { ...base, id: 'c1', fecha: '2026-10-05', importe: 30, origen: 'efectivo', concepto: 'Pulido faros', categoria: 'Transporte' },
  { ...base, id: 'c2', fecha: '2026-10-06', importe: 10, origen: 'efectivo', tipoInterno: 'gasto_efectivo', concepto: 'Abarrotao' },
  { ...base, id: 'b1', fecha: '2026-10-07', importe: 20, origen: 'banco', banco: 'Revolut', concepto: 'Gasolinera' },
  { ...base, id: 'w1', fecha: '2026-10-06', importe: 100, origen: 'banco', banco: 'CaixaBank', concepto: 'Reintegro cajero' },
  { ...base, id: 't1', fecha: '2026-10-06', importe: 100, origen: 'efectivo', tipoInterno: 'traspaso_efectivo', concepto: 'Meter efectivo' },
];
const visibles = rows.filter((r) => variableVisibleInPeriod(r, '2026-10')).map((r) => r.id);
assert.deepEqual(visibles, ['c1', 'c2', 'b1'], 'efectivo gastado y gasto bancario cuentan como variables; retirada y traspaso no');
const suma = rows.filter((r) => variableVisibleInPeriod(r, '2026-10')).reduce((t, r) => t + r.importe, 0);
assert.equal(suma, 60, 'Variables del mes = 30 + 10 + 20');

// el Disponible usa la misma clasificación: lo que cuenta en Variables es lo que resta una vez
assert.equal(rows.filter((r) => availableVariableCounts(r)).map((r) => r.id).join(','), 'c1,c2,b1');
assert.equal(availableVariableCounts(rows[3]), false, 'sacar dinero del cajero es neutral');
assert.equal(availableVariableCounts(rows[4]), false, 'meter efectivo es neutral');

// financiación: pagada en el mes por su mapa de pagos o por fecha de pago del mes
vm.runInContext("selectedMonth='2026-10'", context);
assert.equal(rowIsPaid({ pagos: { '2026-10': '2026-10-12' } }), true, 'cuota iPhone pagada en octubre');
assert.equal(rowIsPaid({ pagadoEl: '2026-10-14' }), true, 'fijo pagado en octubre');
assert.equal(rowIsPaid({ pagadoEl: '2026-09-30' }), false, 'pagado en septiembre no cuenta en octubre');
assert.equal(rowIsPaid({ pagos: { '2026-09': '2026-09-19' } }), false);

// la app estable no cambia: ningún cambio en index.html
void fs; void path; void api;
console.log('PASS v2.0.60: efectivo gastado en Variables (60,00 € de prueba), retirada y traspaso neutrales, financiación pagada por mes');
