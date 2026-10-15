'use strict';
/* Fluxia Élite v2.0.26 · integración y huecos de corte. Fixtures SINTÉTICAS: no prueban importes reales. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEliteFunctions, memoryStorage, MODS } = require('./lib/elite-html-functions.cjs');

const results = [];
const t = (group, name, fn) => { try { fn(); results.push({ group, name, ok: true }); } catch (e) { results.push({ group, name, ok: false, error: String(e.message).split('\n')[0] }); } };
const L = loadEliteFunctions();
const { api, reconciliation: R, financialEngine: E } = L;
const CUT = '2026-10-15T10:00:00+02:00';
const calc = (o = {}, month = '2026-10') => api.availableComputeFrom({ selectedMonth: month, cutoff: CUT, engine: E, reconciliation: R, sourceName: 'fixture', incomeRows: [], fixedRows: [], variableRows: [], sharedRows: [], financeRows: [], huchas: [], uses: [], ...o });
const hucha = (ap = []) => ({ id: 'h', nombre: 'Hucha de prueba', importeMensual: 100, inicio: '2026-01', aportaciones: { octubre: ap } });
const codes = (r) => r.issues.map((i) => i.code);

function session(over = {}) {
  const S = loadEliteFunctions(over), ctx = S.context, key = (id) => MODS.find((m) => m.id === id).key;
  const rows = {
    ingresos: [{ id: 'i1', mes: '2026-10', concepto: 'Nómina sintética', importe: 1500, pagadoEl: '2026-10-01', fecha: '2026-10-01' }],
    fijos: [{ id: 'f1', mes: '2026-10', concepto: 'Alquiler sintético', importe: 600 }],
    variables: [{ id: 'v1', mes: '2026-10', fecha: '2026-10-04', concepto: 'Compra sintética', importe: 40, origen: 'manual' }],
    compartidos: [], financiaciones: [], huchas: [hucha([{ id: 'a1', fecha: '2026-10-02', importe: 100 }])],
  };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  ctx.items = Object.fromEntries(Object.entries(rows).map(([id, list]) => [key(id), clone(list)]));
  ctx.extraFinance = { planRescate_v2_usos: [] };
  ctx.cloudFinanceSnapshot = { owner: ctx.owner, profile: ctx.activeProfile, complete: true };
  ctx.cloudReadAt = new Date(Date.now() - 1800000).toISOString();
  ctx.backupFinance = { owner: ctx.owner, profile: ctx.activeProfile, when: new Date(Date.now() - 3600000).toISOString(),
    modules: Object.fromEntries(Object.entries(rows).map(([id, list]) => [id, { sourceKey: id, records: clone(list) }])), sources: { v2_usos: { value: [] } } };
  S.storage.setItem('fluxia_elite_recon_bankscope_v1:' + encodeURIComponent(ctx.owner) + ':' + encodeURIComponent(ctx.activeProfile), JSON.stringify({ scope: 'none', month: '2026-10' }));
  return { S, ctx, rows, key };
}

t('corte', 'ingreso cobrado con fecha posterior al corte NO se cuenta y se señala por ID', () => {
  const r = calc({ incomeRows: [{ id: 'late', mes: 'octubre', importe: 100, pagadoEl: '2026-10-28', fecha: '2026-10-28' }] });
  assert.equal(r.cents, 0n);
  assert.ok(codes(r).includes('COBRO_CON_FECHA_POSTERIOR_AL_CORTE'));
  assert.equal(r.issues.find((i) => i.code === 'COBRO_CON_FECHA_POSTERIOR_AL_CORTE').ref, 'late');
});
t('corte', 'un cobro con ID bancario del proveedor sí cuenta (el banco prueba que ocurrió)', () => {
  assert.equal(calc({ incomeRows: [{ id: 'b', mes: 'octubre', importe: 100, pagadoEl: '2026-10-28', bancoRef: 'BANK-1' }] }).cents, 10000n);
});
t('corte', 'cobro del mismo día del corte cuenta (límite inclusivo, Europa/Madrid)', () => {
  assert.equal(calc({ incomeRows: [{ id: 'd', mes: 'octubre', importe: 100, pagadoEl: '2026-10-15' }] }).cents, 10000n);
});
t('corte', 'aportación, rescate y reposición posteriores al corte se señalan sin cambiar la regla mensual', () => {
  const ap = calc({ huchas: [hucha([{ id: 'a', fecha: '2026-10-28', importe: 100 }])] });
  assert.equal(ap.cents, -10000n);
  assert.ok(codes(ap).includes('OPERACION_POSTERIOR_AL_CORTE'));
  const use = calc({ huchas: [hucha()], uses: [{ id: 'u', tipo: 'temporal', fecha: '2026-10-05', importe: 100, repuesto: 100, reposiciones: [{ id: 'r', fecha: '2026-10-28', importe: 100 }], provisionId: 'h' }] });
  assert.ok(codes(use).includes('OPERACION_POSTERIOR_AL_CORTE'));
  assert.equal(calc({ huchas: [hucha([{ id: 'a', fecha: '2026-10-02', importe: 100 }])] }).issues.length, 0, 'sin fechas futuras no hay incidencias');
});
t('corte', 'cualquier operación posterior al corte impide VERIFICADO (criterio [f])', () => {
  const { S, ctx, key } = session();
  assert.equal(S.api.availableCertificationReport().status, 'VERIFICADO', 'línea base sintética limpia');
  const late = { id: 'late', mes: '2026-10', concepto: 'Premio', importe: 50, pagadoEl: '2026-10-30', fecha: '2026-10-30' };
  ctx.items[key('ingresos')].push(late); ctx.backupFinance.modules.ingresos.records.push({ ...late });
  const cert = S.api.availableCertificationReport();
  assert.notEqual(cert.status, 'VERIFICADO');
  assert.equal(cert.verdict.gates.find((g) => g.id === 'f').pass, false);
});
t('corte', 'la memoización del certificado no sirve datos viejos si cambian registros sin cambiar el total', () => {
  const { S, ctx, key } = session();
  const before = S.api.availableCertificationReport();
  ctx.items[key('variables')][0].id = 'otro-id';   // mismo importe, distinto ID: el total no cambia
  const after = S.api.availableCertificationReport();
  assert.equal(before.calculation.cents, after.calculation.cents);
  assert.notEqual(before.evidence.checksums['nube:variables'], after.evidence.checksums['nube:variables']);
  assert.notEqual(after.status, 'VERIFICADO', 'la nube ya no coincide con la copia del HTML');
});
t('persistencia', 'la revisión «distintos» persiste tras reinicio (mismo almacenamiento) y no cruza a otro usuario', () => {
  const a = session();
  const twin = { id: 'v2', mes: '2026-10', fecha: '2026-10-04', concepto: 'Compra sintética', importe: 40, origen: 'manual' };
  a.ctx.items[a.key('variables')].push(twin); a.ctx.backupFinance.modules.variables.records.push({ ...twin });
  const first = a.S.api.availableCertificationReport();
  assert.notEqual(first.status, 'VERIFICADO');
  const reviewKey = 'fluxia_elite_recon_review_v1:' + encodeURIComponent(a.ctx.owner) + ':' + encodeURIComponent(a.ctx.activeProfile);
  a.S.storage.setItem(reviewKey, JSON.stringify({ [first.evidence.variableDuplicates[0].key]: { decision: 'distinct' } }));
  // «Reinicio»: nueva instancia del HTML con el MISMO localStorage.
  const reopen = (overrides) => { const r = session({ localStorage: a.S.storage, ...overrides }); r.ctx.items[r.key('variables')].push({ ...twin }); r.ctx.backupFinance.modules.variables.records.push({ ...twin }); return r.S.api.availableCertificationReport(); };
  assert.equal(reopen({}).status, 'VERIFICADO', 'tras reiniciar se respeta la decisión del usuario');
  const other = reopen({ owner: 'owner-b', activeProfile: 'p_usr-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb__' });
  assert.notEqual(other.status, 'VERIFICADO', 'otro usuario no hereda la decisión');
});
t('persistencia', 'usuario nuevo vacío: 0,00 €, sin libro y nunca VERIFICADO', () => {
  const { S, ctx, key } = session({ owner: 'owner-new', activeProfile: 'p_usr-cccccccc-cccc-cccc-cccc-cccccccccccc__' });
  for (const id of ['ingresos', 'fijos', 'variables', 'compartidos', 'financiaciones', 'huchas']) { ctx.items[key(id)] = []; ctx.backupFinance.modules[id].records = []; }
  const cert = S.api.availableCertificationReport();
  assert.equal(cert.calculation.cents, 0n);
  assert.equal(cert.calculation.ledger.length, 0);
});
t('banco', 'cargo bancario ligado a fijo: conciliado una sola vez por ID del proveedor y sin gasto variable duplicado', () => {
  const A = L.bankAdapter, C = L.bankConnector;
  const inbox = C.normalizeRows([{ id: 'p-fijo', idAuthority: 'provider', stableRef: 'p-fijo', accountKey: 'acct', banco: 'Revolut', fecha: '2026-10-05', importe: -102.5, concepto: 'Seguro' }]);
  const fixed = [{ id: 'f1', mes: 'octubre', importe: 100 }];
  const linked = { id: 'v1', mes: '2026-10', fecha: '2026-10-05', cuentaComoFijo: true, vinculoFijoId: 'f1', importe: 102.5, bancoRef: inbox[0].bankRef, origen: 'banco' };
  const r = calc({ fixedRows: fixed, variableRows: [linked] });
  assert.equal(r.cents, -10250n);
  const rec = R.reconcileBank({ adapter: A, inbox, ledgerRows: [{ module: 'variables', row: linked }], period: '2026-10', cutoff: CUT, status: { ok: true, checkedAt: CUT } });
  assert.equal(rec.summary.exact, 1);
  assert.equal(rec.reconciled, true);
  // El mismo cargo importado de nuevo (doble sync) no crea un segundo gasto.
  assert.equal(R.simulateDoubleSync({ adapter: A, existing: [linked], incoming: inbox, tombstones: {} }).secondAdditions, 0);
});
t('seguridad', 'sin secretos, tokens ni PII en los archivos nuevos o modificados del release', () => {
  const root = path.join(__dirname, '../..');
  const files = ['lab/js/fluxia-elite-reconciliation-v1.js', 'lab/tools/elite-reconcile-cli.cjs', 'lab/qa/lib/elite-html-functions.cjs', 'lab/qa/elite-reconciliation-v2025.cjs', 'lab/qa/elite-integration-v2026.cjs', 'lab/fluxia-elite-safari-datos-reales.html'];
  const parts = ['eyJ[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}', 'sb_' + 'secret_', 'service' + '_role', 'BEGIN (RSA |EC )?PRIVATE KEY', 'ghp_[A-Za-z0-9]{20,}', '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.(com|es|net)\\b'];
  const bad = new RegExp(parts.join('|'));
  for (const f of files) { const text = fs.readFileSync(path.join(root, f), 'utf8').replace(/tu-correo@[a-z.]+/g, ''); const m = text.match(bad); assert.ok(!m, f + ' contiene algo con forma de secreto/PII: ' + (m && m[0].slice(0, 12))); }
});
t('seguridad', 'los informes privados y copias nunca entran en el repositorio (.gitignore o ausencia)', () => {
  const root = path.join(__dirname, '../..');
  const offenders = [];
  (function walk(d, depth) { if (depth > 3) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git') continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p, depth + 1); else if (/informe-privado|elite-cloud-readonly|fluxia-perfil.*\.json$/i.test(e.name)) offenders.push(path.relative(root, p)); } })(root, 0);
  assert.deepEqual(offenders, []);
});

const failed = results.filter((r) => !r.ok);
for (const r of failed) console.error('✗ [' + r.group + '] ' + r.name + '\n    ' + r.error);
console.log(JSON.stringify({ suite: 'elite-integration-v2026', total: results.length, passed: results.length - failed.length, failed: failed.length, note: 'Fixtures sintéticas: no prueban importes reales' }));
if (failed.length) process.exit(1);
console.log('PASS v2.0.26 integration suite: ' + results.length + ' tests (synthetic fixtures only)');
