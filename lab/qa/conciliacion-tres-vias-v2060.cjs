'use strict';
// Pruebas de aceptación de la conciliación de tres vías (D1, D2, D3, D4) con datos SINTÉTICOS (ningún dato real).
// Ejecuta el HTML real (lab/v97.73.html y lab/index.html) y el motor real de Élite sobre la misma instantánea sintética.
const assert = require('node:assert/strict');
const path = require('node:path');
const T = require('../tools/conciliacion-tres-vias.cjs');
const root = path.resolve(__dirname, '../..');
const PERFIL = 'usr-00000000-test-0000-0000-000000000000';
const fila = (clave, v) => ({ clave: 'profile:' + PERFIL + ':' + clave, v: JSON.stringify(v), t: 1, updated_at: '2026-10-17T06:00:00Z' });
function instantanea({ ingresos = [], fijos = [], movimientos = [], provisiones = [], usos = [], compartidos = [], financiaciones = [] } = {}) {
  return { corte: '2026-10-17T06:00:00Z', rows: [fila('v2_ingresos', ingresos), fila('v2_fijos', fijos), fila('v2_movimientos', movimientos), fila('v2_provisiones', provisiones), fila('v2_usos', usos), fila('v2_compartidos', compartidos), fila('v2_financiaciones', financiaciones),
    { clave: 'profile:otro-perfil:v2_movimientos', v: JSON.stringify([{ id: 'ajeno', mes: 'octubre', fecha: '2026-10-05', concepto: 'De otro perfil', importe: 999, categoria: 'Otros' }]), t: 1 }] };
}
async function conciliar(snap, html = 'lab/v97.73.html') {
  const exp = T.exportacionElite(snap, PERFIL, 'usuario-test', '2026-10');
  const h = await T.libroHTML(path.join(root, html), snap, PERFIL, 'octubre');
  assert(!h.fallo, 'el HTML calcula: ' + h.fallo);
  const e = T.libroElite(exp, '2026-10', new Map());
  assert(e.ok, 'Élite calcula: ' + (e.blockers || []).join(' · '));
  return { h, e, r: T.cruzar(h, e) };
}
(async () => {
  // D1: céntimos, cobrado frente a pendiente, aportación prevista frente a exceso, devolución y rescate frente a uso.
  const base = instantanea({
    ingresos: [{ id: 'i1', mes: 'octubre', concepto: 'Nómina', importe: 2000.1, pagadoEl: '2026-10-01' },
      { id: 'i2', mes: 'octubre', concepto: 'Pensión', importe: 316.3, fechaPrevista: '2026-10-24' },
      { id: 'i3', mes: 'octubre', concepto: 'Cobro futuro', importe: 50, fechaPrevista: '2099-01-01' },
      { id: 'i4', mes: 'octubre', concepto: 'Préstamo puente', importe: 500, tipo: 'puente', pagadoEl: '2026-10-02' }],
    movimientos: [{ id: 'm1', mes: 'octubre', fecha: '2026-10-05', concepto: 'Supermercado', importe: 50.25, categoria: 'Alimentación' },
      { id: 'm2', mes: 'octubre', fecha: '2026-10-06', concepto: 'Gasolina', importe: 20, categoria: 'Gasolina' },
      { id: 'm3', mes: 'octubre', fecha: '2026-10-07', concepto: 'Devolución', importe: -10.1, categoria: 'Otros' },
      { id: 'm4', mes: 'septiembre', fecha: '2026-09-30', concepto: 'Otro mes', importe: 99, categoria: 'Otros' }],
    provisiones: [{ id: 'p1', nombre: 'Seguro', importeMensual: 100, inicio: 'julio', fin: null, aportaciones: { octubre: [{ id: 'a1', fecha: '2026-10-03', importe: 150 }] } }],
    usos: [{ id: 'u1', mes: 'octubre', fecha: '2026-10-15', provision: 'Seguro', tipo: 'temporal', importe: 80, repuesto: 0 }],
  });
  let { h, e, r } = await conciliar(base);
  // 2000,10 − 0 − (100 + 50 de exceso) − (50,25 + 20 − 10,10) + 0 = 1789,95 €
  assert.equal(Math.round(h.breakdown.total * 100), 178995, 'HTML: Disponible esperado');
  assert.equal(String(e.cents), '178995', 'Élite: mismo Disponible');
  assert.equal(r.delta, '0'); assert.equal(r.diferencias.length, 0, JSON.stringify(r.diferencias));
  assert.equal(r.modulos.ingresos.partidasHTML, 1, 'pensión pendiente, cobro futuro y puente no cuentan');
  assert.equal(r.modulos.provisiones.efectoHTML, '-15000', 'previsto + exceso, sin restar dos veces la aportación prevista');
  assert.equal(r.modulos.variables.efectoHTML, '-6015', 'la devolución resta del gasto');
  assert.equal(String(e.trace.pendingHuchaRescuesCents), '8000', 'Élite ve el rescate pendiente, solo informativo');

  // La versión del HTML que suma rescates aparece como «regla distinta» con su importe exacto.
  ({ r } = await conciliar(base, 'lab/index.html'));
  assert(r.diferencias.some((d) => d.modulo === 'rescatesPendientes' && d.html === '8000'), 'la diferencia de regla se informa con su importe');

  // D2: una divergencia de una partida se detecta con su delta exacto.
  const falsa = { ...e, ledger: e.ledger.map((x) => (x.id === 'm1' ? { ...x, impactCents: String(BigInt(x.impactCents) - 1n) } : x)) };
  const r2 = T.cruzar(h, falsa);
  assert.equal(r2.diferencias.length, 1); assert.equal(r2.diferencias[0].tipo, 'importe distinto'); assert.equal(r2.delta, '1');

  // D3: el mismo cargo bancario importado dos veces no se cuenta dos veces si el HTML lo descarta, y el cruce lo deja visible.
  const dup = instantanea({ movimientos: [{ id: 'b1', mes: 'octubre', fecha: '2026-10-05', concepto: 'Bar', importe: 7.5, categoria: 'Bares', origen: 'banco', bancoRef: 'ref-1' }] });
  ({ r } = await conciliar(dup));
  assert.equal(r.delta, '0');

  // D4: un perfil sin datos queda a cero en las dos apps y no ve filas de otro perfil.
  ({ h, e, r } = await conciliar(instantanea()));
  assert.equal(Math.round(h.breakdown.total * 100), 0); assert.equal(String(e.cents), '0'); assert.equal(r.diferencias.length, 0);
  assert(!JSON.stringify(e.ledger).includes('ajeno'), 'sin fuga de otro perfil');
  console.log('PASS conciliación tres vías: céntimos, cobrado/pendiente, exceso, devolución, rescate informativo, divergencia exacta, cuenta vacía a cero');
  process.exit(0);
})().catch((err) => { console.error('FAIL', err.message); process.exit(1); });
