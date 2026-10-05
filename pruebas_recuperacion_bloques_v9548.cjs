const assert=require('assert');
function useful(v){if(v==null)return false;let s=String(v).trim();if(!s||['null','[]','{}','""'].includes(s))return false;try{let x=JSON.parse(s);if(Array.isArray(x))return x.length>0;if(x&&typeof x==='object')return Object.keys(x).length>0;if(typeof x==='string')return x.trim().length>0;return x!==null&&x!==false;}catch{return true;}}
const map=[
 ['v2_ingresos',['v2_ingresos','planRescate_v2_ingresos']],
 ['v2_fijos',['v2_fijos','planRescate_v2_fijos']],
 ['v2_movimientos',['v2_movimientos','planRescate_v2_movimientos']],
 ['v2_provisiones',['v2_provisiones','planRescate_v2_provisiones']]
];
function plan(current,legacy){let out=[];for(const [dest,srcs] of map){if(current[dest]&&useful(current[dest]))continue;let s=srcs.find(k=>legacy[k]&&useful(legacy[k]));if(s)out.push([dest,s]);}return out;}
let current={v2_fijos:JSON.stringify([{id:'f1'}]),v2_ingresos:'[]',v2_movimientos:'[]',v2_provisiones:JSON.stringify([{id:'p1'}])};
let legacy={v2_fijos:JSON.stringify([{id:'OLD'}]),planRescate_v2_ingresos:JSON.stringify([{id:'i1'}]),v2_movimientos:JSON.stringify([{id:'m1'}]),v2_provisiones:JSON.stringify([{id:'OLDP'}])};
assert.deepStrictEqual(plan(current,legacy),[['v2_ingresos','planRescate_v2_ingresos'],['v2_movimientos','v2_movimientos']]);
assert(!plan(current,legacy).some(x=>x[0]==='v2_fijos'),'No debe pisar fijos no vacíos');
assert(!plan(current,legacy).some(x=>x[0]==='v2_provisiones'),'No debe pisar huchas no vacías');
console.log('OK v95.48 per-key recovery');
