const fs=require('fs'),vm=require('vm'),assert=require('assert');
const s=fs.readFileSync(__dirname+'/index_fluxia_v95.34_LAB.html','utf8');let n=0;
for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/type=["']application\//.test(m[1]))continue;new vm.Script(m[2]);n++;}
const a=s.indexOf('window.FluxiaSync954 = (function(){'),b=s.indexOf('\n})();',a)+6;
const ctx={window:{},Almacen:{getItem:()=>null,setItem:()=>{}},claveLS:k=>k};vm.createContext(ctx);vm.runInContext(s.slice(a,b),ctx);
const sync=ctx.window.FluxiaSync954;
function p(arr,month='septiembre'){return [{id:'pot',aportaciones:{[month]:arr}}]}
function merge(l,r,t={}){return JSON.parse(sync.mergeCloudValue('v2_provisiones',JSON.stringify(l),JSON.stringify(r),JSON.stringify(t),'{}'))}
const old={id:'a',importe:100,fecha:'2026-09-01',_fxUpdatedAt:1},edit={...old,importe:150,_fxUpdatedAt:2};
assert.equal(merge(p([edit]),p([old]))[0].aportaciones.septiembre.length,1);
assert.equal(merge(p([edit]),p([old]))[0].aportaciones.septiembre[0].importe,150);
let moved=merge(p([{...edit,fecha:'2026-10-01'}],'octubre'),p([old]))[0];assert.equal(moved.aportaciones.septiembre.length,0);assert.equal(moved.aportaciones.octubre.length,1);
assert.equal(merge(p([old,{...old,id:'b'}]),p([]))[0].aportaciones.septiembre.length,2);
assert.equal(merge([],p([{...old,_fxUpdatedAt:999}]),{v2_provisiones:{'s:pot:aportaciones:septiembre:a':2}})[0].aportaciones.septiembre.length,0);
assert.deepEqual(merge(p([edit]),p([old])),merge(p([old]),p([edit])));
assert.deepEqual(merge(p([edit]),p([edit])),p([edit]));
let concurrent=merge(p([edit]),p([{...old,id:'b'}]));assert.equal(concurrent[0].aportaciones.septiembre.length,2);
console.log('PASS: sintaxis y pruebas de integridad.');
