const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(__dirname+'/index_fluxia_v95.37_LAB.html','utf8');const a=s.indexOf('window.FluxiaSync954 = (function(){'),b=s.indexOf('\n})();',a)+6;
const store={};const ctx={window:{},Almacen:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},claveLS:k=>k,LS_PREFIX:'v2_'};vm.createContext(ctx);vm.runInContext(s.slice(a,b),ctx);const sync=ctx.window.FluxiaSync954;
function P(list){return [{id:'p',nombre:'Boda Ana',aportaciones:{octubre:list}}]}
let x={id:'a',fecha:'2026-10-04',importe:50,_fxMutationId:'m1',_fxUpdatedAt:1};let y={...x,id:'b',_fxUpdatedAt:2};
let r=JSON.parse(sync.mergeCloudValue('v2_provisiones',JSON.stringify(P([x])),JSON.stringify(P([y])),'{}','{}','{}','{}','{}','{}'));assert.equal(r[0].aportaciones.octubre.length,1,'same mutation must dedupe');
let a1={id:'c',fecha:'2026-10-04',importe:50,_fxUpdatedAt:1};let a2={id:'d',fecha:'2026-10-04',importe:50,_fxUpdatedAt:2};r=JSON.parse(sync.mergeCloudValue('v2_provisiones',JSON.stringify(P([a1])),JSON.stringify(P([a2])),'{}','{}','{}','{}','{}','{}'));assert.equal(r[0].aportaciones.octubre.length,1,'legacy exact clone must dedupe');
a2.allowDuplicate=true;a2._fxUserConfirmedExtra=true;r=JSON.parse(sync.mergeCloudValue('v2_provisiones',JSON.stringify(P([a1])),JSON.stringify(P([a2])),'{}','{}','{}','{}','{}','{}'));assert.equal(r[0].aportaciones.octubre.length,2,'confirmed duplicate must survive');
console.log('PASS merge huchas');
