'use strict';
// v2.0.50: el resumen «Provisiones reales» muestra previsto/aportado/pendiente del mes, solo presentación.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadEliteFunctions } = require('./lib/elite-html-functions.cjs');
const S = loadEliteFunctions({ selectedMonth: '2026-10' });
const c = S.context, html = S.html;
const a = html.indexOf('function huchaMonthProvisionSummary('), b = html.indexOf('function huchaMonthlyContributions(', a);
assert(a > 0 && b > a, 'función presente');
const mk = (tag, cls, txt) => ({ tag, cls, txt, children: [], append(...x) { this.children.push(...x); } });
const huchas = [
  { id: 'h1', nombre: 'Renta', importeMensual: 164.05, inicio: 'julio', fin: null, aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-01', importe: 164.05 }] } },
  { id: 'h2', nombre: 'Agua', importeMensual: 67, inicio: 'julio', fin: null, aportaciones: { octubre: [] } },
  { id: 'h3', nombre: 'Seguro', importeMensual: 50, inicio: 'julio', fin: null, aportaciones: { octubre: [{ id: 'a3', fecha: '2026-10-02', importe: 60 }] } },
];
Object.assign(c, { el: mk, monthTitle: () => 'octubre 2026', mods: [{ id: 'huchas', key: 'planRescate_v2_provisiones' }], monthRecords: () => huchas.map((data, index) => ({ data, index, monthStatus: 'plan' })), money: (v) => v.toFixed(2) + ' €' });
vm.runInContext(html.slice(a, b), c);
const card = c.huchaMonthProvisionSummary(huchas, [], '2026-10');
const lines = card.children.filter((x) => x.cls === 'eliteHuchaBalanceLine').map((x) => x.children.map((y) => y.txt).join(' → '));
const text = lines.join('\n');
assert(/Provisión prevista del mes → 281\.05 €/.test(text), text);
assert(/Aportado en el mes → 224\.05 €/.test(text), text);
assert(/Pendiente de aportar → 67\.00 €/.test(text), text);
assert(/Exceso sobre lo previsto → 10\.00 €/.test(text), text);
assert(/Agua → 0\.00 € \/ 67\.00 € · falta 67\.00 €/.test(text), text);
assert(/Renta → 164\.05 € \/ 164\.05 € ✓/.test(text), text);
console.log('PASS v2.0.50: provisiones reales del mes (previsto, aportado, pendiente y exceso) por hucha y total');
