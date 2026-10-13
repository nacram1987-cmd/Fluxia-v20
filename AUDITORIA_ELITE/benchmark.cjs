'use strict';
const fs=require('node:fs'),{performance}=require('node:perf_hooks');
const {JSDOM,VirtualConsole}=require('../auditorias/qa-v97.66/node_modules/jsdom');
const {IDBFactory,IDBKeyRange}=require('../auditorias/qa-v97.66/node_modules/fake-indexeddb');
const versions=['lab/v97.68.html','lab/v97.69.html','lab/v97.70.html','lab/v97.71.html','lab/v97.72.html'];
const metrics=Object.fromEntries(versions.map(x=>[x,{construction:[],menu:[],warmVariables:[],coldVariables:[],bankPanel:[],domContentLoaded:[],errors:[]} ]));
const summarize=a=>{const s=[...a].sort((x,y)=>x-y);return {n:s.length,median:s[Math.floor(s.length/2)],p95:s[Math.ceil(s.length*.95)-1],min:s[0],max:s.at(-1)}};
(async()=>{for(let run=0;run<10;run++)for(const file of [...versions.slice(run%3),...versions.slice(0,run%3)]){
 const html=fs.readFileSync(file,'utf8'),out=metrics[file],vc=new VirtualConsole();vc.on('jsdomError',e=>out.errors.push(e.message));
 if(global.gc)global.gc();
 const start=performance.now();let domAt=null;
 const dom=new JSDOM(html,{url:'https://nacram1987-cmd.github.io/Fluxia-v20/lab/test.html',pretendToBeVisual:true,runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.addEventListener('DOMContentLoaded',()=>{domAt=performance.now()-start});w.indexedDB=new IDBFactory();w.IDBKeyRange=IDBKeyRange;w.fetch=async()=>{throw Error('controlled offline benchmark')};w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addListener(){},addEventListener(){}});w.HTMLCanvasElement.prototype.getContext=()=>null;}});
 out.construction.push(performance.now()-start);const w=dom.window;
 try{
 await new Promise(r=>setTimeout(r,1600));out.domContentLoaded.push(domAt);
 w.eval(`movimientos=Array.from({length:400},(_,i)=>({id:'qa-'+i,mes:mesSeleccionado,fecha:'2026-10-13',concepto:'Prueba '+i,importe:3.5,categoria:'Otros'}));window.movimientos=movimientos;`);
 let t=performance.now();w.goToTab('gastos-variables');w.fxNav9761Invalidate();w.fxNav9761Render('gastos-variables');out.coldVariables.push(performance.now()-t);
 for(let i=0;i<20;i++){t=performance.now();w.document.getElementById('btnMenu').click();out.menu.push(performance.now()-t);w.closeDrawer();t=performance.now();w.fxNav9761Render('gastos-variables');out.warmVariables.push(performance.now()-t)}
 t=performance.now();const bankOpen=w.abrirConexionBancaria();out.bankPanel.push(performance.now()-t);await bankOpen;
 }finally{w.close()}
 }
 const result={environment:'Node '+process.version+' / JSDOM 30.1.2 / Linux; offline; 400 movements; interleaved order',controlledHeap:!!global.gc,units:'milliseconds of host JS/DOM operations, NOT iPhone responsiveness or rendering',repeats:10,physicalIOS:false,browserPainting:false,LCP:null,INP:null,CLS:null,FPS:null,versions:{}};
 for(const [file,m]of Object.entries(metrics)){result.versions[file]={};for(const [k,v]of Object.entries(m))result.versions[file][k]=k==='errors'?v:summarize(v)}
 fs.writeFileSync('AUDITORIA_ELITE/logs/benchmark.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
