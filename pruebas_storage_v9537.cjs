const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(__dirname+'/index_fluxia_v95.37_LAB.html','utf8');
let n=0;for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/type=["']application\//.test(m[1]))continue;new vm.Script(m[2]);n++;}
assert(s.includes('!nuestra(k)){'), 'cross-prefix recovery must be disabled for financial keys');
assert(!s.includes('window.FluxiaRecovery9536='), 'legacy auto recovery must be absent');
assert(s.includes('if(!window._FLUXIA_RESTORE_PLAN_EXPLICITO) return false;'),'snapshot restore must require explicit human action');
assert(s.includes('cuandoDatosListos(function(){ marcarListo(); });'),'v94.63 recovery must not auto-merge on boot');
assert(s.includes('AUTO-SEED FINANCIERO DESACTIVADO PARA TODOS LOS PERFILES'),'financial seed must be globally disabled');
assert(s.includes("if (false && !Almacen.getItem('v2_limpieza_aportaciones_huerfanas'))"),'orphan contribution cleaner must be disabled');
assert(s.includes("FluxiaSync954.registerDelete('v2_ingresos',it)"),'income delete tombstone missing');
assert(s.includes('it._fxManualEdit=true'),'manual income edit flag missing');
assert(s.includes('!it._fxManualEdit&&Math.abs(it.importe-importe)>=0.01'),'bank override guard missing');
assert(s.includes('forzarSubida'),'single-key cloud force missing');
assert(s.includes('window.FluxiaRecovery9537'),'canonical recovery missing');
console.log('PASS storage source invariants · scripts',n);
