'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const start=html.indexOf('async function revokeEliteLocalSession('),end=html.indexOf('async function refreshStoredSession(',start);
assert(start>=0&&end>start);
const ctx={BASE:'https://example.invalid',KEY:'public-test',fetch:()=>{throw Error('network must be mocked')},AbortController,setTimeout,clearTimeout};
vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
(async()=>{
 let calls=0;
 assert.equal(await ctx.revokeEliteLocalSession('access-fixture',async(url,init)=>{
  calls++;
  assert.equal(url,'https://example.invalid/auth/v1/logout?scope=local');
  assert.equal(init.method,'POST');
  assert.equal(init.headers.Authorization,'Bearer access-fixture');
  assert.equal(init.credentials,'omit');
  assert.equal(init.cache,'no-store');
  return {ok:true};
 }),true);
 assert.equal(calls,1);
 assert.equal(await ctx.revokeEliteLocalSession('access-fixture',async()=>({ok:false})),false);
 assert.equal(await ctx.revokeEliteLocalSession('access-fixture',async()=>{throw Error('offline')}),false);
 assert.equal(await ctx.revokeEliteLocalSession('',async()=>{throw Error('must not call')}),false);
 assert(html.includes('const exitingToken=token;clearElitePrivateState();clearStoredSession()'));
 assert(html.includes('if(!token&&!owner)'));
 console.log('PASS v1.9.99 local server revocation, offline honesty and immediate private-state clearing');
})().catch(e=>{console.error(e);process.exitCode=1});
