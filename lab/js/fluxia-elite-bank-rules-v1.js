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
 // Vinculación automática de un cargo a un fijo o cuota del mes.
 // «auto»: importe exacto, único candidato, fijo fijo (no variable) y no pagado todavía.
 // «ask»: importe parecido, varios candidatos o un fijo de importe variable (margen configurable por el usuario).
 // «none»: traspasos, cargos ya ligados o fijos ya pagados. Nunca se paga dos veces.
 var DEFAULT_VARIABLE_MARGIN_PCT=10, DEFAULT_FIXED_MARGIN_PCT=5;
 function suggestFixedLink(charge,candidates,options){
  var opts=options||{}, varPct=Number(opts.variableMarginPct??DEFAULT_VARIABLE_MARGIN_PCT), fixPct=Number(opts.fixedMarginPct??DEFAULT_FIXED_MARGIN_PCT);
  if(!charge||!Number.isFinite(Number(charge.importeCents))||Number(charge.importeCents)===0)return {action:'none',reason:'CARGO_NO_VALIDO',options:[]};
  if(charge.tipo==='traspaso'||charge.tipo==='puente'||charge.yaLigado)return {action:'none',reason:'NO_ES_GASTO_FIJO',options:[]};
  var amount=Math.abs(Number(charge.importeCents));
  var eligible=(Array.isArray(candidates)?candidates:[]).filter(function(c){return c&&!c.pagado&&Number.isFinite(Number(c.importeCents))});
  if(!eligible.length)return {action:'none',reason:'SIN_FIJOS_PENDIENTES',options:[]};
  var scored=eligible.map(function(c){
   var target=Math.abs(Number(c.importeCents)), diff=Math.abs(target-amount), pct=target?diff/target*100:Infinity;
   return {id:c.id,nombre:c.nombre,importeCents:target,variable:c.variable===true,diff:diff,pct:pct};
  });
  var exact=scored.filter(function(c){return !c.variable&&c.diff===0});
  if(exact.length===1&&scored.filter(function(c){return c.diff===0}).length===1){
   return {action:'auto',fijoId:exact[0].id,reason:'IMPORTE_EXACTO_UNICO',options:[exact[0]]};
  }
  var near=scored.filter(function(c){
   if(c.variable)return c.pct<=varPct;
   return c.diff>0&&c.pct<=fixPct;
  });
  var exactAll=scored.filter(function(c){return c.diff===0});
  if(exactAll.length>1)return {action:'ask',reason:'VARIOS_CON_MISMO_IMPORTE',options:exactAll};
  if(exactAll.length===1&&exactAll[0].variable)return {action:'ask',reason:'FIJO_VARIABLE',options:exactAll};
  if(near.length)return {action:'ask',reason:near.some(function(c){return c.variable})?'FIJO_VARIABLE_MARGEN':'IMPORTE_PARECIDO',options:near};
  return {action:'none',reason:'SIN_COINCIDENCIA',options:[]};
 }
 var api={version:'1.1.0',words:words,ruleFromDecision:ruleFromDecision,validateAccount:validateAccount,mergeRules:mergeRules,suggestFixedLink:suggestFixedLink,DECISIONS:DECISIONS};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.FluxiaEliteBankRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
