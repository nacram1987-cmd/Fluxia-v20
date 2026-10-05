const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(__dirname+'/index_fluxia_v95.34_LAB.html','utf8');
const storage={};let tick=10;
const c={window:{},LS_PREFIX:'planRescate_demo_v2_',Date:{now:()=>tick},Almacen:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},claveLS:k=>'planRescate_demo_v2_'+k.replace('v2_','')};
vm.createContext(c);let a=s.indexOf('window.FluxiaSync954 = (function(){'),b=s.indexOf('\n})();',a)+6;vm.runInContext(s.slice(a,b),c);let sync=c.window.FluxiaSync954;
let remote=[{id:'pot',nombre:'Antes',_fxUpdatedAt:1000,aportaciones:{septiembre:[{id:'a',importe:50,fecha:'2026-09-01',_fxUpdatedAt:1000}]}}];
storage[c.claveLS('v2_provisiones')]=JSON.stringify(remote);let edit=JSON.parse(JSON.stringify(remote));edit[0].nombre='Después';sync.prepare('v2_provisiones',edit);assert(edit[0]._fxUpdatedAt>1000);
let merged=JSON.parse(sync.mergeCloudValue(c.claveLS('v2_provisiones'),JSON.stringify(edit),JSON.stringify(remote),'{}','{}'));assert.equal(merged[0].nombre,'Después');
// Modal stays open while reload replaces the live array. Commit resolves current identities.
c.provisiones=JSON.parse(JSON.stringify(remote));const stale=c.provisiones[0];c.provisiones=JSON.parse(JSON.stringify(remote));c.MESES=['septiembre','octubre'];c.parseImporte=Number;c.mesFromFechaISO=f=>f.slice(5,7)==='10'?'octubre':'septiembre';c.mostrarToast=()=>{};c.guardarProvisiones=()=>{sync.prepare('v2_provisiones',c.provisiones);storage[c.claveLS('v2_provisiones')]=JSON.stringify(c.provisiones);return true;};
a=s.indexOf('function fluxiaEditarAporteV9534(');b=s.indexOf('\nfunction eliminarAportacionProvision',a);vm.runInContext(s.slice(a,b),c);
assert(c.fluxiaEditarAporteV9534('pot','a',75,'2026-10-01'));assert.equal(stale.aportaciones.septiembre[0].importe,50);
let persisted=JSON.parse(storage[c.claveLS('v2_provisiones')]);let result=JSON.parse(sync.mergeCloudValue('v2_provisiones',JSON.stringify(persisted),JSON.stringify(remote),'{}','{}'));
assert.equal(result[0].aportaciones.octubre[0].importe,75);assert.equal(result[0].aportaciones.septiembre.length,0);assert.equal(c.fluxiaEditarAporteV9534('pot','missing',30,'2026-10-01'),false);
assert.equal(sync.isProtectedListKey('planRescate_demo_v2_provisiones'),true);
console.log('PASS: edición tras recarga, persistencia/reapertura, cambio de mes, reloj anterior, claves prefijadas y registro ausente.');
