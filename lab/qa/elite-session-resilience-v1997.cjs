const fs=require('node:fs');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
assert.match(html,/const ELITE_SAFARI_VERSION='1\.9\.98'/);
const start=html.indexOf('const ELITE_SESSION_KEY=');
const end=html.indexOf('async function continueWithSession',start);
assert(start>0&&end>start);
const storage=new Map([['fluxia_elite_auth_session_v1',JSON.stringify({refresh_token:'r'.repeat(24),user_id:'A'})]]);
const ctx={
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
 fetch:async()=>{throw Error('offline')},
 BASE:'https://example.invalid',KEY:'public-test-key',token:'',owner:'',currentUserName:'',
 displayName:user=>user.name||'',Date,JSON,Error
};
vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
(async()=>{
 await assert.rejects(ctx.refreshStoredSession(),e=>e.code==='NETWORK');
 assert(storage.has('fluxia_elite_auth_session_v1'),'Offline must not erase a remembered session');
 ctx.fetch=async()=>({ok:true,status:200,json:async()=>({access_token:'access',refresh_token:'new-token',user:{id:'B'}})});
 await assert.rejects(ctx.refreshStoredSession(),/no corresponde a esta cuenta/);
 assert.equal(ctx.owner,'','Cross-account refresh must not authenticate');
 ctx.fetch=async()=>({ok:true,status:200,json:async()=>({access_token:'access',refresh_token:'new-token',user:{id:'A',name:'Nacho'}})});
 assert.equal(await ctx.refreshStoredSession(),true);
 assert.equal(ctx.owner,'A');
 assert.equal(ctx.currentUserName,'Nacho');
 assert(html.includes('try{await discoverAndLoadProfiles()}catch(error){showAuthenticatedLoadError(error)}'));
 assert(html.includes('clearElitePrivateState();token=data.access_token'));
 assert(html.includes("const signOut=el('button','monthApply','Cerrar sesión en este dispositivo')"));
 assert(!html.includes("$('#logout').classList.remove('hide')"));
 console.log('PASS v1.9.97 offline session, identity and logout location');
})().catch(error=>{console.error(error);process.exitCode=1});
