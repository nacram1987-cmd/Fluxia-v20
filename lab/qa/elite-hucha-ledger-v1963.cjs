'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const a=html.indexOf('function reconstructedHuchaLedger('),b=html.indexOf('function huchaUsesFromSource(',a);
assert(a>=0&&b>a);
const ctx=vm.createContext({
 MONTHS:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
 grossHuchaContributions:hs=>({complete:!hs.some(h=>h.invalid),cents:hs.reduce((n,h)=>n+h.aportado*100,0),details:hs.map(h=>({cents:h.aportado*100}))}),
 exactHuchaUsageLink:(u,hs)=>{const h=hs.find(x=>x.id===u.huchaId);return h?{kind:'linked',hucha:h}:{kind:'unverified'}},
 candidateHuchaByName:(u,hs)=>{const h=hs.find(x=>x.id===u.huchaId);if(h)return {kind:'linked',hucha:h};const names=hs.filter(x=>x.nombre===u.provision);return names.length===1?{kind:'name_candidate',hucha:names[0]}:{kind:'unverified'}},
 temporaryUseOutstanding:u=>u.broken?{kind:'history_mismatch'}:{kind:'verified_summary',repaidCents:Math.round((u.repuesto||0)*100)},
 el:(tag,cls,text)=>({tag,cls,text,children:[],append(...xs){this.children.push(...xs)}}),money:n=>n+' €'
});
vm.runInContext(html.slice(a,b),ctx,{timeout:1000});const fn=ctx.reconstructedHuchaLedger;
vm.runInContext(html.slice(html.indexOf('const actualChargeDate='),html.indexOf('const chargeMeta=')),ctx);
const h=[{id:'a',nombre:'Césped',aportado:70},{id:'b',nombre:'Boda',aportado:150}];
const uses=[{id:'u1',huchaId:'a',tipo:'definitivo',importe:70,repuesto:0,fecha:'2026-09-20'},{id:'u2',huchaId:'b',tipo:'temporal',importe:80,repuesto:30,fecha:'2026-10-05'}];
assert.equal(fn(h,uses).provisionalCents,10000);
assert.equal(fn(h,uses).complete,true);
assert.equal(fn(h,[...uses,uses[0]]).complete,false);
assert.equal(fn(h,[...uses,{id:'u3',provision:'Césped',importe:10,tipo:'definitivo'}]).complete,false);
assert.equal(fn(h,[{...uses[1],broken:true}]).complete,false);
assert.equal(fn([{...h[0],rescates:[{importe:12}]},h[1]],uses).complete,false);
assert.equal(fn(h,null).complete,false);
assert.equal(fn([{...h[0],invalid:true},h[1]],uses).complete,false);
assert(ctx.renderReconstructedHuchaLedger(h,uses,'test'));
assert.match(html,/const ELITE_SAFARI_VERSION='(?:1\.9\.63|2\.0\.(?:00|01|02|03))'/);
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1])new vm.Script(m[1]);
console.log('PASS v1.9.63 reconstruction, duplicate/unmatched/unknown/hidden history guards, parse');
