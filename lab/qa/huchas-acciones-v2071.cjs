'use strict';
// v2.0.71: cada hucha ofrece las seis acciones, todas como vista previa sin escritura en Supabase.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../fluxia-elite-safari-datos-reales.html'), 'utf8');
for (const label of ['Nueva aportación', 'Rescate', 'Uso', 'Editar', 'Corregir fecha', 'Archivar']) {
  assert(html.includes("'" + label + "'"), 'falta la acción ' + label);
}
const start = html.indexOf('function huchaActionPreview(action){');
const end = html.indexOf('\nfunction renderBankInboxRows(){', start);
assert(start > 0 && end > start);
const body = html.slice(start, end);
for (const forbidden of ['fetch(', 'localStorage', 'setItem', '.upsert(', '.insert(', 'update(', '.rpc(', '.from(']) {
  assert(!body.includes(forbidden), 'la vista previa no escribe: ' + forbidden);
}
assert(html.includes("const ELITE_SAFARI_VERSION='2.0.71';"));
console.log('PASS v2.0.71: seis acciones de hucha como vista previa, sin escritura');
