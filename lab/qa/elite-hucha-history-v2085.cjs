'use strict';
// Historial de provisiones con el criterio del HTML (eventosProvisiones). Datos sintéticos.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { loadEliteFunctions } = require('./lib/elite-html-functions.cjs');
const E = loadEliteFunctions({});
const lab = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');
const grab = (name, end) => { const a = lab.indexOf('function ' + name + '('), b = lab.indexOf(end, a + 10); assert(a > 0 && b > a, name); return lab.slice(a, b); };
vm.runInContext(grab('candidateHuchaByName', '\nfunction ') + '\n' + grab('eliteHuchaEvents', '\nfunction eliteHuchaHistoryPanel('), E.context);
const hucha = { id: 'h1', nombre: 'Demo', importeMensual: 50, aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-01', importe: 50 }] } };
const usos = [
  { id: 'u1', fecha: '2026-09-17', provision: 'Demo', concepto: 'Pago', importe: 100, tipo: 'temporal', reposiciones: [{ id: 'r1', fecha: '2026-09-24', importe: 40 }], repuesto: 40 },
  { id: 'u2', fecha: '2026-10-02', provision: 'Demo', concepto: 'Factura luz', importe: 30, tipo: 'definitivo', repuesto: 0 },
  { id: 'u3', fecha: '2026-10-03', provision: 'Demo', concepto: 'Rescate temporal', importe: 50, tipo: 'temporal', reposiciones: [{ id: 'r2', fecha: '2026-10-05', importe: 50 }], repuesto: 50 },
  { id: 'u4', fecha: '2026-10-04', provision: 'Demo', concepto: 'Rescate', importe: 60, tipo: 'temporal', reposiciones: [{ id: 'r3', fecha: '2026-10-06', importe: 30 }], repuesto: 50 },
];
const ev = E.context.eliteHuchaEvents(hucha, [hucha], usos);
const by = (id) => ev.filter((e) => e.id === id);
// rescate parcial: «faltan X»; rescate devuelto: «devuelto»
assert.equal(by('u1')[0].t, 'prestamo');
assert.match(by('u1')[0].det, /^faltan /, 'rescate parcial indica lo que falta');
assert.equal(by('u3')[0].det, 'devuelto', 'rescate devuelto');
// concepto genérico no se repite
assert.equal(by('u1')[0].det.includes('Pago'), false, 'concepto genérico no se muestra');
// pago de factura: concepto real, tipo pago, resta
assert.equal(by('u2')[0].t, 'pago');
assert.equal(by('u2')[0].det, 'Factura luz');
assert.equal(by('u2')[0].imp, -30);
// reposición sin fecha: la diferencia entre lo repuesto y las reposiciones con fecha se cuenta
const repos = ev.filter((e) => (e.id === 'u4' || e.id === 'r3') && e.t === 'repone');
assert.equal(repos.length, 2, 'una reposición con fecha y otra por la diferencia');
assert.equal(repos.reduce((s, e) => s + e.imp, 0), 50, 'total repuesto = repuesto declarado');
// orden: fecha descendente
const fechas = JSON.parse(JSON.stringify(ev.map((e) => e.f)));
assert.deepEqual(fechas, [...fechas].sort().reverse());
console.log('PASS v2.0.85: historial de provisiones con el criterio del HTML (faltan/devuelto, genéricos, reposiciones y orden)');
