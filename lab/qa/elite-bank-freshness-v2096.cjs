'use strict';
// v2.0.96/v2.0.97: Bancos muestra el estado bancario de la nube sin inventar la última consulta del HTML.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');

assert(html.includes("'v2_espejo__fluxia_banco_estado',"), 'el estado bancario de la nube se carga en modo solo lectura');
assert(html.includes("d.append(actions,state,bankFreshnessLine());"), 'la pantalla de bancos muestra el estado de la nube');

const start = html.indexOf('function bankFreshnessLine(){');
const end = html.indexOf('function showBanksAudit(){');
assert(start > 0 && end > start, 'función localizada');
const sandbox = { sourceUpdated: {}, extraFinance: {}, el: (tag, cls, text) => ({ tag, cls, text }), Date };
new Function('sandbox', 'with(sandbox){' + html.slice(start, end) + ';sandbox.bankFreshnessLine=bankFreshnessLine}')(sandbox);
const iso = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString();

sandbox.sourceUpdated = {};
assert.match(sandbox.bankFreshnessLine().text, /Sin estado bancario guardado/, 'sin dato: no se inventan cifras');

sandbox.sourceUpdated = { v2_espejo__fluxia_banco_estado: iso(47) };
sandbox.extraFinance = { v2_espejo__fluxia_banco_estado: { conectado: true, error: '' } };
let line = sandbox.bankFreshnessLine();
assert.equal(line.cls, 'periodHint bankFreshness', 'una hora sin cambios no es alarma');
assert.match(line.text, /no indica cuándo consultó el HTML/, 'el texto aclara qué mide');

sandbox.sourceUpdated = { v2_espejo__fluxia_banco_estado: iso(60 * 24 * 12) };
assert.match(sandbox.bankFreshnessLine().text, /hace 12 días/, 'antigüedad en días');

sandbox.extraFinance = { v2_espejo__fluxia_banco_estado: { conectado: true, errorFondo: 'CaixaBank: HUB046: límite de consultas de hoy' } };
line = sandbox.bankFreshnessLine();
assert.equal(line.cls, 'notice bankFreshness', 'límite diario: aviso destacado');
assert.match(line.text, /límite diario de consultas/);

sandbox.extraFinance = { v2_espejo__fluxia_banco_estado: { conectado: false, error: 'sin conexión con el banco' } };
line = sandbox.bankFreshnessLine();
assert.equal(line.cls, 'notice bankFreshness', 'error: aviso destacado');

console.log('PASS v2.0.97: estado bancario de la nube sin falsa alarma por antigüedad; avisos solo por error o límite');
