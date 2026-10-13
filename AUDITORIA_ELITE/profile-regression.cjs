'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('../auditorias/qa-v97.66/node_modules/jsdom');
const {IDBFactory,IDBKeyRange}=require('../auditorias/qa-v97.66/node_modules/fake-indexeddb');
const html=fs.readFileSync(process.argv[2]||'AUDITORIA_ELITE/candidate/v97.70.html','utf8');
let disk={};const profiles=[{id:'qa-A',name:'QA A'},{id:'qa-B',name:'QA B'}];
async function open(id){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(html,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.70.html',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 const get=w.Storage.prototype.getItem,set=w.Storage.prototype.setItem,key=w.Storage.prototype.key,length=Object.getOwnPropertyDescriptor(w.Storage.prototype,'length').get;
 for(const [k,v]of Object.entries(disk))set.call(w.localStorage,k,v);
 const p=profiles.find(p=>p.id===id);set.call(w.localStorage,'fluxia_profile_v2',JSON.stringify(p));set.call(w.sessionStorage,'fluxia_profile_v2',JSON.stringify(p));set.call(w.localStorage,'fluxia_profiles_v2',JSON.stringify(profiles));set.call(w.sessionStorage,'fx_gate_ok','1');
 w.__captureRaw=()=>{const o={};for(let i=0;i<length.call(w.localStorage);i++){const k=key.call(w.localStorage,i);o[k]=get.call(w.localStorage,k)}return o};
 w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('offline profile regression')};w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null;
 }});await new Promise(r=>setTimeout(r,1700));assert.equal(dom.window.FLUXIA_PROFILE.id,id);return {dom,errors,w:dom.window,close(){disk=dom.window.__captureRaw();dom.window.close()}}}
(async()=>{let d=await open('qa-A');assert.equal(d.w.cargarLS('v2_movimientos',[]).length,0);assert(d.w.guardarLS('v2_movimientos',[{id:'a-only',importe:11}]));assert.equal(d.w.cargarLS('v2_movimientos',[])[0].id,'a-only');d.close();
 d=await open('qa-B');assert.equal(d.w.cargarLS('v2_movimientos',[]).length,0,'B cannot see A local ledger');assert(d.w.guardarLS('v2_movimientos',[{id:'b-only',importe:22}]));d.close();
 d=await open('qa-A');assert.equal(d.w.cargarLS('v2_movimientos',[]).length,1);assert.equal(d.w.cargarLS('v2_movimientos',[])[0].id,'a-only','A rebuilt from persisted namespace');assert.deepEqual(d.errors,[]);d.close();
 d=await open('qa-B');assert.equal(d.w.cargarLS('v2_movimientos',[])[0].id,'b-only');assert.deepEqual(d.errors,[]);d.close();
 console.log(JSON.stringify({syntheticProfiles:['A','B'],sameDeviceLocalNamespaces:true,newProfileEmpty:true,reloadPersistence:true,accountAlternations:4,cloudAPI:'NOT TESTED WITH REAL TOKENS',twoPhysicalDevices:false},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
