'use strict';
// Paso 3 de la escritura bidireccional: formulario «＋ Nueva provisión» preparado con interruptor apagado. Comprobación estática del contrato.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '..', 'fluxia-elite-safari-datos-reales.html'), 'utf8');

// interruptor apagado: el botón no aparece hasta una orden explícita
assert(html.includes('const ELITE_CLOUD_WRITE_ENABLED=true;'), 'interruptor activado desde la 2.0.81');
assert(html.includes("if(!ELITE_CLOUD_WRITE_ENABLED||!window.FluxiaEliteCloudWrite||!window.FluxiaSync954)return null;"), 'sin interruptor no hay formulario');
// scripts del motor y del escritor, antes del principal
assert(html.indexOf('js/fluxia-sync-engine-v1.js') > 0 && html.indexOf('js/fluxia-sync-engine-v1.js') < html.indexOf('js/fluxia-elite-cloud-write-v1.js'), 'orden de carga: motor, luego escritor');
// flujo de escritura: validar, token fresco, transporte, clave corta para el motor, recarga
const btn = html.slice(html.indexOf('button.onclick=async()=>{'), html.indexOf('card.append(name,amount,month,button,status)'));
for (const frag of ['W.validateProvision(', 'await ensureFreshToken()', 'W.supabaseTransport({base:BASE,anonKey:KEY,token,owner', "const profileKey='profile:'+activeProfile.slice(2,-2)+':v2_provisiones'", "shortKey:'v2_provisiones'", 'await W.writeCollection(', 'await loadCanonicalProfile(activeProfile,{preserveView:true})']) {
  assert(btn.includes(frag), 'flujo de escritura: ' + frag);
}
// en Huchas el formulario se monta antes del resumen, y solo en esa pestaña
assert(html.includes("const nueva=eliteNewProvisionCard();if(nueva)$('#content').append(nueva);"), 'formulario montado en Huchas');
console.log('PASS v2.0.80 (paso 3): formulario de alta con interruptor apagado y flujo de escritura cableado');
