'use strict';
const fs=require('node:fs');
const patchFluxia=function patchFluxia(source) {
  let s=source;
  const replace=(a,b,label)=>{
    const n=s.split(a).length-1;if(n!==1)throw Error(label+" anchor count "+n);
    s=s.replace(a,b);
  };
  replace("if(!mv)continue;totalPlan+=Number(mv.importe)||0;if(!esMovimientoVariable(mv,mes))continue;mesMovs.push(mv);","if(!mv||!esMovimientoVariable(mv,mv.mes))continue;totalPlan+=Number(mv.importe)||0;if(mv.mes!==mes)continue;mesMovs.push(mv);","Filtered variable plan total");
  replace('Total del plan</span><strong id="gvStatTotal"','Variables de todo el plan</span><strong id="gvStatTotal"',"Lifetime label");
  const summaryHTML = `
  <div id="fx9769Spend" style="margin:9px 0 0;padding:10px 12px;background:var(--surface);border:1px solid var(--line);border-radius:12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <span style="font-size:.76rem;color:var(--muted);font-weight:700;">Gasto realizado · variables + fijos/cuotas pagados</span>
      <strong id="fx9769SpentTotal" style="color:var(--ink);font-size:1.03rem;white-space:nowrap;">—</strong>
    </div>
    <div style="font-size:.7rem;color:var(--muted);margin-top:4px;" id="fx9769PaidDetails">—</div>
    <details id="fx9769History" style="margin-top:7px;">
      <summary style="font-size:.73rem;color:var(--teal);font-weight:700;cursor:pointer;">🕘 Historial conjunto de gastos del mes</summary>
      <div id="fx9769HistoryRows" style="margin-top:8px;"></div>
    </details>
  </div>
`;
  replace('  <div class="fx-dashboard67-actions fx30-secondary">',summaryHTML+'  <div class="fx-dashboard67-actions fx30-secondary">',"Dashboard summary");
  const logic=`
/* v97.69: derived read-only financial views. No writes to financial state. */
function fx9769SpentState(mes){
 const hoy=hoyISO(),linked=new Map();
 for(const mv of (Array.isArray(movimientos)?movimientos:[])){
   if(!mv||mv.mes!==mes||mv.cuentaComoFijo!==true||!mv.vinculoFijoId||mv.excluido)continue;
   const id=String(mv.vinculoFijoId),old=linked.get(id);
   if(!old||(!!mv.bancoRef&&!old.bancoRef)||
     (!!mv.bancoRef===!!old.bancoRef&&String(mv.fecha||"")>String(old.fecha||"")))linked.set(id,mv);
 }
 const fixed=fijosDe(mes).filter(f=>f&&f.tipo!=="puente");
 const financing=financiacionesActivas(mes);
 let paid=0,pending=0;
 const fixedRows=[],financingRows=[];
 for(const f of fixed){
   const date=fechaPago("fijo",f,mes),valid=date&&String(date).slice(0,10)<=hoy;
   const bank=linked.get(String(f.id));
   const amount=bank?Math.abs(Number(bank.importe)||0):Number(f.importe)||0;
   if(valid){paid+=amount;fixedRows.push({concepto:f.nombre||"Gasto fijo",importe:amount,
     fecha:String(bank&&bank.fecha||date).slice(0,10),tipo:bank?"📌 Fijo · Banco · Pagado":"📌 Fijo · Registrado como pagado",
     key:"fixed:"+String(f.id)})}
   else pending+=Number(f.importe)||0;
 }
 for(const f of financing){
   const date=fechaPago("financiacion",f,mes),amount=Number(f.cuota)||0;
   if(date&&String(date).slice(0,10)<=hoy){paid+=amount;financingRows.push({concepto:f.nombre||"Financiación",
     importe:amount,fecha:String(date).slice(0,10),tipo:"💳 Cuota · Registrada como pagada",key:"finance:"+String(f.id)})}
   else pending+=amount;
 }
 const variables=variablesTotal(mes);
 return{variables:Math.round(variables*100)/100,paid:Math.round(paid*100)/100,
  pending:Math.round(pending*100)/100,total:Math.round((variables+paid)*100)/100,
  fixedRows:fixedRows,financingRows:financingRows};
}
function fx9769RenderHistory(mes,state){
 const host=document.getElementById("fx9769HistoryRows"),details=document.getElementById("fx9769History");
 if(!host||!details||!details.open||mes!==mesSeleccionado)return;
 if(host.dataset.fxMes!==mes){host.dataset.fxMes=mes;host.dataset.fxLimit="40"}
 const rows=state.fixedRows.concat(state.financingRows);
 for(const mv of movimientosVariablesVisibles(mes)){
   rows.push({concepto:mv.concepto||"Gasto variable",importe:Number(mv.importe)||0,
     fecha:String(mv.fecha||"").slice(0,10),tipo:"🛒 Variable · "+String(mv.categoria||"Otros"),
     key:"variable:"+String(mv.id)});
 }
 rows.sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
 const limit=Math.min(rows.length,Number(host.dataset.fxLimit)||40);
 const markup=rows.slice(0,limit).map(r=>
  '<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px solid var(--line);padding:7px 0;font-size:.76rem;">'+
  '<div style="min-width:0;"><b>'+escapeHtml(r.concepto)+'</b><div style="font-size:.68rem;color:var(--muted);">'+
  escapeHtml(r.tipo)+' · '+escapeHtml(r.fecha||"Sin fecha")+'</div></div>'+
  '<b style="white-space:nowrap;">−'+eur(r.importe,2)+'</b></div>').join("");
 host.innerHTML=markup+(rows.length>limit?
  '<button type="button" data-fx9769-next style="border:1px solid var(--line);border-radius:9px;background:var(--surface);padding:8px;width:100%;color:var(--teal);font-weight:700;">Ver más ('+(rows.length-limit)+' restantes)</button>':
  rows.length===0?'<p class="hint">No hay gastos realizados registrados este mes.</p>':"");
}
function fx9769RenderSpend(mes,fmt){
 const box=document.getElementById("fx9769Spend");if(!box)return;
 const state=fx9769SpentState(mes);
 const total=document.getElementById("fx9769SpentTotal");
 if(total&&total.textContent!==fmt(state.total))total.textContent=fmt(state.total);
 const subtitle=document.getElementById("fx9769PaidDetails");
 const details=fmt(state.paid)+" en fijos/cuotas pagados · "+fmt(state.pending)+" pendientes";
 if(subtitle&&subtitle.textContent!==details)subtitle.textContent=details;
 const exp=document.getElementById("fx9769History");
 const host=document.getElementById("fx9769HistoryRows");
 if(!exp||!host)return;
 if(!exp._fx9769Bound){
   exp._fx9769Bound=true;
   exp.addEventListener("toggle",function(){if(exp.open)fx9769RenderHistory(mesSeleccionado,fx9769SpentState(mesSeleccionado))});
   host.addEventListener("click",function(e){
     const btn=e.target&&e.target.closest&&e.target.closest("[data-fx9769-next]");
     if(!btn)return;
     host.dataset.fxLimit=String((Number(host.dataset.fxLimit)||40)+40);
     fx9769RenderHistory(mesSeleccionado,fx9769SpentState(mesSeleccionado));
   });
 }
 if(exp.open)fx9769RenderHistory(mes,state);
}
`;
  replace('function renderDashboard(){',logic+'function renderDashboard(){',"New read-only derived helpers");
  replace('set("fxDashVariables",fmt(vars));','set("fxDashVariables",fmt(vars));try{fx9769RenderSpend(mes,fmt)}catch(_fx9769Error){console.warn("[Fluxia v97.69 gastos realizados]",_fx9769Error)}',"Dashboard invocation");
  s=s.replaceAll('v97.68-LAB','v97.69-LAB').replace('window.FLUXIA_LAB_VERSION="v97.68"','window.FLUXIA_LAB_VERSION="v97.69"');
  if(s===source||s.includes("gvAjustadoVal"))throw Error("Invalid candidate");
  return s;
};
const base=fs.readFileSync('lab/v97.68.html','utf8');
const html=patchFluxia(base);
fs.writeFileSync('lab/v97.69.html',html,'utf8');
console.log(JSON.stringify({built:'v97.69-LAB',sourceBytes:Buffer.byteLength(base),outputBytes:Buffer.byteLength(html)}));
