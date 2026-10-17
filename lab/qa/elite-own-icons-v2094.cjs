'use strict';
// v2.0.94: sin logotipos de terceros ni búsqueda online. Cada glifo de categoría tiene su icono propio.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');

// sin hosts de logotipos ni llamadas a Wikidata/Wikimedia en código (el historial de versiones no cuenta)
const code = html.split("\n").filter((l) => !/^ \[\x27/.test(l)).join("\n");
for (const bad of ["wikidata", "wikimedia", "assets/brands", "logoLookupEnabled", "discoverMerchantLogo", "remoteBrandLogo"]) {
  assert(!code.toLowerCase().includes(bad.toLowerCase()), "sin " + bad);
}
assert(!/connect-src[^;]*wikidata/.test(html), "CSP sin Wikidata");
assert(!/img-src[^;]*wikimedia/.test(html), "CSP sin Wikimedia");

// cada glifo que devuelve chargeIcon tiene icono propio (no cae en el genérico)
const block = html.slice(html.indexOf('const OWN_ICON_SVG={'), html.indexOf('function ownIcon('));
const keys = [...block.matchAll(/^ '((?:[^'\\]|\\.)+)':'/gm)].map((m) => m[1]);
const glyphs = [...html.slice(html.indexOf('const chargeIcon=('), html.indexOf('const brandName=')).matchAll(/\[\/[^\]]*\/[iu]*, '([^']+)'\]/g)].map((m) => m[1]);
assert(glyphs.length >= 16, 'categorías de chargeIcon encontradas: ' + glyphs.length);
for (const g of glyphs) {
  const ok = keys.some((k) => eval("'" + k + "'") === g);
  assert(ok, 'sin icono propio para ' + g);
}
assert(html.includes('.ownIcon{'), 'estilo del icono propio');
console.log('PASS v2.0.94: iconos propios por categoría y sin logotipos de terceros (' + glyphs.length + ' categorías)');
