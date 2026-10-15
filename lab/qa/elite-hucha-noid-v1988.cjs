'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const a=html.indexOf('function huchaFinancialSnapshot('),b=html.indexOf('function appendHuchaFinancialSummary(',a);
assert(a>=0&&b>a);
const ctx=vm.createContext({
 MONTHS:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 huchaContributionSnapshot:hucha=>({sourceReady:true,lifetimeCents:7000,monthCents:7000,monthComplete:true,plannedCents:3500,pendingCents:0,invalid:0,duplicates:0}),
 huchaMonthlyContributions:h=>({rows:Object.values(h.aportaciones||{}).flat().map(record=>({record})),invalid:0}),
 exactHuchaUsageLink:(u,hs)=>{const id=String(u.provisionId||u.huchaId||'');const m=hs.filter(h=>String(h.id)===id);return m.length===1?{kind:'linked',hucha:m[0]}:{kind:'unverified'}},
 candidateHuchaByName:(u,hs)=>{const id=String(u.provisionId||u.huchaId||'');const m=hs.filter(h=>String(h.id)===id);return m.length===1?{kind:'linked',hucha:m[0]}:{kind:'unverified'}},
 temporaryUseOutstanding:u=>({kind:'verified_summary',repaidCents:Math.round((u.repuesto||0)*100),cents:Math.round((u.importe-(u.repuesto||0))*100)})
});
vm.runInContext(html.slice(a,b),ctx,{timeout:1000});
vm.runInContext(html.slice(html.indexOf('const actualChargeDate='),html.indexOf('const chargeMeta=')),ctx);
const h={id:'h1',nombre:'Césped',importeMensual:35,aportaciones:{octubre:[{id:'a1',importe:70,fecha:'2026-10-01'}]}};
const result=ctx.huchaFinancialSnapshot(h,'2026-10',[{provisionId:'h1',tipo:'definitivo',importe:7.5,fecha:'2026-10-15'}]);
assert.equal(result.definitiveCents,750);
assert.equal(result.availableCents,6250);
assert.equal(result.status,'provisional');
assert.equal(result.history[0].id,'sin-id:0');
assert.match(html,/sin-id:'\+useIndex/);
assert.match(html,/snapshot\.status==='conciliada por registros verificables'/);
console.log('PASS v1.9.88 hucha no-ID linked operations retained but never certified');
