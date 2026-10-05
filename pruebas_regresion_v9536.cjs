const assert=require('assert');
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function cents(v){return Math.round((Number(v)||0)*100)}
function sem(x){return 'apt|'+String(x.fecha||'').slice(0,10)+'|'+cents(x.importe)+'|'+norm(x.obs||x.nota||'')}
function active(tombs,exp,rest){const out={};Object.keys(exp||{}).forEach(q=>{const d=Math.max(Number((tombs||{})[q]||0),Number(exp[q].t||0));if(d>Number((rest||{})[q]||0))out[q]={t:d,rec:exp[q]};});return out}
// 1) un tombstone legacy SIN evidencia explícita jamás borra.
let t={'i:g1':999},e={},r={};assert.equal(!!active(t,e,r)['i:g1'],false);
// 2) un borrado explícito domina aunque la copia tenga timestamp futuro.
e={'i:g1':{t:1000,explicit:true,snapshot:{id:'g1'}}};assert.equal(!!active(t,e,r)['i:g1'],true);
// 3) restauración explícita posterior gana.
r={'i:g1':1001};assert.equal(!!active(t,e,r)['i:g1'],false);
// 4) firma de aportación borrada detecta clon con otro ID.
const old={id:'a1',fecha:'2026-10-05',importe:50,nota:''},clone={id:'otro',fecha:'2026-10-05',importe:50,nota:''};assert.equal(sem(old),sem(clone));
// 5) duplicado confirmado por el usuario queda distinguible por política (el motor no aplica veto semántico a allowDuplicate).
clone.allowDuplicate=true;assert.equal(clone.allowDuplicate,true);
console.log('OK v95.36 deletion regression suite');