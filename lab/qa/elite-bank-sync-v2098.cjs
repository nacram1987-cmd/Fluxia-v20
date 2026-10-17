'use strict';
// v2.0.98: conciliación y sincronización bancaria de Élite con las reglas del HTML v97.77.
// 1) El núcleo copiado es idéntico a lo que genera lab/v97.77.html. 2) Élite decide igual que el call()+aplicarMovs() real
// (paridad aleatoria con colisiones deliberadas). 3) Escenarios obligatorios de la norma. 4) Política de lectura, bandeja y lista negra.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const loadUmd = require('./load-umd.cjs');
const builder = require('../tools/build-bank-html-core.cjs');
loadUmd('../js/fluxia-elite-bank-html-core-v1.js');
const sync = loadUmd('../js/fluxia-elite-bank-sync-v1.js');
const parity = require('./lib/bank-html-parity.cjs');

// 1) Copia literal: el archivo publicado es exactamente lo que produce el HTML de referencia.
const built = builder.build();
assert.equal(fs.readFileSync(path.join(__dirname, '..', 'js', 'fluxia-elite-bank-html-core-v1.js'), 'utf8'), built.text, 'el núcleo coincide con lab/v97.77.html');
for (const name of ['movimientoBancoVetado', 'pendienteIgual', 'yaExisteManual', 'eraDelCorte', 'esTraspasoPropio', 'clasificar', 'clsRegla']) assert(built.functions.includes(name), 'núcleo con ' + name);
assert(!/function (registrarGastoVariable|mostrarToast|guardarMovimientos|procesarIngreso)\(/.test(built.text), 'el núcleo no contiene funciones que escriben o pintan');

const F = require('./lib/bank-sync-fixtures.cjs');
const { PID, ACCOUNTS, ident, row } = F;
const { storeOf, ctxOf } = F.makeHelpers(sync);
const byState = (result, estado, tipo = 'gasto') => result.items.filter((x) => x.estado === estado && x.tipo === tipo).map((x) => String(x.m.legacyId || x.m.id)).sort();
function compare(rows, ctx, label) {
 const elite = sync.classify(rows, ctx);
 const html = parity.htmlDecisions(rows, ctx, sync);
 const nuevos = elite.items.filter((x) => x.estado === 'nuevo' && x.tipo === 'gasto').map((x) => String(x.m.id)).sort();
 assert.deepEqual(nuevos, html.importados, label + ': mismos cargos nuevos que el HTML');
 const enlazados = elite.items.filter((x) => x.estado === 'en-libro' && /pendiente ya apuntado|apunte manual/.test(x.motivo)).map((x) => String(x.m.id)).sort();
 assert.deepEqual(enlazados, html.enlazados, label + ': mismos enlaces con apuntes existentes');
 assert.deepEqual(elite.items.filter((x) => x.estado === 'revisar').map((x) => String(x.m.legacyId || x.m.id)).sort(), html.conflictos, label + ': mismos conflictos de identidad');
 return { elite, html };
}

// 2) Escenarios obligatorios.
{
 // Dos cargos distintos con el mismo importe, día y comercio: los dos son nuevos.
 const r = compare([row({ id: 'a1', banco: 'Revolut', fecha: '2026-10-16', importe: -3.2, concepto: 'Panaderia' }), row({ id: 'a2', banco: 'Revolut', fecha: '2026-10-16', importe: -3.2, concepto: 'Panaderia' })], ctxOf([]), 'mismo importe y día');
 assert.deepEqual(byState(r.elite, 'nuevo'), ['a1', 'a2']);
}
{
 // Mismo ID bruto en dos bancos: no se fusiona con el registro del otro banco.
 const ledger = [{ id: 'm1', fecha: '2026-10-16', importe: 11, concepto: 'Farmacia', origen: 'banco', banco: 'Revolut', bancoRef: 'same' }];
 const r = compare([row({ id: 'same', banco: 'CaixaBank', fecha: '2026-10-16', importe: -11, concepto: 'Farmacia' })], ctxOf(ledger), 'mismo id en otro banco');
 assert.deepEqual(byState(r.elite, 'nuevo'), ['same']);
}
{
 // Ya contabilizado por referencia antigua o por identidad, y vetado: nada es nuevo.
 const ledger = [
  { id: 'm1', fecha: '2026-10-10', importe: 12, concepto: 'Mercadona', origen: 'banco', banco: 'Revolut', bancoRef: 'old' },
  { id: 'm2', fecha: '2026-10-11', importe: 7.5, concepto: 'Estanco', origen: 'banco', banco: 'Revolut', bancoRef: ident('Revolut', 'kRev', 'idn'), bancoIdentity: ident('Revolut', 'kRev', 'idn') }
 ];
 const rows = [row({ id: 'old', banco: 'Revolut', fecha: '2026-10-10', importe: -12, concepto: 'Mercadona' }), row({ id: 'idn', banco: 'Revolut', fecha: '2026-10-11', importe: -7.5, concepto: 'Estanco' }), row({ id: 'gone', banco: 'Revolut', fecha: '2026-10-12', importe: -30, concepto: 'Amazon' })];
 const r = compare(rows, ctxOf(ledger, { v2_borrados_blacklist: [ident('Revolut', 'kRev', 'gone')] }), 'libro y vetos');
 assert.deepEqual(byState(r.elite, 'en-libro'), ['idn', 'old']);
 assert.deepEqual(byState(r.elite, 'descartado'), ['gone']);
 assert.deepEqual(byState(r.elite, 'nuevo'), []);
}
{
 // Como en el HTML v97.77: el veto por identidad lee la lista negra tal cual, sin consultar restauraciones
 // (solo la lista que se envía al servidor las excluye). Élite no se desvía: mostraría un «nuevo» que el HTML nunca importaría.
 const gone = ident('Revolut', 'kRev', 'back');
 const extra = { v2_borrados_blacklist: [gone], v2_sync_tombstones: { v2_borrados_blacklist: { ['i:' + gone]: 10 } }, v2_sync_restores: { v2_borrados_blacklist: { ['i:' + gone]: 20 } } };
 const r = compare([row({ id: 'back', banco: 'Revolut', fecha: '2026-10-12', importe: -30, concepto: 'Amazon' })], ctxOf([], extra), 'borrado recuperado');
 assert.deepEqual(byState(r.elite, 'descartado'), ['back']);
}
{
 // Corte: anterior al inicio del banco en Fluxia; el corte por banco nunca baja de la fecha de conexión del servidor.
 const rows = [row({ id: 'early', banco: 'Revolut', fecha: '2026-09-10', importe: -5, concepto: 'Cafe' }), row({ id: 'cx-before', banco: 'CaixaBank', fecha: '2026-09-25', importe: -6, concepto: 'Kiosko' }), row({ id: 'cx-after', banco: 'CaixaBank', fecha: '2026-10-05', importe: -6, concepto: 'Kiosko' })];
 const r = compare(rows, ctxOf([], {}, { CaixaBank: '2026-10-01', Revolut: '2026-09-01' }), 'cortes');
 assert.deepEqual(byState(r.elite, 'anterior'), ['cx-before', 'early']);
 assert.deepEqual(byState(r.elite, 'nuevo'), ['cx-after']);
}
{
 // Reglas por contraparte (puente), Bizum saliente (se importa aunque haya regla), traspaso propio y reposición de hucha.
 const rows = [
  row({ id: 'p1', banco: 'Revolut', fecha: '2026-10-15', importe: -40, concepto: 'Transferencia', contraparte: 'Ana Maria Lopez' }),
  row({ id: 'b1', banco: 'Revolut', fecha: '2026-10-15', importe: -15, concepto: 'Bizum enviado', contraparte: 'Ana Maria Lopez' }),
  row({ id: 't1', banco: 'CaixaBank', fecha: '2026-10-16', importe: -200, concepto: 'Transferencia a Revolut top up' }),
  row({ id: 'h1', banco: 'CaixaBank', fecha: '2026-10-16', importe: -100, concepto: 'Reponer hucha ahorro' })
 ];
 const r = compare(rows, ctxOf([]), 'traspasos y reglas');
 assert.deepEqual(byState(r.elite, 'traspaso'), ['h1', 'p1', 't1']);
 assert.deepEqual(byState(r.elite, 'nuevo'), ['b1']);
}
{
 // Apunte manual del mismo importe con otro comercio no se enlaza; con el mismo, sí.
 const ledger = [{ id: 'm1', fecha: '2026-10-14', importe: 20, concepto: 'Peluqueria', origen: 'manual' }, { id: 'm2', fecha: '2026-10-14', importe: 25, concepto: 'Zapateria', origen: 'manual' }];
 const rows = [row({ id: 'man', banco: 'Revolut', fecha: '2026-10-14', importe: -20, concepto: 'Peluqueria' }), row({ id: 'other', banco: 'Revolut', fecha: '2026-10-14', importe: -25, concepto: 'Ferreteria' })];
 const r = compare(rows, ctxOf(ledger), 'apuntes manuales');
 assert.deepEqual(byState(r.elite, 'en-libro'), ['man']);
 assert.deepEqual(byState(r.elite, 'nuevo'), ['other']);
}
{
 // El banco devuelve en el mismo lote el pendiente y el asentado del mismo pago: queda uno solo, como en el HTML.
 const rows = [row({ id: 'pend', banco: 'Revolut', fecha: '2026-10-15', importe: -9.9, concepto: 'Cine', pendiente: true }), row({ id: 'book', banco: 'Revolut', fecha: '2026-10-16', importe: -9.9, concepto: 'Cine' })];
 const r = compare(rows, ctxOf([]), 'pendiente y asentado');
 assert.equal(r.elite.items.filter((x) => x.estado === 'nuevo').length, 1);
}
{
 // Ingresos: registrados en Ingresos, vistos por el HTML o sin asentar no son nuevos. Una referencia antigua sin banco
 // es el conflicto «legacy-bank-unknown» del HTML: no se fusiona y queda para revisar.
 const ingresos = [{ id: 'i1', importe: 1000, concepto: 'Nomina', banco: 'Revolut', bancoRef: 'in-1' }, { id: 'i5', importe: 30, concepto: 'Venta', bancoRef: 'in-5' }];
 const ctx = { profileId: PID, store: storeOf({ v2_espejo__fluxia_banco_ing_vistos_v94: ['in-2'] }), ledger: { movimientos: [], ingresos } };
 const r = sync.classify([row({ id: 'in-1', banco: 'Revolut', fecha: '2026-10-01', importe: 1000, concepto: 'Nomina' }), row({ id: 'in-2', banco: 'Revolut', fecha: '2026-10-02', importe: 50, concepto: 'Bizum de Ana' }), row({ id: 'in-3', banco: 'Revolut', fecha: '2026-10-03', importe: 20, concepto: 'Devolucion', pendiente: true }), row({ id: 'in-4', banco: 'Revolut', fecha: '2026-10-04', importe: 15, concepto: 'Reembolso' }), row({ id: 'in-5', banco: 'Revolut', fecha: '2026-10-05', importe: 30, concepto: 'Venta' })], ctx);
 assert.deepEqual(byState(r, 'revisar', 'ingreso'), ['in-5']);
 assert.deepEqual(byState(r, 'en-libro', 'ingreso'), ['in-1']);
 assert.deepEqual(byState(r, 'visto', 'ingreso'), ['in-2']);
 assert.deepEqual(byState(r, 'pendiente-banco', 'ingreso'), ['in-3']);
 assert.deepEqual(byState(r, 'nuevo', 'ingreso'), ['in-4']);
}

// 3) Paridad aleatoria con colisiones deliberadas (importes, días, comercios, ids repetidos entre bancos, vetos en todos los formatos).
const scenario = (seed) => F.scenario(seed, ctxOf);
let compared = 0, totalNuevos = 0;
for (let seed = 1; seed <= 300; seed++) {
 const { rows, ctx } = scenario(seed);
 const { elite } = compare(rows, ctx, 'semilla ' + seed);
 compared += rows.length; totalNuevos += elite.items.filter((x) => x.estado === 'nuevo').length;
}
assert(compared >= 12000 && totalNuevos > 0, 'paridad aleatoria con volumen suficiente');

// 4) Idempotencia: 400 IDs y diez relecturas dan exactamente la misma clasificación.
{
 const rows = [];
 for (let i = 0; i < 400; i++) rows.push(row({ id: 'big' + i, banco: i % 3 ? 'Revolut' : 'CaixaBank', fecha: '2026-10-' + String(1 + (i % 17)).padStart(2, '0'), importe: -(1 + (i % 37)), concepto: 'Comercio ' + (i % 23) }));
 const ctx = ctxOf([{ id: 'x', fecha: '2026-10-05', importe: 5, concepto: 'Comercio 4', origen: 'banco', banco: 'Revolut', bancoRef: 'big4' }]);
 const first = JSON.stringify(sync.classify(rows, ctx).items.map((x) => [x.m.id, x.estado]));
 for (let n = 0; n < 10; n++) assert.equal(JSON.stringify(sync.classify(rows, ctx).items.map((x) => [x.m.id, x.estado])), first, 'relectura ' + n + ' idéntica');
 const once = sync.classify(rows, ctx);
 assert.equal(once.items.length, 400);
 assert.equal(once.counts['en-libro'], 1);
 compare(rows, ctx, '400 ids');
 // La clasificación no modifica el libro de Élite.
 assert.deepEqual(ctx.ledger.movimientos, [{ id: 'x', fecha: '2026-10-05', importe: 5, concepto: 'Comercio 4', origen: 'banco', banco: 'Revolut', bancoRef: 'big4' }]);
}

// 5) Política de lectura al abrir: solo con permiso, sin límite, sin otra lectura reciente de cualquier app.
{
 const now = Date.parse('2026-10-17T15:00:00Z');
 const conn = (o) => Object.assign({ connected: true, canRefresh: true, limited: false, lastSync: '2026-10-17T14:00:00Z' }, o);
 assert.deepEqual(sync.decideAutoSync([], now, {}).read, false);
 assert.equal(sync.decideAutoSync([conn({ canRefresh: false, limited: true })], now, {}).reason, 'limite-diario');
 assert.equal(sync.decideAutoSync([conn({ lastSync: '2026-10-17T14:55:00Z' })], now, {}).reason, 'reciente');
 assert.equal(sync.decideAutoSync([conn({})], now, {}).read, true);
 assert.equal(sync.decideAutoSync([conn({ lastSync: null })], now, {}).reason, 'sin-lectura');
 assert.equal(sync.decideAutoSync([conn({})], now, { inFlight: true }).reason, 'en-curso');
 assert.equal(sync.decideAutoSync([conn({})], now, { lastAttemptAt: now - 30000 }).reason, 'intento-reciente');
 // Un banco limitado no impide leer el otro; el más antiguo de los que se pueden leer decide.
 assert.equal(sync.decideAutoSync([conn({ canRefresh: false, limited: true }), conn({ lastSync: '2026-10-17T14:58:00Z' })], now, {}).read, false);
 assert.equal(sync.decideAutoSync([conn({ lastSync: '2026-10-17T14:58:00Z' }), conn({ lastSync: '2026-10-17T13:00:00Z' })], now, {}).read, true);
 // Un banco que falla siempre (su hora del servidor no avanza) no provoca una lectura en cada vuelta: la propia de Élite cuenta 12 min.
 assert.equal(sync.decideAutoSync([conn({ lastSync: '2026-10-17T09:00:00Z' })], now, { readAt: '2026-10-17T14:50:00Z' }).reason, 'reciente');
 assert.equal(sync.decideAutoSync([conn({ lastSync: '2026-10-17T09:00:00Z' })], now, { readAt: '2026-10-17T14:40:00Z' }).read, true);
 // Comprobación previa sin red: ni lectura propia en 12 min, ni intento en 90 s, ni otra comprobación del estado en 1 min.
 assert.deepEqual(sync.shouldCheck({}, now), { check: true, reason: 'comprobar' });
 assert.equal(sync.shouldCheck({ readAt: '2026-10-17T14:55:00Z' }, now).reason, 'reciente');
 assert.equal(sync.shouldCheck({ lastAttemptAt: now - 30000 }, now).reason, 'intento-reciente');
 assert.equal(sync.shouldCheck({ checkedAt: '2026-10-17T14:59:30Z' }, now).reason, 'comprobado');
 assert.equal(sync.shouldCheck({ checkedAt: '2026-10-17T14:58:00Z', readAt: '2026-10-17T14:40:00Z', lastAttemptAt: Date.parse('2026-10-17T14:40:00Z') }, now).check, true);
}

// 6) Bandeja: un banco con error conserva sus filas; los leídos sin error se sustituyen (un pendiente ya asentado no se duplica).
{
 const prev = { rows: [{ id: 'r-old', banco: 'Revolut', pendiente: true }, { id: 'c-old', banco: 'CaixaBank' }], fetchedAt: { revolut: 'x', caixabank: 'y' }, cortes: { CaixaBank: '2026-10-01' } };
 const next = sync.mergeRead(prev, { movimientos: [{ id: 'r-new', banco: 'Revolut' }], por_banco: { Revolut: 1, CaixaBank: 0 }, avisos: 'CaixaBank: HUB046: límite de consultas de hoy', cortes: { Revolut: '2026-09-28' } }, Date.parse('2026-10-17T15:00:00Z'));
 assert.deepEqual(next.rows.map((x) => x.id).sort(), ['c-old', 'r-new']);
 assert.equal(next.fetchedAt.caixabank, 'y');
 assert.equal(next.fetchedAt.revolut, '2026-10-17T15:00:00.000Z');
 assert.deepEqual(next.cortes, { CaixaBank: '2026-10-01', Revolut: '2026-09-28' });
 // Lectura parcial (una cuenta del banco falla): se conservan las filas anteriores, sin repetir las que han vuelto a llegar.
 const partial = sync.mergeRead({ rows: [{ id: 'c1', bankRef: 'k-c1', banco: 'CaixaBank' }, { id: 'c2', bankRef: 'k-c2', banco: 'CaixaBank' }] }, { movimientos: [{ id: 'c1', bankRef: 'k-c1', banco: 'CaixaBank' }, { id: 'c3', bankRef: 'k-c3', banco: 'CaixaBank' }], por_banco: { CaixaBank: 2 }, avisos: 'CaixaBank: Enable Banking HTTP 500' }, Date.parse('2026-10-17T15:00:00Z'));
 assert.deepEqual(partial.rows.map((x) => x.bankRef).sort(), ['k-c1', 'k-c2', 'k-c3']);
 assert.equal(partial.fetchedAt.caixabank, undefined, 'un banco con error no se da por leído');
}

// 7) Lista negra para el servidor = misma unión que fluxiaBlacklistParaEdge() del HTML, sin los borrados recuperados.
{
 const store = storeOf({ v2_borrados_blacklist: ['a', 'b', 'fp:x'], v2_sync_tombstones: { v2_borrados_blacklist: { 'i:b': 1 } }, v2_sync_restores: { v2_borrados_blacklist: { 'i:b': 2 } } });
 assert.deepEqual(sync.blacklistForEdge(store, PID).sort(), ['a', 'fp:x']);
}

// 8) El almacén usa las claves modernas del perfil y deja la antigua copia sin usar.
{
 const keys = sync.cloudKeysFor(PID);
 assert.equal(keys.fluxia_banco_clasif_v94, 'v2_espejo__fluxia_banco_clasif_v94');
 assert.equal(keys['fluxia_banco_conexiones_v1_' + PID], 'v2_espejo__fluxia_banco_conexiones_v1_' + PID);
 const known = JSON.parse(storeOf({}, { CaixaBank: '2026-10-01', Revolut: '2026-09-01' })['fluxia_bancos_conocidos_v62_' + PID]);
 assert.deepEqual(known, { revolut: { banco: 'Revolut', corte: '2026-09-18' }, caixabank: { banco: 'CaixaBank', corte: '2026-10-01' } });
 assert.equal(sync.ageText(30 * 1000), 'hace menos de 1 min');
 assert.equal(sync.ageText(140 * 60 * 1000), 'hace 2 h 20 min');
}

console.log('PASS v2.0.98: núcleo idéntico al HTML v97.77; paridad con aplicarMovs real en 300 lotes (' + compared + ' cargos); escenarios de la norma, 400 ids × 10, política de lectura, bandeja y lista negra');
