'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'fluxia-elite-safari-datos-reales.html'),'utf8');
assert.match(html,/const ELITE_SAFARI_VERSION='[0-9]+[.][0-9]+[.][0-9]+'/);
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
const calcSource=between('function availableAccountingMonth(row,ym,assumedYear){','\nfunction renderAvailableCertification()');
const certSource=between('function availableCertificationReport(){','\nfunction availableCalculationReport()');
const rows={
 ingresos:[{id:'income',fecha:'2026-10-01',importe:1000}],
 fijos:[{id:'fixed',mes:'octubre',importe:200},{id:'old-fixed',mes:'septiembre',importe:9000}],
 variables:[{id:'variable',mes:'2026-10',fecha:'2026-10-04',importe:300}],
 compartidos:[],
 financiaciones:[{id:'finance',mes:'octubre',cuota:100},{id:'ended-finance',inicio:'enero',fin:'septiembre',cuota:5000}],
 huchas:[{...hucha,mes:undefined,inicio:'julio'},{id:'ended-hucha',nombre:'Hucha cerrada',inicio:'enero',fin:'septiembre',importeMensual:9000,aportaciones:{octubre:[]}}]
};
const integration={...context,window:{FluxiaEliteFinancialEngine:{cents:moneyToCents,available(input){const cents=input.incomeCents-input.realExpensesCents-input.plannedProvisionsCents-input.excessContributionsCents+input.sharedImpactCents;return {ok:true,cents,trace:input}}}},
 mods:Object.entries(rows).map(([id,data])=>({id,rows:data})),selectedMonth:'2026-10',canon:mod=>Array.isArray(mod?.rows)?mod.rows:null,
 preferredHuchaUses:()=>({rows:[rescue],origin:'Supabase'}),backupFinance:null,sourceUpdated:{},monthStatus:row=>String(row?.fecha||row?.mes||'').startsWith('2026-10')||row?.mes==='octubre'?'match':'other',
 financialRecordRole:()=> 'variable-real',backupFinance:null,owner:'owner',activeProfile:'profile',csvAudit:null};
vm.runInNewContext(sources.join('\n')+'\n'+certSource+'\n'+calcSource,integration);
integration.backupFinance={owner:'owner',profile:'profile',when:new Date().toISOString(),sources:{v2_usos:{value:[rescue]}},modules:Object.fromEntries(Object.entries(rows).map(([id,data])=>[id,{records:id==='variables'?data.map(row=>({...row,importe:350})):data}]))};
const report=integration.availableCalculationReport();
assert.equal(report.ok,true,'A fresh same-profile HTML backup enables a provisional current-month calculation without adding temporary rescues');
assert.equal(report.cents,5000n,'The current-month result uses the local HTML snapshot, not stale cloud rows');
assert.equal(report.provisional,true);
assert.equal(report.source,'html_backup');
assert(html.includes("if(amount>repaid&&(link.provisional||snapshot.provisionalLinks))"),'A rescue linked by unique name remains provisional');
assert.match(report.provisionalNotes[0],/vinculado provisionalmente por nombre único/);
const certification=integration.availableCertificationReport();
assert.equal(certification.certified,false,'A provisional figure never passes the full certification gate');
assert.equal(certification.calculation.cents,5000n);
const freshBackup=integration.backupFinance;
integration.backupFinance=null;
const blocked=integration.availableCalculationReport();
assert.equal(blocked.ok,false,'A current-month cloud-only calculation is blocked without a recent same-profile HTML snapshot');
assert.match(blocked.blockers.join(' '),/copia reciente del HTML del mismo perfil/);
assert.equal(blocked.cents,undefined);
integration.backupFinance={...freshBackup,when:new Date(Date.now()-49*60*60*1000).toISOString()};
const stale=integration.availableCalculationReport();
assert.equal(stale.ok,false,'An HTML snapshot older than 48 hours cannot produce a current-month amount');
assert.match(stale.blockers.join(' '),/copia reciente/);
integration.backupFinance={...freshBackup,profile:'another-profile'};
const wrongProfile=integration.availableCalculationReport();
assert.equal(wrongProfile.ok,false,'A backup from another profile cannot enter the current-month calculation');
assert.match(wrongProfile.blockers.join(' '),/mismo perfil/);
assert(certification.blockers.some(x=>/nombre único/.test(x)));
integration.backupFinance=null;
integration.cloudFinanceSnapshot={owner:'owner',profile:'profile',complete:true};
integration.extraFinance={planRescate_v2_usos:[rescue]};
const modern=integration.availableCalculationReport();
assert.equal(modern.ok,true,'Complete modern collections calculate without HTML upload');
assert.equal(modern.cents,10000n);
assert.equal(modern.source,'supabase');
integration.backupFinance=freshBackup;
assert.equal(integration.availableCalculationReport().cents,10000n,'Complete modern cloud wins over an older backup');
integration.backupFinance=null;
integration.cloudFinanceSnapshot.profile='other-profile';
assert.equal(integration.availableCalculationReport().ok,false,'Modern cloud is profile isolated');
integration.cloudFinanceSnapshot.profile='profile';
rows.ingresos.push({id:'pension',mes:'octubre',concepto:'Pensión',importe:300});
rows.ingresos.push({id:'transfer',mes:'octubre',tipo:'puente',bancoRef:'same-bank',importe:9});
rows.ingresos.push({id:'duplicate',mes:'octubre',bancoRef:'same-bank',importe:9});
rows.ingresos.push({id:'cycle',mes:'octubre',cicloDe:'other',importe:99});
assert.equal(integration.availableCalculationReport().cents,10000n,'Pending pension, bridge, duplicate bank reference and cycles do not inflate income');
rows.variables.push({id:'cash',mes:'octubre',origen:'efectivo',importe:20});
rows.variables.push({id:'atm',mes:'octubre',origen:'banco',concepto:'ATM withdrawal',importe:90});
rows.variables.push({id:'fixed-charge',mes:'octubre',fecha:'2026-09-30',cuentaComoFijo:true,vinculoFijoId:'fixed',importe:210});
rows.variables.push({id:'refund',mes:'octubre',importe:-5});
assert.equal(integration.availableCalculationReport().cents,7500n,'Cash and signed refund count, ATM does not, linked actual fixed replaces plan exactly once');
assert.equal(integration.availableAccountingMonth({mes:'octubre',fecha:'2026-09-30'},'2026-10'),true,'Accounting month precedes payment date');
assert.equal(integration.availableAccountingMonth({mes:'octubre'},'2025-10'),false,'Unqualified plan month does not leak into previous years');
console.log(JSON.stringify({version:'2.0.21',syntheticRescueCents:provisional.pendingCents,syntheticAvailableCents:Number(report.cents),certified:false,otherMonthFixedExcluded:true,endedPlansExcluded:true,monthNamePlanIncluded:true,duplicateAndAmbiguousLinksBlocked:true,explicitBrokenIdsBlocked:true},null,2));
