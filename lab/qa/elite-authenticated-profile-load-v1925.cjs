'use strict';
// Regression: authenticated Fluxia profile must load without invoking removed reconciliation helpers.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const start=html.indexOf('async function loadCanonicalProfile('),end=html.indexOf('function showProfilePicker(',start);
assert(start>=0&&end>start,'Authenticated profile loading function missing');
const source=html.slice(start,end);
assert(!source.includes('identifyUnmatchedOctober'),'Obsolete October function is breaking authenticated login');
const id='p_usr-11111111-1111-4111-8111-111111111111__';
const keys=['ingresos','fijos','movimientos','provisiones','compartidos','financiaciones'].map(x=>'planRescate_v2_'+x);
const modules=keys.map((key,i)=>({id:String(i),key}));
const rows=[...keys,'v2_movimientos'].map(key=>({clave:id+key,user_id:'accountA',v:[],updated_at:'2026-10-05T12:00:00Z'}));
let n=0;
async function test(name,fn){await fn();console.log('PASS',name);n++}
(async()=>{
 const c={token:'dummy-token',owner:'accountA',mods:modules,authRequest:async()=>rows,draftEdits:new Map(),csvAudit:null,csvAuditError:'',walletBackup:null,walletBackupError:'',motherAudit:null,fullProfileAudit:null,extraFinance:{},items:{},sourceUpdated:{},activeProfile:'',rawSources:{},page:'inicio',search:'',period:'Todos',render:()=>{c.rendered=true},hideLoading:()=>{},openTutorial:()=>{},rendered:false};
 vm.createContext(c);vm.runInContext(source,c,{timeout:1000});
 await test('Can load authenticated profile without ReferenceError',async()=>{await c.loadCanonicalProfile(id);assert.equal(c.activeProfile,id);assert(c.rendered)});
 await test('Cloud sources loaded, not duplicated',async()=>assert.equal(c.items.planRescate_v2_movimientos.length,0));
 await test('User ownership validation works',async()=>{c.authRequest=async()=>[{...rows[0],user_id:'accountB'}];await assert.rejects(c.loadCanonicalProfile(id),/Protección de perfil/);assert.equal(c.activeProfile,id)});
 await test('Malformed profile is blocked',async()=>await assert.rejects(c.loadCanonicalProfile('other'),/Perfil financiero no válido/));
 console.log('RESULT',n,'authenticated-load regression tests passed')
})().catch(e=>{console.error(e);process.exitCode=1});
