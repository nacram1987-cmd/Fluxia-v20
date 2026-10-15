'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const a=html.indexOf('function huchaContributionSnapshot('),b=html.indexOf('function renderHuchaMonthlyContributions(',a);
assert(a>=0&&b>a);
const ctx=vm.createContext({
 MONTHS:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 huchaMonthlyContributions:h=>({rows:Object.values(h.aportaciones||{}).flat().map(record=>({record})),invalid:0,sourceReady:!!h.aportaciones}),
 monthTitle:x=>x,el:(tag,cls,text)=>({tag,cls,text,children:[],append(...x){this.children.push(...x)}}),money:x=>x+' €'
});
vm.runInContext(html.slice(a,b),ctx,{timeout:1000});const f=ctx.huchaContributionSnapshot;
vm.runInContext(html.slice(html.indexOf('const actualChargeDate='),html.indexOf('const chargeMeta=')),ctx);
const h={id:'h',aportaciones:{septiembre:[{id:'1',importe:35,fecha:'2026-09-15'}],octubre:[{id:'2',importe:35,fecha:'2026-10-03'},{id:'3',importe:10,fecha:'2025-10-03'}]}};
const ok=f(h,'2026-10');
assert.equal(ok.monthCents,3500);assert.equal(ok.lifetimeCents,8000);assert.equal(ok.monthComplete,true);
assert.equal(f({aportaciones:{octubre:[{id:'1',importe:10}]}},'2026-10').monthComplete,false);
assert.equal(f({aportaciones:{octubre:[{id:'1',importe:10,fecha:'2026-10-01'},{id:'1',importe:10,fecha:'2026-10-02'}]}},'2026-10').lifetimeComplete,false);
assert.match(html,/const ELITE_SAFARI_VERSION='(?:1\.9\.64|2\.0\.(?:00|01|02|03|04|05|06|07|08|09|10|11))'/);
assert(html.includes('appendHuchaFinancialSummary(card,row,selectedMonth,huchaLedger)'));
assert(html.includes('appendHuchaFinancialSummary(card,data,selectedMonth,cloudHuchaLedger)'));
assert(html.includes("const face=mod.id==='huchas'?el('button','entry'):card"));
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1])new vm.Script(m[1]);
console.log('PASS v1.9.64 hucha monthly/year isolation, lifetime sums, duplicates, source cards and JS parse');
