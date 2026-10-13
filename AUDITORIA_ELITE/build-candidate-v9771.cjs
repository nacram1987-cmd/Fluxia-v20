'use strict';
const fs=require('node:fs');
let html=fs.readFileSync('lab/v97.70.html','utf8');
function replaceOnce(a,b,label){const n=html.split(a).length-1;if(n!==1)throw Error(label+': expected one anchor, found '+n);html=html.replace(a,b)}

// A list diff cannot prove user intent. Only explicit delete handlers may file
// a record in Papelera; retain the existing explicit push()/enviar() paths.
replaceOnce(
 'autoDiff:function(key,val){try{autoDiff(key,val)}catch(e){}try{if(prev.autoDiff)prev.autoDiff(key,val)}catch(e){}},',
 'autoDiff:function(){return false},',
 'Papelera autoDiff'
);

// Keep explicit user deletions recoverable after disabling unsafe list diffs.
replaceOnce(
 'window._fluxiaRegistrarBorradoGV=function(mv){try{if(!mv)return;try{if(window.FluxiaBancoFijos&&FluxiaBancoFijos.olvidarCargo)FluxiaBancoFijos.olvidarCargo(mv)}catch(_ol){}if(window.FluxiaGVBorrados)FluxiaGVBorrados.registrar(mv);else{if(mv.bancoRef)marcarMovimientoBorrado(String(mv.bancoRef));if(mv.id)marcarMovimientoBorrado(String(mv.id))}}catch(e){}};',
 'window._fluxiaRegistrarBorradoGV=function(mv){try{if(!mv)return;try{if(window.FluxiaBancoFijos&&FluxiaBancoFijos.olvidarCargo)FluxiaBancoFijos.olvidarCargo(mv)}catch(_ol){}try{var pap=window.FluxiaPapelera,key="planRescate_v2_movimientos",items=pap&&pap.listar?pap.listar():[],ya=mv.id!=null&&items.some(function(x){return x&&x.key===key&&x.snapshot&&String(x.snapshot.id)===String(mv.id)});if(pap&&pap.push&&!ya)pap.push("Gasto variable",[mv],key)}catch(_pap){}if(window.FluxiaGVBorrados)FluxiaGVBorrados.registrar(mv);else{if(mv.bancoRef)marcarMovimientoBorrado(String(mv.bancoRef));if(mv.id)marcarMovimientoBorrado(String(mv.id))}}catch(e){}};',
 'explicit movement deletion archival'
);

// Do not silently restore movements from Papelera at startup, even when a
// legacy recovery scan is forced. The user can still restore one item manually.
replaceOnce(
 'if(opts.forzar||!localStorage.getItem("fluxia_v63_pap_"+p)){var pc=recuperarDePapelera(listas,inf);if(pc.usos)tocadas.usos=1;if(pc.movimientos)tocadas.movimientos=1;try{localStorage.setItem("fluxia_v63_pap_"+p,(new Date).toISOString())}catch(e){}}',
 'if(opts.forzar||!localStorage.getItem("fluxia_v63_pap_"+p)){try{localStorage.setItem("fluxia_v63_pap_"+p,(new Date).toISOString())}catch(e){}}',
 'automatic recovery from Papelera'
);

// Replace only the two matcher functions inside the bank/fixed controller.
const tags=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const idx=tags.findIndex(m=>m[1].includes('window.FluxiaBancoFijos=function'));
if(idx<0)throw Error('Bank/fixed controller not found');
let script=tags[idx][1];
function replaceFunction(startName,nextName,replacement){
 const start=script.indexOf('function '+startName+'('),end=script.indexOf('function '+nextName+'(',start+1);
 if(start<0||end<0)throw Error('Function boundary missing: '+startName);
 script=script.slice(0,start)+replacement+script.slice(end);
}
replaceFunction('mejorFijo','aplicarVinculo',
 'function mejorFijo(concepto,importe,fecha){var mes=mesDeFecha(fecha);if(!mes)return null;var scored=fijosDelMes(mes).map(function(f){return{fijo:f,score:scoreFijo(concepto,importe,f)}}).filter(function(x){return x.score>=45}).sort(function(a,b){return b.score-a.score});if(!scored.length)return null;var top=scored[0],tied=scored.filter(function(x){return x.score===top.score}).length>1;if(tied)return null;return{fijo:top.fijo,score:top.score,auto:top.score>=70&&!top.fijo.pagadoEl}}'
);
replaceFunction('fijoMismoImporte','financiacionMismaCuota',
 'function fijoMismoImporte(gasto){var imp=Number(gasto.importe)||0;if(!(imp>0))return null;var mes=mesDeFecha(gasto.fecha);if(!mes)return null;var amountMatches=fijosDelMes(mes).filter(function(f){var fi=Number(f.importe)||0;return!f.pagadoEl&&fi>0&&Math.abs(fi-imp)<=.05});if(!amountMatches.length)return null;var textMatches=amountMatches.filter(function(f){return scoreFijo(gasto.concepto,imp,f)>=45});if(textMatches.length===1)return textMatches[0];if(textMatches.length>1)return null;return amountMatches.length===1?amountMatches[0]:null}'
);
const old=tags[idx][0],next=old.replace(tags[idx][1],script);
html=html.slice(0,tags[idx].index)+next+html.slice(tags[idx].index+old.length);
html=html.replaceAll('v97.70-LAB','v97.71-LAB').replaceAll('v97.70','v97.71');
html=html.replace('\n    \n    <div class="fx30-wave','\n\n    <div class="fx30-wave');
fs.mkdirSync('AUDITORIA_ELITE/candidate',{recursive:true});
fs.writeFileSync('AUDITORIA_ELITE/candidate/v97.71.html',html);
console.log(JSON.stringify({candidate:'v97.71-LAB',base:'v97.70-LAB',papereraAutoDiff:false,autoRestoreFromTrash:false,unknownMerchantExactUniqueFixed:'manual suggestion only',tiedFixedCandidates:'never auto-link',bytes:Buffer.byteLength(html)}));
