'use strict';
// v2.0.96/v2.0.97: Bancos muestra el estado bancario sin inventar la última consulta del HTML.
// v2.0.98 (cambio explícito): la copia espejo v2_espejo__fluxia_banco_estado dejó de usarse porque el HTML moderno no la actualiza;
// la antigüedad se toma por banco de ultima_sync_fondo, que guarda el servidor en cada lectura de cualquier app (HTML o Élite).
// Se conservan los invariantes: sin dato no se inventan cifras, la antigüedad sola no es alarma, el límite diario y los errores se
// destacan y el texto dice qué mide. Se añaden la lectura al abrir (una sola, con el usuario presente) y la hora del dispositivo.
process.env.TZ = 'Atlantic/Canary';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const loadUmd = require('./load-umd.cjs');
const html = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');

assert(!html.includes('v2_espejo__fluxia_banco_estado'), 'la copia espejo del estado (sin actualizar por el HTML moderno) ya no se usa');
assert(html.includes('d.append(actions,state,bankAutoSyncLine());'), 'la pantalla de bancos muestra la lectura automática');
assert(html.includes("try{scheduleBankReconcile();scheduleBankAutoSync('carga',4000)}catch(_e){}"), 'la lectura al abrir va fuera de la ruta crítica y nunca impide cargar el perfil');

const start = html.indexOf('// v2.0.98: conciliación y sincronización bancaria');
const end = html.indexOf('async function runBankConnector(');
assert(start > 0 && end > start, 'bloque bancario localizado');
const rowStart = html.indexOf('function bankRowLine(x){');
const rowEnd = html.indexOf('function resolveBankConflict(', rowStart);
assert(rowStart > 0 && rowEnd > rowStart, 'línea de cargo localizada');
const block = html.slice(start, end) + html.slice(rowStart, rowEnd);
assert(!/timeZone\s*:/.test(block), 'las horas bancarias usan la zona del dispositivo');

// Navegador mínimo: almacenamiento, nodos y eventos.
const memory = new Map();
const storage = { getItem: (k) => (memory.has(k) ? memory.get(k) : null), setItem: (k, v) => memory.set(k, String(v)), removeItem: (k) => memory.delete(k) };
globalThis.localStorage = storage;
loadUmd('../js/fluxia-elite-bank-html-core-v1.js');
const sync = loadUmd('../js/fluxia-elite-bank-sync-v1.js');
const realConnector = loadUmd('../js/fluxia-elite-bank-connector-v1.js');
assert.equal(realConnector.endpoint('bandeja'), '/functions/v1/Fluxia-banco-lab9770', 'los movimientos se leen con la identidad completa del HTML v97.77');
assert.equal(realConnector.endpoint('estado'), '/functions/v1/Fluxia-banco', 'el estado sigue en la función de Élite (solo base de datos)');

const node = (tag, cls, text) => ({ tag, cls: cls || '', id: '', textContent: text == null ? '' : String(text), children: [], append(...c) { this.children.push(...c); }, replaceChildren(...c) { this.children = c; } });
const textOf = (n) => (n ? [n.textContent, ...n.children.map(textOf)].join(' ') : '');
const find = (n, test) => { if (!n) return null; if (test(n)) return n; for (const c of n.children) { const hit = find(c, test); if (hit) return hit; } return null; };
const listeners = [];
const roots = { detail: node('div'), content: node('div') };
const documentStub = { visibilityState: 'visible', addEventListener: (type, fn) => listeners.push(['document', type, fn]), getElementById: (id) => find(roots.detail, (n) => n.id === id) || find(roots.content, (n) => n.id === id) };
const windowStub = { addEventListener: (type, fn) => listeners.push(['window', type, fn]), FluxiaEliteBankHtmlCore: globalThis.FluxiaEliteBankHtmlCore, FluxiaEliteBankSync: sync };

