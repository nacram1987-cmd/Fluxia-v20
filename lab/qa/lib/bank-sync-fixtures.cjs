'use strict';
// Casos de prueba de conciliación bancaria: filas como las devuelve Fluxia-banco-lab9770 y lotes aleatorios con colisiones
// deliberadas (importes, días, comercios, ids repetidos entre bancos y vetos en todos los formatos del HTML).
const PID = 'usr-11111111-2222-3333-4444-555555555555';
const ACCOUNTS = { Revolut: ['kRev'], CaixaBank: ['kC1', 'kC2'] };
const ident = (banco, account, ref) => 'fxbank9770:' + JSON.stringify(['enablebanking', banco.toLowerCase(), account, ref]);
function row(o) {
 const account = o.account || ACCOUNTS[o.banco][0];
 const fallback = o.idAuthority === 'fallback';
 return Object.assign({ provider: 'enablebanking', accountKeyKind: 'iban-digest', moneda: 'EUR', pendiente: false, contraparte: '' }, o, {
  idAuthority: fallback ? 'fallback' : 'provider', legacyId: o.id, accountKey: account, accountId: 'uid-' + account,
  stableRef: fallback ? 'fallback|' + o.fecha + '|' + o.importe + '|' + o.concepto + '|' + (o.contraparte || '') + '|EUR' : o.id
 });
}
const conexiones = [{ banco: 'Revolut', cuentas: [{ uid: 'uid-kRev', nombre: 'Jose Ignacio Ramos' }] }, { banco: 'CaixaBank', cuentas: [{ uid: 'uid-kC1', nombre: 'Jose Ignacio Ramos' }, { uid: 'uid-kC2', nombre: 'Cuenta ahorro' }] }];
function makeHelpers(sync) {
 function storeOf(extra, cortes) {
  return sync.buildStore(Object.assign({
   v2_espejo__fluxia_banco_corte_v55: { fecha: '2026-09-18', hecho: '2026-09-29T12:00:00Z', vistos: [] },
   ['v2_espejo__fluxia_banco_conexiones_v1_' + PID]: conexiones,
   v2_espejo__fluxia_banco_clasif_v94: [{ t: ['ana', 'maria', 'lopez'], tipo: 'puente', dir: 'out', ts: 1 }]
  }, extra || {}), PID, cortes || {});
 }
 const ctxOf = (ledger, extra, cortes) => ({ profileId: PID, store: storeOf(extra, cortes), ledger: { movimientos: ledger || [], ingresos: [] } });
 return { storeOf, ctxOf };
}
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, list) => list[Math.floor(r() * list.length)];
const CONCEPTS = ['Mercadona', 'Shell', 'Amazon', 'Netflix', 'Panaderia', 'Farmacia', 'Bar Pepe', 'Transferencia', 'Bizum enviado', 'Transferencia a Revolut top up', 'Reponer hucha ahorro', 'Gasolinera Repsol', 'Apple.com/bill'];
const CONTRA = ['', '', '', 'Ana Maria Lopez', 'Jose Ignacio Ramos', 'Supermercado Dia'];
const AMOUNTS = [3.2, 7.5, 9.99, 12, 20, 40, 52.1, 100, 200];
function scenario(seed, ctxOf) {
 const r = rng(seed), rows = [], ledger = [], blacklist = [], gv = [], aliases = {}, vistos = [], ids = [];
 const date = () => '2026-' + pick(r, ['09-12', '09-20', '09-28', '10-02', '10-09', '10-14', '10-15', '10-16', '10-17']);
 for (let i = 0; i < 40; i++) {
  const banco = r() < 0.6 ? 'Revolut' : 'CaixaBank';
  const id = r() < 0.08 && rows.length ? rows[Math.floor(r() * rows.length)].legacyId : 'tx' + seed + '-' + i;
  const m = row({ id, banco, account: pick(r, ACCOUNTS[banco]), fecha: date(), importe: (r() < 0.12 ? 1 : -1) * pick(r, AMOUNTS), concepto: pick(r, CONCEPTS), contraparte: pick(r, CONTRA), pendiente: r() < 0.1, idAuthority: r() < 0.05 ? 'fallback' : 'provider' });
  rows.push(m);
  const k = ident(banco, m.accountKey, m.stableRef);
  const roll = r();
  if (roll < 0.12) ledger.push({ id: 'L' + i, fecha: m.fecha, importe: Math.abs(m.importe), concepto: m.concepto, origen: 'banco', banco, bancoRef: m.id });
  else if (roll < 0.2) ledger.push({ id: 'L' + i, fecha: m.fecha, importe: Math.abs(m.importe), concepto: m.concepto, origen: 'banco', banco, bancoRef: k, bancoIdentity: k, bancoAccountKey: m.accountKey });
  else if (roll < 0.25) { ledger.push({ id: 'L' + i, fecha: m.fecha, importe: Math.abs(m.importe), concepto: m.concepto, origen: 'banco', banco, bancoRef: m.id }); aliases['L' + i] = { identity: k, accountKey: m.accountKey, stable: m.stableRef, provider: 'enablebanking', kind: 'iban-digest', raw: m.id }; }
  else if (roll < 0.3) ledger.push({ id: 'L' + i, fecha: m.fecha, importe: Math.abs(m.importe), concepto: m.contraparte && m.contraparte.length > 1 ? m.contraparte : m.concepto, origen: 'manual' });
  else if (roll < 0.34) ledger.push({ id: 'L' + i, fecha: m.fecha, importe: Math.abs(m.importe), concepto: m.contraparte && m.contraparte.length > 1 ? m.contraparte : m.concepto, origen: 'banco', banco, bancoRef: 'pend-' + i, bancoV: 2, bancoPendiente: true });
  else if (roll < 0.38) ledger.push({ id: 'L' + i, fecha: m.fecha, importe: Math.abs(m.importe), concepto: m.concepto, origen: 'banco', bancoRef: m.id });
  const veto = r();
  if (veto < 0.05) blacklist.push(k);
  else if (veto < 0.08) blacklist.push(m.id);
  else if (veto < 0.1) blacklist.push('fp:' + m.fecha + '|' + Math.round(Math.abs(m.importe) * 100) + '|' + m.concepto.toLowerCase().replace(/[^a-z0-9]/g, ''));
  else if (veto < 0.12) blacklist.push('cc:|' + Math.round(Math.abs(m.importe) * 100) + '|' + m.concepto.toLowerCase().replace(/[^a-z0-9]/g, ''));
  else if (veto < 0.15) gv.push({ id: 'G' + i, bancoRef: m.id, fecha: m.fecha, cents: Math.round(Math.abs(m.importe) * 100), conc: m.concepto.toLowerCase().replace(/[^a-z0-9]/g, ''), banco: banco.toLowerCase(), snapshot: r() < 0.5 ? { id: 'G' + i, banco, bancoIdentity: k } : { id: 'G' + i } });
  if (r() < 0.04) vistos.push({ f: m.fecha, c: Math.round(Math.abs(m.importe) * 100), p: true });
  if (r() < 0.05) ids.push(r() < 0.5 ? m.id : k);
 }
 const extra = { v2_borrados_blacklist: blacklist, fluxia_gv_borrados_v1: gv, ['v2_bank_identity_aliases9770_' + PID]: aliases, v2_espejo__fluxia_banco_ids: ids,
  v2_espejo__fluxia_banco_corte_v55: { fecha: '2026-09-18', hecho: '2026-09-29T12:00:00Z', vistos },
  v2_espejo__fluxia_banco_clasif_item_v9464: rows.length > 3 ? { [rows[3].id]: { tipo: 'propio' } } : {} };
 return { rows, ctx: ctxOf(ledger, extra, r() < 0.5 ? { CaixaBank: '2026-10-01' } : {}) };
}
module.exports = { PID, ACCOUNTS, ident, row, conexiones, makeHelpers, rng, scenario };
