'use strict';
// No real login credentials, network calls or customer data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const start=html.indexOf('async function discoverAndLoadProfiles(){'),end=html.indexOf('function loginScreen(){',start);
assert(start>=0&&end>start,'Missing separated authentication data load');
const profile='p_usr-11111111-1111-4111-8111-111111111111__';
const fakeRows=[{clave:profile+'planRescate_v2_ingresos',user_id:'accountA'}];
const c={token:'memory-only',owner:'accountA',authRequest:async()=>fakeRows,loadCanonicalProfile:async(p)=>{c.loaded=p},hideLoading:()=>{},showProfilePicker:(p)=>{c.picker=p}};
vm.createContext(c);vm.runInContext(html.slice(start,end),c,{timeout:1000});
(async()=>{
 let tests=0;const check=(name,fn)=>fn().then(()=>{tests++;console.log('PASS',name)});
 await check('authenticated profile loads without password replay',async()=>{await c.discoverAndLoadProfiles();assert.equal(c.loaded,profile)});
 await check('unknown user id rejected',async()=>{c.authRequest=async()=>[{...fakeRows[0],user_id:'accountB'}];await assert.rejects(c.discoverAndLoadProfiles(),/ajeno/);c.authRequest=async()=>fakeRows});
 await check('no canonical profile returns accurate load error',async()=>{c.authRequest=async()=>[];await assert.rejects(c.discoverAndLoadProfiles(),/Autenticación correcta/);c.authRequest=async()=>fakeRows});
 await check('non matching keys never become profiles',async()=>{c.authRequest=async()=>[{clave:'p_usr-11111111-1111-4111-8111-111111111111__otra',user_id:'accountA'}];await assert.rejects(c.discoverAndLoadProfiles(),/Autenticación correcta/);c.authRequest=async()=>fakeRows});
 await check('new UI distinguishes valid credentials and profile failures',async()=>{assert(html.includes('Sesión iniciada · datos pendientes'));assert(html.includes('Reintentar cargar mis datos'));assert(html.includes('btn.disabled=false;status(e.message'))});
 console.log('RESULT',tests,'login recovery regressions passed')
})().catch(e=>{console.error(e);process.exitCode=1});
