(function(root){
 'use strict';
 function cents(value){
  if(typeof value==='bigint')return value;
  if(typeof value==='number'&&Number.isFinite(value))return BigInt(Math.round(value*100));
  if(typeof value==='string'&&value.trim()&&Number.isFinite(Number(value)))return BigInt(Math.round(Number(value)*100));
  return null;
 }
 function sum(values){return values.reduce(function(total,value){var c=cents(value);return c===null?null:total+c;},0n)}
 function role(row){
  if(!row||typeof row!=='object')return 'unknown';
  if(row.papelera===true||row.eliminado===true||row.deleted===true||row.archivado===true||row.archived===true||row.excluido===true||row.excluidoDisponible===true)return 'excluded';
  if(row.cuentaComoFijo===true||row.vinculoFijoId||row.pagoFijoId||row.fijoId)return 'fixed-linked';
  if(row.origen==='efectivo'||row.tipoInterno==='gasto_efectivo')return 'cash';
  if(row.esTraspasoPropio===true||['reponer_hucha','traspaso','traspaso_efectivo','puente'].indexOf(row.tipoInterno)>=0)return 'transfer';
  return 'variable-real';
 }
 function available(input){
  var required=['incomeCents','realExpensesCents','plannedProvisionsCents','excessContributionsCents'];
  if(!input||required.some(function(key){return typeof input[key]!=='bigint'}))return {ok:false,reason:'INCOMPLETE_INPUT'};
  var result=input.incomeCents-input.realExpensesCents-input.plannedProvisionsCents-input.excessContributionsCents;
  return {ok:true,cents:result,trace:{incomeCents:input.incomeCents,realExpensesCents:input.realExpensesCents,plannedProvisionsCents:input.plannedProvisionsCents,excessContributionsCents:input.excessContributionsCents}};
 }
 function hucha(input){
  if(!input||!Array.isArray(input.contributions)||!Array.isArray(input.uses))return {ok:false,reason:'INCOMPLETE_HUCHA_SOURCE'};
  var contributions=sum(input.contributions.map(function(x){return typeof x==='object'?x.cents??x.importe:x}));
  if(contributions===null)return {ok:false,reason:'INVALID_CONTRIBUTION'};
  var definitive=0n,temporary=0n,repaid=0n,outstanding=0n;
  for(var i=0;i<input.uses.length;i++){
   var use=input.uses[i],amount=typeof use==='object'?cents(use.cents??use.importe):cents(use);
   if(amount===null||amount<0n)return {ok:false,reason:'INVALID_USE'};
   if(String(use.tipo||'').toLowerCase()==='definitivo'){definitive+=amount;continue}
   temporary+=amount;
   var returned=typeof use==='object'?cents(use.repaidCents??use.repuesto??0):0n;
   if(returned===null||returned<0n||returned>amount)return {ok:false,reason:'INVALID_REPAYMENT'};
   repaid+=returned;outstanding+=amount-returned;
  }
  return {ok:true,contributionsCents:contributions,temporaryCents:temporary,definitiveCents:definitive,repaidCents:repaid,outstandingCents:outstanding,availableCents:contributions-definitive-temporary+repaid};
 }
 function certification(evidence){
  var keys=['canonical','htmlSnapshot','variablesCompared','bankReconciled','huchaReconciled','engineRules'];
  var missing=keys.filter(function(key){return evidence?.[key]!==true});
  return {certified:missing.length===0,missing:missing};
 }
 var api={version:'1.0.0',cents:cents,sum:sum,role:role,available:available,hucha:hucha,certification:certification};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.FluxiaEliteFinancialEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
