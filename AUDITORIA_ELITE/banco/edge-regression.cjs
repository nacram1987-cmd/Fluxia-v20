'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('node:crypto');
const acorn=require('../../auditorias/qa-v97.66/node_modules/acorn');
const ts=fs.readFileSync('AUDITORIA_ELITE/banco/Fluxia-banco-lab9770.ts','utf8');
const js=stripTypeScriptTypes(ts,{mode:'transform'});acorn.parse(js,{ecmaVersion:'latest',sourceType:'module'});
const ast=acorn.parse(js,{ecmaVersion:'latest',sourceType:'module'}),wanted=['mapMov','mapCuentas','fetchMovsSesion','friendlyEbError'];
const source=ast.body.filter(n=>n.type==='FunctionDeclaration'&&wanted.includes(n.id.name)).map(n=>js.slice(n.start,n.end)).join('\n');
const txn={entry_reference:'same-provider-id',booking_date:'2026-10-13',transaction_amount:{amount:'20.00',currency:'EUR'},credit_debit_indicator:'DBIT',description:'Mercadona',status:'BOOK'};
let calls=0;const c={crypto:webcrypto,TextEncoder,URLSearchParams,Date,Array,Uint8Array,Number,String,Math,console,hoyISO:()=> '2026-10-13',hub046SigueActivo:()=>false,ebFetch:async()=>{calls++;return {transactions:[txn]}}};vm.createContext(c);vm.runInContext(source,c);
(async()=>{
 const a=await c.fetchMovsSesion({banco:'Caixa',account_uids:['uid-A','uid-B'],cuentas:[{uid:'uid-A',iban:'QA-IBAN-A'},{uid:'uid-B',iban:'QA-IBAN-B'}]},'2026-10-01');
 assert.equal(a.movs.length,2);assert.notEqual(a.movs[0].accountKey,a.movs[1].accountKey);assert.equal(a.movs[0].legacyId,'same-provider-id');assert.equal(calls,2);
 const reconnect=await c.fetchMovsSesion({banco:'Caixa',account_uids:['new-consent-uid'],cuentas:[{uid:'new-consent-uid',iban:'QA-IBAN-A'}]},'2026-10-01');
 assert.equal(reconnect.movs[0].accountKey,a.movs[0].accountKey,'IBAN-based identity stable after consent change');
 const hashed=await c.fetchMovsSesion({banco:'Caixa',account_uids:['hash-uid-A'],cuentas:[{uid:'hash-uid-A',identificationHashes:['qa-identification-hash']}]},'2026-10-01');const rehashed=await c.fetchMovsSesion({banco:'Caixa',account_uids:['hash-uid-B'],cuentas:[{uid:'hash-uid-B',identificationHashes:['qa-identification-hash']}]},'2026-10-01');assert.equal(hashed.movs[0].accountKey,rehashed.movs[0].accountKey);
 const fallback=await c.fetchMovsSesion({banco:'Caixa',account_uids:['uid-A'],cuentas:[]},'2026-10-01');assert(fallback.movs[0].accountKey);
 assert(!JSON.stringify(a.movs).includes('QA-IBAN'),'IBAN not exposed to client');
 // The identity module executed in a synthetic client consumes actual mapped results.
 const client={window:{},Set,Map,Array,JSON,String,Date,Almacen:{getItem:()=>null,setItem:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null}};client.window=client;vm.createContext(client);vm.runInContext(fs.readFileSync('AUDITORIA_ELITE/banco/identity9770.js','utf8'),client);
 const plan=client.FluxiaBankIdentity9770.plan(a.movs,[]);assert.equal(plan.items.length,2);assert.notEqual(plan.items[0].id,plan.items[1].id);assert.equal(plan.conflicts.length,0);const unstableA=c.mapMov({...txn,entry_reference:null,transaction_id:'detail-A'},'Caixa','key-A','uid-A');const unstableB=c.mapMov({...txn,entry_reference:null,transaction_id:'detail-B'},'Caixa','key-A','uid-A');assert.equal(client.FluxiaBankIdentity9770.key(unstableA),client.FluxiaBankIdentity9770.key(unstableB),'transaction detail ID is not used as immutable identity');
 // Full deployed handler with real token-validation/control flow. Supabase and
 // the provider are synthetic boundaries, not accounts created in production.
 let handler,providerCalls=0;const owners=[];
 const sessions=[{id:'s-A',user_id:'A',banco:'Caixa',session_id:'session-A',account_uids:['uid-A'],cuentas:[{uid:'uid-A',iban:'QA-IBAN-A'}]},{id:'s-B',user_id:'B',banco:'Revolut',session_id:'session-B',account_uids:['uid-B'],cuentas:[{uid:'uid-B',iban:'QA-IBAN-B'}]}];
 const database={auth:{getUser:async token=>['A','B'].includes(token)?{data:{user:{id:token}},error:null}:{data:null,error:{message:'invalid'}}},from(){let filters={},update=false;return{select(){return this},update(){update=true;return this},eq(k,v){filters[k]=v;return this},order(){return this},then(resolve){if(!update){assert(filters.user_id,'bank sessions query must restrict owner');owners.push(filters.user_id)}resolve({data:update?null:sessions.filter(row=>Object.entries(filters).every(([k,v])=>row[k]===v)),error:null})}}}};
 const server={Deno:{env:{get:()=> 'qa-only'},serve(fn){handler=fn}},createClient:()=>database,crypto:webcrypto,TextEncoder,URLSearchParams,Request,Response,Date,Array,Uint8Array,Number,String,Math,JSON,Set,console,btoa,atob};vm.createContext(server);
 vm.runInContext(js.replace(/^import .*?from [^;]+;\s*$/gm,''),server);
 server.ebFetch=async()=>{providerCalls++;return {transactions:[txn]}};
 async function request(token){const headers={'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;return handler(new Request('https://qa.invalid/functions/v1/Fluxia-banco-lab9770',{method:'POST',headers,body:JSON.stringify({accion:'movimientos',desde:'2026-10-01'})}))}
 const noAuth=await request(null),badAuth=await request('wrong');assert(noAuth.status>=400);assert(badAuth.status>=400);assert.equal(providerCalls,0,'unauthorized calls never reach provider');
 const outA=await(await request('A')).json(),outB=await(await request('B')).json();assert.equal(outA.movimientos.length,1);assert.equal(outB.movimientos.length,1);assert.equal(outA.movimientos[0].banco,'Caixa');assert.equal(outB.movimientos[0].banco,'Revolut');assert.deepEqual(owners,['A','B']);assert.equal(providerCalls,2);
 console.log(JSON.stringify({serverSyntaxParsed:true,providerAccountCollisionSeparated:true,rawReferenceRetained:true,reconnectionIbanStable:true,reconnectionIdentificationHashStable:true,unstableTransactionDetailIdNotUsedAsIdentity:true,noExtraProviderRequests:true,noIbanInClientPayload:true,actualServerMappingToClientIdentity:true,fullHandlerSyntheticABIsolation:true,unauthorizedProviderRequests:0,livePSD2:false},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
