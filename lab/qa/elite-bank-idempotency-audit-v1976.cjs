'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
assert(html.includes('function renderBankIdempotencyAudit()'));
assert(html.includes('IDs duplicados'));
assert(html.includes('sin identificador estable'));
assert(html.includes('No demuestra que la reconexión bancaria no resucite cargos'));
assert(html.includes('renderBankIdempotencyAudit();'));
console.log('PASS v1.9.76 read-only bank identity, duplicate and pending audit');
