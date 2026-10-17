const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {JSDOM}=require('../../auditorias/qa-v97.66/node_modules/jsdom');
const html=fs.readFileSync('lab/fluxia-elite-safari-datos-reales.html','utf8');
const dom=new JSDOM('<main></main>'),doc=dom.window.document;
const cut=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
const ctx={el,selectedMonth:'2026-10',money:v=>v.toFixed(2)+' €',chargeMeta:d=>d.fecha||'',chargeMark:()=>el('span','chargeEmoji','📌')};
vm.createContext(ctx);vm.runInContext(cut('function financialRecordEvidence(', '// Importe absoluto')+cut('const rowIsPaid=', '// Cifras de gasto')+cut('function commitmentCardMadre(', 'function renderList('),ctx);
for(const moduleId of ['fijos','financiaciones']){
 for(const sample of [{pagado:false},{pagado:true},{pagos:{'2026-10':'2026-10-01'}},{}]){
  const data={id:'fixture',nombre:'Prueba de presentación',importe:34.95,...sample},before=JSON.stringify(data);let opens=0;
  const card=ctx.commitmentCardMadre(data,moduleId,data.nombre,34.95,()=>opens++);
  assert(card.textContent.includes('34.95 €'));assert.equal(card.querySelectorAll('button').length,1);card.querySelector('button').click();assert.equal(opens,1);assert.equal(JSON.stringify(data),before);
  if(sample.pagado||sample.pagos)assert(card.textContent.includes('✓ Pagado'));
  else if(sample.pagado===false)assert(card.textContent.includes('Pendiente de pago'));
  else assert(!card.textContent.includes('✓ Pagado'));
 }
}
assert(html.includes("onOpen:()=>openPrivateHTMLRecord(row,mod.id)"),'HTML huchas open their own source');
assert(html.includes('#content .pv-card.pv-pend{--pv-acc:var(--mother-blue)'));
assert(html.includes('#content .pv-card.pv-ok{--pv-acc:var(--mother-gold)'));
console.log('PASS v2.0.66: fixed/financing amounts, source payment states, detail actions, no record mutation, HTML-source routing');
