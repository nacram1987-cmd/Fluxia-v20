'use strict';
// v2.0.49: vínculos persistentes de rescate (fluxia_rescue_links) no deben invalidar el cálculo ni romper Inicio con BigInt.
const assert = require('node:assert/strict');
const { loadEliteFunctions } = require('./lib/elite-html-functions.cjs');
const month = '2026-10';
function build(withLinks) {
  const links = withLinks ? new Map([['u1', { hucha_id: 'h1', operation_name: 'Renta', amount_cents: 10000, operation_date: '2026-10-01' }]]) : undefined;
  const S = loadEliteFunctions({ selectedMonth: month, ...(links ? { rescueIdentityLinks: links } : {}) });
  const c = S.context;
  c.items = {
    planRescate_v2_ingresos: [{ id: 'i1', concepto: 'Nómina', importe: 1000, fecha: '2026-10-01', cobrado: true, mes: 'octubre' }],
    planRescate_v2_fijos: [], planRescate_v2_movimientos: [{ id: 'm1', concepto: 'Super', importe: 10, fecha: '2026-10-02', mes: 'octubre', origen: 'efectivo' }],
    planRescate_v2_provisiones: [{ id: 'h1', nombre: 'Renta', importeMensual: 100, inicio: 'julio', fin: null, aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-01', importe: 100 }] } }],
    planRescate_v2_compartidos: [], planRescate_v2_financiaciones: [],
  };
  c.extraFinance = { planRescate_v2_usos: [{ id: 'u1', tipo: 'temporal', provision: 'Renta', importe: 100, repuesto: 100, fecha: '2026-10-01', mes: 'octubre', reposiciones: [{ id: 'r1', importe: 100, fecha: '2026-10-02', origen: 'manual' }] }] };
  c.cloudFinanceSnapshot = { owner: c.owner, profile: c.activeProfile, complete: true };
  c.cloudReadAt = '2026-10-16T10:00:00.000Z';
  return S;
}
for (const withLinks of [true, false]) {
  const S = build(withLinks);
  let report;
  assert.doesNotThrow(() => { report = S.api.availableCertificationReport(); }, 'sin error BigInt (links=' + withLinks + ')');
  assert.ok(report && report.calculation, 'hay cálculo');
  assert.equal(report.calculation.ok, true, 'el cálculo es válido (links=' + withLinks + '): ' + JSON.stringify(report.calculation.blockers));
  assert.equal(report.calculation.cents, 89000n, 'Disponible 890,00 € (rescate = traspaso interno)');
}
console.log('PASS v2.0.49: certificación sin error BigInt con y sin vínculos persistentes');
