'use strict';
/* Fluxia Élite v2.0.29 · bancoRef repetido y vínculos rescate→hucha.
 *
 * IMPORTANTE: FIXTURES SINTÉTICAS ANONIMIZADAS con la FORMA de los casos reales (cinco grupos de octubre con el mismo
 * bancoRef en dos filas con IDs de registro distintos; cuatro presentes una sola vez en la copia del 7 de octubre).
 * Demuestran las reglas; NO demuestran ningún importe real ni certifican el perfil del usuario.
 * Regla fuente (HTML estable): bancoRef = identidad del cargo; ingresosDe() lo cuenta una vez; los GASTOS con el mismo
 * bancoRef se cuentan todos y limpiarDuplicadosBancoRef es solo manual (la llamada tras sincronizar está neutralizada).
 */
const assert = require('node:assert/strict');
const { loadEliteFunctions, memoryStorage, MODS } = require('./lib/elite-html-functions.cjs');

const results = [];
const t = (group, name, fn) => { try { fn(); results.push({ group, name, ok: true }); } catch (e) { results.push({ group, name, ok: false, error: String(e && e.message || e).split('\n')[0] }); } };
const L = loadEliteFunctions();
const { api, reconciliation: R, financialEngine: E, bankAdapter: A, bankConnector: C } = L;
const CUT = '2026-10-15T10:00:00+02:00';
const SNAP = '2026-10-07T12:00:00+02:00';
const SNAP_MS = Date.parse(SNAP);
const clone = (x) => JSON.parse(JSON.stringify(x));
const calc = (o = {}) => api.availableComputeFrom({ selectedMonth: '2026-10', cutoff: CUT, engine: E, reconciliation: R, sourceName: 'fixture', incomeRows: [], fixedRows: [], variableRows: [], sharedRows: [], financeRows: [], huchas: [], uses: [], ...o });
const stable = (row) => A.stableId({ bancoRef: row.bancoRef });
const json = (v) => JSON.stringify(v, (k, x) => (typeof x === 'bigint' ? x.toString() + 'n' : x));

// Cinco grupos con la forma de octubre: dos filas por bancoRef, mismos fecha/importe/concepto/banco/origen, IDs de registro distintos.
const SHAPES = [
  { ref: 'TX-ANON-0001', fecha: '2026-10-02', importe: 23.45, concepto: 'Supermercado Alfa', inHistory: true },
  { ref: 'TX-ANON-0002', fecha: '2026-10-03', importe: 7.5, concepto: 'Gasolinera Beta', inHistory: true },
  { ref: 'TX-ANON-0003', fecha: '2026-10-04', importe: 61.2, concepto: 'Farmacia Gamma', inHistory: true },
  { ref: 'TX-ANON-0004', fecha: '2026-10-05', importe: 12, concepto: 'Cafetería Delta', inHistory: true },
  { ref: 'TX-ANON-0005', fecha: '2026-10-09', importe: 38.9, concepto: 'Ferretería Epsilon', inHistory: false }, // aparece solo en los datos actuales
];
function realShapedRows() {
  const first = [], second = [], history = [];
  SHAPES.forEach((s, i) => {
    const base = { mes: 'octubre', fecha: s.fecha, importe: s.importe, concepto: s.concepto, banco: 'BancoAnon', origen: 'banco', bancoRef: s.ref, categoria: 'Otros' };
    const a = { ...base, id: String(SNAP_MS - 86400000 * 3 + i * 1000) + '_' + (i + 1) };      // creada antes de la copia del 7 de octubre
    const b = { ...base, id: String(SNAP_MS + 86400000 * 2 + i * 1000) + '_' + (i + 10) };     // creada DESPUÉS de esa copia
    first.push(a); second.push(b);
    if (s.inHistory) history.push(clone(a));
  });
  return { rows: [...first, ...second], history: [{ label: 'copia del 7 de octubre', takenAt: SNAP, rows: history }] };
}
const classify = (rows, history, extra = {}) => R.classifyBankRefGroups(rows, { stableId: stable, ownerId: 'owner-a', history, ...extra });

