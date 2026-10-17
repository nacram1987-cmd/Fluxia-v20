'use strict';
// v2.0.95: los fijos «mes sin año» cuentan en su mes (como fijosDe del HTML) y el total de Variables usa el héroe de Huchas.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');

assert(html.includes('const datos=[...fixed,...legacy].map(x=>x.data),previsto='), 'el previsto de Fijos suma match y legacy');
assert(html.includes("page==='fijos'?'⚠️ Fijos con mes sin año · contados en el mes'"), 'aviso de Fijos correcto');
assert(html.includes("el('div','eliteHuchaHero varHero')"), 'héroe de Variables con la clase de Huchas, sin «card»');
assert(html.includes("el('div','varHeroAmount',money(expenseFigures.totalCents/100))"), 'importe de Variables como bloque, no como strong');
assert(/\.varHero\{background:linear-gradient\(150deg,#FCEBC9/.test(html), 'fondo crema del héroe');
assert(/\.varHeroAmount\{display:block;font:800 38px/.test(html), 'importe de 38 px');
assert(!/\.varHeroLabel\{[^}]*var\(--muted\)/.test(html), 'etiqueta sin color dependiente del tema');
console.log('PASS v2.0.95: Fijos cuenta los «mes sin año»; héroe de Variables con colores fijos');
