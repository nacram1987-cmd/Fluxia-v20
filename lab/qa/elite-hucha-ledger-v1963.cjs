'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const a=html.indexOf('function reconstructedHuchaLedger('),b=html.indexOf('function huchaUsesFromSource(',a);
assert(a>=0&&b>a);
const ctx=vm.createContext({
 MONTHS:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 grossHuchaContributions:hs=>({complete:!hs.some(h=>h.invalid),cents:hs.reduce((n,h)=>n+h.aportado*100,0),details:hs.map(h=>({cents:h.aportado*100}))}),
 exactHuchaUsageLink:(u,hs)=>{const h=hs.find(x=>x.id===u.huchaId);return h?{kind:'linked',hucha:h}:{kind:'unverified'}},
 candidateHuchaByName:(u,hs)=>{const h=hs.find(x=>x.id===u.huchaId);if(h)return {kind:'linked',hucha:h};const names=hs.filter(x=>x.nombre===u.provision);return names.length===1?{kind:'name_candidate',hucha:names[0]}:{kind:'unverified'}},
 temporaryUseOutstanding:u=>u.broken?{kind:'history_mismatch'}:{kind:'verified_summary',repaidCents:Math.round((u.repuesto||0)*100),cents:Math.round((u.importe-(u.repuesto||0))*100)},
 el:(tag,cls,text)=>({tag,cls,text,children:[],append(...xs){this.children.push(...xs)}}),money:n=>n+' €'
});
vm.runInContext(html.slice(a,b),ctx,{timeout:1000});const fn=ctx.reconstructedHuchaLedger;
vm.runInContext(html.slice(html.indexOf('const actualChargeDate='),html.indexOf('const chargeMeta=')),ctx);
const h=[{id:'a',nombre:'Césped',aportado:70},{id:'b',nombre:'Boda',aportado:150}];
const uses=[{id:'u1',huchaId:'a',tipo:'definitivo',importe:70,repuesto:0,fecha:'2026-09-20'},{id:'u2',huchaId:'b',tipo:'temporal',importe:80,repuesto:30,fecha:'2026-10-05'}];
assert.equal(fn(h,uses).provisionalCents,10000);
assert.equal(fn(h,uses).complete,true);
assert.equal(fn(h,[...uses,uses[0]]).complete,false);
assert.equal(fn(h,[...uses,{id:'u3',provision:'Césped',importe:10,tipo:'definitivo'}]).complete,false);
assert.equal(fn(h,[{...uses[1],broken:true}]).complete,false);
assert.equal(fn([{...h[0],rescates:[{importe:12}]},h[1]],uses).complete,false);
assert.equal(fn(h,null).complete,false);
assert.equal(fn([{...h[0],invalid:true},h[1]],uses).complete,false);
assert(ctx.renderReconstructedHuchaLedger(h,uses,'test'));
const tempFixture=fn([{id:'t',nombre:'Tributos',aportado:300}],[{id:'temp',huchaId:'t',tipo:'temporal',importe:123.45,repuesto:20,fecha:'2026-09-01'}]);
assert.equal(tempFixture.complete,true);
assert.equal(tempFixture.outstandingCents,10345,'verified pending repayment stays separate from available balance');
assert.equal(tempFixture.provisionalCents,19655,'withdrawal and repayment affect balance exactly once');
const summary=ctx.renderReconstructedHuchaLedger([{id:'t',nombre:'Tributos',aportado:300}],[{id:'temp',huchaId:'t',tipo:'temporal',importe:123.45,repuesto:20,fecha:'2026-09-01'}],'test');
const textOf=node=>[node.text||'',...(node.children||[]).map(textOf)].join(' ');
assert.match(textOf(summary),/Pendiente de reponer: 103\.45 € · reconstruido/);
assert.match(html,/ELITE_SAFARI_VERSION='[0-9]+[.][0-9]+[.][0-9]+'/);
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1])new vm.Script(m[1]);