// ───────────────────────── 1. bancoRef repetido ─────────────────────────
t('bancoRef', 'cinco grupos reales-anónimos: todos reimportación; 4 con evidencia independiente del historial, 1 solo por la regla del HTML', () => {
  const { rows, history } = realShapedRows();
  const r = classify(rows, history);
  assert.equal(r.summary.groups, 5);
  assert.equal(r.summary.reimportacion, 5);
  assert.equal(r.summary.identidadInsuficiente, 0);
  assert.equal(r.summary.reimportacionConfirmada, 4, 'las cuatro filas presentes en la copia del 7/10 y creadas después');
  const lone = r.groups.find((g) => g.ref === R.pseudonym('owner-a', 'TX-ANON-0005'));
  assert.equal(lone.confidence, 'POR_REGLA_DEL_HTML', 'el quinto grupo no aparece en la copia: sin prueba independiente');
  assert.ok(lone.evidence.some((e) => /no contiene esta referencia/.test(e)));
  const withHistory = r.groups.find((g) => g.ref === R.pseudonym('owner-a', 'TX-ANON-0001'));
  assert.equal(withHistory.confidence, 'CONFIRMADA_CON_EVIDENCIA_INDEPENDIENTE');
  assert.ok(withHistory.evidence.some((e) => /solo había 1 fila/.test(e) && /se crearon después/.test(e)));
});
t('bancoRef', 'importe en juego exacto en céntimos (una fila sobrante por grupo) y nunca se aplica', () => {
  const { rows, history } = realShapedRows();
  const r = classify(rows, history);
  const expected = SHAPES.reduce((s, x) => s + BigInt(Math.round(x.importe * 100)), 0n);
  assert.equal(r.summary.surplusCents, expected);
  assert.equal(expected, 2345n + 750n + 6120n + 1200n + 3890n);
  assert.ok(r.groups.every((g) => g.bothCounted === true && g.canMarkDistinct === false));
});
t('bancoRef', 'paridad con el HTML: el Disponible cuenta TODAS las filas (no se fusiona nada); el clasificador no altera la fuente', () => {
  const { rows, history } = realShapedRows();
  const frozen = clone(rows);
  const withDup = calc({ variableRows: rows });
  assert.equal(withDup.ok, true);
  const gross = rows.reduce((s, x) => s + BigInt(Math.round(x.importe * 100)), 0n);
  assert.equal(withDup.cents, -gross, 'ambas filas cuentan, como en el HTML estable');
  classify(rows, history);
  assert.deepEqual(rows, frozen, 'el clasificador no muta los registros');
  const once = rows.filter((_, i) => i < SHAPES.length);
  assert.equal(calc({ variableRows: once }).cents, -once.reduce((s, x) => s + BigInt(Math.round(x.importe * 100)), 0n));
});
t('bancoRef', 'referencia no estable (sintética) o campos distintos: IDENTIDAD_INSUFICIENTE, nunca se decide por importe/concepto', () => {
  const base = { mes: 'octubre', fecha: '2026-10-02', importe: 10, concepto: 'X', banco: 'B', origen: 'banco' };
  const synthetic = classify([{ ...base, id: 'a', bancoRef: 'BancoAnon|2026-10-02|-10|x' }, { ...base, id: 'b', bancoRef: 'BancoAnon|2026-10-02|-10|x' }], []);
  assert.equal(synthetic.groups[0].class, 'IDENTIDAD_INSUFICIENTE');
  assert.ok(synthetic.groups[0].reasons.includes('REFERENCIA_NO_ESTABLE'));
  const different = classify([{ ...base, id: 'a', bancoRef: 'TX-ANON-9' }, { ...base, id: 'b', bancoRef: 'TX-ANON-9', importe: 11 }], []);
  assert.equal(different.groups[0].class, 'IDENTIDAD_INSUFICIENTE');
  assert.ok(different.groups[0].reasons.some((x) => /^CAMPOS_DISTINTOS:.*cents/.test(x)));
  assert.equal(different.groups[0].surplusCents, null, 'sin decidir no hay importe sobrante');
  const sameId = classify([{ ...base, id: 'dup', bancoRef: 'TX-ANON-9' }, { ...base, id: 'dup', bancoRef: 'TX-ANON-9' }], []);
  assert.ok(sameId.groups[0].reasons.includes('ID_DE_REGISTRO_REPETIDO'));
});
t('bancoRef', 'la bandeja del proveedor con el ID una sola vez es evidencia independiente; dos veces no lo es', () => {
  const base = { mes: 'octubre', fecha: '2026-10-02', importe: 10, concepto: 'X', banco: 'B', origen: 'banco', bancoRef: 'TX-ANON-7' };
  const rows = [{ ...base, id: 'a' }, { ...base, id: 'b' }];
  const once = classify(rows, [], { inbox: [{ bankRef: 'TX-ANON-7' }] });
  assert.equal(once.groups[0].confidence, 'CONFIRMADA_CON_EVIDENCIA_INDEPENDIENTE');
  const twice = classify(rows, [], { inbox: [{ bankRef: 'TX-ANON-7' }, { bankRef: 'TX-ANON-7' }] });
  assert.equal(twice.groups[0].confidence, 'POR_REGLA_DEL_HTML');
  const none = classify(rows, [], { inbox: [] });
  assert.equal(none.groups[0].confidence, 'POR_REGLA_DEL_HTML');
});
t('bancoRef', 'una copia donde ya había dos filas NO prueba reimportación posterior', () => {
  const { rows } = realShapedRows();
  const twoRowHistory = [{ label: 'copia vieja', takenAt: SNAP, rows: rows.filter((r) => r.bancoRef === 'TX-ANON-0001') }];
  const r = classify(rows.filter((x) => x.bancoRef === 'TX-ANON-0001'), twoRowHistory);
  assert.equal(r.groups[0].confidence, 'POR_REGLA_DEL_HTML');
  assert.ok(r.groups[0].evidence.some((e) => /ya contenía 2 filas/.test(e)));
});

