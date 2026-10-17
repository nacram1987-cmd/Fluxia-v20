'use strict';
// Arnés de paridad: ejecuta el call() + aplicarMovs() REALES de lab/v97.77.html (extraídos con acorn) sobre el núcleo copiado
// y devuelve qué cargos importaría el HTML. Las funciones que escriben o pintan se sustituyen por registros en memoria.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..', '..', '..');
const acorn = require(path.join(root, 'auditorias/qa-v97.66/node_modules/acorn'));
const loadUmd = require(path.join(__dirname, '..', 'load-umd.cjs'));

function functionSource(html, name) {
 const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
 let m, found = [];
 while ((m = re.exec(html))) {
  let ast; try { ast = acorn.parse(m[1], { ecmaVersion: 'latest' }); } catch (_e) { continue; }
  const code = m[1];
  (function walk(n) {
   if (!n || typeof n.type !== 'string') return;
   if (n.type === 'FunctionDeclaration' && n.id && n.id.name === name) found.push(code.slice(n.start, n.end));
   for (const k of Object.keys(n)) { const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); }
  })(ast);
 }
 const distinct = [...new Set(found)];
 if (distinct.length !== 1) throw new Error('Se esperaba una definición de ' + name + ', hay ' + distinct.length);
 return distinct[0];
}

const HTML = fs.readFileSync(path.join(root, 'lab/v97.77.html'), 'utf8');
const APLICAR = functionSource(HTML, 'aplicarMovs');
const core = loadUmd('../js/fluxia-elite-bank-html-core-v1.js');

// Registra cada asignación de bancoRef: la primera de un cargo creado es su importación; las demás son enlaces.
function trackRefs(item, log, isNew) {
 let value = item.bancoRef;
 Object.defineProperty(item, 'bancoRef', { configurable: true, enumerable: true, get() { return value; }, set(next) { log.push({ item, value: next, isNew, first: isNew && !log.some((x) => x.item === item) }); value = next; } });
 return item;
}

// Devuelve {importados:[ids de cargo], enlazados:[ids], conflictos:[ids]} según el HTML real.
function htmlDecisions(rows, ctx, sync) {
 const env = sync.createEnv(ctx.store || {}, ctx.profileId, ctx.ledger);
 const movimientos = env.movimientos; // la misma lista que ven listaMovs() y las funciones copiadas
 const log = [];
 movimientos.forEach((x) => trackRefs(x, log, false));
 const c = core.create(env);
 const W = c.window, ID = W.FluxiaBankIdentity9770, GV = W.FluxiaGVBorrados;
 let n = 0;
 const sandbox = Object.assign({}, c, {
  window: W, FluxiaGVBorrados: GV, FluxiaBankIdentity9770: ID, FluxiaEsBizumSaliente9621: W.FluxiaEsBizumSaliente9621, MARCA: 2, movimientos, localStorage: env.localStorage, console: env.console,
  clsDiagOut() {}, clsDiag() {}, clsResultado() { return ''; }, clsPendQuitar() {}, mostrarToast() {}, ingMarcarVisto() {}, clsLogPuente() {}, clsEncolar() {},
  intentarAutoReponerDesdeBanco() { return null; }, detectarCategoria() { return null; }, eur(x) { return String(x); },
  procesarIngreso() { return null; },
  registrarGastoVariable(o) { const g = trackRefs({ id: 'nuevo-' + (++n), concepto: o.concepto, categoria: o.categoria, importe: o.importe, fecha: o.fecha }, log, true); movimientos.push(g); return g; }
 });
 vm.createContext(sandbox);
 vm.runInContext(APLICAR, sandbox);
 // call(): plan de identidad (sin apply) y filtro de vetos, igual que el HTML.
 const input = (rows || []).map(sync.serverRow);
 const plan = ID.plan(input);
 const lista = plan.items.filter((m) => !(GV.debeIgnorarBanco(m, m.banco) || c.movimientoBancoVetado(m, m.banco)));
 const ids = new Set((sync && ctx.store && ctx.store.fluxia_banco_ids ? JSON.parse(ctx.store.fluxia_banco_ids) : []).map(String));
 const res = sandbox.aplicarMovs(lista, ids, '');
 const importados = log.filter((x) => x.first).map((x) => String(x.value)).sort();
 const enlazados = log.filter((x) => !x.first).map((x) => String(x.value)).sort();
 return { importados, enlazados, conflictos: plan.conflicts.map((x) => String(x.movement.legacyId || x.movement.id)).sort(), resumen: res };
}

module.exports = { htmlDecisions, functionSource, HTML, core };
