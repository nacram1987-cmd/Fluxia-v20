const assert=require('assert');
function parse(v){try{let a=JSON.parse(String(v||'[]'));return Array.isArray(a)?a:[]}catch{return []}}
function shouldRecover(current,legacy){return parse(current).length===0 && parse(legacy).length>0}
assert.equal(shouldRecover('[]','[{"id":"1"}]'),true);
assert.equal(shouldRecover('[{"id":"x"}]','[{"id":"1"}]'),false);
assert.equal(shouldRecover('[]','[]'),false);
function total(fijos,fin){return fijos.filter(x=>x.tipo!=='puente').reduce((s,x)=>s+Number(x.importe||0),0)+fin}
assert.equal(total([{importe:50},{importe:20},{importe:999,tipo:'puente'}],621.51),691.51);
console.log('v95.46 regression: OK');