// ───────────────────────── 2. Dos cargos legítimos ─────────────────────────
t('legitimos', 'mismo día, importe y concepto con identificadores bancarios distintos: legítimos, no bloquean ni son sospechosos', () => {
  const mk = (id, ref) => ({ id, bancoRef: ref, mes: 'octubre', fecha: '2026-10-06', importe: 3.5, concepto: 'Cafetería Delta', banco: 'BancoAnon', origen: 'banco' });
  const rows = [mk('x1', 'TX-ANON-1001'), mk('x2', 'TX-ANON-1002')];
  const r = classify(rows, []);
  assert.equal(r.groups.length, 0);
  assert.equal(r.legit.length, 1);
  assert.equal(r.legit[0].class, 'DOS_CARGOS_LEGITIMOS');
  assert.equal(r.legit[0].blocking, false);
  assert.equal(R.findSuspiciousDuplicates(rows, { stableId: stable, excludeSameBankRef: true }).length, 0);
  assert.equal(calc({ variableRows: rows }).cents, -700n, 'ambos cargos cuentan');
});
t('legitimos', 'un trío mezclado (dos reimportados + un cargo legítimo distinto) separa cada caso', () => {
  const mk = (id, ref) => ({ id, bancoRef: ref, mes: 'octubre', fecha: '2026-10-06', importe: 3.5, concepto: 'Cafetería Delta', banco: 'BancoAnon', origen: 'banco' });
  const r = classify([mk('p1', 'TX-A'), mk('p2', 'TX-A'), mk('p3', 'TX-B')], []);
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0].count, 2);
  assert.equal(r.legit.length, 1);
  assert.equal(r.legit[0].count, 2, 'TX-A y TX-B son dos transacciones distintas del proveedor');
});

