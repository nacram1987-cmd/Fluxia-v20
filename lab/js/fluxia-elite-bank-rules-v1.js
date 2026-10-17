(function(root){
 'use strict';
 // Reglas de clasificación bancaria creadas por el propio usuario. Lógica genérica: no contiene nombres, cuentas ni importes.
 // Una decisión sobre un cargo nuevo se convierte en una regla que solo afecta a ese usuario (se guarda en su perfil).
 var DECISIONS={propio:'propio',puente:'puente',real:'real',olvidar:'olvidar'};
 var ROLES={corriente:true,ahorro:true,tarjeta:true,efectivo:true};
 function words(text){
  return String(text||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').split(/[^a-z0-9]+/).filter(function(w){return w.length>=2&&!/^\d{4,}$/.test(w)});
 }
 // Una regla nueva necesita palabras con sentido: sin ellas, un concepto vacío casaría con cualquier cargo.
 function ruleFromDecision(input){
  var tokens=words(input&&input.concepto), decision=DECISIONS[input&&input.decision];
  if(!tokens.length)return {ok:false,reason:'CONCEPTO_SIN_PALABRAS'};
  if(!decision)return {ok:false,reason:'DECISION_NO_VALIDA'};
  var amount=Number(input.importeCents);
  if(!Number.isFinite(amount)||amount===0)return {ok:false,reason:'IMPORTE_NO_VALIDO'};
  var dir=amount<0?'out':'in';
  var rule={t:tokens,tipo:decision,dir:decision==='olvidar'?'*':dir,ts:Number(input.ts)||Date.now(),sup:true,origen:'confirmacion-bandeja'};
  return {ok:true,rule:rule};
 }
 // Cuentas con función: solo se aceptan roles conocidos y, si es tarjeta, un día de cobro del recibo entre 1 y 31.
 function validateAccount(account){
  if(!account||typeof account!=='object')return {ok:false,reason:'CUENTA_NO_VALIDA'};
  if(!ROLES[account.rol])return {ok:false,reason:'ROL_NO_VALIDO'};
  if(account.rol==='tarjeta'){
   var day=Number(account.diaCobroRecibo);
   if(!Number.isInteger(day)||day<1||day>31)return {ok:false,reason:'DIA_COBRO_NO_VALIDO'};
  }
  return {ok:true};
 }
 // Igual que la regla del traspaso del conector: una regla nueva sustituye a la igual; «olvidar» anula.
 function mergeRules(existing,rule){
  var list=Array.isArray(existing)?existing.slice():[];
  var key=rule.t.slice().sort().join(' ');
  var kept=list.filter(function(r){return !(r&&Array.isArray(r.t)&&r.t.slice().sort().join(' ')===key&&Number(r.ts||0)<=Number(rule.ts||0))});
  kept.push(rule);
  return kept;
 }
 var api={version:'1.0.0',words:words,ruleFromDecision:ruleFromDecision,validateAccount:validateAccount,mergeRules:mergeRules,DECISIONS:DECISIONS};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.FluxiaEliteBankRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
