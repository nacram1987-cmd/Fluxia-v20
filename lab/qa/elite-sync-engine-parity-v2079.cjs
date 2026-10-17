'use strict';
// Fase 1 de la escritura bidireccional: el motor de fusión de la nube es una copia exacta del HTML y se comporta igual en casos sintéticos.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const mod = fs.readFileSync(path.join(root, 'lab', 'js', 'fluxia-sync-engine-v1.js'), 'utf8');
const seg = mod.slice(mod.indexOf('window.FluxiaSync954=function'), mod.lastIndexOf('}();') + 4);

// 1. una sola fuente: el bloque del módulo aparece literalmente en el HTML estable
assert(html.includes(seg), 'el módulo debe ser idéntico al bloque de index.html');

// 2. comportamiento con almacenamiento en memoria (sintético)
const store = {};
const Almacen = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
const win = {};
const ctx = vm.createContext({ window: win, Almacen, console });
vm.runInContext(seg, ctx);
const E = win.FluxiaSync954;
assert(E && typeof E.mergeCloudValue === 'function', 'exporta mergeCloudValue');

const K = 'v2_provisiones';
const merge = (local, remote, extra = {}) => JSON.parse(E.mergeCloudValue(K, JSON.stringify(local), JSON.stringify(remote), extra.tl ?? null, extra.tr ?? null, extra.rl ?? null, extra.rr ?? null, extra.el ?? null, extra.er ?? null));

// a) unión por id: lo que hay en un lado y no en el otro se conserva
const a = { id: 'a', nombre: 'Agua', importeMensual: 67, _fxUpdatedAt: 100, aportaciones: {} };
const b = { id: 'b', nombre: 'Renta', importeMensual: 164, _fxUpdatedAt: 100, aportaciones: {} };
assert.deepEqual(merge([a], [b]).map((x) => x.id).sort(), ['a', 'b'], 'union por id');

// b) gana la versión más reciente del mismo id
const aNew = { ...a, importeMensual: 70, _fxUpdatedAt: 200 };
assert.equal(merge([a], [aNew])[0].importeMensual, 70, 'la marca más reciente gana');
assert.equal(merge([aNew], [a])[0].importeMensual, 70, 'independiente del orden');

// c) un borrado registrado no resucita aunque el otro lado lo tenga
E.registerDelete(K, a, {});
const merged = merge([], [a]);
assert.equal(merged.some((x) => x.id === 'a'), false, 'el borrado impide la resurrección');

// d) aportaciones de la misma provisión se unen por id, sin duplicar
const p1 = { id: 'p', nombre: 'Seguro', importeMensual: 50, _fxUpdatedAt: 100, aportaciones: { octubre: [{ id: 'x1', fecha: '2026-10-01', importe: 50 }] } };
const p2 = { id: 'p', nombre: 'Seguro', importeMensual: 50, _fxUpdatedAt: 100, aportaciones: { octubre: [{ id: 'x1', fecha: '2026-10-01', importe: 50 }, { id: 'x2', fecha: '2026-10-15', importe: 20 }] } };
const u = merge([p1], [p2]);
assert.equal(u.length, 1);
const oct = u[0].aportaciones.octubre.map((x) => x.id).sort();
assert.deepEqual(oct, ['x1', 'x2'], 'aportaciones unidas sin duplicados');

// e) claves que no son colecciones protegidas se devuelven tal cual
assert.equal(E.mergeCloudValue('v2_preferencias', '{"x":1}', '{"x":2}', null, null, null, null, null, null), '{"x":1}', 'clave no protegida: sin fusión');

console.log('PASS v2.0.79 (fase 1): motor de fusión idéntico al HTML y con el mismo comportamiento en casos sintéticos');
