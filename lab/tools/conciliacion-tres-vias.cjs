#!/usr/bin/env node
'use strict';
/* Conciliación de tres vías HTML ↔ Supabase ↔ Élite sobre UNA instantánea (solo lectura).
 *
 * Uso:
 *   node lab/tools/conciliacion-tres-vias.cjs --snapshot instantanea.json --html lab/v97.73.html \
 *        --mes octubre --periodo 2026-10 --perfil usr-… [--rescue-links vinculos.json] --out ./informe-privado
 *
 *  --snapshot  {corte, rows:[{clave, v, t, updated_at}]} con las filas de public.fluxia_datos del usuario (privado: NO subir).
 *  --html      versión del HTML cuyo motor se ejecuta tal cual (JSDOM, sin red). No se modifica.
 *  --perfil    id del perfil (sin prefijo). Se usan solo las claves profile:<perfil>:… (las que leen el HTML y Élite).
 *
 * Qué hace: 1) arranca el HTML real con esas claves en su almacenamiento local y pide a SUS funciones la contribución
 * de cada partida al Disponible; 2) ejecuta el motor real de Élite sobre las mismas colecciones; 3) cruza partida a
 * partida por id con el efecto CON SIGNO sobre el Disponible. No usa red, no lee credenciales y no escribe en Supabase.
 * Salida: informe-privado.json (ids reales) e informe-publico.json (seudónimos). Código de salida 0 solo si Δ = 0 y
 * no hay diferencias.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');

function arg(name, fallback) { const i = process.argv.indexOf('--' + name); return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : fallback; }
function fail(m) { console.error('ERROR: ' + m); process.exit(2); }

const MODULOS_ELITE = { ingresos: 'planRescate_v2_ingresos', fijos: 'planRescate_v2_fijos', movimientos: 'planRescate_v2_movimientos', provisiones: 'planRescate_v2_provisiones', compartidos: 'planRescate_v2_compartidos', financiaciones: 'planRescate_v2_financiaciones' };
const EXTRA = ['usos', 'efectivo', 'historico', 'presupuestos', 'fin_pagos_historico', 'config_plan'];

function clavesPerfil(snapshot, perfil) {
  const pre = 'profile:' + perfil + ':', out = {};
  for (const r of snapshot.rows || []) if (r && typeof r.clave === 'string' && r.clave.startsWith(pre)) out[r.clave.slice(pre.length)] = r;
  return out;
}

// Exportación con el formato que consume el motor de Élite, construida SOLO con las colecciones del perfil.
function exportacionElite(snapshot, perfil, userId, periodo) {
  const k = clavesPerfil(snapshot, perfil), sources = {}, updated = {};
  for (const [c, key] of Object.entries(MODULOS_ELITE)) {
    const r = k['v2_' + c];
    if (!r) throw new Error('Falta la colección v2_' + c + ' del perfil');
    sources[key] = { available: true, records: JSON.parse(r.v) }; updated[key] = r.updated_at || null;
  }
  for (const c of EXTRA) { const r = k['v2_' + c]; if (r) sources['planRescate_v2_' + c] = { available: true, value: JSON.parse(r.v) }; }
  const corte = new Date(Date.parse(snapshot.corte)).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return { format: 'fluxia-elite-cloud-readonly-v1', user_id: userId, profile_key: 'p_' + perfil + '__', exported_at: corte, accounting_month: periodo, source_updated: updated, sources };
}

// Contribución por partida calculada DENTRO del HTML con sus propias funciones.
const CODIGO_HTML = (mes) => `(function(mes){var c=function(x){return Math.round((Number(x)||0)*100)};var out={ingresos:[],fijos:[],financiaciones:[],provisiones:[],variables:[],compartidosCents:c(impactoCajaCompartidosMes(mes))};
 (ingresosDe(mes)||[]).forEach(function(it){out.ingresos.push({id:String(it.id),cuenta:!!fxIngresoCuentaDisponible(it),cents:c(it.importe)})});
 fijosDe(mes).filter(function(it){return it&&it.tipo!=="puente"}).forEach(function(f){var real=null;var cand=(movimientos||[]).filter(function(mv){return mv&&mv.mes===mes&&mv.cuentaComoFijo===true&&String(mv.vinculoFijoId||"")===String(f.id||"")&&!mv.excluido});if(cand.length){cand.sort(function(a,b){var ab=a.bancoRef?1:0,bb=b.bancoRef?1:0;if(ab!==bb)return bb-ab;return String(b.fecha||"").localeCompare(String(a.fecha||""))});real=Math.abs(Number(cand[0].importe)||0)}out.fijos.push({id:String(f.id),cents:c(real!==null?real:f.importe)})});
 out.financiacionesTotalCents=c(financiacionesTotal(mes));
 (typeof financiacionesActivas==="function"?financiacionesActivas(mes):[]).forEach(function(f){out.financiaciones.push({id:String(f.id),cents:c(f.cuota)})});
 provisionesActivas(mes).forEach(function(p){var prev=Math.max(0,Number(p.importeMensual)||0),ap=Math.max(0,Number(totalAportadoProvision(p,mes))||0);out.provisiones.push({id:String(p.id),cents:c(prev+Math.max(0,ap-prev))})});
 movimientosDe(mes).forEach(function(m){out.variables.push({id:String(m.id),cents:c(m.importe)})});
 out.breakdown=FluxiaDisponibleEngine.breakdown(mes);out.cargados=movimientos.length;return out})(${JSON.stringify(mes)})`;

function libroHTML(htmlPath, snapshot, perfil, mes, esperaMs = 4500) {
  const req = require('node:module').createRequire(path.join(root, 'auditorias/qa-v97.66/package.json'));
  const { JSDOM, VirtualConsole } = req('jsdom');
  const { indexedDB, IDBKeyRange } = req('fake-indexeddb');
  const html = fs.readFileSync(htmlPath, 'utf8'), k = clavesPerfil(snapshot, perfil), LP = 'fluxia_user_' + perfil + '__';
  const p = { id: perfil, name: 'Perfil', createdAt: 0, legacy: false, principal: true };
  const errores = [], vc = new VirtualConsole(); vc.on('jsdomError', (e) => errores.push(String(e.message).slice(0, 160)));
  const dom = new JSDOM(html, { url: 'https://nacram1987-cmd.github.io/Fluxia-v20/' + path.relative(root, htmlPath), runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.indexedDB = indexedDB; w.IDBKeyRange = IDBKeyRange; w.fetch = async () => { throw new Error('sin red'); };
      w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      for (const key of ['fluxia_profile_v2', 'fluxia_profile_active_v2']) w.localStorage.setItem(key, JSON.stringify(p));
      w.localStorage.setItem('fluxia_profiles_v2', JSON.stringify([p]));
      for (const [name, r] of Object.entries(k)) w.localStorage.setItem(LP + name, r.v);
    } });
  return new Promise((resolve) => setTimeout(() => {
    let out; try { out = dom.window.eval(CODIGO_HTML(mes)); } catch (e) { out = { fallo: String(e.message || e) }; }
    out.erroresJS = errores.slice(0, 5); out.arch = dom.window.FLUXIA_ARCH_VERSION || null;
    try { dom.window.close(); } catch (_) {}
    resolve(out);
  }, esperaMs));
}

function libroElite(exp, periodo, enlaces) {
  const { loadEliteFunctions, MODS } = require(path.join(root, 'lab/qa/lib/elite-html-functions.cjs'));
  const S = loadEliteFunctions({ owner: exp.user_id, activeProfile: exp.profile_key, selectedMonth: periodo, rescueIdentityLinks: enlaces || new Map() });
  const c = S.context;
  c.items = {}; for (const m of MODS.filter((m) => m.key)) c.items[m.key] = exp.sources[m.key].records;
  c.extraFinance = {}; for (const [key, s] of Object.entries(exp.sources)) if (s.value !== undefined) c.extraFinance[key] = s.value;
  c.cloudReadAt = exp.exported_at; c.cloudFinanceSnapshot = { owner: exp.user_id, profile: exp.profile_key, complete: true };
  return S.api.availableCalculationReport();
}

// Cruce por id con el efecto con signo sobre el Disponible (un gasto resta; una devolución en Variables suma).
function cruzar(h, e) {
  // Élite puede repartir una partida en varias líneas (p. ej. provisión prevista «id» y su exceso «id#exceso»): se agrupan por id base.
  const E = {}; for (const x of e.ledger || []) { const base = String(x.id).split('#')[0], m = (E[x.module] = E[x.module] || {}); m[base] = (m[base] || 0n) + BigInt(x.impactCents || 0); }
  const spec = [['ingresos', (h.ingresos || []).filter((x) => x.cuenta), 'ingresos', 1n], ['fijos', h.fijos, 'fijos', -1n], ['financiaciones', h.financiaciones, 'financiaciones', -1n], ['variables', h.variables, 'variables', -1n], ['provisiones', h.provisiones, 'huchas', -1n]];
  const modulos = {}, diferencias = []; let totalH = 0n, totalE = 0n;
  for (const [mod, items, emod, signo] of spec) {
    const eL = Object.fromEntries(Object.entries(E[emod] || {}).filter(([, v]) => v !== 0n));
    const hL = Object.fromEntries((items || []).filter((x) => x.cents !== 0).map((x) => [x.id, signo * BigInt(x.cents)]));
    const sH = Object.values(hL).reduce((a, b) => a + b, 0n), sE = Object.values(eL).reduce((a, b) => a + b, 0n);
    for (const id of Object.keys(hL)) { if (!(id in eL)) diferencias.push({ modulo: mod, tipo: 'falta en Élite', id, html: String(hL[id]) }); else if (hL[id] !== eL[id]) diferencias.push({ modulo: mod, tipo: 'importe distinto', id, html: String(hL[id]), elite: String(eL[id]) }); }
    for (const id of Object.keys(eL)) if (!(id in hL)) diferencias.push({ modulo: mod, tipo: 'sobra en Élite', id, elite: String(eL[id]) });
    modulos[mod] = { partidasHTML: Object.keys(hL).length, partidasElite: Object.keys(eL).length, efectoHTML: String(sH), efectoElite: String(sE), delta: String(sH - sE) };
    totalH += sH; totalE += sE;
  }
  const compE = Object.values(E.compartidos || {}).reduce((a, b) => a + b, 0n), compH = BigInt(h.compartidosCents || 0);
  modulos.compartidos = { efectoHTML: String(compH), efectoElite: String(compE), delta: String(compH - compE) };
  totalH += compH; totalE += compE;
  // Rescates temporales pendientes: algunas versiones del HTML los suman al Disponible; Élite los muestra solo como información.
  const resH = BigInt(Math.round(Number(h.breakdown && h.breakdown.rescatesHucha || 0) * 100));
  if (resH !== 0n) { modulos.rescatesPendientes = { efectoHTML: String(resH), efectoElite: '0', delta: String(resH), nota: 'regla de versión del HTML: suma rescates temporales pendientes' }; totalH += resH; diferencias.push({ modulo: 'rescatesPendientes', tipo: 'regla distinta', id: 'regla', html: String(resH), elite: '0' }); }
  return { modulos, diferencias, disponibleHTML: String(totalH), disponibleElite: String(totalE), delta: String(totalH - totalE) };
}

function seudonimo(id) { return '#' + crypto.createHash('sha256').update('fx-' + String(id)).digest('hex').slice(0, 8); }

async function main() {
  const snapPath = arg('snapshot'), htmlPath = arg('html'), mes = arg('mes', 'octubre'), periodo = arg('periodo', '2026-10'), perfil = arg('perfil'), out = arg('out', './informe-conciliacion'), linksPath = arg('rescue-links');
  if (!snapPath || !htmlPath || !perfil) fail('Uso: --snapshot <json> --html <archivo> --perfil <id> [--mes octubre --periodo 2026-10 --rescue-links <json> --out carpeta]');
  const snapshot = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
  const userId = arg('usuario', 'usuario-de-la-instantanea');
  const exp = exportacionElite(snapshot, perfil, userId, periodo);
  const enlaces = new Map();
  if (linksPath) for (const l of JSON.parse(fs.readFileSync(linksPath, 'utf8'))) { if (l.profile_id && l.profile_id !== perfil) fail('Vínculo de otro perfil'); if (!enlaces.has(l.operation_id)) enlaces.set(l.operation_id, l); }
  const h = await libroHTML(path.resolve(htmlPath), snapshot, perfil, mes);
  if (h.fallo) fail('El HTML no pudo calcular: ' + h.fallo);
  const e = libroElite(exp, periodo, enlaces);
  if (!e.ok) fail('Élite no pudo calcular: ' + (e.blockers || []).join(' · '));
  const r = cruzar(h, e);
  const disponibleMotorHTML = String(Math.round(h.breakdown.total * 100)), disponibleMotorElite = String(e.cents);
  const priv = { corte: snapshot.corte, html: path.relative(root, path.resolve(htmlPath)), arch: h.arch, mes, periodo, disponibleMotorHTML, disponibleMotorElite, ...r, rescatesPendientesInformativosElite: String(e.trace.pendingHuchaRescuesCents), erroresJS: h.erroresJS };
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'informe-privado.json'), JSON.stringify(priv, null, 1));
  const pub = { ...priv, diferencias: r.diferencias.map((d) => ({ ...d, id: seudonimo(d.id) })) };
  fs.writeFileSync(path.join(out, 'informe-publico.json'), JSON.stringify(pub, null, 1));
  const ok = r.delta === '0' && r.diferencias.length === 0 && disponibleMotorHTML === disponibleMotorElite && disponibleMotorHTML === r.disponibleHTML;
  console.log((ok ? 'COINCIDE' : 'DIFERENCIAS') + ' · Disponible HTML ' + disponibleMotorHTML + ' · Élite ' + disponibleMotorElite + ' (céntimos) · diferencias: ' + r.diferencias.length);
  for (const [m, v] of Object.entries(r.modulos)) console.log('  ' + m + ': Δ ' + v.delta + (v.partidasHTML !== undefined ? ' · partidas ' + v.partidasHTML + '/' + v.partidasElite : ''));
  process.exit(ok ? 0 : 1);
}

if (require.main === module) main().catch((e) => fail(e.stack || e.message));
module.exports = { exportacionElite, cruzar, clavesPerfil, libroHTML, libroElite };
