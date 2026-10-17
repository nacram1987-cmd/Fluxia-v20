#!/usr/bin/env node
'use strict';
// Genera lab/js/fluxia-elite-bank-html-core-v1.js: copia literal de las funciones del HTML v97.77 que deciden qué cargo bancario
// se importa (identidad, borrados, vetos, cortes, traspasos, reglas y apuntes manuales). Élite las ejecuta con el estado de la nube
// inyectado y sin escrituras. Uso: node lab/tools/build-bank-html-core.cjs [--check]
//   --check  no escribe; termina con error si el archivo publicado no coincide con lo que genera el HTML actual.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const SOURCE = 'lab/v97.77.html';
const TARGET = 'lab/js/fluxia-elite-bank-html-core-v1.js';
const acorn = require(path.join(ROOT, 'auditorias/qa-v97.66/node_modules/acorn'));

// Puntos de entrada que necesita la clasificación de Élite. Sus dependencias se añaden solas.
const ENTRY_FUNCTIONS = ['estáEnBlacklist', 'movimientoBancoVetado', 'validarMovimiento', 'listaMovs', 'pendienteIgual', 'yaExisteManual',
  'leerCorte', 'eraDelCorte', 'corteDeBanco', 'esTraspasoPropio', 'esMovimientoReponerHucha', 'clasificar', 'ingVistos', 'hoyLocal', 'CX_KEY', 'KNOWN_KEY'];
const ENTRY_STATEMENTS = ['window.FluxiaGVBorrados=', 'Object.defineProperty(window,"FluxiaBankIdentity9770"'];
// Nunca se copian: escriben datos, pintan la interfaz o importan movimientos.
const DENY = new Set(['registrarGastoVariable', 'mostrarToast', 'guardarMovimientos', 'guardarIngresos', 'guardarIds', 'guardarEstado', 'clsEncolar',
  'clsDiag', 'clsDiagOut', 'clsLogPuente', 'clsPendQuitar', 'procesarIngreso', 'intentarAutoReponerDesdeBanco', 'pintarEstado', 'renderKPIs',
  'categoriaAprendida', 'detectarCategoria', 'aplicarMovs', 'sincronizar', 'call']);
// Lo aporta el entorno de Élite (window, almacenamiento de solo lectura y datos del libro).
const ENV = new Set(['window', 'localStorage', 'sessionStorage', 'Almacen', 'console', 'document', 'movimientos', 'ingresosItems', 'FLUXIA_PROFILE',
  'APP_MODO', 'LS_PREFIX']);

function inlineScripts(html) {
  const out = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const code = m[1];
    if (!code.trim()) continue;
    try { out.push({ code, ast: acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true }) }); } catch (_e) { /* JSON u otros bloques */ }
  }
  return out;
}

function walk(node, visit, parents = []) {
  if (!node || typeof node.type !== 'string') return;
  visit(node, parents);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit, parents.concat(node)));
    else if (value && typeof value.type === 'string') walk(value, visit, parents.concat(node));
  }
}

const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
// Solo definiciones visibles para el resto del script: nivel superior o dentro de la IIFE que envuelve el script.
const topLevel = (parents) => parents.filter((p) => FUNCTION_TYPES.has(p.type)).length <= 1;

function collect(scripts) {
  const functions = new Map(), declarations = new Map(), statements = new Map();
  scripts.forEach((script, scriptIndex) => {
    walk(script.ast, (node, parents) => {
      if (node.type === 'FunctionDeclaration' && node.id && topLevel(parents)) {
        const list = functions.get(node.id.name) || [];
        list.push({ scriptIndex, text: script.code.slice(node.start, node.end), node });
        functions.set(node.id.name, list);
      }
      if (node.type === 'VariableDeclaration' && topLevel(parents) && !parents.some((p) => /^(For|ForIn|ForOf)Statement$/.test(p.type))) {
        for (const d of node.declarations) if (d.id && d.id.type === 'Identifier') {
          const list = declarations.get(d.id.name) || [];
          list.push({ scriptIndex, text: script.code.slice(node.start, node.end), node });
          declarations.set(d.id.name, list);
        }
      }
      if (node.type === 'ExpressionStatement') {
        const text = script.code.slice(node.start, node.end);
        for (const prefix of ENTRY_STATEMENTS) if (text.startsWith(prefix)) {
          const list = statements.get(prefix) || [];
          list.push({ scriptIndex, text, node });
          statements.set(prefix, list);
        }
      }
    });
  });
  return { functions, declarations, statements };
}

