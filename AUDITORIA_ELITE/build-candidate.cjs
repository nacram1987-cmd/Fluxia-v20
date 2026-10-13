'use strict';
const fs=require('node:fs'),acorn=require('../auditorias/qa-v97.66/node_modules/acorn');
let html=fs.readFileSync('lab/v97.69.html','utf8');
const tags=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)],bank=tags[97][1];
let output=bank;const edits=[];function walk(n){if(!n||typeof n!=='object')return;
 if(n.type==='FunctionDeclaration'){
  if(n.id.name==='yaExisteManual')edits.push([n.start,n.end,'function yaExisteManual(fecha,importe,cargo){const cand=listaMovs().filter(x=>x&&!x.bancoRef&&difDias(x.fecha,fecha)<=1&&Math.abs(Number(x.importeOriginal!=null?x.importeOriginal:x.importe)-importe)<.005&&fx9770MismoCargo(x,cargo,false));return cand.length===1?cand[0]:null}']);
  if(n.id.name==='pendienteIgual')edits.push([n.start,n.end,'function pendienteIgual(fecha,importe,cargo){const cand=listaMovs().filter(x=>x&&x.bancoRef&&x.bancoV===MARCA&&x.bancoPendiente&&Math.abs(Number(x.importeOriginal!=null?x.importeOriginal:x.importe)-importe)<.005&&difDias(x.fecha,fecha)<=3&&fx9770MismoCargo(x,cargo,true));return cand.length===1?cand[0]:null}']);
  if(n.id.name==='aplicarMovs'){
   let s=bank.slice(n.start,n.end);
   const replace=(a,b)=>{if(s.split(a).length!==2)throw Error('Nonunique bank patch anchor');s=s.replace(a,b)};
   replace('pendienteIgual(fecha,importe)','pendienteIgual(fecha,importe,m)');
   replace('yaExisteManual(fecha,importe)','yaExisteManual(fecha,importe,m)');
   // Provider IDs of two confirmed records must not be merged by a heuristic.
   const start=s.indexOf('const hNuevo=huellaCargo('),end=s.indexOf('const cb=m.banco?',start);
   if(start<0||end<0)throw Error('Missing fingerprint block');s=s.slice(0,start)+s.slice(end);
   const dupStart=s.indexOf('var yaDup='),dupEnd=s.indexOf('const g=registrarGastoVariable(',dupStart);
   if(dupStart<0||dupEnd<0)throw Error('Missing broad dedupe block');s=s.slice(0,dupStart)+s.slice(dupEnd);
   edits.push([n.start,n.end,s]);
  }
 }
 for(const[k,v]of Object.entries(n))if(k!=='start'&&k!=='end')Array.isArray(v)?v.forEach(walk):walk(v);
}walk(acorn.parse(bank,{ecmaVersion:'latest'}));
if(edits.length!==3)throw Error('Expected exactly three functions');
for(const[start,end,s]of edits.sort((a,b)=>b[0]-a[0]))output=output.slice(0,start)+s+output.slice(end);
const helper='function fx9770MismoCargo(x,m,requireBank){if(!x||!m)return false;const concept=normCat((m.contraparte&&m.contraparte.length>1?m.contraparte:m.concepto)||""),stored=normCat(x.concepto||"");if(!concept||stored!==concept)return false;const xb=nomBanco(x.banco),mb=nomBanco(m.banco);if(requireBank&&(!xb||!mb||xb!==mb))return false;if(xb&&mb&&xb!==mb)return false;const xa=String(x.cuentaId||x.accountId||x.account_id||""),ma=String(m.cuentaId||m.accountId||m.account_id||"");return !(xa&&ma&&xa!==ma)}';
output=output.replace('function yaExisteManual(',helper+'function yaExisteManual(');
html=html.slice(0,tags[97].index)+tags[97][0].replace(bank,output)+html.slice(tags[97].index+tags[97][0].length);
html=html.replaceAll('v97.69-LAB','v97.70-LAB').replace('window.FLUXIA_LAB_VERSION="v97.69"','window.FLUXIA_LAB_VERSION="v97.70"');
fs.mkdirSync('AUDITORIA_ELITE/candidate',{recursive:true});
fs.writeFileSync('AUDITORIA_ELITE/candidate/v97.70.html',html);
console.log(JSON.stringify({candidate:'v97.70',base:'v97.69',changedFunctions:3,outputBytes:Buffer.byteLength(html),publication:'BLOCKED pending extended QA and benchmark'}));
