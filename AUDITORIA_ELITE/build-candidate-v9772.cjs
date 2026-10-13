'use strict';
// Regression-safe, reproducible LAB build. No stable/PWA promotion.
const fs=require('node:fs'),assert=require('node:assert/strict');
const replacements=[
 ['if(scoreFijo(_merchant,_amount,{nombre:x.fijoNombre,importe:_amount,pagadoEl:null})<45)return false','if(x.modo!=="importe"&&scoreFijo(_merchant,_amount,{nombre:x.fijoNombre,importe:_amount,pagadoEl:null})<45)return false'],
 ['if(!_fixed||_fixed.pagadoEl||scoreFijo(_merchant,_amount,_fixed)<45)return false','if(!_fixed||_fixed.pagadoEl||(x.modo==="importe"?(Math.abs((Number(_fixed.importe)||0)-_amount)>.05||fijosDelMes(_month).filter(function(f){return f&&!f.pagadoEl&&(Number(f.importe)||0)>0&&Math.abs((Number(f.importe)||0)-_amount)<=.05}).length!==1):scoreFijo(_merchant,_amount,_fixed)<45))return false'],
 ['if(vistos[g.id]||enCola[g.id]||decRevisado(g))return;','if(enCola[g.id]||decRevisado(g)||estaDismiss(huellaMov(g)))return;if(vistos[g.id]&&!mejorFijo(g.concepto,Number(g.importe)||0,g.fecha)&&!fijoMismoImporte(g))return;']
];
function patch(h){for(const [before,after] of replacements){const count=h.split(before).length-1;assert.equal(count,1,'unique anchor: '+before.slice(0,60));h=h.replace(before,after)}return h.replaceAll('v97.71','v97.72')}
const files=[
 ['lab/v97.71.html','lab/v97.72.html',s=>patch(s)],
 ['lab/v97.71/index.html','lab/v97.72/index.html',s=>patch(s)],
 ['lab/v97.71/manifest.webmanifest','lab/v97.72/manifest.webmanifest',s=>s.replaceAll('v97.71','v97.72').replaceAll('9771','9772')],
 ['lab/v97.71/fluxia-sw.js','lab/v97.72/fluxia-sw.js',s=>s.replaceAll('v97.71','v97.72').replaceAll('9771','9772')]
];
for(const [from,to,transform] of files){
 const expected=transform(fs.readFileSync(from,'utf8'));
 if(process.argv.includes('--check')){const actual=fs.readFileSync(to,'utf8');if(actual!==expected){let i=0;while(i<actual.length&&i<expected.length&&actual[i]===expected[i])i++;console.error(JSON.stringify({file:to,firstDiff:i,actualLength:actual.length,expectedLength:expected.length,actualSnippet:actual.slice(Math.max(0,i-90),i+120),expectedSnippet:expected.slice(Math.max(0,i-90),i+120)}));throw Error('candidate drift '+to)}}
 else {fs.mkdirSync(require('node:path').dirname(to),{recursive:true});fs.writeFileSync(to,expected)}
}
const old=fs.readFileSync('lab/v97.71.html','utf8'),newer=fs.readFileSync('lab/v97.72.html','utf8');
const scripts=h=>[...h.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
const a=scripts(old),b=scripts(newer);assert.equal(a.length,168);assert.equal(b.length,a.length);
const changed=[];for(let i=0;i<b.length;i++)if(a[i]!==b[i].replaceAll('v97.72','v97.71'))changed.push(i);
assert.deepEqual(changed,[96],'no unrelated runtime JS changes, especially financial code');
console.log(JSON.stringify({version:'v97.72',reference:'v97.71',changedScriptIndices:changed,checked:process.argv.includes('--check'),safe:'No index.html or base PWA edits'}));
