'use strict';
// v2.0.73: rescates pendientes por provisión. Datos ficticios; sin escritura.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { loadEliteFunctions, between, line } = require('./lib/elite-html-functions.cjs');
const { html, context } = loadEliteFunctions({});
const slice = between(html, 'function huchaRescatesPendientes(hucha){', '\nfunction huchaRescatesPanel(');
assert(slice.length > 100, 'función de rescates presente');
assert(!slice.includes('fetch(') && !slice.includes('setItem') && !slice.includes('.insert('), 'sin escritura');
const huchasFict = [{ id: 'h1', nombre: 'Agua' }, { id: 'h2', nombre: 'Renta' }, { id: 'h3', nombre: 'Renta' }];
context.mods = [{ id: 'huchas', key: 'x' }];
context.items = { x: huchasFict };
context.canon = (m) => (m && m.id === 'huchas' ? huchasFict : null);
context.huchaUsesFromSource = () => [
  { id: 'u1', tipo: 'temporal', provision: 'Agua', importe: 100, repuesto: 40, fecha: '2026-09-01', devolver: '2026-11-01' },
  { id: 'u2', tipo: 'temporal', provision: 'Agua', importe: 50, repuesto: 50, fecha: '2026-08-01' },
  { id: 'u3', tipo: 'definitivo', provision: 'Agua', importe: 20 },
  { id: 'u4', tipo: 'temporal', provision: 'Renta', importe: 30, repuesto: 0, fecha: '2026-09-05' },
];
context.temporaryUseOutstanding = (u) => (u.id === 'u1' ? { kind: 'verified_summary', cents: 6000, repaidCents: 4000 } : u.id === 'u2' ? { kind: 'verified_summary', cents: 0, repaidCents: 5000 } : { kind: 'verified_summary', cents: 3000, repaidCents: 0 });
vm.runInContext(slice, context, { filename: 'rescates' });
const fn = vm.runInContext('huchaRescatesPendientes', context);
const agua = fn(huchasFict[0]);
assert.equal(agua.ambiguo, false);
assert.deepEqual(agua.items.map((x) => x.id), ['u1'], 'solo el rescate con saldo pendiente');
assert.equal(agua.items[0].falta, 60);
const renta = fn(huchasFict[1]);
assert.equal(renta.ambiguo, true, 'dos provisiones con el mismo nombre: no se asocia nada');
assert.equal(renta.items.length, 0);
console.log('PASS v2.0.73: rescates pendientes por nombre único; con nombre repetido no se asocia nada');