const iso = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString();
const settle = () => new Promise((resolve) => setImmediate(resolve));
const PID = 'usr-11111111-2222-3333-4444-555555555555';
const calls = [];
let estado = null, bandeja = null, failBandeja = null, onBandeja = null;
const connector = Object.assign({}, realConnector, {
 configure() {},
 async call(action, body) {
  calls.push([action, body]);
  if (action === 'estado') return estado;
  if (failBandeja) throw Error(failBandeja);
  if (onBandeja) await onBandeja();
  return bandeja;
 }
});
windowStub.FluxiaEliteBankConnector = connector;
const sandbox = {
 window: windowStub, document: documentStub, navigator: { onLine: true }, localStorage: storage,
 activeProfile: 'p_' + PID + '__', owner: 'owner-1', token: 'jwt', cloudReadAt: 'r1', BASE: 'https://x', KEY: 'k', selectedMonth: new Date().toISOString().slice(0, 7),
 page: 'inicio', navigated: [], navigateElite(id) { sandbox.navigated.push(id); sandbox.page = id; }, monthStatus: (o, ym) => (String(o.fecha || '').slice(0, 7) === ym ? 'match' : 'other'),
 extraFinance: { ['v2_espejo__fluxia_banco_conexiones_v1_' + PID]: [{ banco: 'Revolut', cuentas: [{ uid: 'uid-kRev', nombre: 'Titular' }] }] },
 mods: [{ id: 'variables', rows: [] }, { id: 'ingresos', rows: [] }], canon: (m) => (m ? m.rows : []), money: (x) => x.toFixed(2).replace('.', ',') + ' €',
 el: node, $: (q) => (q === '#detailContent' ? roots.detail : roots.content), openDetailSheet() {}, ensureFreshToken: async () => {},
 renderBankInboxRows: () => node('section'), renderBankBalances: () => node('section'), renderBankAdapterReadiness: () => node('section'), renderBankFixedReview: () => node('section')
};
const load = () => new Function('sandbox', 'with(sandbox){' + block + ';sandbox.api={runBankAutoSync,bankAutoSyncLine,showBanksAudit,bankReconciliation,bankBannerHost,readBankAutoSync,saveBankAutoSync,flight:()=>bankAutoSyncFlight}}')(sandbox);
load();
load();
assert.equal(listeners.filter(([t, type]) => t === 'document' && type === 'visibilitychange').length, 1, 'un solo listener de vuelta a la app');
assert.equal(listeners.filter(([t, type]) => t === 'window' && type === 'online').length, 1, 'un solo listener de conexión');
const api = sandbox.api;
const reset = () => { calls.length = 0; storage.removeItem('fluxia_elite_bank_autosync_v1:owner-1:' + encodeURIComponent(sandbox.activeProfile)); };

const conexion = (o) => Object.assign({ banco: 'Revolut', valido_hasta: new Date(Date.now() + 30 * 864e5).toISOString(), cuentas: [{ uid: 'uid-kRev' }], permiso_valido: true, operativo: true, ultima_sync_fondo: iso(20), ultimo_error: null, limite_diario: false }, o);
const caixaLimitada = conexion({ banco: 'CaixaBank', cuentas: [{ uid: 'uid-kC1' }], ultima_sync_fondo: '2026-10-17T09:12:00Z', ultimo_error: 'HUB046: límite de consultas de hoy. Los datos ya cargados siguen. Prueba mañana.', limite_diario: true, operativo: false });
const cargo = { id: 'tx-1', legacyId: 'tx-1', stableRef: 'tx-1', idAuthority: 'provider', provider: 'enablebanking', accountKey: 'kRev', accountId: 'uid-kRev', accountKeyKind: 'iban-digest', fecha: new Date().toISOString().slice(0, 10), importe: -7.5, concepto: 'Gasolinera', contraparte: '', banco: 'Revolut', moneda: 'EUR', pendiente: true };