// Identificadores libres: los usados dentro del nodo menos los declarados dentro de él (parámetros, variables, funciones, catch).
function referencedNames(node) {
  const used = new Set(), declared = new Set();
  const declare = (pattern) => walk(pattern, (p, parents) => {
    const parent = parents[parents.length - 1];
    if (p.type === 'Identifier' && !(parent && parent.type === 'Property' && parent.key === p && !parent.shorthand) && !(parent && parent.type === 'AssignmentPattern' && parent.right === p)) declared.add(p.name);
  });
  walk(node, (n, parents) => {
    if (FUNCTION_TYPES.has(n.type)) { if (n.id && n !== node) declared.add(n.id.name); n.params.forEach(declare); }
    if (n.type === 'VariableDeclarator') declare(n.id);
    if (n.type === 'CatchClause' && n.param) declare(n.param);
    if (n.type !== 'Identifier') return;
    const parent = parents[parents.length - 1];
    if (parent && parent.type === 'MemberExpression' && parent.property === n && !parent.computed) return;
    if (parent && parent.type === 'Property' && parent.key === n && !parent.computed && !parent.shorthand) return;
    used.add(n.name);
  });
  return new Set([...used].filter((name) => !declared.has(name)));
}

function unique(list, name, bankScript) {
  if (!list || !list.length) return null;
  const distinct = [...new Map(list.map((x) => [x.text, x])).values()];
  if (distinct.length === 1) return distinct[0];
  const inBank = distinct.filter((x) => x.scriptIndex === bankScript);
  if (inBank.length === 1) return inBank[0];
  throw new Error('Definición ambigua en ' + SOURCE + ': ' + name + ' (' + distinct.length + ')');
}

