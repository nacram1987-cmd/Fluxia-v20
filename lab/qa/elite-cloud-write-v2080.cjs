'use strict';
// Paso 2 de la escritura bidireccional: escritura de Élite con fusión, copia previa y control de conflictos. Datos sintéticos; sin red.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..', '..');
// el módulo se carga como en el navegador (window), igual que el motor
const winW = {};
vm.runInContext(fs.readFileSync(path.join(root, 'lab', 'js', 'fluxia-elite-cloud-write-v1.js'), 'utf8'), vm.createContext({ window: winW, console }));
const W = winW.FluxiaEliteCloudWrite;

// motor real del HTML (módulo idéntico, comprobado en elite-sync-engine-parity-v2079)
const store = {};
const win = {};
vm.runInContext(fs.readFileSync(path.join(root, 'lab', 'js', 'fluxia-sync-engine-v1.js'), 'utf8'),
  vm.createContext({ window: win, Almacen: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, console }));
const sync = win.FluxiaSync954;

// los arrays del motor vienen de otro contexto vm: se comparan como datos planos
const plain = (x) => JSON.parse(JSON.stringify(x));

const PK = 'profile:usr-068a982d-9638-40cc-8b8c-a595534ab36d:v2_provisiones';
const SK = 'v2_provisiones';
const NOW = 1792300000000;
const base = [
  { id: 'h1', nombre: 'Agua', importeMensual: 67, inicio: 'julio', fin: null, _fxUpdatedAt: 100, aportaciones: {} },
  { id: 'h2', nombre: 'Renta', importeMensual: 164.05, inicio: 'julio', fin: null, _fxUpdatedAt: 100, aportaciones: {} },
];

// transporte en memoria: versión t, copias y escrituras condicionadas
function memory(initial, { beforePatch } = {}) {
  const log = [];
  let row = initial ? { v: JSON.parse(JSON.stringify(initial)), t: 1000 } : null;
  return {
    log,
    get row() { return row; },
    async read() { log.push('read'); return row ? { v: JSON.parse(JSON.stringify(row.v)), t: row.t } : null; },
    async backup(k, r) { log.push('backup'); store['bk:' + k + ':' + log.length] = JSON.stringify(r); },
    async patch(k, expectedT, array) {
      log.push('patch');
      if (beforePatch) { beforePatch(); beforePatch = null; }
      if ((row ? row.t : 0) !== expectedT) { log.push('conflict'); return false; }
      row = { v: array, t: (row ? row.t : 0) + 1 };
      return true;
    },
  };
}

