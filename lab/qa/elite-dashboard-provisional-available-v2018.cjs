'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'fluxia-elite-safari-datos-reales.html'),'utf8');
assert.match(html,/const ELITE_SAFARI_VERSION='2\.0\.18'/);
assert(html.includes("calculation?.ok?'PROVISIONAL':'PENDIENTE'"),'Dashboard labels an uncertified numeric calculation as provisional');
assert(html.includes('else if(calculation.provisional)blockers.push(...calculation.provisionalNotes)'),'Provisional rescue never passes the certification gate');
assert(html.includes('availableRescueHuchaLink(use,huchas,uses)'),'Available calculation allows safe name-only rescue matching');
function between(start,end){const a=html.indexOf(start),b=html.indexOf(end,a);assert(a>=0&&b>a,`source section exists: ${start}`);return html.slice(a,b)}
const sources=[
 between('const actualChargeDate=obj=>','\nconst chargeMeta='),
 between('function temporaryUseOutstanding(use){','\nfunction reconstructedHuchaLedger('),
 between('function exactHuchaUsageLink(usage,huchas){','\nfunction canonicalMovementId('),
 between('function huchaMonthlyContributions(hucha){','\n// Misma precedencia de iconoProvision/PV_ICONOS'),
 between('function huchaContributionSnapshot(hucha,period){','\nfunction huchaFinancialSnapshot('),
 between('function huchaFinancialSnapshot(hucha,period,uses,allHuchas){','\nfunction appendHuchaFinancialSummary(')
];
const rescue={id:'rescate-fixture-2026-10-15',fecha:'2026-10-15',tipo:'temporal',importe:150,repuesto:0,provision:'Tributos de prueba'};
const hucha={id:'hucha-fixture',nombre:'Tributos de prueba',importeMensual:300,aportaciones:{octubre:[]}};
const context={MONTHS:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']};
vm.runInNewContext(sources.join('\n')+';globalThis.availableRescueHuchaLink=availableRescueHuchaLink;globalThis.huchaFinancialSnapshot=huchaFinancialSnapshot',context);
const provisional=context.availableRescueHuchaLink(rescue,[hucha],[rescue]);
assert.equal(provisional.kind,'name_candidate');
assert.equal(provisional.provisional,true);
assert.equal(provisional.pendingCents,15000);
assert.equal(context.availableRescueHuchaLink(rescue,[hucha,{...hucha,id:'duplicate'}],[rescue]).kind,'ambiguous_name');
assert.equal(context.availableRescueHuchaLink(rescue,[hucha],[rescue,{...rescue}]).kind,'duplicate_or_missing_use_id');
assert.equal(context.availableRescueHuchaLink({...rescue,provisionId:'wrong-id'},[hucha],[rescue]).kind,'missing_hucha','An explicit broken ID cannot fall back to a name match');
assert.equal(context.availableRescueHuchaLink({...rescue,importe:'150'},[hucha],[rescue]).kind,'unverified_replenishment_history');
const snapshot=context.huchaFinancialSnapshot(hucha,'2026-10',[rescue],[hucha]);
assert.equal(snapshot.issues,0);
assert.equal(snapshot.conflicts,0);
assert.equal(snapshot.provisionalLinks,1);
assert.equal(snapshot.history[0].estado,'provisional');
const moneyToCents=value=>BigInt(Math.round(Number(value)*100));
const calcSource=between('function availableCalculationReport(){','\nfunction renderAvailableCertification()');
const certSource=between('function availableCertificationReport(){','\nfunction availableCalculationReport()');
const rows={
 ingresos:[{id:'income',fecha:'2026-10-01',importe:1000}],
 fijos:[{id:'fixed',mes:'octubre',importe:200}],
 variables:[{id:'variable',mes:'2026-10',fecha:'2026-10-04',importe:300}],
 compartidos:[],
 financiaciones:[{id:'finance',mes:'octubre',cuota:100}],
 huchas:[{...hucha,mes:'octubre'}]
};
const integration={...context,window:{FluxiaEliteFinancialEngine:{cents:moneyToCents,available(input){const cents=input.incomeCents-input.realExpensesCents-input.plannedProvisionsCents-input.excessContributionsCents+input.sharedImpactCents+input.pendingHuchaRescuesCents;return {ok:true,cents,trace:input}}}},
 mods:Object.entries(rows).map(([id,data])=>({id,rows:data})),selectedMonth:'2026-10',canon:mod=>Array.isArray(mod?.rows)?mod.rows:null,
 preferredHuchaUses:()=>({rows:[rescue],origin:'Supabase'}),monthStatus:row=>String(row?.fecha||row?.mes||'').startsWith('2026-10')||row?.mes==='octubre'?'match':'other',
 financialRecordRole:()=> 'variable-real',backupFinance:null,owner:'owner',activeProfile:'profile',csvAudit:null};
vm.runInNewContext(sources.join('\n')+'\n'+certSource+'\n'+calcSource,integration);
const report=integration.availableCalculationReport();
assert.equal(report.ok,true,'Complete numeric sources yield a provisional figure with a unique name link');
assert.equal(report.cents,25000n);
assert.equal(report.provisional,true);
assert.match(report.provisionalNotes[0],/Tributos.*nombre único/);
const certification=integration.availableCertificationReport();
assert.equal(certification.certified,false,'A provisional figure never passes the full certification gate');
assert.equal(certification.calculation.cents,25000n);
assert(certification.blockers.some(x=>/nombre único/.test(x)));
console.log(JSON.stringify({version:'2.0.18',syntheticRescueCents:provisional.pendingCents,syntheticAvailableCents:Number(report.cents),certified:false,duplicateAndAmbiguousLinksBlocked:true,explicitBrokenIdsBlocked:true},null,2));