function build() {
  const html = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
  const scripts = inlineScripts(html);
  const bankScript = scripts.findIndex((s) => s.code.includes('functions/v1/Fluxia-banco-lab9770'));
  if (bankScript < 0) throw new Error('No se encuentra el conector bancario en ' + SOURCE);
  const bizum = scripts.find((s) => s.code.includes('window.FluxiaEsBizumSaliente9621=function'));
  if (!bizum) throw new Error('No se encuentra FluxiaEsBizumSaliente9621');
  const { functions, declarations, statements } = collect(scripts);
  const chosenFunctions = new Map(), chosenDecls = new Map(), queue = [];
  const visit = (node) => referencedNames(node).forEach((name) => queue.push(name));
  for (const prefix of ENTRY_STATEMENTS) {
    // Solo la sentencia más exterior: el getter de FluxiaBankIdentity9770 contiene otra con el mismo inicio.
    const all = statements.get(prefix) || [];
    const list = all.filter((x) => !all.some((y) => y !== x && y.scriptIndex === x.scriptIndex && y.node.start <= x.node.start && y.node.end >= x.node.end));
    if (list.length !== 1) throw new Error('Se esperaba una sola sentencia ' + prefix);
    statements.set(prefix, list);
    visit(list[0].node);
  }
  ENTRY_FUNCTIONS.forEach((name) => queue.push(name));
  while (queue.length) {
    const name = queue.shift();
    if (ENV.has(name) || DENY.has(name) || chosenFunctions.has(name) || chosenDecls.has(name)) continue;
    const fn = unique(functions.get(name), name, bankScript);
    if (fn) { chosenFunctions.set(name, fn); visit(fn.node); continue; }
    const decl = unique(declarations.get(name), name, bankScript);
    if (decl && (decl.scriptIndex === bankScript || decl.node.declarations.every((d) => d.init && /Literal|NewExpression|RegExp/.test(d.init.type)))) {
      if ([...chosenDecls.values()].some((x) => x.text === decl.text)) { chosenDecls.set(name, decl); continue; }
      chosenDecls.set(name, decl); visit(decl.node);
    }
  }
  const order = (a, b) => (a.scriptIndex - b.scriptIndex) || (a.node.start - b.node.start);
  const decls = [...new Map([...chosenDecls.values()].sort(order).map((x) => [x.text, x])).values()];
  const fns = [...chosenFunctions.entries()].sort((a, b) => order(a[1], b[1]));
  const parts = [];
  parts.push('// GENERADO por lab/tools/build-bank-html-core.cjs a partir de ' + SOURCE + '. No editar a mano: regenerar con la herramienta.');
  parts.push('// Copia literal de las funciones del HTML que deciden si un cargo bancario se importa. Élite las ejecuta con el estado de la nube');
  parts.push('// inyectado en `env`; el almacenamiento del entorno no persiste nada (las escrituras quedan en memoria durante una clasificación).');
  parts.push('(function(root){');
  parts.push('function create(env){');
  parts.push('var window=env.window,localStorage=env.localStorage,sessionStorage=env.sessionStorage,Almacen=env.Almacen,console=env.console,document=env.document,JSON=env.JSON||globalThis.JSON;');
  parts.push('var movimientos=env.movimientos,ingresosItems=env.ingresosItems,FLUXIA_PROFILE=window.FLUXIA_PROFILE,APP_MODO="real",LS_PREFIX="v2_";');
  parts.push('// --- declaraciones copiadas ---');
  decls.forEach((d) => parts.push(d.text));
  parts.push('// --- funciones copiadas ---');
  fns.forEach(([, f]) => parts.push(f.text));
  parts.push('// --- módulos copiados (en el HTML son globales; aquí se enlazan con el window del entorno) ---');
  parts.push('var FluxiaGVBorrados,FluxiaBankIdentity9770,FluxiaSync954=window.FluxiaSync954;');
  for (const prefix of ENTRY_STATEMENTS) parts.push(statements.get(prefix)[0].text + ';');
  parts.push(bizum.code.trim());
  parts.push('FluxiaGVBorrados=window.FluxiaGVBorrados;FluxiaBankIdentity9770=window.FluxiaBankIdentity9770;');
  parts.push('return {window:window,' + fns.map(([name]) => JSON.stringify(name) + ':' + name).join(',') + '};');
  parts.push('}');
  parts.push('var api={source:' + JSON.stringify(SOURCE) + ',functions:' + JSON.stringify(fns.map(([name]) => name)) + ',create:create};');
  parts.push("if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FluxiaEliteBankHtmlCore=api;");
  parts.push("})(typeof globalThis!=='undefined'?globalThis:this);");
  return { text: parts.join('\n') + '\n', functions: fns.map(([n]) => n), declarations: decls.map((d) => d.node.declarations.map((x) => x.id.name).join(',')) };
}

if (require.main === module) {
  const result = build();
  const target = path.join(ROOT, TARGET);
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (current !== result.text) { console.error('El núcleo bancario no coincide con ' + SOURCE + '. Regenera con node lab/tools/build-bank-html-core.cjs'); process.exit(1); }
    console.log('OK: ' + TARGET + ' coincide con ' + SOURCE + ' (' + result.functions.length + ' funciones)');
  } else {
    fs.writeFileSync(target, result.text);
    console.log('Escrito ' + TARGET + ': ' + result.functions.length + ' funciones, ' + result.declarations.length + ' declaraciones');
    console.log('Funciones: ' + result.functions.join(', '));
    console.log('Declaraciones: ' + result.declarations.join(' | '));
  }
}
module.exports = { build, SOURCE, TARGET };
