'use strict';
// v2.0.53: las huchas se muestran como tarjetas del HTML original. Solo presentación: el estado sale del snapshot y nunca se inventa un «Guardado».
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../fluxia-elite-safari-datos-reales.html'), 'utf8');

assert(html.includes('ÉLITE BETA · v2.0.53') && html.includes("const ELITE_SAFARI_VERSION='2.0.53';"));
assert(html.includes("<title>Fluxia Élite BETA v2.0.53 · Safari</title>") && html.includes('<meta name="fluxia-elite-version" content="2.0.53">'));
assert(html.includes(" ['2.0.53','Huchas: cada hucha vigente se muestra como en el HTML original"));
assert(html.includes("list.append(huchaMadreCard(hucha,name,snap,ok))"));

const cut = (from, to) => { const a = html.indexOf(from), b = html.indexOf(to, a); assert(a > 0 && b > a, from); return html.slice(a, b); };
const src = cut('const ELITE_HUCHA_ICONS=', 'function huchaContributionSnapshot') + cut('function huchaMadreCard(', 'function huchaMonthProvisionSummary(');
const node = (tag, cls, text) => ({ tag, cls: cls || '', text: text == null ? '' : String(text), children: [], style: {}, setAttribute() {}, append(...k) { this.children.push(...k); } });
const ctx = { el: node, money: (v) => v.toFixed(2).replace('.', ',') + ' €', monthTitle: () => 'octubre 2026', selectedMonth: '2026-10' };
vm.createContext(ctx); vm.runInContext(src, ctx);
const flat = (n) => [n.cls, n.text, ...n.children.map(flat)].join(' | ');
const base = { plannedCents: 5000, monthCents: 5000, status: 'conciliada por registros verificables', lifetimeComplete: true, issues: 0, conflicts: 0, timelineIncomplete: false, asOfBalanceCents: 12345 };

// al día + conciliada (icono por la misma precedencia del HTML: «coche» antes que «seguro»): «✓ Al día», Guardado y barra al 100 %
let c = ctx.huchaMadreCard({}, 'Seguro de coche', base, true), t = flat(c);
assert(c.cls.includes('pv-ok') && t.includes('🚗') && t.includes('✓ Al día') && t.includes('123,45 €') && t.includes('50,00 € / 50,00 €'));
assert.equal(c.children[2].children[0].style.width, '100.0%');

// parcial: «Faltan X» y barra proporcional
c = ctx.huchaMadreCard({}, 'Agua', { ...base, monthCents: 2000 }, true); t = flat(c);
assert(c.cls.includes('pv-pend') && t.includes('Faltan 30,00 €') && c.children[2].children[0].style.width === '40.0%');

// sin aportar
c = ctx.huchaMadreCard({}, 'Renta', { ...base, monthCents: 0 }, true); t = flat(c);
assert(t.includes('Sin aportar') && c.children[2].children[0].style.width === '0.0%');

// hucha no conciliada: NO se inventa el Guardado
c = ctx.huchaMadreCard({}, 'Boda Ana', { ...base, status: 'con conflicto', conflicts: 1 }, true); t = flat(c);
assert(!t.includes('123,45') && t.includes('—') && t.includes('Guardado no mostrado'));

// provisional verificable: se muestra marcado como provisional
c = ctx.huchaMadreCard({}, 'Tributos', { ...base, status: 'provisional' }, true); t = flat(c);
assert(t.includes('123,45 €') && t.includes('Guardado provisional'));

// línea de tiempo incompleta: sin Guardado
c = ctx.huchaMadreCard({}, 'Agua', { ...base, timelineIncomplete: true }, true);
assert(!flat(c).includes('123,45'));

// plan o aportaciones no verificables: «No verificable», sin cifras del mes
c = ctx.huchaMadreCard({}, 'Fondo', { ...base, plannedCents: null, monthCents: 0 }, false); t = flat(c);
assert(c.cls.includes('pv-na') && t.includes('No verificable') && t.includes('Plan mensual no verificable'));

// excedido: barra capada al 100 %
c = ctx.huchaMadreCard({}, 'Agua', { ...base, monthCents: 9000 }, true);
assert.equal(c.children[2].children[0].style.width, '100.0%');
console.log('PASS v2.0.53: tarjetas de huchas al estilo del HTML original sin inventar el Guardado');
