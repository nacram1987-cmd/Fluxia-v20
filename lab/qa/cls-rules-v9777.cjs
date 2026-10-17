'use strict';
// v97.77 (LAB): las reglas «puente» ya no silencian pagos por defecto, una regla nueva puede sustituir a la antigua y hay pantalla para gestionarlas.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const lab = fs.readFileSync(path.join(root, 'lab/v97.77.html'), 'utf8');
const prod = fs.readFileSync(path.join(root, 'lab/v97.73.html'), 'utf8'); // base de la que parte la v97.77
const estable = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// 0. producción intacta y diferencias acotadas
assert(!prod.includes('clsReglasEfectivas') && !estable.includes('clsReglasEfectivas') && !estable.includes('fluxia-v9777-cls-rules'), 'index.html (estable) y v97.73 no se tocan');
assert(lab.includes('<title>Fluxia BETA v97.77-LAB · reglas de clasificación</title>'));
assert(lab.includes('Fluxia-banco-lab9770'), 'mantiene la identidad bancaria nueva de las LAB v97.70+');

const cut = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i + a.length); assert(i > 0 && j > i, a); return src.slice(i, j); };
function load(html, store) {
  const ls = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const ctx = { localStorage: ls, normCat: (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), JSON, Number, Array, String };
  vm.createContext(ctx);
  vm.runInContext(html.match(/const CLS_KEY=[^;]+;/)[0] + html.match(/const CLS_PART=[^;]+;/)[0] + html.match(/const CLS_STOP=[^;]+;/)[0] + cut(html, 'function clsNorm(', 'function clasificar('), ctx);
  return ctx;
}
const KEY = lab.match(/const CLS_KEY="([^"]+)"/)[1];
const REGLAS = [{ t: ['automocon', 'aljarafe'], tipo: 'real', dir: 'out', ts: 1792072855310 }, { t: ['amortizacion', 'cuenta'], tipo: 'propio', dir: '*', ts: 1791054251809 },
  { t: ['jose', 'ignacio', 'ramos', 'ramirez'], tipo: 'puente', dir: '*', ts: 1791130518460 }, { t: ['ana', 'maria', 'sanchez'], tipo: 'puente', dir: '*', ts: 1791130515045 },
  { t: ['enrique', 'javier', 'sanchez', 'can'], tipo: 'puente', dir: '*', ts: 1791297789552 }];
const pago = { concepto: 'Anduriña', contraparte: 'Ana María❤️', importe: -19.4 };
const regla = (ctx, m, d) => ctx.clsRegla(m, d);
const set = (store, r) => { store[KEY] = JSON.stringify(r); };

// 1. sin tocar nada, el comportamiento antiguo se conserva (compatibilidad con los datos actuales)
let store = {}; set(store, REGLAS); let c = load(lab, store);
assert.equal(regla(c, pago, 'out'), 'puente', 'sin regla nueva sigue como antes');
assert.equal(regla(c, { contraparte: 'Ana María Sánchez de la Torre', concepto: 'Transferencia' }, 'in'), 'puente');
assert.equal(regla(c, { contraparte: 'Mercadona', concepto: 'Mercadona' }, 'out'), null);
// idéntico a la base v97.73 con las mismas reglas (misma función original)
store = {}; set(store, REGLAS); const p = load(prod, store);
for (const m of [pago, { contraparte: 'Enrique Javier Sánchez Can' }, { contraparte: 'José Ignacio Ramos Ramírez' }, { concepto: 'ITV Gelves', contraparte: '' }])
  for (const d of ['in', 'out']) assert.equal(regla(c, m, d), regla(p, m, d), 'paridad con la base v97.73 sin reglas nuevas');

// 2. la regla nueva «solo entradas» sustituye a la antigua: el pago deja de ser puente, la entrada sigue siéndolo
store = {}; set(store, [{ t: ['ana', 'maria', 'sanchez'], tipo: 'puente', dir: 'in', ts: 1792300000000, sup: true }, ...REGLAS]); c = load(lab, store);
assert.equal(regla(c, pago, 'out'), null, 'el pago de 19,40 € ya no es puente');
assert.equal(regla(c, pago, 'in'), 'puente', 'las entradas de Ana María siguen siendo puente');
assert.equal(c.clsReglasEfectivas().filter((r) => r.t.join(' ') === 'ana maria sanchez').length, 1, 'solo queda una regla efectiva con esas palabras');
assert.equal(regla(c, { contraparte: 'José Ignacio Ramos Ramírez' }, 'out'), 'puente', 'otras reglas no cambian');

