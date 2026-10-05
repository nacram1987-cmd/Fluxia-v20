const fs=require('fs'),assert=require('assert');
const h=fs.readFileSync('index_fluxia_v95.46_LAB.html','utf8');
assert(h.includes('function claveLegacyRecuperable(k)'));
assert(h.includes('async function recuperarDatosLegacyParaPerfil(opts)'));
assert(h.includes("var prefix='profile:'+encodeURIComponent(p)+':'"));
assert(h.includes("if(!k || k.indexOf('profile:')===0) return false;"));
assert(h.includes('Lectura posterior: no declarar recuperación'));
assert(h.includes('async function descartarVaciosOnboarding()'));
assert(h.includes("op==='set'&&_payloadVacio(v)"));
assert(h.includes('FluxiaNube.recuperarDatosLegacyParaPerfil({auto:true})'));
assert(h.includes('FluxiaNube.tieneDatosPerfil ? FluxiaNube.tieneDatosPerfil()'));
assert(!h.includes('index_fluxia_v95.44_LAB.html?v=v95.44-LAB'));
const cfg=JSON.parse(fs.readFileSync('fluxia-cloud-config-v95.46.json','utf8'));
assert(/^https:\/\/.+\.supabase\.co$/.test(cfg.project_url));
assert(/^sb_publishable_/.test(cfg.publishable_key));
const chan=JSON.parse(fs.readFileSync('fluxia-canal-v95.46-LAB.json','utf8'));
assert.equal(chan.stable,'v95.39');
function legacy(k){k=String(k||'');if(!k||k.startsWith('profile:'))return false;if(k.startsWith('v2_u_'))return false;if(/^v2_backup_(mov|banco_meta)_/.test(k))return false;return /^(planRescate|tmd_|bk_|v2_)/.test(k)||/^fluxia_(papelera_v[12]_|gv_borrados_v1|presupuestos_borrados_v1|cat_prefs_v1)/.test(k)}
assert(legacy('v2_ingresos'));assert(legacy('v2_provisiones'));assert(!legacy('profile:p:v2_ingresos'));assert(!legacy('v2_backup_mov_x'));
function vacio(v){if(v==null)return true;const s=String(v).trim();return ['', 'null','[]','{}','""'].includes(s)}
assert(vacio('[]'));assert(vacio('{}'));assert(!vacio('[{"id":"real"}]'));
console.log('OK v95.46 legacy cloud recovery + profile isolation + public config');
