'use strict';
// v2.0.54: Huchas sin nombres repetidos y con tarjetas interactivas; Variables con filas del HTML original. Solo presentación.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../fluxia-elite-safari-datos-reales.html'), 'utf8');

// la novedad 2.0.54 sigue registrada en el historial (la versión visible la comprueban las pruebas de cada release)
assert(html.includes(" ['2.0.54','Huchas y Variables como en el HTML original."));

// --- Huchas: ya no se repite la lista de planes vigentes bajo las tarjetas, y la auditoría queda plegada ---
assert(html.includes("if(page!=='huchas')addGroup("), 'las huchas vigentes no se listan dos veces');
assert(html.includes("const fold=el('details','eliteAuditFold')"), 'auditoría plegada');
assert(html.includes("appendHuchaFinancialSummary(sumBox,entry,selectedMonth,reconstructedHuchaLedger("), 'el resumen financiero pasa al detalle de la hucha');
assert(html.includes("addGroup(page==='huchas'||page==='financiaciones'?'⚠️ Planes sin vigencia fechada · revisar'"), 'los planes sin vigencia siguen visibles');

const cut = (from, to) => { const a = html.indexOf(from), b = html.indexOf(to, a); assert(a > 0 && b > a, from); return html.slice(a, b); };
const node = (tag, cls, text) => ({ tag, cls: cls || '', text: text == null ? '' : String(text), children: [], style: {}, attrs: {}, classList: { add(c) { this._c.push(c); }, _c: [] },
  setAttribute(k, v) { this.attrs[k] = v; }, replaceChildren(...k) { this.children = k; }, append(...k) { this.children.push(...k); } });
const flat = (n) => [n.cls, n.text, ...(n.children || []).map(flat)].join(' | ');