// 3. orden en el array irrelevante (la fusión con la nube concatena listas): gana siempre la más nueva
store = {}; set(store, [...REGLAS, { t: ['ana', 'maria', 'sanchez'], tipo: 'puente', dir: 'in', ts: 1792300000000, sup: true }]); c = load(lab, store);
assert.equal(regla(c, pago, 'out'), null);

// 4. «Quitar» = regla olvidar; una regla posterior con las mismas palabras vuelve a valer
store = {}; set(store, [{ t: ['ana', 'maria', 'sanchez'], tipo: 'olvidar', dir: '*', ts: 1792300000000, sup: true }, ...REGLAS]); c = load(lab, store);
assert.equal(regla(c, pago, 'out'), null); assert.equal(regla(c, pago, 'in'), null);
set(store, [{ t: ['ana', 'maria', 'sanchez'], tipo: 'puente', dir: '*', ts: 1792400000000 }, { t: ['ana', 'maria', 'sanchez'], tipo: 'olvidar', dir: '*', ts: 1792300000000, sup: true }, ...REGLAS]);
assert.equal(regla(load(lab, store), pago, 'out'), 'puente', 'una regla más nueva que la lápida vuelve a aplicarse');

// 4b. reglas «real» con las mismas palabras y distinta dirección conviven (sin sup no se sustituyen)
store = {}; set(store, [{ t: ['bodega', 'altos'], tipo: 'real', dir: 'out', ts: 2 }, { t: ['bodega', 'altos'], tipo: 'puente', dir: 'in', ts: 1 }]); c = load(lab, store);
assert.equal(regla(c, { contraparte: 'Bodega Altos' }, 'out'), 'real'); assert.equal(regla(c, { contraparte: 'Bodega Altos' }, 'in'), 'puente');

// 5. regla creada desde la pantalla de preguntas: «puente» recuerda la dirección del movimiento; «traspaso propio» y «real» como siempre
assert(lab.includes('tipo:tipo,dir:tipo==="propio"?"*":g.dir,ts:Date.now()}'), 'clsResponder: puente por dirección, propio en ambas');
const respSrc = cut(lab, 'function clsResponder(', 'const clsDetAbiertos');
for (const [grupoDir, tipo, esperado] of [['in', 'puente', 'in'], ['out', 'puente', 'out'], ['in', 'propio', '*'], ['out', 'propio', '*'], ['out', 'real', 'out'], ['in', 'real', 'in']]) {
  const guardadas = [];
  const rctx = { clsGrupos: () => [{ dir: grupoDir, tk: ['ana', 'maria'], nombre: 'Ana María' }], clsGrupoKey: () => 'k', clsLeer: () => [], clsGuardar: (a) => guardadas.push(a),
    clsResolverPendientes: () => 0, clsTokens: (x) => String(x).split(' '), clsRefrescar: () => {}, window: {}, Date, JSON };
  vm.createContext(rctx); vm.runInContext(respSrc, rctx);
  assert.equal(rctx.clsResponder('k', tipo), 0);
  assert.equal(guardadas[0][0].dir, esperado, tipo + ' desde grupo ' + grupoDir);
  assert.equal(guardadas[0][0].tipo, tipo);
}
// valores no válidos no guardan nada
{ const g = []; const rctx = { clsGrupos: () => [], clsGrupoKey: () => 'k', clsLeer: () => [], clsGuardar: (a) => g.push(a), window: {} }; vm.createContext(rctx); vm.runInContext(respSrc, rctx); assert.equal(rctx.clsResponder('k', 'otro'), 0); assert.equal(g.length, 0); }
console.log('PASS v97.77: reglas con sustitución por la más nueva, puente por dirección, paridad con la base v97.73');
