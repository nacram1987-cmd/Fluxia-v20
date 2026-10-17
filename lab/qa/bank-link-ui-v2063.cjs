'use strict';
// Fase 2 (sesión): la bandeja usa el módulo de reglas y no escribe en la nube al vincular.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../fluxia-elite-safari-datos-reales.html'), 'utf8');
assert(html.includes('<script src="js/fluxia-elite-bank-rules-v1.js"></script>'), 'la pantalla carga el módulo de reglas');
// v2.0.65: la pestaña de bancos ya no lista cargos; muestra solo el número pendiente
assert(html.includes('pendientes de revisar. Se revisan en Variables y Fijos, no en esta pestaña.'), 'resumen de pendientes en bancos');
assert(!html.includes("main.append(bankLinkPanel(row,bankRef))") && !html.includes("card.append(bankLinkPanel(row,bankRef))"), 'la lista de gastos sale de bancos');
const start = html.indexOf('function bankLinkPanel(row,bankRef){');
const end = html.indexOf('\nfunction renderBankInboxRows(){', start);
assert(start > 0 && end > start);
const body = html.slice(start, end);
for (const forbidden of ['fetch(', 'Supabase', 'localStorage', 'setItem', 'upsert', 'insert', 'update(']) {
  assert(!body.includes(forbidden), 'el panel no escribe ni persiste: ' + forbidden);
}
console.log('PASS v2.0.65: bandeja con vinculación en sesión, sin escritura en la nube ni persistencia');