// ───────────────────────── 3. Integración con el certificado ─────────────────────────
function session() {
  const S = loadEliteFunctions(), ctx = S.context, key = (id) => MODS.find((m) => m.id === id).key;
  const dupes = realShapedRows().rows;
  const rows = {
    ingresos: [{ id: 'i1', mes: '2026-10', concepto: 'Nómina sintética', importe: 1500, pagadoEl: '2026-10-01', fecha: '2026-10-01' }],
    fijos: [{ id: 'f1', mes: '2026-10', concepto: 'Alquiler sintético', importe: 600 }],
    variables: [{ id: 'v1', mes: '2026-10', fecha: '2026-10-04', concepto: 'Compra sintética', importe: 40, origen: 'manual' }, ...dupes],
    compartidos: [], financiaciones: [],
    huchas: [{ id: 'h1', nombre: 'Hucha sintética', importeMensual: 50, inicio: '2026-01', aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-02', importe: 50 }] } }],
  };
  ctx.items = Object.fromEntries(Object.entries(rows).map(([id, list]) => [key(id), clone(list)]));
  ctx.extraFinance = { planRescate_v2_usos: [] };
  ctx.cloudFinanceSnapshot = { owner: ctx.owner, profile: ctx.activeProfile, complete: true };
  ctx.cloudReadAt = new Date(Date.now() - 1800000).toISOString();
  ctx.backupFinance = { owner: ctx.owner, profile: ctx.activeProfile, when: new Date(Date.now() - 3600000).toISOString(),
    modules: Object.fromEntries(Object.entries(rows).map(([id, list]) => [id, { sourceKey: id, records: clone(list) }])), sources: { v2_usos: { value: [] } } };
  return { S, ctx, rows, key };
}
t('certificado', 'con los cinco grupos repetidos NO hay VERIFICADO, el blocker nombra el identificador bancario y el informe lista los grupos', () => {
  const { S } = session();
  const cert = S.api.availableCertificationReport();
  assert.notEqual(cert.status, 'VERIFICADO');
  assert.equal(cert.verdict.gates.find((g) => g.id === 'd').pass, false);
  assert.ok(cert.blockers.some((b) => /mismo identificador bancario/.test(b)), cert.blockers.join(' | '));
  const ev = cert.evidence;
  assert.equal(ev.bankRefGroups.summary.groups, 5);
  assert.equal(ev.bankRefGroups.summary.reimportacion, 5);
  assert.equal(ev.bankRefGroupsRaw.groups[0].key !== undefined, true, 'el informe privado lleva la clave real');
  assert.equal(ev.bankRefGroups.groups[0].key, undefined, 'el público solo seudónimos');
  assert.ok(!json(ev.bankRefGroups).includes('TX-ANON-0001'), 'sin identificadores reales en la versión seudonimizada');
});
t('certificado', 'declarar «distintas» en el almacén local NO desbloquea un grupo con el mismo identificador bancario', () => {
  const { S, ctx } = session();
  const before = S.api.availableCertificationReport();
  const storeKey = 'fluxia_elite_recon_review_v1:' + encodeURIComponent(ctx.owner) + ':' + encodeURIComponent(ctx.activeProfile);
  const store = {};
  for (const g of before.evidence.bankRefGroupsRaw.groups) store[g.key] = { decision: 'distinct', at: CUT, count: g.count };
  S.storage.setItem(storeKey, JSON.stringify(store));
  const after = S.api.availableCertificationReport();
  assert.notEqual(after.status, 'VERIFICADO');
  assert.equal(after.evidence.bankRefGroups.summary.groups, 5);
});
t('certificado', 'el Disponible calculado cuenta ambas filas y el certificado lo marca PROVISIONAL/bloqueado por banco, no VERIFICADO', () => {
  const { S, ctx } = session();
  const cert = S.api.availableCertificationReport();
  assert.equal(cert.calculation.ok, true);
  const dupes = ctx.items[MODS.find((m) => m.id === 'variables').key].filter((r) => r.bancoRef);
  const dupCents = dupes.reduce((s, x) => s + BigInt(Math.round(x.importe * 100)), 0n);
  assert.equal(cert.calculation.cents, 150000n - 60000n - 4000n - 5000n - dupCents);
  assert.equal(cert.status, 'PROVISIONAL');
});
t('certificado', 'sin duplicados la misma fixture alcanza VERIFICADO (la regla solo bloquea con repetidos)', () => {
  const { S, ctx, key } = session();
  const vk = key('variables');
  ctx.items[vk] = ctx.items[vk].filter((r) => !r.bancoRef);
  ctx.backupFinance.modules.variables.records = ctx.backupFinance.modules.variables.records.filter((r) => !r.bancoRef);
  S.storage.setItem('fluxia_elite_recon_bankscope_v1:' + encodeURIComponent(ctx.owner) + ':' + encodeURIComponent(ctx.activeProfile), JSON.stringify({ scope: 'none', month: '2026-10' }));
  const cert = S.api.availableCertificationReport();
  assert.deepEqual(cert.verdict.gates.filter((g) => g.pass !== true).map((g) => g.id + ':' + g.detail), []);
  assert.equal(cert.status, 'VERIFICADO');
});

// ───────────────────────── 4. Reimportación bancaria idempotente ─────────────────────────
const bankRow = (id, over = {}) => ({ id, idAuthority: 'provider', stableRef: id, accountKey: 'acct-sintetica', banco: 'Revolut', fecha: '2026-10-09', importe: -38.9, concepto: 'Ferretería Epsilon', ...over });
t('reimportacion', 'reimportar el mismo cargo ya presente no añade filas, ni en la 2.ª pasada, ni resucita descartes', () => {
  const incoming = C.normalizeRows([bankRow('TX-ANON-0005'), bankRow('TX-ANON-0006', { importe: -5, concepto: 'Kiosco' })]);
  const existing = [{ id: '1790900000000_1', mes: 'octubre', fecha: '2026-10-09', importe: 38.9, concepto: 'Ferretería Epsilon', banco: 'Revolut', origen: 'banco', bancoRef: incoming[0].bankRef }];
  const sim = R.simulateDoubleSync({ adapter: A, existing, incoming, tombstones: { deletedBankRefs: [] } });
  assert.equal(sim.ok, true);
  assert.equal(sim.firstAdditions, 1, 'solo el cargo que no estaba');
  assert.equal(sim.secondAdditions, 0);
  assert.ok(sim.secondDuplicates >= 1, 'el ya presente se reconoce como duplicado por ID estable');
  const dead = R.simulateDoubleSync({ adapter: A, existing, incoming, tombstones: { deletedBankRefs: [incoming[1].bankRef] } });
  assert.deepEqual(dead.resurrected, []);
  assert.equal(dead.firstAdditions, 0, 'un cargo descartado no se resucita');
});
t('reimportacion', 'tras importar, el libro no contiene bancoRef repetidos (idempotencia extremo a extremo)', () => {
  const incoming = C.normalizeRows([bankRow('TX-ANON-0005'), bankRow('TX-ANON-0006', { importe: -5, concepto: 'Kiosco' })]);
  const plan1 = A.planImport([], incoming, { deletedBankRefs: [] });
  const applied = plan1.additions.map((a) => ({ ...a.raw, id: 'n-' + a.bankRef }));
  const plan2 = A.planImport(applied, incoming, { deletedBankRefs: [] });
  assert.equal(plan2.additions.length, 0);
  assert.equal(classify(applied.map((x) => ({ ...x, bancoRef: x.bankRef || x.bancoRef })), []).groups.length, 0);
});

// ───────────────────────── 5. Pensión prevista y no cobrada ─────────────────────────
t('pension', 'pensión prevista y no cobrada no suma; cobrada con ID bancario suma una vez aunque se reimporte', () => {
  const planned = { id: 'p1', mes: 'octubre', concepto: 'Pensión anonimizada', importe: 1200, fechaPrevista: '2026-10-28' };
  const r = calc({ incomeRows: [planned] });
  assert.equal(r.cents, 0n);
  assert.ok(r.ledger[0].flags.includes('PENSION_NO_COBRADA'));
  const futurePaid = calc({ incomeRows: [{ ...planned, pagadoEl: '2026-10-28' }] });
  assert.equal(futurePaid.cents, 0n, 'marcada pagada con fecha posterior al corte y sin ID bancario: no se anticipa');
  const paid = { ...planned, pagadoEl: '2026-10-10', bancoRef: 'TX-ANON-PEN-1' };
  assert.equal(calc({ incomeRows: [paid, { ...paid, id: 'p1-reimport' }] }).cents, 120000n, 'una sola vez');
});

// ───────────────────────── 6. Vínculos rescate → hucha ─────────────────────────
const hucha = (extra = {}) => ({ id: 'h1', nombre: 'Viajes Anon', importeMensual: 100, inicio: '2026-01', aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-02', importe: 100 }] }, ...extra });
const use = (extra = {}) => ({ id: 'u1', tipo: 'temporal', fecha: '2026-10-08', importe: 150, repuesto: 0, ...extra });
t('hucha', 'con ID de hucha el vínculo es verificado; sin ID y con nombre exacto es provisional por nombre (la regla del HTML) y no se certifica', () => {
  const byId = calc({ huchas: [hucha()], uses: [use({ provisionId: 'h1' })] });
  assert.equal(byId.stats.rescues.verified, 1);
  assert.equal(byId.provisional, false);
  const byName = calc({ huchas: [hucha()], uses: [use({ provision: 'Viajes Anon' })] });
  assert.equal(byName.stats.rescues.provisional, 1);
  assert.equal(byName.stats.rescues.htmlExactName, 1);
  assert.equal(byName.stats.rescues.nonHtmlName, 0);
  assert.equal(byName.provisional, true);
  assert.equal(byName.cents, calc({ huchas: [hucha()], uses: [use({ provisionId: 'h1' })] }).cents, 'el vínculo no cambia el Disponible: un rescate es traspaso interno');
});
t('hucha', 'nombre que solo coincide tras normalizar: el HTML (igualdad exacta) no lo atribuiría; se señala y no se certifica', () => {
  const r = calc({ huchas: [hucha()], uses: [use({ provision: 'viajes  ANON' })] });
  assert.equal(r.stats.rescues.nonHtmlName, 1);
  assert.equal(r.stats.rescues.htmlExactName, 0);
  assert.ok(r.issues.some((i) => i.code === 'VINCULO_DE_HUCHA_NO_EXACTO_EN_HTML' && i.ref === 'u1'));
  assert.equal(r.provisional, true);
});
t('hucha', 'dos huchas con el mismo nombre exacto: ambiguo (el HTML restaría el uso a las dos); nunca se elige una', () => {
  const r = calc({ huchas: [hucha(), hucha({ id: 'h2' })], uses: [use({ provision: 'Viajes Anon' })] });
  assert.equal(r.ok, false, 'sin hucha verificable el cálculo no se da por bueno');
  assert.equal(r.stats.rescues.verified + r.stats.rescues.provisional, 0);
});
t('hucha', 'uso sin ID de hucha ni nombre: sin vincular, bloquea el cálculo en lugar de inventar la asociación', () => {
  const r = calc({ huchas: [hucha()], uses: [use()] });
  assert.equal(r.ok, false);
  assert.ok(r.blockers.some((b) => /sin hucha e ID verificables/.test(b)));
});
t('hucha', 'compuerta [c]: ni el nombre exacto con usos y huchas idénticos a la copia HTML certifica sin ID', () => {
  const S = session().S, ctx = S.context, key = (id) => MODS.find((m) => m.id === id).key;
  ctx.items[key('variables')] = ctx.items[key('variables')].filter((r) => !r.bancoRef);
  ctx.backupFinance.modules.variables.records = ctx.backupFinance.modules.variables.records.filter((r) => !r.bancoRef);
  const u = { id: 'u9', tipo: 'temporal', fecha: '2026-10-08', importe: 150, repuesto: 0, provision: 'Hucha sintética' };
  ctx.extraFinance.planRescate_v2_usos = [u]; ctx.backupFinance.sources.v2_usos.value = [clone(u)];
  const cert = S.api.availableCertificationReport();
  const c = cert.verdict.gates.find((g) => g.id === 'c');
  assert.equal(c.pass, false);
  assert.match(c.detail, /nombre único/);
  assert.notEqual(cert.status, 'VERIFICADO');
  const n = clone(u); n.provision = 'hucha sintetica';
  ctx.extraFinance.planRescate_v2_usos = [n]; ctx.backupFinance.sources.v2_usos.value = [clone(n)];
  const cert2 = S.api.availableCertificationReport();
  assert.match(cert2.verdict.gates.find((g) => g.id === 'c').detail, /solo coincide tras normalizar/);
});

// ───────────────────────── 6b. Herramienta local con copias históricas ─────────────────────────
t('cli', 'la CLI fecha cada fila repetida con --history, no escribe nada fuera de --out y el informe público no filtra IDs reales', () => {
  const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), cp = require('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fluxia-bankref-'));
  try {
    const owner = 'synthetic-owner', profile = 'p_usr-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa__';
    const { rows, history } = realShapedRows();
    const keyOf = (id) => MODS.find((m) => m.id === id).key;
    const source = (list) => ({ available: true, records: list });
    const sources = (variables) => ({
      [keyOf('ingresos')]: source([]), [keyOf('fijos')]: source([]), [keyOf('variables')]: source(variables),
      [keyOf('huchas')]: source([]), [keyOf('compartidos')]: source([]), [keyOf('financiaciones')]: source([]),
      planRescate_v2_usos: { available: true, value: [] },
    });
    const base = { format: 'fluxia-elite-cloud-readonly-v1', accounting_month: '2026-10', user_id: owner, profile_key: profile };
    const now = { ...base, exported_at: CUT, sources: sources(rows) };
    const old = { ...base, exported_at: SNAP, sources: sources(history[0].rows) };
    const strangerProfile = { ...old, profile_key: 'p_usr-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb__' };
    const write = (name, v) => { const f = path.join(dir, name); fs.writeFileSync(f, JSON.stringify(v)); return f; };
    const cli = path.join(__dirname, '../tools/elite-reconcile-cli.cjs'), out = path.join(dir, 'out');
    const run = (extra) => cp.spawnSync(process.execPath, [cli, '--cloud', write('now.json', now), '--month', '2026-10', '--cutoff', CUT, '--out', out, ...extra], { encoding: 'utf8' });
    const ok = run(['--history', 'copia 7 oct=' + write('old.json', old)]);
    assert.equal(ok.status, 1, 'sin copia HTML ni banco no puede certificar: ' + ok.stderr);
    assert.match(ok.stdout, /bancoRef repetido: 5 grupo/);
    assert.match(ok.stdout, /4 con evidencia independiente/);
    const priv = JSON.parse(fs.readFileSync(path.join(out, 'informe-privado.json'), 'utf8'));
    assert.equal(priv.bankRefGroups.summary.reimportacionConfirmada, 4);
    assert.ok(priv.bankRefGroups.groups.every((g) => /^TX-ANON-000\d$/.test(g.key)), 'el privado lleva las claves reales');
    assert.equal(priv.historySources[0].label, 'copia 7 oct');
    const pub = fs.readFileSync(path.join(out, 'informe-publico.json'), 'utf8');
    assert.ok(!/TX-ANON/.test(pub), 'el público no contiene identificadores bancarios reales');
    assert.equal(JSON.parse(pub).bankRefGroups.reimportacion, 5);
    assert.notEqual(priv.status, 'VERIFICADO');
    const mixed = run(['--history', 'ajena=' + write('stranger.json', strangerProfile)]);
    assert.equal(mixed.status, 2);
    assert.match(mixed.stderr, /otro usuario o perfil/);
    assert.deepEqual(fs.readdirSync(dir).sort(), ['now.json', 'old.json', 'out', 'stranger.json'].sort(), 'solo escribe en --out');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ───────────────────────── 7. Aislamiento y determinismo ─────────────────────────
t('aislamiento', 'usuario nuevo sin datos: ningún grupo, ningún bloqueo heredado y la clasificación es determinista', () => {
  assert.deepEqual(classify([], []).groups, []);
  const { rows, history } = realShapedRows();
  assert.equal(json(classify(rows, history)), json(classify(rows, history)));
  assert.notEqual(R.pseudonym('owner-a', 'TX-ANON-0001'), R.pseudonym('owner-b', 'TX-ANON-0001'), 'seudónimos distintos por usuario');
  const other = R.classifyBankRefGroups(rows, { stableId: stable, ownerId: 'owner-b', history });
  assert.notEqual(other.groups[0].ref, classify(rows, history).groups[0].ref);
});

const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({ suite: 'elite-bankref-hucha-v2029', total: results.length, passed: results.length - failed.length, failed: failed.length, note: 'Fixtures sintéticas anonimizadas: no prueban importes reales' }));
for (const r of results) console.log((r.ok ? '✓' : '✗') + ' [' + r.group + '] ' + r.name + (r.ok ? '' : '\n    ' + r.error));
if (failed.length) process.exit(1);