// --- tarjeta de hucha (v2.0.74: estructura del HTML; la interacción está en sus botones y en su propio historial) ---
const opened = [];
const hctx = { el: node, money: (v) => v.toFixed(2).replace('.', ',') + ' €', monthTitle: () => 'octubre 2026', selectedMonth: '2026-10', openDetail: (...a) => opened.push(a) };
vm.createContext(hctx);
vm.runInContext(cut('const ELITE_HUCHA_ICONS=', 'function huchaContributionSnapshot') + cut('function huchaMonthlyContributions(', 'const ELITE_HUCHA_ICONS=') + cut('function huchaMadreCard(', 'function huchaMonthProvisionSummary(') + cut('function huchaActionPreview(', '// Vinculación de cargos nuevos'), hctx);
const base = { plannedCents: 5000, monthCents: 5000, status: 'conciliada por registros verificables', lifetimeComplete: true, issues: 0, conflicts: 0, timelineIncomplete: false, asOfBalanceCents: 12345 };
const hucha = { id: 'h1', nombre: 'Renta', aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-01', importe: 30 }, { id: 'a2', fecha: '2026-10-15', importe: 20 }], septiembre: [{ id: 'a0', fecha: '2026-09-02', importe: 50 }] } };
const find = (n, pred) => (pred(n) ? n : (n.children || []).map((k) => find(k, pred)).find(Boolean));
const histPanel = { open: false, scrollIntoView() {} };
const rescates = [{ id: 'r1', importe: 40, falta: 25, fecha: '2026-09-20', devolver: '2026-10-30' }];
const c = hctx.huchaMadreCard(hucha, 'Renta', base, true, { period: '2026-10', history: histPanel, rescates });
const tc = flat(c);
assert(c.cls.includes('pv-ok') && tc.includes('✓ Al día') && tc.includes('🔄 Rescatado 40,00 €') && tc.includes('Faltan 25,00 €'), 'estructura HTML: pill, rescate y lo que falta');
assert(tc.includes('Era un pago') && tc.includes('Reponer') && tc.includes('Borrar') && tc.includes('Usar dinero') && tc.includes('＋ Aportar') && tc.includes('✎ Editar'), 'acciones del HTML');
const hist = find(c, (n) => n.attrs && n.attrs['aria-label'] === 'Historial de Renta');
assert(hist, 'botón 🕘 dentro de la propia tarjeta');
hist.onclick(); assert.equal(histPanel.open, true, 'el historial se abre dentro de la tarjeta');
const det = c.children.find((x) => x.tag === 'details');
assert(det && /2 aportaciones en octubre/.test(flat(det)) && flat(det).includes('+30,00 €') && flat(det).includes('+20,00 €'), 'aportaciones del mes desplegables');
assert(!flat(det).includes('50,00'), 'solo las del mes');
// ninguna escritura se ejecuta: cada acción solo abre una vista previa
find(c, (n) => n.tag === 'button' && n.text === '＋ Aportar').onclick();
assert(opened.length === 0 && flat(c).includes('Vista previa · Aportar') && flat(c).includes('no guarda nada'), 'Aportar muestra vista previa y no guarda');
// sin plan verificable: no es una tarjeta interactiva con cifras inventadas
const na = hctx.huchaMadreCard(hucha, 'Renta', { ...base, plannedCents: null, monthCents: 0 }, false, { period: '2026-10', history: histPanel });
assert(na.cls.includes('pv-na') && flat(na).includes('No verificable'), 'sin plan: no verificable');

// --- fila de Variables al estilo HTML ---
const vctx = { el: node, money: (v) => v.toFixed(2).replace('.', ',') + ' €', field: (o, ks) => { for (const k of ks) if (o[k] != null && o[k] !== '') return o[k]; return null; },
  actualChargeDate: (d) => (d.fecha ? { sort: Number(String(d.fecha).replace(/-/g, '')) } : null), financialRecordRole: (d) => (d.cuentaComoFijo ? 'fixed-linked' : 'variable-real'),
  chargeMark: () => node('span', 'chargeEmoji'), openDetail: (...a) => opened.push(a) };
vm.createContext(vctx); vm.runInContext(cut('function variableRowMadre(', 'function renderList('), vctx);
const row = (d, amount) => vctx.variableRowMadre(d, 3, 'planRescate_v2_movimientos', d.concepto, amount);
let r = row({ concepto: 'Bizum contacto prueba', fecha: '2026-10-16', categoria: 'Bizum', origen: 'manual' }, 12.3), t = flat(r);
assert(t.includes('16/10 · Bizum · Manual') && t.includes('− 12,30 €') && t.includes('movExpense'), t);
r = row({ concepto: 'Devolución Amazon', fecha: '2026-10-06', categoria: 'Otros', origen: 'manual' }, -67.03); t = flat(r);
assert(t.includes('+ 67,03 €') && t.includes('movRefund') && !t.includes('− 67,03'), 'la devolución sale en verde con +');
r = row({ concepto: 'Seguro', fecha: '2026-10-05', cuentaComoFijo: true, origen: 'banco' }, 50); t = flat(r);
assert(t.includes('Fijo') && t.includes('movRef') && t.includes('50,00 €') && !t.includes('− 50,00'), 'fijo vinculado: referencia, sin signo de gasto');
r = row({ concepto: 'Sin fecha' }, null); assert(flat(r).includes('Sin fecha') && flat(r).includes('—'), 'importe no válido: «—», nunca 0');
const before = opened.length; r.onclick(); assert.deepEqual([opened[before][1], opened[before][2]], [3, 'planRescate_v2_movimientos'], 'toda la fila abre su detalle');
assert(r.attrs['aria-label'] === 'Abrir detalle de Sin fecha');
// el resumen del mes usa la misma cifra que ya mostraba la pestaña
assert(html.includes("el('strong','varHeroAmount',money(expenseFigures.totalCents/100))"));
assert(html.includes("if(page==='variables'){list.append(variableRowMadre(data,index,m.key,name,amount));continue}"));
// la evidencia sale en el detalle (no se pierde)
assert(html.includes("{const ev=financialRecordEvidence(entry,page);d.append(el('p','eliteEvidence eliteEvidence-'+ev.tone,ev.label))}"));
// Inicio: las filas del desglose llevan a su pestaña
assert(html.includes("row.onclick=()=>{if(target==='gastos')") && html.includes("'Aportaciones previstas a huchas','huchas'"));
console.log('PASS v2.0.54: huchas sin repetir e interactivas; Variables con filas del HTML original; sin cambios de cálculo');
