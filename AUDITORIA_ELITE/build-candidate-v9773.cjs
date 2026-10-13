'use strict';
/* Fluxia v97.73 LAB: derived monthly actual spending, no ledger mutations. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const oldCard='<div class="gv-mini" aria-label="Resumen de gastos variables">\n<div><span>Variables del mes · incluye cartera</span><strong id="gvStatMes">—</strong></div>\n<div><span>Variables de todo el plan</span><strong id="gvStatTotal">—</strong></div>\n</div>';
const newCard='<div class="gv-mini" aria-label="Resumen de gastos realizados">\n<div style="grid-column:1 / -1"><span>💶 Total gastado este mes</span><strong id="gvStatGastadoMes">—</strong></div>\n<div><span>Variables del mes · incluye cartera</span><strong id="gvStatMes">—</strong></div>\n<div><span>Fijos y cuotas pagados</span><strong id="gvStatFijosPagados">—</strong></div>\n<div style="grid-column:1 / -1"><span>Variables acumuladas del plan</span><strong id="gvStatTotal">—</strong></div>\n</div>';
const oldRender='var _gvQuickTotal=_gvResumen.totalMes;var _gvQuickMonth=document.getElementById("gvStatMes");if(_gvQuickMonth)_gvQuickMonth.textContent=eur(_gvQuickTotal,2);var _gvQuickPlan=document.getElementById("gvStatTotal");if(_gvQuickPlan)_gvQuickPlan.textContent=eur(_gvResumen.totalPlan,2)';
const newRender='var _gvQuickTotal=_gvResumen.totalMes;var _gvQuickMonth=document.getElementById("gvStatMes");if(_gvQuickMonth)_gvQuickMonth.textContent=eur(_gvQuickTotal,2);var _gvSpent=fx9769SpentState(mes);var _gvSpentTotal=document.getElementById("gvStatGastadoMes");if(_gvSpentTotal)_gvSpentTotal.textContent=eur(_gvSpent.total,2);var _gvFixedPaid=document.getElementById("gvStatFijosPagados");if(_gvFixedPaid)_gvFixedPaid.textContent=eur(_gvSpent.paid,2);var _gvQuickPlan=document.getElementById("gvStatTotal");if(_gvQuickPlan)_gvQuickPlan.textContent=eur(_gvResumen.totalPlan,2)';
function once(s,from,to){assert.equal(s.split(from).length-1,1,'Nonunique/missing anchor '+from.slice(0,60));return s.replace(from,to)}
function patch(s){return once(once(s,oldCard,newCard),oldRender,newRender).replaceAll('v97.72','v97.73').replaceAll('9772','9773')}
const changes=[
 ['lab/v97.72.html','lab/v97.73.html',patch],
 ['lab/v97.72/index.html','lab/v97.73/index.html',patch],
 ['lab/v97.72/manifest.webmanifest','lab/v97.73/manifest.webmanifest',s=>s.replaceAll('v97.72','v97.73').replaceAll('9772','9773')],
 ['lab/v97.72/fluxia-sw.js','lab/v97.73/fluxia-sw.js',s=>s.replaceAll('v97.72','v97.73').replaceAll('9772','9773')]
];
const checking=process.argv.includes('--check');
for(const [src,dst,transform] of changes){const out=transform(fs.readFileSync(src,'utf8'));if(checking)assert.equal(fs.readFileSync(dst,'utf8'),out,'candidate drift '+dst);else{fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,out)}}
const scripts=s=>[...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
const a=scripts(fs.readFileSync('lab/v97.72.html','utf8')),b=scripts(fs.readFileSync('lab/v97.73.html','utf8'));
assert.equal(a.length,168);assert.equal(b.length,168);
const changed=[];for(let i=0;i<b.length;i++)if(a[i]!==b[i].replaceAll('v97.73','v97.72').replaceAll('9773','9772'))changed.push(i);
assert.deepEqual(changed,[29],'Only Variables read-only render function can change');
assert(!fs.readFileSync('lab/v97.73.html','utf8').includes('id="gvStatGastadoMes">0,00 €'),'No synthetic totals');
console.log(JSON.stringify({version:'v97.73 LAB candidate',base:'v97.72',changedScripts:changed,checking,stableUnchanged:true}));
