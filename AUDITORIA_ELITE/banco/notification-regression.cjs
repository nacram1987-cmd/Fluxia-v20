'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('../../auditorias/qa-v97.66/node_modules/jsdom');
const {IDBFactory,IDBKeyRange}=require('../../auditorias/qa-v97.66/node_modules/fake-indexeddb');
const file=process.argv[2]||'AUDITORIA_ELITE/candidate/v97.70.html',html=fs.readFileSync(file,'utf8');
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.70.html',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('offline synthetic')};w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null;w.Notification=function(){};w.Notification.permission='granted'}});
(async()=>{const w=dom.window;try{await new Promise(r=>setTimeout(r,1600));w.FLUXIA_PROFILE={id:'qa-notify-A'};let toasts=0,system=0;w.mostrarToast=()=>{toasts++};w.Notification=function(){system++};w.Notification.permission='granted';
 const emit=id=>w.document.dispatchEvent(new w.CustomEvent('fluxia:banco-nuevos',{detail:{nuevos:1,movimientos:[{id:'local-'+id,bancoRef:id,bancoIdentity:id,concepto:'Prueba',importe:20}]}}));
 emit('account-A:1');assert.equal(toasts,1,'exactly one foreground bank notice');assert.equal(system,0,'foreground does not also emit system notice');
 for(let i=0;i<10;i++)emit('account-A:1');assert.equal(toasts,1,'event repeated 10x does not notify twice');
 emit('account-B:1');assert.equal(toasts,2,'different account transaction still notified');
 w.FLUXIA_PROFILE={id:'qa-notify-B'};emit('account-A:1');assert.equal(toasts,3,'different user has isolated notification ledger');
 w.FLUXIA_PROFILE={id:'qa-notify-A'};emit('account-A:1');assert.equal(toasts,3,'return to A does not resurrect notification');
 Object.defineProperty(w.document,'visibilityState',{value:'hidden',configurable:true});emit('account-A:2');assert.equal(system,1);assert.equal(toasts,3,'one delivery channel in background');emit('account-A:2');assert.equal(system,1);
 // Actual archive engine: a deleted canonical reference cannot delete another
 // same-day/same-amount purchase, including in another account.
 const m={id:'local-archived',bancoRef:'fxbank9770:["enablebanking","caixa","A","raw1"]',bancoIdentity:'fxbank9770:["enablebanking","caixa","A","raw1"]',bancoLegacyId:'raw1',fecha:'2026-10-13',importe:20,concepto:'Mercadona',banco:'Caixa',origen:'banco'};
 w.FluxiaGVBorrados.registrar(m);
 const other={...m,id:'local-other',bancoRef:'fxbank9770:["enablebanking","caixa","B","raw1"]',bancoIdentity:'fxbank9770:["enablebanking","caixa","B","raw1"]'};
 assert.equal(w.FluxiaGVBorrados.debeIgnorarBanco({...m,id:m.bancoRef}),true);
 assert.equal(w.FluxiaGVBorrados.debeIgnorarBanco({...other,id:other.bancoRef}),false,'archive does not erase another account payment');
 assert.equal(w.FluxiaGVBorrados.purgarListaLocal([m,other]).length,1);
 assert.equal(w.movimientoBancoVetado({...other,id:other.bancoRef}),false,'all bank veto paths preserve the other account');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({file,foregroundNoticePerCharge:1,duplicateEventRepetitions:10,backgroundChannels:1,userIsolation:true,accountIsolation:true,canonicalArchivePreserved:true,sameAmountOtherAccountNotPurged:true,physicalPushDelivery:false,errors},null,2));
 }finally{w.close()}})().catch(e=>{console.error(e);process.exitCode=1});
