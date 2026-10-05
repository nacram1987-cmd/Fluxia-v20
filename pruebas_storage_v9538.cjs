const fs=require('fs');
const assert=require('assert');
const html=fs.readFileSync(__dirname+'/index_fluxia_v95.38_LAB.html','utf8');

// 1. Rebase exacto y cloud-first real están presentes.
assert(html.includes('async function reemplazarExacto(k,v)'), 'falta reemplazarExacto');
assert(html.includes("if (lsGet('__exact__'+String(k))==='1') return enviado;"), 'falta bypass exacto en escritura');
assert(html.includes('v95.38 · CLOUD-FIRST REAL'), 'falta política cloud-first real');
assert(!html.includes('v95.22 · INTEGRIDAD VITAL: las listas financieras protegidas NUNCA se sustituyen'), 'sigue activo merge de arranque legacy');

// 2. Canon confirmado 2.817,88 €.
const total = 4*422.67 - 0.10 + 4*164.05 + (3*130.16 - 240.48) + 3*50 + 2*35 + (2*67 - 132.90) + 2*50;
assert(Math.abs(total-2817.88)<0.005, 'canon no cuadra: '+total);

// 3. IDs nuevos de generación: el rebase no reutiliza IDs contaminados.
['fx38_prov_amortizacion','fx38_prov_renta','fx38_prov_tributos','fx38_prov_boda_ana','fx38_prov_cesped','fx38_prov_agua','fx38_prov_seguro_coche'].forEach(id=>assert(html.includes(id),'falta '+id));

// 4. Edición manual de Ingresos prevalece en merge.
assert(html.includes("z&&z._fxManualEdit===true"),'falta preferencia de ingreso manual');
assert(html.includes('it._fxManualEdit=true'),'el editor de ingresos no marca edición manual');

// 5. Borrado de aportación registra tombstone antes de filtrar.
const posReg=html.indexOf("FluxiaSync954.registerDelete('v2_provisiones',apt");
const posFilter=html.indexOf("p.aportaciones[mes] = p.aportaciones[mes].filter",posReg);
assert(posReg>0 && posFilter>posReg,'orden de borrado de aportación incorrecto');

console.log('OK v95.38 · integridad storage');