// Screenshot October 2026 arithmetic reference: seven monthly plans total 918.88,
// October contributions total 671.72, pending plan total 247.16, and visible
// reserved balances total 2747.98. 240.48 pending repayment is separate.
const screenshot=[
 {name:'Seguro de coche',plan:50,balance:100,october:0},
 {name:'Tributos',plan:130.16,balance:150,october:0},
 {name:'Agua',plan:67,balance:1.10,october:0},
 {name:'Boda Ana',plan:50,balance:150,october:50},
 {name:'Amortización',plan:422.67,balance:1690.68,october:422.67},
 {name:'Renta',plan:164.05,balance:656.20,october:164.05},
 {name:'Mantenimiento Césped',plan:35,balance:0,october:35}
];
const cents=key=>screenshot.reduce((n,h)=>n+Math.round(h[key]*100),0);
assert.equal(cents('plan'),91888);
assert.equal(cents('balance'),274798);
assert.equal(cents('october'),67172);
assert.equal(cents('plan')-cents('october'),24716);
assert.equal(Math.round((390.48-150)*100),24048,'pending Tributos repayment is displayed separately from reserved balance');

const aliasStart=html.indexOf('function cloudProfileAliases('),aliasEnd=html.indexOf('\nasync function loadCanonicalProfile(',aliasStart);
assert(aliasStart>=0&&aliasEnd>aliasStart,'cloud profile alias helper exists');
vm.runInContext(html.slice(aliasStart,aliasEnd),ctx,{timeout:1000});
const aliases=ctx.cloudProfileAliases('p_usr-068a982d-9638-40cc-8b8c-a595534ab36d__');
assert.equal(aliases['profile:usr-068a982d-9638-40cc-8b8c-a595534ab36d:v2_provisiones'],'planRescate_v2_provisiones');
assert.equal(aliases['profile:usr-068a982d-9638-40cc-8b8c-a595534ab36d:v2_usos'],'planRescate_v2_usos');
assert.deepEqual({...ctx.cloudProfileAliases('invalid')},{});
assert.equal(aliases['profile:usr-068a982d-9638-40cc-8b8c-a595534ab36d:v2_efectivo'],'v2_efectivo');
assert.equal(aliases['profile:usr-068a982d-9638-40cc-8b8c-a595534ab36d:v2_movimientos'],'planRescate_v2_movimientos');
assert.equal(ctx.supersededLegacyCloudKey('planRescate_v2_movimientos',new Set(['planRescate_v2_movimientos'])),true);
assert.match(html,/rawSources=\{movimientos:Array\.isArray\(nextExtra\.v2_movimientos\).*next\.planRescate_v2_movimientos/);
assert.match(html,/renderWalletLinkAudit\(wallet,variableRows,useRows\.present\?useRows\.value:null\)/);

assert.equal(ctx.supersededLegacyCloudKey('planRescate_v2_efectivo',new Set(['v2_efectivo'])),true);
assert.equal(ctx.supersededLegacyCloudKey('v2_efectivo',new Set(['v2_efectivo'])),true);
assert.equal(ctx.supersededLegacyCloudKey('v2_efectivo',new Set()),false);
const activityStart=html.indexOf('function latestWalletMovementDate('),activityEnd=html.indexOf('\nfunction financeSourceNotice(',activityStart);
assert(activityStart>=0&&activityEnd>activityStart,'wallet activity date resolver exists');
vm.runInContext(html.slice(activityStart,activityEnd),ctx,{timeout:1000});
assert.equal(ctx.latestWalletMovementDate({movimientos:[{fecha:'2026-10-07'},{fecha:'2026-10-15T11:27:05.196Z'}]}).raw,'2026-10-15T11:27:05.196Z');
assert.match(html,/más reciente que updated_at de la fila/);

const loader=html.slice(aliasEnd,html.indexOf('\nfunction showProfilePicker(',aliasEnd));
assert.match(loader,/modernTargets/);
assert.match(loader,/ignore its stale legacy mirror/);
console.log('PASS ledger safeguards, parse, and October screenshot arithmetic');
