'use strict';
// v2.0.96: Élite no lee el banco al abrir. Muestra la antigüedad del estado bancario que guarda el HTML en la nube.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');

assert(html.includes("'v2_espejo__fluxia_banco_estado',"), 'el estado bancario de la nube se carga en modo solo lectura');
assert(html.includes("d.append(actions,state,bankFreshnessLine());"), 'la pantalla de bancos muestra la antigüedad');

// ejecutar la función real con datos sintéticos
const start = html.indexOf('function bankFreshnessLine(){');
const end = html.indexOf('function showBanksAudit(){');
assert(start > 0 && end > start, 'función localizada');
const sandbox = {
  sourceUpdated: {}, extraFinance: {},
  el: (tag, cls, text) => ({ tag, cls, text }),
  Date,
};
new Function('sandbox', 'with(sandbox){' + html.slice(start, end) + ';sandbox.bankFreshnessLine=bankFreshnessLine}')(sandbox);
const now = Date.now();
const iso = (minsAgo) => new Date(now - minsAgo * 60000).toISOString();

sandbox.sourceUpdated = {};
assert.match(sandbox.bankFreshnessLine().text, /Sin estado bancario del HTML/, 'sin dato: aviso, no cifras inventadas');

sandbox.sourceUpdated = { v2_espejo__fluxia_banco_estado: iso(3) };
sandbox.extraFinance = { v2_espejo__fluxia_banco_estado: { conectado: true, error: '' } };
let line = sandbox.bankFreshnessLine();
assert.equal(line.cls, 'periodHint bankFreshness', 'reciente: aviso neutro');
assert.match(line.text, /hace 3 min/);

sandbox.sourceUpdated = { v2_espejo__fluxia_banco_estado: iso(47) };
line = sandbox.bankFreshnessLine();
assert.equal(line.cls, 'notice bankFreshness', 'vencido: aviso destacado');
assert.match(line.text, /Élite puede estar desactualizada/);

sandbox.sourceUpdated = { v2_espejo__fluxia_banco_estado: iso(2) };
sandbox.extraFinance = { v2_espejo__fluxia_banco_estado: { conectado: true, errorFondo: 'CaixaBank: HUB046: límite de consultas de hoy' } };
line = sandbox.bankFreshnessLine();
assert.match(line.text, /límite diario de consultas/, 'límite HUB046 se explica');
assert.equal(line.cls, 'notice bankFreshness');

console.log('PASS v2.0.96: antigüedad del estado bancario del HTML, con aviso de vencido y de límite');