(async () => {
  // 1. validación: nada se toca si los datos no son válidos
  assert.equal(W.validateProvision({ nombre: '', importeMensual: 20, mes: 10 }, NOW).ok, false);
  assert.equal(W.validateProvision({ nombre: 'X', importeMensual: -1, mes: 10 }, NOW).ok, false);
  assert.equal(W.validateProvision({ nombre: 'X', importeMensual: 1.005, mes: 10 }, NOW).ok, false, 'céntimos exactos');
  assert.equal(W.validateProvision({ nombre: 'X', importeMensual: 20, mes: 13 }, NOW).ok, false);
  const v = W.validateProvision({ nombre: '  Prueba 2 ', importeMensual: '20,5', mes: 10, seq: 1 }, NOW);
  assert.equal(v.ok, true);
  assert.equal(v.item.nombre, 'Prueba 2');
  assert.equal(v.item.importeMensual, 20.5);
  assert.equal(v.item.inicio, 'octubre', 'misma forma que el HTML: nombre del mes');
  assert.equal(v.item.fin, null);
  assert.equal(v.item.origen, 'manual');

  // 2. alta normal: copia previa antes de escribir, y el resultado conserva lo que había
  const m1 = memory(base);
  const r1 = await W.writeCollection({ sync, transport: m1, profileKey: PK, shortKey: SK, build: (remote) => [...remote, v.item] });
  assert.equal(r1.attempt, 1);
  assert.deepEqual(m1.log, ['read', 'backup', 'patch'], 'lee, copia, escribe');
  assert.deepEqual(plain(m1.row.v).map((x) => x.nombre).sort(), ['Agua', 'Prueba 2', 'Renta'].sort());

  // 3. conflicto real: el HTML guarda otra provisión entre la lectura y la escritura
  const htmlItem = { id: 'html_1', nombre: 'Seguro', importeMensual: 50, inicio: 'octubre', fin: null, _fxUpdatedAt: NOW - 5, aportaciones: {} };
  const m2 = memory(base, { beforePatch: () => { m2.row.v = [...m2.row.v, htmlItem]; m2.row.t += 1; } });
  const r2 = await W.writeCollection({ sync, transport: m2, profileKey: PK, shortKey: SK, build: (remote) => [...remote, v.item] });
  assert.equal(r2.attempt, 2, 'reintenta tras el conflicto');
  assert.deepEqual(m2.log.filter((x) => x === 'conflict'), ['conflict']);
  const names = plain(m2.row.v).map((x) => x.nombre).sort();
  assert.deepEqual(names, ['Agua', 'Prueba 2', 'Renta', 'Seguro'], 'no se pierde el alta del HTML ni la de Élite');
  assert.equal(plain(m2.row.v).filter((x) => x.id === v.item.id).length, 1, 'el reintento no duplica la alta');

  // 4. el motor sí fusiona con la clave corta: gana la versión remota más reciente del mismo id
  const remoteNewer = { ...base[0], importeMensual: 70, _fxUpdatedAt: 999999 };
  const m3 = memory([remoteNewer, base[1]]);
  await W.writeCollection({ sync, transport: m3, profileKey: PK, shortKey: SK, build: (remote) => [...remote, v.item] });
  assert.equal(plain(m3.row.v).find((x) => x.id === 'h1').importeMensual, 70, 'la nube más reciente gana (fusión activa)');

  // 5. trampa: con la clave completa el motor no fusiona; se rechaza en lugar de escribir sin fusión
  await assert.rejects(W.writeCollection({ sync, transport: memory(base), profileKey: PK, shortKey: PK, build: (r) => [...r, v.item] }), /clave corta/);

  // 6. si el motor descartara algo, no se escribe nada
  const dropping = { mergeCloudValue: () => JSON.stringify(base) };
  const m6 = memory(base);
  await assert.rejects(W.writeCollection({ sync: dropping, transport: m6, profileKey: PK, shortKey: SK, build: (r) => [...r, v.item] }), /descartaría/);
  assert.deepEqual(m6.log, ['read'], 'sin copia ni escritura');

  // 7. conflicto persistente: después de los intentos no se escribe y se avisa
  const m7 = memory(base, { beforePatch: null });
  m7.patch = async () => { m7.log.push('conflict'); return false; };
  await assert.rejects(W.writeCollection({ sync, transport: m7, profileKey: PK, shortKey: SK, build: (r) => [...r, v.item], maxAttempts: 2 }), /no se escribió nada/);

  // 8. cuenta nueva sin fila: escribe sin copia previa (no hay nada que copiar)
  const m8 = memory(null);
  const r8 = await W.writeCollection({ sync, transport: m8, profileKey: PK, shortKey: SK, build: () => [v.item] });
  assert.equal(r8.count, 1);
  assert.deepEqual(m8.log, ['read', 'patch']);

  console.log('PASS v2.0.80 (paso 2): escritura con fusión, copia previa, conflicto y reintento sin duplicar; sin escritura si la fusión descarta algo');
})().catch((e) => { console.error(e); process.exit(1); });

