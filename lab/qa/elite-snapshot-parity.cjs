'use strict';
// FLUXIA ÉLITE — read-only snapshot parity gate. No network, no writes.
// node lab/qa/elite-snapshot-parity.cjs html-snapshot.json elite-snapshot.json
const fs=require('node:fs');
const crypto=require('node:crypto');
const fields=['user_id','profile_id','canonical_id','bank_identity','booking_date','operation_date','accounting_month','amount_cents','concept','category','origin','status','fixed_link','excluded','archived','tombstone_version'];
function read(path){const x=JSON.parse(fs.readFileSync(path,'utf8'));if(!x||!Array.isArray(x.movements)||!x.user_id||!x.profile_id||!x.accounting_month||!x.captured_at)throw Error('Snapshot incompleto');return x}
function compare(a,b){
 if(a.user_id!==b.user_id||a.profile_id!==b.profile_id||a.accounting_month!==b.accounting_month)throw Error('PERFIL/MES DIFERENTE: comparación bloqueada');
 const scan=(s)=>{const map=new Map(),duplicate=[];for(const x of s.movements){if(x.user_id!==s.user_id||x.profile_id!==s.profile_id)throw Error('Contaminación entre perfiles');for(const k of fields)if(!(k in x))throw Error('Falta campo '+k);if(!Number.isSafeInteger(x.amount_cents))throw Error('Importe no entero en céntimos');const id=String(x.canonical_id);if(!id)throw Error('ID vacío');if(map.has(id))duplicate.push(id);else map.set(id,x)}return {map,duplicate}};
 const aa=scan(a),bb=scan(b),missing=[],extra=[],mismatch=[];
 for(const [id,x] of aa.map){const y=bb.map.get(id);if(!y){missing.push(id);continue}const diff=fields.filter(k=>JSON.stringify(x[k])!==JSON.stringify(y[k]));if(diff.length)mismatch.push({id,fields:diff})}
 for(const id of bb.map.keys())if(!aa.map.has(id))extra.push(id);
 const sum=s=>s.movements.filter(x=>!x.archived&&!x.excluded).reduce((n,x)=>n+x.amount_cents,0);
 const report={status:'BLOCKED',month:a.accounting_month,source_count:a.movements.length,candidate_count:b.movements.length,missing_ids:missing,extra_ids:extra,value_mismatches:mismatch,duplicate_source:aa.duplicate,duplicate_candidate:bb.duplicate,delta_cents:sum(b)-sum(a),snapshot_same_time:a.captured_at===b.captured_at};
 report.status=!missing.length&&!extra.length&&!mismatch.length&&!aa.duplicate.length&&!bb.duplicate.length&&report.delta_cents===0&&report.snapshot_same_time?'PASS':'BLOCKED';return report
}
if(require.main===module){try{if(process.argv.length!==4)throw Error('Uso: node elite-snapshot-parity.cjs html.json elite.json');const report=compare(read(process.argv[2]),read(process.argv[3]));console.log(JSON.stringify(report,null,2));if(report.status!=='PASS')process.exitCode=2}catch(e){console.error('BLOCKED:',e.message);process.exitCode=2}}
module.exports={compare};
