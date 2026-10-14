'use strict';
// Offline regressions for read-only JSON profile comparison; no private user data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const between=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a);assert(a>=0&&b>a,'Missing '+start);return html.slice(a,b)};
const code=between('function motherRowId(','function renderMotherComparison(){');
const profile='usr-11111111-1111-4111-8111-111111111111', owner='owner-a';
const context={
 owner,token:'only-in-memory',activeProfile:'p_'+profile+'__',selectedMonth:'2026-10',
 MONTHS:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 mods:[{id:'variables',key:'movimientos'}],items:{movimientos:[]},
 canon:m=>context.items[m.key],render:()=>{context.renderCount++},renderCount:0,
 originalVisibleVariable:(row,month)=>row.mes===month,
 field:(row,keys)=>keys.map(k=>row[k]).find(Boolean)||null,
 motherAudit:null
};
vm.createContext(context);vm.runInContext(code,context,{timeout:1000});
let tests=0;
async function check(name,fn){await fn();tests++;console.log('PASS',name)}
(async()=>{
 const row=(id,value=7.5)=>({id,mes:'octubre',concepto:'Test',importe:value,fecha:'2026-10-14'});
 const file=(obj)=>({size:200,text:async()=>JSON.stringify(obj)});
 const backup=(p,rows)=>({v:'fluxia-perfil-v1',profile:{id:p},keys:{['fluxia_user_'+p+'__v2_movimientos']:JSON.stringify(rows)}});
 await check('Matching backup compares without writing',async()=>{context.items.movimientos=[row('a')];await context.auditMotherFile(file(backup(profile,[row('a')])));assert.equal(context.motherAudit.missing.length,0);assert.equal(context.motherAudit.different.length,0);assert.equal(context.motherAudit.sourceType,'archivo privado exportado del HTML')});
 await check('Different amount identified',async()=>{context.items.movimientos=[row('a',8)];await context.auditMotherFile(file(backup(profile,[row('a')])));assert.equal(context.motherAudit.different.length,1)});
 await check('Missing movement identified',async()=>{context.items.movimientos=[];await context.auditMotherFile(file(backup(profile,[row('a')])));assert.equal(context.motherAudit.missing.length,1)});
 await check('Wrong profile rejected',async()=>{await assert.rejects(context.auditMotherFile(file(backup('usr-22222222-2222-4222-8222-222222222222',[row('a')]))),/no pertenece a este perfil/)});
 await check('Oversize backup rejected',async()=>{await assert.rejects(context.auditMotherFile({size:9*1024*1024,text:async()=>''}),/8 MB/)});
 await check('Missing canonical key rejected',async()=>{await assert.rejects(context.auditMotherFile(file({v:'fluxia-perfil-v1',profile:{id:profile},keys:{}})),/no contiene los movimientos/)});
 console.log('RESULT',tests,'offline local-backup comparison regressions passed')
})().catch(e=>{console.error(e);process.exitCode=1});