// 9. transporte real contra fluxia_datos, con fetch simulado (sin red)
(async () => {
  const calls = [];
  const rowsStore = { v: JSON.stringify(base), t: 500 };
  const fakeFetch = async (url, opts = {}) => {
    calls.push({ url, method: opts.method || 'GET', headers: opts.headers, body: opts.body });
    const json = (x, s = 200) => ({ ok: s < 300, status: s, json: async () => x });
    if (!opts.method || opts.method === 'GET') return json([{ v: rowsStore.v, t: rowsStore.t }]);
    if (opts.method === 'POST') return json([{}], 201);
    if (opts.method === 'PATCH') {
      const want = new URL(url).searchParams.get('t');
      if (String(rowsStore.t) !== want.replace('eq.', '')) return json([]);
      rowsStore.v = JSON.parse(opts.body).v; rowsStore.t = JSON.parse(opts.body).t;
      return json([{ t: rowsStore.t }]);
    }
    return json([], 400);
  };
  const T = W.supabaseTransport({ base: 'https://x.supabase.co', anonKey: 'anon', token: 'user-jwt', owner: 'b0a89b51-ee34-4b3d-8931-61004550eeaf', fetchFn: fakeFetch });
  const read = await T.read(PK);
  assert.equal(read.t, 500);
  assert.equal(JSON.parse(JSON.stringify(read.v)).length, 2);
  const url = calls[0].url;
  assert(url.includes('user_id=eq.b0a89b51-ee34-4b3d-8931-61004550eeaf') && url.includes('clave=eq.' + encodeURIComponent(PK)), 'siempre filtra por usuario y clave');
  assert.equal(calls[0].headers.Authorization, 'Bearer user-jwt', 'usa el token del usuario, nunca clave de servicio');
  await T.backup(PK, read);
  assert.equal(calls[1].method, 'POST');
  assert(JSON.parse(calls[1].body).clave.startsWith('backup:' + PK + ':'), 'copia con clave de respaldo');
  // escritura con versión correcta se aplica
  assert.equal(await T.patch(PK, 500, [{ id: 'z', nombre: 'Z' }]), true);
  // escritura con versión antigua no se aplica
  assert.equal(await T.patch(PK, 500, [{ id: 'y', nombre: 'Y' }]), false, 'versión antigua: no se sobrescribe');
  assert.equal(JSON.parse(rowsStore.v)[0].id, 'z', 'la nube conserva la última escritura válida');
  console.log('PASS v2.0.80 (transporte): lectura, copia y escritura condicionada contra fluxia_datos (simulado)');
})().catch((e) => { console.error(e); process.exit(1); });

// 10. borrados de la nube: un registro borrado en el HTML no vuelve al escribir desde Élite
(async () => {
  const PREFIX = PK.slice(0, PK.lastIndexOf(':') + 1);
  const borrado = { id: 'hz', nombre: 'Borrada en HTML', importeMensual: 10, inicio: 'julio', fin: null, _fxUpdatedAt: 50, aportaciones: {} };
  const remoto = [...base, borrado];
  const tomb = { v2_provisiones: { 'i:hz': NOW } };
  const nueva = W.validateProvision({ nombre: 'Nueva', importeMensual: 20, mes: 10, seq: 9 }, NOW).item;
  const m = memory(remoto);
  // el HTML escribe el tombstone y el registro de borrado explícito; el motor solo aplica un borrado con ambos
  const explicito = { v2_provisiones: { 'i:hz': { t: NOW, explicit: true } } };
  m.readAux = async () => ({ tRemote: JSON.stringify(tomb), rRemote: null, eRemote: JSON.stringify(explicito) });
  await W.writeCollection({ sync, transport: m, profileKey: PK, shortKey: SK, build: (r) => [...r, nueva] });
  const ids = plain(m.row.v).map((x) => x.id);
  assert.equal(ids.includes('hz'), false, 'el borrado en el HTML se respeta');
  assert.equal(ids.includes(nueva.id), true, 'la alta nueva sí se escribe');

  // transporte: lee los tres registros de borrados del mismo perfil en una sola petición
  const seen = [];
  const T = W.supabaseTransport({ base: 'https://x.supabase.co', anonKey: 'anon', token: 'user-jwt', owner: 'b0a89b51-ee34-4b3d-8931-61004550eeaf',
    fetchFn: async (url) => { seen.push(url); return { ok: true, status: 200, json: async () => [{ clave: PREFIX + 'v2_sync_tombstones', v: '{"v2_provisiones":{"i:hz":1}}' }] }; } });
  const aux = await T.readAux(PK);
  assert.equal(seen.length, 1, 'una sola petición');
  for (const k of ['v2_sync_tombstones', 'v2_sync_restores', 'v2_explicit_deletions']) assert(decodeURIComponent(seen[0]).includes(PREFIX + k), 'lee ' + k);
  assert.equal(JSON.parse(aux.tRemote).v2_provisiones['i:hz'], 1);
  assert.equal(aux.rRemote, null, 'sin restauraciones: null');
  console.log('PASS v2.0.80 (borrados): los registros borrados en la nube no vuelven; lectura de borrados en una sola petición');
})().catch((e) => { console.error(e); process.exit(1); });
