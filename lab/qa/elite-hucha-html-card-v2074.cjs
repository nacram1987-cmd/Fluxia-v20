'use strict';
// v2.0.74: la tarjeta de provisión replica la estructura del HTML operativo. Datos sintéticos; sin escritura.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../fluxia-elite-safari-datos-reales.html'), 'utf8');
const cut = (from, to) => { const a = html.indexOf(from), b = html.indexOf(to, a + 1); assert(a > 0 && b > a, 'sección: ' + from); return html.slice(a, b); };
const node = (tag, cls, text) => ({ tag, cls: cls || '', text: text == null ? '' : String(text), children: [], attrs: {}, style: {}, setAttribute(k, v) { this.attrs[k] = v; }, replaceChildren(...k) { this.children = k; }, append(...k) { this.children.push(...k); } });
const ctx = { el: node, money: (v) => v.toFixed(2).replace('.', ',') + ' €', monthTitle: () => 'octubre 2026', selectedMonth: '2026-10' };
vm.createContext(ctx);
vm.runInContext(cut('const ELITE_HUCHA_ICONS=', 'function huchaContributionSnapshot') + cut('function huchaMonthlyContributions(', 'const ELITE_HUCHA_ICONS=') + cut('function huchaMadreCard(', 'function huchaMonthProvisionSummary(') + cut('function huchaActionPreview(', '// Vinculación de cargos nuevos'), ctx);
const flat = (n) => [n.cls, n.text, ...n.children.map(flat)].join(' | ');
const snap = { plannedCents: 5000, monthCents: 2000, status: 'conciliada por registros verificables', lifetimeComplete: true, issues: 0, conflicts: 0, timelineIncomplete: false, asOfBalanceCents: 12345 };
const hucha = { id: 'h1', nombre: 'Seguro sintético', aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-01', importe: 20 }] } };
const rescates = [{ id: 'r1', importe: 40, falta: 25, fecha: '2026-09-20', devolver: '2026-10-30' }];

// orden de bloques igual al HTML: cabecera, saldo, barra, rescates, acciones, aportaciones, historial, pie
const card = ctx.huchaMadreCard(hucha, 'Seguro sintético', snap, true, { period: '2026-10', rescates, history: node('details', 'pv-det') });
const order = card.children.map((x) => x.cls.split(' ')[0]);
assert.deepEqual(order.slice(0, 3), ['pv-top', 'pv-saldo', 'pv-bar'], order.join(','));
assert(order.indexOf('pv-loan') > order.indexOf('pv-bar') && order.indexOf('pv-acts') > order.indexOf('pv-loan'), order.join(','));
assert(order.indexOf('pv-det') > order.indexOf('pv-acts') && order[order.length - 1] === 'pv-foot', order.join(','));
// rescate: importe, lo que falta y las tres acciones del HTML
const loan = card.children.find((x) => x.cls === 'pv-loan');
assert(flat(loan).includes('🔄 Rescatado 40,00 €') && flat(loan).includes('Faltan 25,00 €') && flat(loan).includes('en 13 d'));
assert(['Era un pago', 'Reponer', 'Borrar'].every((label) => flat(loan).includes(label)), 'acciones del rescate');
// sin ningún gesto de tarjeta completa: el historial es el 🕘 y el pie tiene Editar / Borrar
assert(!card.attrs.role && !card.onclick, 'la tarjeta no es un control entero');
// cada escritura solo abre vista previa en su franja; nunca guarda
const aportar = card.children.find((x) => x.cls === 'pv-acts').children[0];
aportar.onclick();
const slot = card.children.find((x) => x.cls === 'huchaPreviewSlot');
assert(flat(slot).includes('Vista previa · Aportar') && flat(slot).includes('no guarda nada'), 'vista previa sin escritura');
// pendiente de conciliar: sin Guardado inventado
const nc = ctx.huchaMadreCard(hucha, 'Seguro sintético', { ...snap, status: 'con conflicto', conflicts: 1 }, true, { period: '2026-10', rescates: [] });
assert(!flat(nc).includes('12,35') && flat(nc).includes('Guardado no mostrado'), 'sin cifra de guardado no conciliado');
// v2.0.75: en modo nube (el normal) las tarjetas salen del resumen; sin esto la pestaña quedaba vacía y una provisión nueva no aparecía
assert(html.includes('list.append(huchaMadreCard(hucha,name,snap,ok,{period,ambiguo:rescates.ambiguo,rescates:rescates.items,history:eliteHuchaInlineHistory(hucha,huchas,uses)}))'), 'el resumen pinta una tarjeta por provisión de la nube');
assert(html.includes('provisiones en Supabase')&&html.includes(',list);'), 'la lista de tarjetas y su línea de lectura se montan en el resumen');
console.log('PASS v2.0.74: tarjeta de provisión con la estructura del HTML, rescates por tarjeta y acciones solo en vista previa');
