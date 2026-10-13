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
const helper='function fx9770MismoCargo(x,m,requireBank){if(!x||!m)return false;const concept=normCat((m.contraparte&&m.contraparte.length>1?m.contraparte:m.concepto)||""),stored=normCat(x.concepto||"");if(!concept||stored!==concept)return false;const xb=nomBanco(x.banco),mb=nomBanco(m.banco);if(requireBank&&(!xb||!mb||xb!==mb))return false;if(xb&&mb&&xb!==mb)return false;const xa=String((window.FluxiaBankIdentity9770?FluxiaBankIdentity9770.account(x):x.bancoAccountKey)||x.cuentaId||x.accountId||x.account_id||""),ma=String(m.accountKey||m.cuentaId||m.accountId||m.account_id||"");return !(xa&&ma&&xa!==ma)}';
output=output.replace('function yaExisteManual(',helper+'function yaExisteManual(');
// Namespace only on response/import, never on startup finance/render.
const identity=fs.readFileSync('AUDITORIA_ELITE/banco/identity9770.js','utf8');

const replaceBank=(a,b)=>{if(output.split(a).length!==2)throw Error('Missing identity anchor '+a.slice(0,60));output=output.replace(a,b)};
replaceBank('Fluxia-banco-lab9755','Fluxia-banco-lab9770');
replaceBank('try{if(data&&(data.avisos||data.errorFondo||data.error))', 'if(data&&Array.isArray(data.movimientos)){var _identityPlan=FluxiaBankIdentity9770.plan(data.movimientos);FluxiaBankIdentity9770.apply(_identityPlan);data.movimientos=_identityPlan.items;FluxiaBankIdentity9770.conflicts(_identityPlan);if(_identityPlan.conflicts.length){data.avisos=(data.avisos?data.avisos+" · ":"")+_identityPlan.conflicts.length+" cargo(s) requieren revisar su cuenta antigua; no se han fusionado"}}try{if(data&&(data.avisos||data.errorFondo||data.error))');
replaceBank('if(g){g.origen="banco";g.bancoV=MARCA;g.bancoRef=m.id;', 'if(g){FluxiaBankIdentity9770.stamp(g,m);g.origen="banco";g.bancoV=MARCA;g.bancoRef=m.id;');
replaceBank('pend.bancoPendiente=false;pend.bancoRef=m.id;', 'FluxiaBankIdentity9770.stamp(pend,m);pend.bancoPendiente=false;pend.bancoRef=m.id;');
replaceBank('manual.bancoRef=m.id;ids.add(m.id);', 'FluxiaBankIdentity9770.stamp(manual,m);manual.bancoRef=m.id;ids.add(m.id);');
replaceBank('if(r)ingMarcarVisto(m.id);', 'if(r&&r.it)FluxiaBankIdentity9770.stamp(r.it,m);if(r)ingMarcarVisto(m.id);');
replaceBank('nuevosList.push({id:g.id||m.id,bancoRef:m.id,', 'nuevosList.push({id:g.id||m.id,bancoRef:m.id,bancoIdentity:g.bancoIdentity,banco:g.banco,');
const notifyStart=output.indexOf('if(tot.nuevos){try{document.dispatchEvent'),notifyEnd=output.indexOf('return tot}catch(err)',notifyStart);
if(notifyStart<0||notifyEnd<0)throw Error('Notification block missing');
output=output.slice(0,notifyStart)+'if(tot.nuevos){document.dispatchEvent(new CustomEvent("fluxia:banco-nuevos",{detail:{nuevos:tot.nuevos,banco:e.banco,movimientos:tot.movimientos||[]}}))}'+output.slice(notifyEnd);
html=html.slice(0,tags[97].index)+tags[97][0].replace(bank,output)+html.slice(tags[97].index+tags[97][0].length);
if(html.split(tags[9][0]).length!==2)throw Error('Identity bootstrap anchor');html=html.replace(tags[9][0],tags[9][0].replace(tags[9][1],tags[9][1]+'\n'+identity));
const replaceHTML=(a,b)=>{if(html.split(a).length!==2)throw Error('Missing shared identity anchor '+a.slice(0,60));html=html.replace(a,b)};
replaceHTML('function movimientoBancoVetado(m,banco){try{','function movimientoBancoVetado(m,banco){if(m&&(m.bancoIdentity||String(m.id||m.bancoRef||"").indexOf("fxbank9770:")===0)&&window.FluxiaBankIdentity9770)return FluxiaBankIdentity9770.ignored(m);try{');
replaceHTML('function debeIgnorarBanco(m,banco){try{', 'function debeIgnorarBanco(m,banco){if(m&&(m.bancoIdentity||String(m.id||m.bancoRef||"").indexOf("fxbank9770:")===0)&&window.FluxiaBankIdentity9770)return FluxiaBankIdentity9770.ignored(m);try{');
replaceHTML('concepto:mv.concepto,banco:mv.banco};return!debeIgnorarBanco(fake,mv.banco)', 'concepto:mv.concepto,banco:mv.banco,bancoIdentity:mv.bancoIdentity,bancoLegacyId:mv.bancoLegacyId};return!debeIgnorarBanco(fake,mv.banco)');
// Remove the competing legacy notifier; keep script110 as the single event owner.
const nowTags=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
let legacy=nowTags[109][1];const oldHook=legacy.match(/function hookSyncNotif\(\)\{[\s\S]*?\}function bindUI/)[0].slice(0,-'function bindUI'.length);
replaceHTML(oldHook,'function hookSyncNotif(){}');
const currentTags=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
let notifier=currentTags[110][1];let notifyNode=null;
function findNotification(n){if(!n||typeof n!=='object')return;if(n.type==='Property'&&n.key&&n.key.name==='mostrarCargo')notifyNode=n;for(const[k,v]of Object.entries(n))if(k!=='start'&&k!=='end')Array.isArray(v)?v.forEach(findNotification):findNotification(v)}
findNotification(acorn.parse(notifier,{ecmaVersion:'latest'}));if(!notifyNode)throw Error('Single notifier missing');
const oldNotify=notifier.slice(notifyNode.start,notifyNode.end),newNotify=fs.readFileSync('AUDITORIA_ELITE/banco/notification9770.js','utf8').trim();
replaceHTML(oldNotify,newNotify);
replaceHTML('window.FluxiaWebPush.mostrarCargo(conc,imp,{id:m.id||m.bancoRef})','window.FluxiaWebPush.mostrarCargo(conc,imp,{id:m.bancoIdentity||m.bancoRef||m.id})');
html=html.replaceAll('v97.69-LAB','v97.70-LAB').replace('window.FLUXIA_LAB_VERSION="v97.69"','window.FLUXIA_LAB_VERSION="v97.70"');
fs.mkdirSync('AUDITORIA_ELITE/candidate',{recursive:true});
fs.writeFileSync('AUDITORIA_ELITE/candidate/v97.70.html',html);
console.log(JSON.stringify({candidate:'v97.70',base:'v97.69',changedFunctions:3,outputBytes:Buffer.byteLength(html),publication:'LAB only after complete CI and deployment smoke; stable never promoted here'}));