(async () => {
 // Sin dato: no se inventan cifras ni horas.
 let line = api.bankAutoSyncLine();
 assert.equal(line.cls, 'periodHint bankFreshness');
 assert.match(line.textContent, /lee tus bancos al abrirse si nadie lo ha hecho en los últimos 12 minutos \(HTML o Élite\)/);
 assert(!/\d/.test(line.textContent.replace('12', '')), 'sin cifras inventadas');

 // Lectura al abrir: un estado + una bandeja con el usuario presente y la lista negra del HTML; dos peticiones a la vez comparten la lectura.
 estado = { conexiones: [conexion({}), caixaLimitada] };
 bandeja = { movimientos: [cargo], por_banco: { Revolut: 1, CaixaBank: 0 }, avisos: 'CaixaBank: HUB046: límite de consultas de hoy', cortes: { Revolut: '2026-09-28' } };
 const a = api.runBankAutoSync('carga'), b = api.runBankAutoSync('vuelta');
 assert.equal(a, b, 'una sola lectura en curso');
 assert.equal((await a).read, true);
 assert.deepEqual(calls.map(([action]) => action), ['estado', 'bandeja']);
 const body = calls[1][1];
 assert.equal(body.presente, true, 'lectura con el usuario presente: no gasta el cupo automático');
 assert(Array.isArray(body.blacklist), 'envía la lista negra unida del HTML');
 assert.equal(body.perfil, sandbox.activeProfile);
 let saved = api.readBankAutoSync();
 assert.equal(saved.reason, 'leido');
 assert.equal(saved.nuevos, 1);
 const inbox = realConnector.readInboxState('owner-1', sandbox.activeProfile);
 assert.equal(inbox.rows.length, 1);
 assert(inbox.rows[0].bankRef.startsWith('fxbank9770:'), 'la bandeja guarda la identidad completa');
 assert.match(api.bankAutoSyncLine().textContent, /Élite leyó tus bancos hace menos de 1 min · 1 cargo nuevo/);
 // Aviso de Inicio: lleva a Variables, donde se despliega la lista (Bancos no la repite, v2.0.65).
 let banner = api.bankBannerHost();
 assert.match(textOf(banner), /1 cargo nuevo del banco · 7,50 €/);
 assert.match(textOf(banner), /No suman todavía a ningún total\. Toca para verlos en Variables/);
 assert(!/Gasolinera/.test(textOf(banner)), 'en Inicio no se lista el cargo');
 find(banner, (n) => n.cls === 'eliteBankBanner').onclick();
 assert.deepEqual(sandbox.navigated, ['variables']);
 banner = api.bankBannerHost();
 assert.match(textOf(banner), /⏳ Gasolinera/, 'en Variables se ve el cargo, aún sin asentar');
 assert.match(textOf(banner), /Revolut · Cargo nuevo, aún sin asentar por el banco/);
 assert.match(textOf(banner), /− 7,50 €/);
 find(banner, (n) => n.cls === 'eliteBankBanner').onclick();
 assert(!/Gasolinera/.test(textOf(api.bankBannerHost())), 'se puede plegar');
 sandbox.selectedMonth = '2020-01';
 assert.equal(api.bankBannerHost().children.length, 0, 'otro mes: sin aviso');
 sandbox.selectedMonth = new Date().toISOString().slice(0, 7);
 sandbox.page = 'inicio';

 // Volver enseguida no repite nada: ni estado ni bandeja.
 calls.length = 0;
 assert.equal((await api.runBankAutoSync('vuelta')).reason, 'intento-reciente');
 assert.equal(calls.length, 0);
 api.saveBankAutoSync({ ...api.readBankAutoSync(), lastAttemptAt: Date.now() - 5 * 60000 });
 assert.equal((await api.runBankAutoSync('vuelta')).reason, 'reciente');
 assert.equal(calls.length, 0, 'su propia lectura cuenta 12 min');

 // Bancos: una línea por banco con la hora del servidor en la del dispositivo; la antigüedad sola no es alarma; límite destacado.
 // Tras una lectura, el estado se vuelve a pedir al servidor (la hora en caché sería la de antes de leer).
 calls.length = 0;
 api.showBanksAudit();
 await settle();
 assert.deepEqual(calls.map(([action]) => action), ['estado'], 'la hora de lectura se pide de nuevo al servidor tras leer');
 calls.length = 0;
 api.showBanksAudit();
 await settle();
 assert.equal(calls.length, 0, 'durante 60 s se reutiliza el estado ya consultado');
 const states = find(roots.detail, (n) => n.cls === 'bankConnectionStates');
 const lines = states.children.map((n) => [n.cls, n.textContent]);
 const revolut = lines.find(([, t]) => t.includes('Revolut'));
 const clock = (v) => new Date(v).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
 assert.equal(revolut[0], 'legacySuccess');
 assert(revolut[1].includes('✓ Revolut — conectado · 1 cuenta(s) · leído hace 20 min (' + clock(estado.conexiones[0].ultima_sync_fondo) + ')'), revolut[1]);
 const caixa = lines.find(([, t]) => t.includes('CaixaBank'));
 assert.equal(caixa[0], 'bankAlert', 'límite diario: aviso destacado');
 assert(caixa[1].includes('⏸️ CaixaBank — límite diario del banco (vuelve mañana)'), caixa[1]);
 assert(caixa[1].includes('(10:12)'), 'hora de Canarias, no de Madrid: ' + caixa[1]);
 assert(lines.some(([, t]) => /La hora de lectura la guarda el servidor: vale para cualquier app \(HTML o Élite\)/.test(t)), 'el texto dice qué mide');

 // Otra app leyó hace 5 min: Élite pregunta el estado y no lee el banco.
 reset();
 estado = { conexiones: [conexion({ ultima_sync_fondo: iso(5) })] };
 assert.equal((await api.runBankAutoSync('carga')).reason, 'reciente');
 assert.deepEqual(calls.map(([action]) => action), ['estado']);
 assert.match(api.bankAutoSyncLine().textContent, /otra lectura \(HTML o Élite\) tiene menos de 12 min; no se repite la consulta/);
 assert.equal(api.bankAutoSyncLine().cls, 'periodHint bankFreshness', 'una lectura reciente no es alarma');

 // Todos en su límite diario: no se gasta ninguna consulta.
 reset();
 estado = { conexiones: [caixaLimitada] };
 assert.equal((await api.runBankAutoSync('carga')).reason, 'limite-diario');
 assert.deepEqual(calls.map(([action]) => action), ['estado']);
 assert.match(api.bankAutoSyncLine().textContent, /límite diario; Élite no gasta más consultas/);

 // Error: aviso destacado y sin tocar la bandeja guardada.
 reset();
 estado = { conexiones: [conexion({ ultima_sync_fondo: iso(60 * 24 * 12) })] };
 failBandeja = 'El banco no ha respondido en 45 s. Inténtalo de nuevo.';
 assert.equal(await api.runBankAutoSync('carga'), null);
 failBandeja = null;
 line = api.bankAutoSyncLine();
 assert.equal(line.cls, 'bankAlert bankFreshness', 'error: aviso destacado');
 assert.match(line.textContent, /La última lectura automática falló hace menos de 1 min: El banco no ha respondido en 45 s/);
 assert.equal(realConnector.readInboxState('owner-1', sandbox.activeProfile).rows.length, 1);

 // Antigüedad en días (sin alarma si el banco está conectado) y banco sin lecturas.
 sandbox.api.showBanksAudit();
 await settle();
 let text = textOf(find(roots.detail, (n) => n.cls === 'bankConnectionStates'));
 assert.match(text, /leído hace 12 días/);
 reset();
 estado = { conexiones: [conexion({ ultima_sync_fondo: null }), conexion({ banco: 'CaixaBank', valido_hasta: iso(60), permiso_valido: false })] };
 bandeja = { movimientos: [], por_banco: { Revolut: 0 }, cortes: {} };
 await api.runBankAutoSync('carga');
 api.showBanksAudit();
 await settle();
 text = textOf(find(roots.detail, (n) => n.cls === 'bankConnectionStates'));
 assert.match(text, /Revolut — conectado · 1 cuenta\(s\) · sin lecturas registradas/);
 assert.match(text, /CaixaBank — permiso caducado: renuévalo desde el HTML/);

 // Fuera de primer plano, sin red o con otro perfil a mitad de lectura: nada se lee ni se guarda en el perfil equivocado.
 reset();
 documentStub.visibilityState = 'hidden';
 assert.equal(await api.runBankAutoSync('vuelta'), null);
 documentStub.visibilityState = 'visible';
 sandbox.navigator.onLine = false;
 assert.equal(await api.runBankAutoSync('vuelta'), null);
 sandbox.navigator.onLine = true;
 assert.equal(calls.length, 0);
 estado = { conexiones: [conexion({ ultima_sync_fondo: iso(30) })] };
 bandeja = { movimientos: [cargo], por_banco: { Revolut: 1 }, cortes: {} };
 const before = realConnector.readInboxState('owner-1', sandbox.activeProfile).rows.length;
 const other = 'p_usr-otro__';
 onBandeja = async () => { sandbox.activeProfile = other; };
 const switched = api.runBankAutoSync('carga');
 assert.equal(await switched, null);
 onBandeja = null;
 assert.equal(realConnector.readInboxState('owner-1', other).rows.length, 0, 'la lectura no se guarda en el perfil nuevo');
 sandbox.activeProfile = 'p_' + PID + '__';
 assert.equal(realConnector.readInboxState('owner-1', sandbox.activeProfile).rows.length, before);
 assert.match(api.bankAutoSyncLine().textContent, /no terminó \(app cerrada o perfil cambiado\); se repite al volver a Élite/, 'una lectura interrumpida no se queda en «Leyendo…»');

 console.log('PASS v2.0.98: estado bancario por banco del servidor y lectura al abrir (una sola, presente, sin repetir en 12 min); sin cifras inventadas; límite y errores destacados; hora del dispositivo');
})().catch((error) => { console.error(error); process.exit(1); });
