'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const dates=html.slice(html.indexOf('const actualChargeDate=obj=>'),html.indexOf('const chargeMeta='));
const start=html.indexOf('function migrationFingerprint('),end=html.indexOf('function migrationSourceFreshness(',start);
assert(start>0&&end>start);
const context=vm.createContext({
 recordAmount:r=>r.importe??null,
 field:(r,keys)=>keys.map(k=>r[k]).find(x=>typeof x==='string'&&x.trim())||null,
 motherRowId:r=>r.id||''
});
vm.runInContext(dates+html.slice(start,end),context,{timeout:1000});
const cloud={id:'cloud1',fecha:'2026-10-14',importe:7.50,concepto:'Gasolina'};
const imported={id:'html1',fecha:'14/10/2026',importe:7.50,concepto:'gasolina'};
assert.equal(context.migrationFingerprint(cloud),context.migrationFingerprint(imported),'Spanish and ISO charge dates must normalize identically');
assert.equal(context.migrationCollisionSignals([imported],[cloud]).length,1,'Same charge with different ID must flag collision');
assert.equal(context.migrationCandidateCollisions([imported,{...cloud,id:'html2'}]).length,1,'Two fresh candidates must flag collision');
assert.equal(context.migrationCandidateCollisions([imported,{...cloud,id:'html2',fecha:'2026-10-15'}]).length,0,'Distinct date must remain distinct');
assert.equal(context.migrationFingerprint({...imported,fecha:'31/02/2026'}),null,'Invalid dates must not match');
const dryRun=html.slice(html.indexOf('function dryRunFinancialModule('),html.indexOf('function buildPrivateDryRun('));
assert(dryRun.includes('migrationCandidateCollisions(additions)'),'Dry-run must refuse repeated candidate charges');
const proposal=html.slice(html.indexOf('function buildPrivateMigrationReport('),html.indexOf('function simulateFinancialReplay('));
assert(proposal.includes('candidateCollisions.length===0'),'Proposal must refuse repeated candidate charges');
assert(html.includes("const ELITE_SAFARI_VERSION='1.9.44'"));
for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(script[1])new vm.Script(script[1]);
console.log('PASS: v1.9.44 duplicate charge detection with Spanish/ISO dates and separate candidate IDs');
