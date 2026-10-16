'use strict';
// v2.0.52: «Así sale tu Disponible» es solo presentación. Debe sumar el Disponible al céntimo,
// avisar si no cuadra, no aparecer sin cálculo válido y no cambiar la fórmula del motor.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const loadUmd = require('./load-umd.cjs');

const html = fs.readFileSync(path.join(__dirname, '../fluxia-elite-safari-datos-reales.html'), 'utf8');
const engine = loadUmd('../js/fluxia-elite-financial-engine-v1.js');

// la novedad 2.0.52 sigue registrada en el historial (la versión visible la comprueban las pruebas de cada release)
assert(html.includes(" ['2.0.52','Inicio: nueva tarjeta «Así sale tu Disponible»"));

// se muestra en Inicio, justo después de la barra de fuente
assert(html.includes("statusBar.append(label,sourceAction);$('#content').append(statusBar);\n {const bd=renderHomeBreakdown(calculation);if(bd)$('#content').append(bd)}"));

// función real extraída del HTML, con un «DOM» mínimo
const start = html.indexOf('function renderHomeBreakdown(calc){');
const end = html.indexOf('function renderHome(){', start);
assert(start > 0 && end > start);
function node(tag, cls, text) { return { tag, cls: cls || '', text: text == null ? '' : String(text), children: [], style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, append(...k) { this.children.push(...k); } }; }
const nav = [];
const ctx = {
  BigInt, Number, Math,
  el: (tag, cls, text) => node(tag, cls, text),
  money: (v) => v.toFixed(2).replace('.', ',') + ' €',
  navigateElite: (id) => nav.push(id),
  document: { querySelector: () => ({ scrollIntoView: () => nav.push('scroll') }) },
};
vm.createContext(ctx);
vm.runInContext(html.slice(start, end), ctx);
const texts = (n) => [n.text, ...n.children.flatMap(texts)];
const flat = (n) => texts(n).join(' | ');

// caso real de octubre (importes ficticios coherentes): ingresos - gastos - provisiones - exceso + compartidos
const input = { incomeCents: 321500n, realExpensesCents: 119787n, plannedProvisionsCents: 413200n, excessContributionsCents: 0n, sharedImpactCents: 8000n, pendingHuchaRescuesCents: 6500n };
const calc = engine.available(input);
assert.equal(calc.ok, true);
assert.equal(calc.cents, 321500n - 119787n - 413200n - 0n + 8000n);
const card = ctx.renderHomeBreakdown(calc);
assert(card, 'con un cálculo válido aparece la tarjeta');
const out = flat(card);
assert(out.includes('Así sale tu Disponible'));
assert(out.includes('+ 3215,00 €'), 'ingresos con signo +');
assert(out.includes('− 1197,87 €'), 'gastos con signo −');
assert(out.includes('− 4132,00 €'), 'provisiones con signo −');
assert(!out.includes('Exceso de aportaciones'), 'exceso cero no se muestra');
assert(out.includes('✓ La suma de las partes coincide con el Disponible al céntimo.'));
assert(out.includes('-2034,87 €'), 'muestra el Disponible exacto');
assert(!out.includes('Rescates'), 'los rescates temporales no suman ni aparecen como parte');

// v2.0.54: cada fila es un botón que lleva a su pestaña (la de gastos baja a «Gastos por pestaña»)
const rows = card.children.filter((x) => x.tag === 'button');
assert.equal(rows.length, 4, 'ingresos, gastos, provisiones y compartidos (exceso 0 no se muestra)');
for (const r of rows) r.onclick();
assert.deepEqual(nav, ['ingresos', 'scroll', 'huchas', 'compartidos']);

// con exceso de aportaciones se muestra como resta
const calcExcess = engine.available({ ...input, excessContributionsCents: 1500n });
assert(flat(ctx.renderHomeBreakdown(calcExcess)).includes('Exceso de aportaciones'));

// si las partes no suman el Disponible, avisa en lugar de aparentar coherencia
const bad = { ...calc, cents: calc.cents + 1n };
assert(flat(ctx.renderHomeBreakdown(bad)).includes('no suman el Disponible'));

// sin cálculo válido no aparece nada (nunca una cifra inventada)
assert.equal(ctx.renderHomeBreakdown(null), null);
assert.equal(ctx.renderHomeBreakdown({ ok: false, blockers: ['falta'] }), null);

// la fórmula del motor no cambia
assert(fs.readFileSync(path.join(__dirname, '../js/fluxia-elite-financial-engine-v1.js'), 'utf8')
  .includes('input.incomeCents-input.realExpensesCents-input.plannedProvisionsCents-input.excessContributionsCents+input.sharedImpactCents'));

console.log('PASS v2.0.52: la tarjeta suma el Disponible al céntimo, avisa si no cuadra y no cambia la fórmula');
