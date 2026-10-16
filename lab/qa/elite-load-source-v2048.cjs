'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('lab/fluxia-elite-safari-datos-reales.html','utf8');
let scripts=0;for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc=|application\/ld\+json/i.test(m[1])){new vm.Script(m[2]);scripts++}}
const {loadEliteFunctions}=require('./lib/elite-html-functions.cjs');
const S=loadEliteFunctions(),c=S.context;
c.token='test';c.page='inicio';c.search='';c.period='Todos';c.draftEdits=new Map();c.render=()=>{};c.hideLoading=()=>{};c.openTutorial=()=>{};
c.walletBackup=c.fullProfileAudit=c.motherAudit=c.csvAudit=null;c.summarizeProfileBackup=()=>[];
c.financialCloudSnapshot=()=>JSON.parse(JSON.stringify(c.items));
const profile=c.activeProfile.slice(2,-2),stem='fluxia_user_'+profile+'__';
const rows=c.mods.filter(m=>m.key).map(m=>({user_id:c.owner,clave:'profile:'+profile+':v2_'+m.key.replace('planRescate_v2_',''),v:JSON.stringify([{id:'cloud-'+m.id,importe:10}]),t:1792140000000}));
rows.push({user_id:c.owner,clave:'profile:'+profile+':v2_usos',v:'[]',t:1792140000000});
c.authRequest=async q=>q.includes('fluxia_rescue_links')?[]:rows;
vm.runInContext(html.slice(html.indexOf('function stageSameOriginHtmlAsAuthority('),html.indexOf('function renderMotherComparison(')),c);
vm.runInContext(html.slice(html.indexOf('function cloudProfileAliases('),html.indexOf('function showProfilePicker(')),c);
(async()=>{
 await c.loadCanonicalProfile(c.activeProfile);
 assert.equal(c.backupFinance,null);
 for(const m of c.mods.filter(m=>m.key))c.localStorage.setItem(stem+'v2_'+m.key.replace('planRescate_v2_',''),JSON.stringify([{id:'html-'+m.id,importe:20}]));
 c.localStorage.setItem(stem+'v2_usos','[]');c.localStorage.setItem(stem+'v2_efectivo',JSON.stringify({movimientos:[{id:'cash'}]}));c.localStorage.setItem(stem+'v2_presupuestos','[]');
 await c.loadCanonicalProfile(c.activeProfile);
 assert.equal(c.items.planRescate_v2_ingresos[0].id,'cloud-ingresos');
 assert.equal(c.backupFinance.modules.ingresos.records[0].id,'html-ingresos');
 assert.equal(c.backupFinance.cloudSnapshot.planRescate_v2_ingresos[0].id,'cloud-ingresos');
 assert.equal(c.backupFinance.sources.v2_efectivo.value.movimientos[0].id,'cash');
 assert.equal(c.listSourceMode,'html');
 c.localStorage.removeItem(stem+'v2_usos');await c.loadCanonicalProfile(c.activeProfile);assert.equal(c.backupFinance,null);assert.equal(c.items.planRescate_v2_ingresos[0].id,'cloud-ingresos');
 console.log('PASS '+scripts+' executable scripts parse; cloud loading; complete HTML isolation; cash preserved; incomplete HTML fallback');
})().catch(e=>{console.error(e);process.exitCode=1});
