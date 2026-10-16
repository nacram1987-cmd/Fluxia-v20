'use strict';
/* Suite de regresión Fluxia Élite v2.0.25 · conciliación integral.
 *
 * IMPORTANTE: todo aquí son FIXTURES SINTÉTICAS. Demuestran que las reglas y los criterios funcionan;
 * NO demuestran ningún importe real de octubre de 2026. Un resultado verde de este archivo (ni de la CI)
 * sustituye jamás la comprobación con datos reales (véase AUDITORIA_CONCILIACION_v2.0.25.md).
 * Ejecuta el código REAL del HTML (extraído por lib/elite-html-functions.cjs), no copias.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loadEliteFunctions, memoryStorage, MODS } = require('./lib/elite-html-functions.cjs');

const L = loadEliteFunctions();
const { api, reconciliation: R, financialEngine: E, bankAdapter: A, bankConnector: C } = L;
const CUT = '2026-10-15T10:00:00+02:00';
const results = [];
function t(group, name, fn) {
  try { fn(); results.push({ group, name, ok: true }); }
  catch (error) { results.push({ group, name, ok: false, error: String(error && error.message || error).split('\n')[0] }); }
}
function calc(o = {}, month = '2026-10', cutoff = CUT) {
  return api.availableComputeFrom({ selectedMonth: month, cutoff, engine: E, reconciliation: R, sourceName: 'fixture',
    incomeRows: [], fixedRows: [], variableRows: [], sharedRows: [], financeRows: [], huchas: [], uses: [], ...o });
}
const hucha = (extra = {}) => ({ id: 'h1', nombre: 'Hucha de prueba', importeMensual: 100, inicio: '2026-01', aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-02', importe: 100 }] }, ...extra });
const bankRow = (id, over = {}) => ({ id, idAuthority: 'provider', stableRef: id, accountKey: 'acct-sintetica', banco: 'Revolut', fecha: '2026-10-15', importe: -7.5, concepto: 'Gasolinera', ...over });

// ───────────────────────── 1. Casos de regresión obligatorios (prompt §5) ─────────────────────────
t('regresion', '01 pensión futura no cobrada: no se anticipa', () => {
  const r = calc({ incomeRows: [{ id: 'p1', mes: 'octubre', concepto: 'Pensión de prueba', importe: 1000, fechaPrevista: '2026-10-28' }] });
  assert.equal(r.cents, 0n);
  assert.equal(r.ledger[0].status, 'previsto');
  assert.ok(r.ledger[0].flags.includes('PENSION_NO_COBRADA'));
});
t('regresion', '01b pensión cobrada se cuenta una sola vez aunque el banco la reimporte', () => {
  const paid = { id: 'p1', mes: 'octubre', concepto: 'Pensión de prueba', importe: 1000, fechaPrevista: '2026-10-28', pagadoEl: '2026-10-28', bancoRef: 'BANK-PEN-1' };
  const r = calc({ incomeRows: [paid, { ...paid, id: 'p1-reimport' }] });
  assert.equal(r.cents, 100000n, 'se cobra una vez');
  assert.equal(r.ledger.filter((e) => e.flags.includes('DUPLICADO_BANCOREF')).length, 1);
});
t('regresion', '01c ingreso manual + bancario del mismo cobro: ambos se cuentan, pero se SEÑALAN y no se fusionan', () => {
  const manual = { id: 'm', mes: '2026-10', fecha: '2026-10-01', concepto: 'Nómina', importe: 1500, pagadoEl: '2026-10-01' };
  const bank = { id: 'b', mes: '2026-10', fecha: '2026-10-01', concepto: 'Nómina', importe: 1500, bancoRef: 'BANK-NOMINA-1' };
  assert.equal(calc({ incomeRows: [manual, bank] }).cents, 300000n, 'sin prueba de identidad no se elimina nada');
  const groups = R.findSuspiciousDuplicates([manual, bank], { stableId: (row) => row.bancoRef || '' });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].bothCounted, true);
});
t('regresion', '02 fijo pagado con cargo bancario: un solo gasto, sin duplicar en Variables', () => {
  const r = calc({
    fixedRows: [{ id: 'f1', mes: 'octubre', concepto: 'Seguro', importe: 100 }],
    variableRows: [{ id: 'v1', mes: 'octubre', fecha: '2026-10-05', cuentaComoFijo: true, vinculoFijoId: 'f1', importe: 102.5, bancoRef: 'B1', origen: 'banco' }],
  });
  assert.equal(r.cents, -10250n, 'importe real del cargo, una vez');
  assert.equal(r.ledger.find((e) => e.module === 'variables').impactCents, 0n);
  assert.equal(r.ledger.find((e) => e.module === 'fijos').status, 'pagado-con-cargo-bancario');
});
t('regresion', '03 dos cargos mismo importe y concepto en fechas distintas NO son el mismo', () => {
  const rows = [{ id: 'a', mes: '2026-10', fecha: '2026-10-03', concepto: 'Cafetería', importe: 3.5 }, { id: 'b', mes: '2026-10', fecha: '2026-10-10', concepto: 'Cafetería', importe: 3.5 }];
  assert.equal(calc({ variableRows: rows }).cents, -700n);
  assert.equal(R.findSuspiciousDuplicates(rows, {}).length, 0);
});
t('regresion', '03b mismo día, importe y concepto sin IDs bancarios: sospechosos, ambos cuentan, nunca se fusionan', () => {
  const rows = [{ id: 'a', mes: '2026-10', fecha: '2026-10-03', concepto: 'Cafetería', importe: 3.5 }, { id: 'b', mes: '2026-10', fecha: '2026-10-03', concepto: 'Cafetería', importe: 3.5 }];
  assert.equal(calc({ variableRows: rows }).cents, -700n);
  const groups = R.findSuspiciousDuplicates(rows, {});
  assert.equal(groups.length, 1);
  assert.equal(groups[0].bothCounted, true);
});
t('regresion', '03c con identidades bancarias estables distintas son transacciones distintas (prueba)', () => {
  const rows = [{ id: 'a', mes: '2026-10', fecha: '2026-10-03', concepto: 'Cafetería', importe: 3.5, bancoRef: 'P-1' }, { id: 'b', mes: '2026-10', fecha: '2026-10-03', concepto: 'Cafetería', importe: 3.5, bancoRef: 'P-2' }];
  assert.equal(R.findSuspiciousDuplicates(rows, { stableId: (row) => row.bancoRef || '' }).length, 0);
});
t('regresion', '04 devolución negativa reduce el gasto neto y no crea ingreso', () => {
  const r = calc({ variableRows: [{ id: 'g', mes: '2026-10', fecha: '2026-10-02', importe: 50 }, { id: 'd', mes: '2026-10', fecha: '2026-10-09', importe: -20, concepto: 'Devolución' }] });
  assert.equal(r.cents, -3000n);
  assert.equal(r.trace.incomeCents, 0n, 'no es un ingreso');
  assert.equal(r.ledger.find((e) => e.id === 'd').nature, 'devolucion');
  assert.equal(r.ledger.find((e) => e.id === 'd').impactCents, 2000n);
});
t('regresion', '04b la pestaña Variables resta las devoluciones (antes las sumaba en positivo)', () => {
  const rows = [{ id: 'g', importe: 50 }, { id: 'd', importe: -20 }];
  const sandbox = loadEliteFunctions({ canon: () => rows, monthRecords: () => rows.map((data) => ({ data })), monthStatus: () => 'match', selectedMonth: '2026-10', mods: MODS });
  const src = sandbox.between(sandbox.html, 'const rowAmountCents=', '\nfunction moduleListSummary');
  const vm = require('node:vm');
  vm.runInContext(src + ';globalThis.__fig=monthExpenseFigures;globalThis.__txt=expenseSummaryText;', sandbox.context);
  const figures = sandbox.context.__fig('variables');
  assert.equal(figures.totalCents, 3000, '50 − 20 = 30,00 € netos');
  assert.equal(figures.refundCents, 2000);
  assert.match(sandbox.context.__txt('variables', figures), /devolución.*resta/);
});
t('regresion', '05 retirada Revolut→efectivo y gasto de efectivo: una transferencia + un gasto, no dos', () => {
  const r = calc({ variableRows: [
    { id: 'atm', mes: '2026-10', fecha: '2026-10-06', origen: 'banco', concepto: 'Retirada de efectivo cajero', importe: 100, bancoRef: 'ATM-1' },
    { id: 'cash', mes: '2026-10', fecha: '2026-10-07', origen: 'efectivo', concepto: 'Panadería', importe: 30 },
  ] });
  assert.equal(r.cents, -3000n);
  assert.equal(r.ledger.find((e) => e.id === 'atm').impactCents, 0n);
  assert.equal(r.ledger.find((e) => e.id === 'cash').status, 'gasto-efectivo');
});
t('regresion', '06 aportación de hucha = previsión: no reduce otra vez el Disponible', () => {
  const r = calc({ huchas: [hucha()] });
  assert.equal(r.cents, -10000n, 'solo la provisión prevista, una vez');
  assert.equal(r.trace.excessContributionsCents, 0n);
});
t('regresion', '06b aportación superior: solo el exceso reduce de nuevo', () => {
  const r = calc({ huchas: [hucha({ aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-02', importe: 100 }, { id: 'a2', fecha: '2026-10-20', importe: 30 }] } })] });
  assert.equal(r.trace.excessContributionsCents, 3000n);
  assert.equal(r.cents, -13000n);
});
t('regresion', '06c aportación inferior: genera pendiente pero NO aumenta el Disponible', () => {
  const r = calc({ huchas: [hucha({ aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-02', importe: 60 }] } })] });
  assert.equal(r.cents, -10000n, 'sigue reservándose la previsión completa');
  const pending = r.ledger.find((e) => e.nature === 'aportacion-pendiente');
  assert.equal(pending.cents, 4000n);
  assert.equal(pending.impactCents, 0n);
});
const rescue = (over = {}) => ({ id: 'u1', tipo: 'temporal', fecha: '2026-10-15', importe: 150, repuesto: 0, provisionId: 'h1', ...over });
t('regresion', '07 rescate temporal pendiente: suma su saldo pendiente (no es ingreso nuevo)', () => {
  const r = calc({ huchas: [hucha()], uses: [rescue()] });
  assert.equal(r.cents, -10000n + 15000n);
  assert.equal(r.trace.incomeCents, 0n, 'transferencia interna, no ingreso');
  assert.equal(r.ledger.find((e) => e.module === 'usos').status, 'pendiente-de-reponer');
});
t('regresion', '07b reposición parcial reduce el efecto; reposición completa lo anula', () => {
  const partial = calc({ huchas: [hucha()], uses: [rescue({ repuesto: 60, reposiciones: [{ id: 'r1', fecha: '2026-10-20', importe: 60 }] })] });
  assert.equal(partial.cents, -10000n + 9000n);
  assert.equal(partial.ledger.find((e) => e.module === 'usos').status, 'reposicion-parcial');
  const full = calc({ huchas: [hucha()], uses: [rescue({ repuesto: 150, reposiciones: [{ id: 'r1', fecha: '2026-10-20', importe: 150 }] })] });
  assert.equal(full.cents, -10000n);
  assert.equal(full.ledger.find((e) => e.module === 'usos').status, 'reposicion-completa');
});
t('regresion', '07c rescate parcial y total de la hucha (40 € y 100 € de 100 €) siguen la misma regla', () => {
  assert.equal(calc({ huchas: [hucha()], uses: [rescue({ importe: 40 })] }).cents, -10000n + 4000n);
  assert.equal(calc({ huchas: [hucha()], uses: [rescue({ importe: 100 })] }).cents, -10000n + 10000n);
});
t('regresion', '07d uso definitivo no aumenta el Disponible', () => {
  assert.equal(calc({ huchas: [hucha()], uses: [rescue({ tipo: 'definitivo', importe: 80 })] }).cents, -10000n);
});
t('regresion', '08 rescate sintético «Tributos de prueba» 150 € el 15/10: ID verificado frente a nombre provisional', () => {
  const tributos = hucha({ id: 'tr', nombre: 'Tributos de prueba', importeMensual: 300, aportaciones: { octubre: [] } });
  const byId = calc({ huchas: [tributos], uses: [rescue({ id: 'tr-u1', provisionId: 'tr' })] });
  assert.equal(byId.provisional, false);
  assert.equal(byId.stats.rescues.verified, 1);
  const byName = calc({ huchas: [tributos], uses: [{ id: 'tr-u2', tipo: 'temporal', fecha: '2026-10-15', importe: 150, repuesto: 0, provision: 'Tributos de prueba' }] });
  assert.equal(byName.provisional, true, 'vinculación solo por nombre único: PROVISIONAL, nunca verificada');
  assert.equal(byName.stats.rescues.provisional, 1);
  assert.equal(byName.cents, byId.cents);
});
t('regresion', '09 uso histórico de «Mantenimiento césped» y aportaciones de varios meses conservan sus fechas reales', () => {
  const cesped = hucha({ id: 'h2', nombre: 'Mantenimiento césped (prueba)', importeMensual: 30, aportaciones: { septiembre: [{ id: 's1', fecha: '2026-09-03', importe: 30 }], octubre: [{ id: 'o1', fecha: '2026-10-02', importe: 30 }] } });
  const uses = [{ id: 'u-hist', tipo: 'definitivo', fecha: '2026-03-12', importe: 80, provisionId: 'h2', mes: 'marzo' }];
  const snapshot = api.huchaFinancialSnapshot(cesped, '2026-10', uses, [cesped]);
  assert.equal(snapshot.history[0].fecha, '2026-03-12', 'la fecha real del uso histórico no se reescribe');
  assert.equal(JSON.stringify(snapshot.monthlyHistory.map((m) => [m.period, m.cents])), JSON.stringify([['2026-10', 3000], ['2026-09', 3000]]));
  assert.equal(calc({ huchas: [cesped], uses }).cents, calc({ huchas: [cesped], uses: [] }).cents, 'el uso de marzo no altera octubre');
});
t('regresion', '10 gasto o rescate retroactivo afecta a su mes histórico y no altera octubre', () => {
  const base = { huchas: [hucha()], variableRows: [{ id: 'v-oct', mes: '2026-10', fecha: '2026-10-04', importe: 20 }] };
  const octBefore = calc(base).cents;
  const retro = { ...base, variableRows: [...base.variableRows, { id: 'v-sep', mes: '2026-09', fecha: '2026-09-20', importe: 99 }], uses: [rescue({ id: 'u-sep', fecha: '2026-09-10', mes: 'septiembre' })] };
  assert.equal(calc(retro).cents, octBefore, 'octubre intacto');
  const sepWith = calc(retro, '2026-09').cents, sepWithout = calc({ huchas: [hucha()] }, '2026-09').cents;
  assert.equal(sepWith - sepWithout, -9900n + 15000n, 'septiembre recoge el gasto y el rescate retroactivos');
});
t('regresion', '11 Compartidos: el pago total adelantado cuenta una sola vez por gastoId', () => {
  const r = calc({ sharedRows: [
    { id: 's1', gastoId: 'g1', quienPago: 'yo', fecha: '2026-10-05', total: 90, importeInicial: 30 },
    { id: 's2', gastoId: 'g1', quienPago: 'yo', fecha: '2026-10-05', total: 90, importeInicial: 30 },
  ] });
  assert.equal(r.cents, -9000n);
});
t('regresion', '11b Financiación: cuota activa una vez; plan finalizado fuera; id duplicado bloquea', () => {
  const ok = calc({ financeRows: [{ id: 'fin1', mes: 'octubre', cuota: 50 }, { id: 'fin0', inicio: '2025-01', fin: '2026-09', cuota: 500 }] });
  assert.equal(ok.cents, -5000n);
  const dup = calc({ financeRows: [{ id: 'fin1', mes: 'octubre', cuota: 50 }, { id: 'fin1', mes: 'octubre', cuota: 50 }] });
  assert.equal(dup.ok, false);
  assert.match(dup.blockers.join(' '), /financiación duplicada/);
});
t('regresion', '12 carga tardía de nube, cierre de sesión y segundo usuario completamente vacío', () => {
  const S = loadEliteFunctions();
  const ctx = S.context, key = (id) => MODS.find((m) => m.id === id).key;
  const blocked = S.api.availableCalculationReport();
  assert.equal(blocked.ok, false, 'antes de que llegue la nube no se inventa ninguna cifra');
  ctx.items = Object.fromEntries(['ingresos', 'fijos', 'variables', 'compartidos', 'financiaciones', 'huchas'].map((id) => [key(id), id === 'ingresos' ? [{ id: 'i', mes: '2026-10', importe: 1000, pagadoEl: '2026-10-01' }] : []]));
  ctx.extraFinance = { planRescate_v2_usos: [] };
  ctx.cloudReadAt = '2026-10-15T08:00:00.000Z';
  assert.equal(S.api.availableCalculationReport().ok, false, 'colecciones sin snapshot de nube completo: sigue bloqueado');
  ctx.cloudFinanceSnapshot = { owner: 'owner-a', profile: ctx.activeProfile, complete: true };
  const userA = S.api.availableCalculationReport();
  assert.equal(userA.ok, true);
  assert.equal(userA.cents, 100000n);
  // Cierre de sesión (clearElitePrivateState) y segundo usuario sin registros.
  ctx.owner = ''; ctx.activeProfile = ''; ctx.items = {}; ctx.extraFinance = {}; ctx.backupFinance = null; ctx.cloudFinanceSnapshot = null; ctx.cloudReadAt = '';
  assert.equal(S.api.availableCalculationReport().ok, false, 'tras cerrar sesión no queda ninguna cifra visible');
  ctx.owner = 'owner-b'; ctx.activeProfile = 'p_usr-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb__';
  ctx.items = Object.fromEntries(['ingresos', 'fijos', 'variables', 'compartidos', 'financiaciones', 'huchas'].map((id) => [key(id), []]));
  ctx.extraFinance = { planRescate_v2_usos: [] };
  ctx.cloudFinanceSnapshot = { owner: 'owner-a', profile: 'p_usr-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa__', complete: true };
  assert.equal(S.api.availableCalculationReport().ok, false, 'el snapshot de otro usuario no sirve');
  ctx.cloudFinanceSnapshot = { owner: 'owner-b', profile: ctx.activeProfile, complete: true };
  const userB = S.api.availableCalculationReport();
  assert.equal(userB.ok, true);
  assert.equal(userB.cents, 0n, 'cero saldo heredado');
  assert.equal(userB.ledger.length, 0);
  const cert = S.api.availableCertificationReport();
  assert.notEqual(cert.status, 'VERIFICADO', 'un usuario vacío sin evidencia jamás se verifica');
});
t('regresion', '13 doble sincronización bancaria sin duplicar ni resucitar descartes', () => {
  const connector = C;
  const incoming = connector.normalizeRows([bankRow('p1'), bankRow('p2', { importe: -12 }), bankRow('p3', { importe: -5 })]);
  const dead = incoming[2].bankRef;
  const sim = R.simulateDoubleSync({ adapter: A, existing: [], incoming, tombstones: { deletedBankRefs: [dead] } });
  assert.equal(sim.ok, true);
  assert.equal(sim.firstAdditions, 2);
  assert.equal(sim.secondAdditions, 0, 'la segunda sincronización no añade nada');
  assert.deepEqual(sim.resurrected, []);
  const storage = memoryStorage();
  connector.saveInbox('o', 'p', incoming, storage);
  const merged = connector.mergeRows(connector.readInbox('o', 'p', storage), incoming);
  assert.equal(merged.rows.length, 3, 'volver desde PWA/Safari con la misma bandeja no multiplica filas');
});
t('regresion', '14 fechas de octubre en Europa/Madrid y fin de mes', () => {
  assert.equal(R.madridDate('2026-10-31T23:30:00Z'), '2026-11-01', '31/10 23:30Z ya es noviembre en Madrid');
  assert.equal(R.madridDate('2026-10-31T22:30:00Z'), '2026-10-31', '23:30 hora de Madrid sigue en octubre');
  assert.equal(R.madridDate('2026-10-24T22:30:00Z'), '2026-10-25', 'día del cambio de hora (CEST→CET)');
  assert.equal(R.madridMonth('2026-09-30T22:30:00Z'), '2026-10', '30/09 22:30Z = 01/10 00:30 Madrid');
  assert.equal(R.madridDate('2026-02-30'), null);
  assert.equal(R.madridDate('15/10/2026'), '2026-10-15');
});
t('regresion', '14b «hoy» del Disponible sale del corte en Madrid, no del reloj del dispositivo', () => {
  const income = [{ id: 'f', mes: 'octubre', concepto: 'Premio', importe: 500, fechaPrevista: '2026-10-31' }];
  assert.equal(calc({ incomeRows: income }, '2026-10', '2026-10-30T23:30:00Z').cents, 50000n, '00:30 del 31/10 en Madrid: la fecha prevista ya llegó');
  assert.equal(calc({ incomeRows: income }, '2026-10', '2026-10-30T21:30:00Z').cents, 0n, '23:30 del 30/10 en Madrid: todavía es futuro');
});
t('regresion', '14c fecha con instante UTC que en Madrid cae en otro mes: se señala y no se certifica', () => {
  const r = calc({ variableRows: [{ id: 'edge', fecha: '2026-10-31T23:30:00Z', importe: 10 }] });
  assert.ok(r.issues.some((i) => i.code === 'FECHA_FUERA_DEL_PERIODO_EN_MADRID'));
});
t('regresion', '15 diferencias de 0,00 € y 0,01 €: cualquier céntimo sin explicar bloquea', () => {
  const mk = (extra) => ({ module: 'variables', id: 'x', index: 0, date: '2026-10-04', rule: 'r', impactCents: -1000n + extra, flags: [] });
  assert.equal(R.compareLedgers([mk(0n)], [mk(0n)]).deltaCents, 0n);
  assert.equal(R.compareLedgers([mk(0n)], [mk(0n)]).diffs.length, 0);
  const one = R.compareLedgers([mk(0n)], [mk(1n)]);
  assert.equal(one.deltaCents, 1n);
  assert.equal(one.diffs.length, 1);
  assert.equal(one.diffs[0].deltaCents, 1n);
  const cmp = R.compareCollections({ module: 'variables', htmlRows: [{ id: 'x', importe: 10.0 }], eliteRows: [{ id: 'x', importe: 10.01 }] });
  assert.equal(cmp.deltaCents, 1n);
  assert.equal(cmp.mismatches, 1);
  assert.match(cmp.diffs[0].cause, /IMPORTE_DISTINTO/);
});

// ───────────────────────── 2. Céntimos exactos ─────────────────────────
t('centimos', 'importes con ruido binario se aceptan, fracciones de céntimo reales se señalan', () => {
  assert.deepEqual([R.centsDetail(7.5).cents, R.centsDetail(7.5).exact], [750n, true]);
  assert.equal(R.centsDetail(0.1 + 0.2).cents, 30n);
  assert.equal(R.centsDetail(0.1 + 0.2).exact, true);
  assert.equal(R.centsDetail(1.005).exact, false);
  assert.equal(R.centsDetail(0.285).exact, false);
  assert.equal(R.centsDetail('12,34').cents, 1234n);
  assert.equal(R.centsDetail('1.234,56').cents, 123456n);
  assert.equal(R.centsDetail('1.234').reason, 'FORMATO_AMBIGUO', 'jamás se adivina 1,234 € frente a 1234 €');
  assert.equal(R.centsDetail(NaN).cents, null);
});
t('centimos', 'un importe con fracción de céntimo en el libro se señala (no se certifica en silencio)', () => {
  const r = calc({ variableRows: [{ id: 'f', mes: '2026-10', fecha: '2026-10-03', importe: 1.005 }] });
  assert.ok(r.issues.some((i) => i.code === 'IMPORTE_CON_FRACCION_DE_CENTIMO'));
});
t('centimos', 'el formateo es exacto para negativos y céntimos de una cifra', () => {
  assert.equal(R.formatCents(-123456n), '-1.234,56 €');
  assert.equal(R.formatCents(5n), '0,05 €');
});

// ───────────────────────── 3. Libro mayor ─────────────────────────
t('libro', 'el libro mayor explica el total al céntimo en un escenario compuesto', () => {
  const r = calc({
    incomeRows: [{ id: 'i1', mes: 'octubre', concepto: 'Nómina', importe: 2000, pagadoEl: '2026-10-01' }],
    fixedRows: [{ id: 'f1', mes: 'octubre', importe: 700 }],
    variableRows: [{ id: 'v1', mes: '2026-10', fecha: '2026-10-03', importe: 41.37 }, { id: 'v2', mes: '2026-10', fecha: '2026-10-08', importe: -3.1 }],
    financeRows: [{ id: 'fin', mes: 'octubre', cuota: 120.5 }],
    huchas: [hucha({ aportaciones: { octubre: [{ id: 'a', fecha: '2026-10-02', importe: 110 }] } })],
    sharedRows: [{ id: 's', gastoId: 'g', quienPago: 'yo', fecha: '2026-10-05', total: 60, importeInicial: 30 }],
    uses: [rescue()],
  });
  assert.equal(r.ok, true);
  const check = R.verifyLedger(r.ledger, r.cents);
  assert.equal(check.ok, true);
  assert.equal(check.deltaCents, 0n);
  assert.equal(r.cents, 200000n - 70000n - 4137n + 310n - 12050n - 10000n - 1000n - 6000n + 15000n);
});
t('libro', 'propiedad: 200 escenarios aleatorios, el libro siempre suma exactamente el resultado', () => {
  let seed = 20261015;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const amount = () => Math.round(rnd() * 100000) / 100;
  for (let n = 0; n < 200; n++) {
    const vars = Array.from({ length: Math.floor(rnd() * 12) }, (_, i) => ({ id: 'v' + i, mes: '2026-10', fecha: '2026-10-' + String(1 + Math.floor(rnd() * 28)).padStart(2, '0'), importe: rnd() < 0.15 ? -amount() / 10 : amount() / 10 }));
    const r = calc({ incomeRows: [{ id: 'i', mes: '2026-10', importe: amount(), pagadoEl: '2026-10-01' }], fixedRows: [{ id: 'f', mes: '2026-10', importe: amount() / 5 }], variableRows: vars,
      huchas: [hucha({ importeMensual: amount() / 20, aportaciones: { octubre: [{ id: 'a', fecha: '2026-10-02', importe: amount() / 20 }] } })] });
    assert.equal(r.ok, true);
    assert.equal(R.verifyLedger(r.ledger, r.cents).ok, true, 'escenario ' + n);
  }
});
t('libro', 'más de 400 movimientos: exacto, determinista y sin depender del orden de entrada', () => {
  const rows = Array.from({ length: 450 }, (_, i) => ({ id: 'm' + i, mes: '2026-10', fecha: '2026-10-' + String(1 + (i % 28)).padStart(2, '0'), concepto: 'Mov ' + i, importe: ((i * 37) % 9973) / 100 + 0.01 }));
  const expected = rows.reduce((t0, row) => t0 + BigInt(Math.round(row.importe * 100)), 0n);
  const a = calc({ variableRows: rows }), b = calc({ variableRows: [...rows].reverse() });
  assert.equal(a.cents, -expected);
  assert.equal(b.cents, a.cents, 'el orden de entrada no cambia el total');
  assert.equal(R.checksum(a.ledger.map((e) => [e.module, e.id, String(e.impactCents)])), R.checksum(b.ledger.map((e) => [e.module, e.id, String(e.impactCents)])), 'libro idéntico: mismo orden canónico');
});
t('libro', 'idempotencia: calcular dos veces da el mismo libro y la misma huella', () => {
  const input = { incomeRows: [{ id: 'i', mes: '2026-10', importe: 10, pagadoEl: '2026-10-01' }], variableRows: [{ id: 'v', mes: '2026-10', fecha: '2026-10-02', importe: 3 }] };
  assert.equal(R.checksum(calc(input).ledger.map((e) => [e.id, String(e.impactCents)])), R.checksum(calc(input).ledger.map((e) => [e.id, String(e.impactCents)])));
});
t('libro', 'un libro que no explica el total se detecta', () => {
  const r = calc({ variableRows: [{ id: 'v', mes: '2026-10', fecha: '2026-10-02', importe: 3 }] });
  assert.equal(R.verifyLedger(r.ledger, r.cents + 1n).ok, false);
  assert.equal(R.verifyLedger(r.ledger, r.cents + 1n).deltaCents, -1n);
});

// ───────────────────────── 4. Defectos detectados en v2.0.24 ─────────────────────────
t('defectos', 'cargo ligado a un fijo inexistente ya no desaparece en silencio', () => {
  const r = calc({ variableRows: [{ id: 'o', mes: '2026-10', fecha: '2026-10-02', cuentaComoFijo: true, vinculoFijoId: 'no-existe', importe: 80 }] });
  assert.equal(r.cents, 0n);
  assert.ok(r.issues.some((i) => i.code === 'CARGO_LIGADO_A_FIJO_INEXISTENTE'));
});
t('defectos', 'varios cargos para un mismo fijo se señalan', () => {
  const r = calc({ fixedRows: [{ id: 'f', mes: '2026-10', importe: 50 }], variableRows: [
    { id: 'c1', mes: '2026-10', fecha: '2026-10-02', cuentaComoFijo: true, vinculoFijoId: 'f', importe: 50, bancoRef: 'X1' },
    { id: 'c2', mes: '2026-10', fecha: '2026-10-09', cuentaComoFijo: true, vinculoFijoId: 'f', importe: 50, bancoRef: 'X2' }] });
  assert.ok(r.issues.some((i) => i.code === 'MULTIPLES_CARGOS_ENLAZADOS'));
});
t('defectos', 'registros descartados/archivados no se cuentan (no resucitan)', () => {
  const r = calc({ variableRows: [{ id: 'a', mes: '2026-10', fecha: '2026-10-02', importe: 5, papelera: true }, { id: 'b', mes: '2026-10', fecha: '2026-10-03', importe: 7, archivado: true }, { id: 'c', mes: '2026-10', fecha: '2026-10-04', importe: 11 }] });
  assert.equal(r.cents, -1100n);
  assert.equal(r.ledger.filter((e) => e.flags.includes('DESCARTADO')).length, 2);
});
t('defectos', 'registros nulos o ilegibles bloquean con mensaje en vez de lanzar excepción', () => {
  const r = calc({ variableRows: [null, { id: 'x', mes: '2026-10', fecha: '2026-10-02', importe: 5 }] });
  assert.equal(r.ok, false);
  assert.match(r.blockers.join(' '), /nulo o ilegible/);
});
t('defectos', 'un mes escrito sin año usa el año del corte común (no el reloj del dispositivo)', () => {
  const row = { id: 'x', mes: 'octubre', importe: 10 };
  assert.equal(api.availableAccountingMonth(row, '2026-10', 2026), true);
  assert.equal(api.availableAccountingMonth(row, '2026-10', 2027), false);
  assert.equal(api.availableAccountingMonth(row, '2025-10', 2026), false, 'no se filtra a años anteriores');
});

// ───────────────────────── 5. Comparación HTML ↔ Élite por ID ─────────────────────────
t('comparacion', 'ausentes, extras y campos distintos por ID, con causa, evidencia y acción', () => {
  const html = [{ id: '1', importe: 10, fecha: '2026-10-01' }, { id: '2', importe: 20, fecha: '2026-10-02' }, { id: '3', importe: 5, fecha: '2026-10-03' }];
  const elite = [{ id: '1', importe: 10, fecha: '2026-10-01', _fxUpdatedAt: 'x' }, { id: '2', importe: 21, fecha: '2026-10-02' }, { id: '9', importe: 1, fecha: '2026-10-09' }];
  const cmp = R.compareCollections({ module: 'variables', ownerId: 'o', htmlRows: html, eliteRows: elite });
  assert.equal(cmp.missing, 1);
  assert.equal(cmp.unexpected, 1);
  assert.equal(cmp.mismatches, 1, '_fxUpdatedAt es solo ruido de refresco');
  assert.equal(cmp.state, 'DIFERENCIAS');
  for (const d of cmp.diffs) { assert.ok(d.cause && d.evidence && d.action); assert.match(d.ref, /^ref:[0-9a-f]{10}$/); }
  assert.equal(cmp.deltaCents, (BigInt(10 + 21 + 1) - BigInt(10 + 20 + 5)) * 100n);
});
t('comparacion', 'identidad insuficiente (sin ID o repetidos) nunca se da por conciliada', () => {
  const cmp = R.compareCollections({ module: 'variables', htmlRows: [{ importe: 1 }, { id: 'a', importe: 1 }, { id: 'a', importe: 1 }], eliteRows: [{ id: 'a', importe: 1 }] });
  assert.equal(cmp.state, 'IDENTIDAD_INSUFICIENTE');
  assert.ok(cmp.unexplained > 0);
});
t('comparacion', 'fuente ausente = NO_VERIFICADO (jamás cero)', () => {
  const cmp = R.compareCollections({ module: 'huchas', htmlRows: null, eliteRows: [] });
  assert.equal(cmp.state, 'NO_VERIFICADO');
  assert.equal(cmp.deltaCents, null);
});
t('comparacion', 'libros HTML y Élite: delta por módulo y global, y registros solo en un lado', () => {
  const html = calc({ variableRows: [{ id: 'a', mes: '2026-10', fecha: '2026-10-02', importe: 10 }, { id: 'b', mes: '2026-10', fecha: '2026-10-03', importe: 5 }] });
  const elite = calc({ variableRows: [{ id: 'a', mes: '2026-10', fecha: '2026-10-02', importe: 10 }, { id: 'c', mes: '2026-10', fecha: '2026-10-04', importe: 7 }] });
  const cmp = R.compareLedgers(html.ledger, elite.ledger, { ownerId: 'o' });
  assert.equal(cmp.deltaCents, -200n);
  assert.equal(cmp.modules.variables.deltaCents, -200n);
  assert.deepEqual(cmp.diffs.map((d) => d.cause).sort(), ['SOLO_EN_HTML', 'SOLO_EN_NUBE_ELITE']);
});
t('comparacion', 'resurrección: descartado en un lado y vivo en el otro se detecta', () => {
  const html = calc({ variableRows: [{ id: 'a', mes: '2026-10', fecha: '2026-10-02', importe: 10, papelera: true }] });
  const elite = calc({ variableRows: [{ id: 'a', mes: '2026-10', fecha: '2026-10-02', importe: 10 }] });
  assert.equal(R.crossTombstoneConflicts(html.ledger, elite.ledger), 1);
  assert.equal(R.crossTombstoneConflicts(html.ledger, html.ledger), 0);
});

// ───────────────────────── 6. Conciliación bancaria ─────────────────────────
function bankScenario() {
  const inbox = C.normalizeRows([bankRow('p1'), bankRow('p2', { importe: -12, concepto: 'Súper' }), bankRow('p3', { importe: -30, fecha: '2026-10-16' })]);
  const led = (n, over = {}) => ({ module: 'variables', row: { id: 'v' + n, mes: '2026-10', fecha: n === 3 ? '2026-10-16' : '2026-10-15', importe: [7.5, 12, 30][n - 1], origen: 'banco', bancoRef: inbox[n - 1].bankRef, concepto: 'x', ...over } });
  return { inbox, led };
}
t('banco', 'exactos, pendientes y signo: gasto positivo en libro ↔ cargo negativo en banco', () => {
  const { inbox, led } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1), led(2)], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: '2026-10-15T07:00:00+02:00' } });
  assert.equal(rec.summary.exact, 2);
  assert.equal(rec.summary.pending, 1, 'p3 está en el banco y no en el libro');
  assert.equal(rec.reconciled, false);
  assert.equal(rec.summary.syncFresh, true);
});
t('banco', 'todo conciliado y sincronización reciente = conciliado', () => {
  const { inbox, led } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1), led(2), led(3)], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: '2026-10-15T07:00:00+02:00' } });
  assert.deepEqual([rec.summary.exact, rec.summary.pending, rec.blockers.length, rec.reconciled], [3, 0, 0, true]);
});
t('banco', 'mismo ID con importe distinto es conflicto, nunca se fusiona', () => {
  const { inbox, led } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1, { importe: 7.51 })], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.idConflicts, 1);
  assert.equal(rec.reconciled, false);
});
t('banco', 'mismo ID con signo distinto (reembolso apuntado como gasto) es conflicto', () => {
  const { inbox, led } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1, { importe: -7.5 })], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.idConflicts, 1);
});
t('banco', 'tombstone: un cargo descartado no se reimporta ni cuenta como pendiente', () => {
  const { inbox } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [], tombstones: { deletedBankRefs: [inbox[0].bankRef] }, period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.tombstoned, 1);
  assert.equal(rec.summary.pending, 2);
});
t('banco', 'referencias sintéticas (sin ID estable del proveedor) quedan como inválidas', () => {
  const rec = R.reconcileBank({ adapter: A, inbox: [{ id: 'x|2026-10-15|-7.5|Gasolinera', fecha: '2026-10-15', importe: -7.5 }], ledgerRows: [], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.invalid, 1);
  assert.equal(rec.reconciled, false);
});
t('banco', 'el id interno de un registro manual NO es identidad bancaria', () => {
  const { inbox } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [{ module: 'variables', row: { id: 'interno-1', origen: 'banco', mes: '2026-10', fecha: '2026-10-15', importe: 7.5 } }], identityOf: () => '', period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.ledgerWithoutStableId, 1);
  assert.equal(rec.reconciled, false);
});
t('banco', 'coincidencia manual↔banco por día e importe: se lista, no se fusiona', () => {
  const { inbox } = bankScenario();
  const rec = R.reconcileBank({ adapter: A, inbox: [inbox[0]], ledgerRows: [{ module: 'variables', row: { id: 'manual', mes: '2026-10', fecha: '2026-10-15', importe: 7.5, concepto: 'Gasolina' } }], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.suspiciousManual, 1);
  assert.equal(rec.reconciled, false);
});
t('banco', 'sincronización antigua o sin constancia no cuenta como actualizada', () => {
  const { inbox, led } = bankScenario();
  const old = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1), led(2), led(3)], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: '2026-10-10T07:00:00+02:00' } });
  assert.equal(old.summary.syncFresh, false);
  const none = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1), led(2), led(3)], period: '2026-10', cutoff: CUT, status: null });
  assert.equal(none.summary.syncFresh, false);
  const failed = R.reconcileBank({ adapter: A, inbox, ledgerRows: [led(1), led(2), led(3)], period: '2026-10', cutoff: CUT, status: { ok: false, checkedAt: CUT } });
  assert.equal(failed.summary.syncFresh, false);
});
t('banco', 'mismo identificador bancario en Ingresos y Variables = colisión entre módulos', () => {
  const collisions = R.findCrossModuleBankCollisions({ ingresos: [{ bancoRef: 'Z1' }], variables: [{ bancoRef: 'Z1' }, { bancoRef: 'Z2' }] }, (row) => row.bancoRef || '');
  assert.equal(collisions.length, 1);
});

// ───────────────────────── 7. Criterios de certificación [a]–[h] ─────────────────────────
function passingInput() {
  return {
    period: '2026-10', cutoff: CUT,
    calc: { ok: true, provisional: false, blockers: [], cents: 100n, issues: [] },
    sources: { cloudComplete: true, cloudProfileMatches: true, missingCollections: [], htmlSnapshot: { present: true, sameProfile: true, fresh: true, complete: true }, cloudUnchangedSinceSnapshot: true },
    comparison: { done: true, deltaCents: 0n, unexplainedCount: 0, modules: [{ module: 'variables', state: 'COINCIDE', deltaCents: 0n }] },
    hucha: { known: true, provisionalLinks: 0, unresolvedRescues: 0, issues: 0, conflicts: 0, usesEqual: true },
    bank: { reconciled: true, summary: { exact: 3, syncFresh: true, lastCheckedAt: CUT }, blockers: [] },
    income: { known: true, suspiciousDuplicates: 0, crossModuleCollisions: 0, unconfirmedCounted: 0 },
    cents: { known: true, engineLoaded: true, subCentIssues: 0, dateIssues: 0, ledgerExplained: true, ledgerDeltaCents: 0n },
    persistence: { known: true, identityConsistent: true, tombstonedCounted: 0, liveRevalidation: null, doubleSyncOk: true },
    evidence: { cutoff: CUT, checksums: { 'nube:variables': 'abc' }, ledgerChecksum: 'def', certificateHash: 'f'.repeat(64) },
  };
}
const clone = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === 'bigint' ? { __b: v.toString() } : v)), (k, v) => (v && v.__b !== undefined ? BigInt(v.__b) : v));
t('certificado', 'con toda la evidencia, VERIFICADO y los tres indicadores separados', () => {
  const v = R.evaluateCertification(passingInput());
  assert.equal(v.status, 'VERIFICADO');
  assert.equal(v.certified, true);
  assert.deepEqual([v.dataSufficientToCalculate, v.dataSufficientToCertify, v.bankSyncUpToDate], [true, true, true]);
  assert.equal(v.gates.length, 8);
});
const mutations = {
  a: (i) => { i.sources.cloudComplete = false; },
  b: (i) => { i.comparison.deltaCents = 1n; },
  'b-unexplained': (i) => { i.comparison.unexplainedCount = 1; },
  'b-nohtml': (i) => { i.sources.htmlSnapshot = { present: false }; },
  'b-stale': (i) => { i.sources.htmlSnapshot.fresh = false; },
  c: (i) => { i.hucha.provisionalLinks = 1; },
  'c-uses': (i) => { i.hucha.usesEqual = false; },
  d: (i) => { i.bank.summary.syncFresh = false; },
  'd-pending': (i) => { i.bank = { reconciled: false, summary: { syncFresh: true }, blockers: ['2 movimientos sin conciliar'] }; },
  e: (i) => { i.income.suspiciousDuplicates = 1; },
  f: (i) => { i.cents.subCentIssues = 1; },
  'f-ledger': (i) => { i.cents.ledgerExplained = false; i.cents.ledgerDeltaCents = 1n; },
  'f-date': (i) => { i.cents.dateIssues = 1; },
  g: (i) => { i.persistence.tombstonedCounted = 1; },
  'g-id': (i) => { i.persistence.identityConsistent = false; },
  'g-sync': (i) => { i.persistence.doubleSyncOk = false; },
  h: (i) => { i.evidence.certificateHash = null; },
  'h-cut': (i) => { i.sources.cloudUnchangedSinceSnapshot = false; },
};
for (const [name, mutate] of Object.entries(mutations)) {
  t('certificado', `fallar solo [${name}] impide VERIFICADO`, () => {
    const input = clone(passingInput()); mutate(input);
    const v = R.evaluateCertification(input);
    assert.notEqual(v.status, 'VERIFICADO');
    assert.equal(v.certified, false);
    assert.equal(v.status, 'PROVISIONAL', 'hay cifra calculada pero no verificada');
  });
}
t('certificado', 'sin cálculo es PENDIENTE y sin copia HTML nunca puede ser VERIFICADO', () => {
  const input = clone(passingInput()); input.calc = { ok: false, blockers: ['x'] };
  assert.equal(R.evaluateCertification(input).status, 'PENDIENTE');
  const noHtml = clone(passingInput()); noHtml.sources.htmlSnapshot = { present: false }; noHtml.comparison = { done: false, modules: [] };
  const v = R.evaluateCertification(noHtml);
  assert.notEqual(v.status, 'VERIFICADO');
  assert.equal(v.dataSufficientToCertify, false);
});
t('certificado', 'un cálculo con notas provisionales jamás se certifica', () => {
  const input = clone(passingInput()); input.calc.provisional = true;
  assert.equal(R.evaluateCertification(input).status, 'PROVISIONAL');
});
t('certificado', 'banco: delimitación explícita (sin cargos) cumple [d] pero no declara sincronización', () => {
  const input = clone(passingInput()); input.bank = { scopeNone: true };
  const v = R.evaluateCertification(input);
  assert.equal(v.gates.find((g) => g.id === 'd').pass, true);
  assert.equal(v.bankSyncUpToDate, false, 'sin afirmar sincronización que no consta');
});

// ───────────────────────── 8. Certificado integrado (HTML real) ─────────────────────────
function syntheticSession(overrides = {}) {
  const S = loadEliteFunctions(overrides);
  const ctx = S.context, key = (id) => MODS.find((m) => m.id === id).key;
  const rows = {
    ingresos: [{ id: 'i1', mes: '2026-10', concepto: 'Nómina sintética', importe: 1500, pagadoEl: '2026-10-01', fecha: '2026-10-01' }],
    fijos: [{ id: 'f1', mes: '2026-10', concepto: 'Alquiler sintético', importe: 600 }],
    variables: [{ id: 'v1', mes: '2026-10', fecha: '2026-10-04', concepto: 'Compra sintética', importe: 40, origen: 'manual' }],
    compartidos: [], financiaciones: [],
    huchas: [hucha({ id: 'h1', nombre: 'Hucha sintética', importeMensual: 50, aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-02', importe: 50 }] } })],
  };
  ctx.items = Object.fromEntries(Object.entries(rows).map(([id, list]) => [key(id), JSON.parse(JSON.stringify(list))]));
  ctx.extraFinance = { planRescate_v2_usos: [] };
  ctx.cloudFinanceSnapshot = { owner: ctx.owner, profile: ctx.activeProfile, complete: true };
  ctx.cloudReadAt = new Date(Date.now() - 30 * 60000).toISOString();
  ctx.backupFinance = { owner: ctx.owner, profile: ctx.activeProfile, when: new Date(Date.now() - 3600000).toISOString(),
    modules: Object.fromEntries(Object.entries(rows).map(([id, list]) => [id, { sourceKey: id, records: JSON.parse(JSON.stringify(list)) }])), sources: { v2_usos: { value: [] } } };
  S.storage.setItem('fluxia_elite_recon_bankscope_v1:' + encodeURIComponent(ctx.owner) + ':' + encodeURIComponent(ctx.activeProfile), JSON.stringify({ scope: 'none', month: '2026-10' }));
  return { S, ctx, rows, key };
}
t('integrado', 'fixture sintética limpia: el motor completo alcanza VERIFICADO (lógica, no datos reales)', () => {
  const { S } = syntheticSession();
  const cert = S.api.availableCertificationReport();
  assert.equal(cert.calculation.ok, true);
  assert.equal(cert.calculation.cents, 150000n - 60000n - 4000n - 5000n);
  assert.deepEqual(cert.verdict.gates.filter((g) => g.pass !== true).map((g) => g.id + ':' + g.detail), []);
  assert.equal(cert.status, 'VERIFICADO');
  assert.equal(cert.evidence.comparison.deltaCents, 0n);
  assert.equal(cert.evidence.certificateHash.length, 64);
});
t('integrado', 'la huella es determinista: misma evidencia, misma huella', () => {
  const a = syntheticSession().S.api.availableCertificationReport().evidence;
  const b = syntheticSession().S.api.availableCertificationReport()