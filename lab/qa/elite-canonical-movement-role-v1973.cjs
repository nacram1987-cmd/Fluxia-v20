'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const extract=name=>{
 const re=new RegExp('function '+name+'\\([^)]*\\)\\{[\\s\\S]*?\\n\\}', 'm');
 const hit=html.match(re);assert(hit,`No se encontró ${name}`);return hit[0];
};
const vm=require('node:vm');
const context={};vm.createContext(context);
new vm.Script([extract('isFixedLinkedMovement'),extract('financialRecordRole'),'this.financialRecordRole=financialRecordRole;'].join('\n')).runInContext(context);
const {financialRecordRole}=context;
assert.equal(financialRecordRole({importe:7.5}),'variable-real');
assert.equal(financialRecordRole({importe:35,cuentaComoFijo:true}),'fixed-linked');
assert.equal(financialRecordRole({importe:12,origen:'efectivo'}),'cash');
assert.equal(financialRecordRole({importe:12,tipoInterno:'traspaso'}),'transfer');
assert.equal(financialRecordRole({importe:12,archivado:true}),'excluded');
assert(html.includes("const visible=records.filter(row=>financialRecordRole(row)==='variable-real')"));
assert(html.includes("if(financialRecordRole(row)!=='variable-real')return false;"));
console.log('PASS v1.9.73 canonical movement roles and shared variable visibility policy');
