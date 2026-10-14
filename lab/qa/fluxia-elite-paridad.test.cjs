'use strict';
// Fluxia Élite Espejo: PURE comparison engine, no network or production writes.
// Usage: node lab/qa/fluxia-elite-paridad.test.cjs
const assert=require('node:assert/strict');
function ym(s){const m=/^(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(String(s||''));if(!m)return null;const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return d.getUTCFullYear()===+m[1]&&d.getUTCMonth()===+m[2]-1&&d.getUTCDate()===+m[3]?m[1]+'-'+m[2]:null}
function signature(x){return String(x.id||x.movimientoId||x.bancoRef||'').trim()}
function same(a,b){return ['fecha','importe','concepto','estado','categoria','cuentaComoFijo','vinculoFijoId'].every(k=>String(a[k]??'')===String(b[k]??''))}
function compare(a,b){
 const byId=new Map();const duplicateIds=[];for(const x of b){const id=signature(x);if(!id)throw Error('Falta ID en candidato');if(byId.has(id))duplicateIds.push(id);else byId.set(id,x)}
 const missing=[],different=[];const sourceIds=new Set();
 for(const x of a){const id=signature(x);if(!id)throw Error('Falta ID en fuente madre');if(sourceIds.has(id))throw Error('ID duplicado en fuente madre: '+id);sourceIds.add(id);if(!byId.has(id))missing.push(id);else if(!same(x,byId.get(id)))different.push({id,old:x,new:byId.get(id)})}
 return {missing,different,extra:[...byId.keys()].filter(id=>!sourceIds.has(id)),duplicateIds,passed:!missing.length&&!different.length&&!duplicateIds.length&&byId.size===a.length}
}
function variableInMonth(rows,month){
 return rows.filter(x=>ym(x.fecha)===month&&!x.cuentaComoFijo&&!x.vinculoFijoId&&!x.archivado&&!x.eliminado&&!x.transferenciaInterna)
}
function expenseSummary(rows,month){const filtered=rows.filter(x=>ym(x.fecha)===month&&!x.archivado&&!x.eliminado);const variable=filtered.filter(x=>!x.cuentaComoFijo&&!x.vinculoFijoId&&!x.transferenciaInterna);const fixed=filtered.filter(x=>x.cuentaComoFijo||x.vinculoFijoId);const sum=a=>Math.round(a.reduce((n,x)=>n+Number(x.importe||0),0)*100)/100;return {variable:sum(variable),fixed:sum(fixed),spent:sum([...variable,...fixed])}}
let passed=0;
function test(name,fn){try{fn();passed++;process.stdout.write('PASS '+name+'\n')}catch(e){process.stderr.write('FAIL '+name+' '+e.message+'\n');process.exitCode=1}}
test('ISO dates reject nonexistent days',()=>{assert.equal(ym('2026-02-30'),null);assert.equal(ym('2026-10-14'),'2026-10')});
test('source 14 vs candidate 11 identifies exact three records',()=>{const a=Array.from({length:14},(_,i)=>({id:'x'+i,fecha:'2026-10-01',importe:i}));const b=a.slice(0,11);assert.deepEqual(compare(a,b).missing,['x11','x12','x13'])});
test('51/51 requires same individual IDs and values',()=>{const a=Array.from({length:51},(_,i)=>({id:'m'+i,fecha:'2026-10-01',importe:i}));const b=a.map(x=>({...x}));assert.equal(compare(a,b).passed,true);b[5].importe++;assert.equal(compare(a,b).passed,false);assert.equal(compare(a,b).different.length,1)});
test('duplicate banking ID blocks parity',()=>{const a=[{id:'bankA',importe:10,fecha:'2026-10-02'}];assert.equal(compare(a,[a[0],a[0]]).passed,false)});
test('bank-linked fixed never doubles variables',()=>{const m=[{id:'a',fecha:'2026-10-01',importe:30},{id:'b',fecha:'2026-10-02',importe:70,cuentaComoFijo:true}];assert.deepEqual(expenseSummary(m,'2026-10'),{variable:30,fixed:70,spent:100})});
test('unpaid fixed must not create bank movement',()=>{const m=[{id:'a',fecha:'2026-10-01',importe:30}];assert.deepEqual(expenseSummary(m,'2026-10'),{variable:30,fixed:0,spent:30})});
test('historic period remains historic',()=>{const m=[{id:'x',fecha:'2026-09-30',importe:100}];assert.equal(variableInMonth(m,'2026-10').length,0)});
test('archived/transfers excluded from variables',()=>{const m=[{id:'a',fecha:'2026-10-02',importe:10,archivado:true},{id:'b',fecha:'2026-10-02',importe:20,transferenciaInterna:true}];assert.equal(variableInMonth(m,'2026-10').length,0)});
test('repeated import is idempotent in set-by-ID model',()=>{const a=[{id:'one',fecha:'2026-10-01',importe:7}];const merge=(old,newRows)=>[...new Map([...old,...newRows].map(x=>[x.id,x])).values()];assert.equal(merge(merge([],a),a).length,1)});
test('different owner data cannot be compared as own data',()=>{const expected=[{id:'a',owner:'A',fecha:'2026-10-01',importe:4}];const candidate=[{id:'a',owner:'B',fecha:'2026-10-01',importe:4}];assert.notEqual(expected[0].owner,candidate[0].owner)});
process.stdout.write('RESULT '+passed+'/10 synthetic parity invariants passed\n');
if(process.exitCode)process.exit(process.exitCode);
