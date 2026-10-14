'use strict';
// Synthetic UI smoke test: zero network, zero real accounts, no financial writes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const wallet=require('../js/fluxia-elite-wallet-v1.js');
const match=html.match(/<script>\s*\(\(\) => \{([\s\S]+?)<\/script>/);
assert(match,'Main inline script not found');
let js=match[1];
const tail="loginScreen();\n})();";
assert(js.includes(tail),'Login bootstrap expected');
const bootstrap=[
 "token='fixture-token';owner='4da6c558-634d-4ae8-8a36-6d3be0e2fd39';",
 "activeProfile='p_usr-4da6c558-634d-4ae8-8a36-6d3be0e2fd39__';",
 "extraFinance={planRescate_v2_efectivo:{saldo:0,movimientos:[]},v2_presupuestos:[],planRescate_v2_categorias:[{id:'transporte',nombre:'Transporte'}]};",
 "sourceUpdated={planRescate_v2_efectivo:'2026-10-05T11:00:00Z'};",
 "items={};for(const m of mods)if(m.key)items[m.key]=[];",
 "window.__qa={go(id){page=id;render()},more(){showMoreModules()},profile(){return activeProfile},owner(){return owner},extras(){return Object.keys(extraFinance).length},logout(){return $('#logout').onclick()}};"
].join('\n');
js=js.replace(tail,bootstrap+'\n})();');
const nodes=new Map();
class FakeNode{
 constructor(tag='div'){
  this.tagName=tag;this.children=[];this.dataset={};this.style={};this.value='';this.disabled=false;this.textContent='';
  this.classList={add(){},remove(){},toggle(){}};this.onclick=null
 }
 append(...n){this.children.push(...n);return this}
 appendChild(n){this.children.push(n);return n}
 replaceChildren(...n){this.children=n;return this}
 setAttribute(){}
 addEventListener(){}
 querySelector(){return null}
}
const document={
 createElement(tag){return new FakeNode(tag)},
 querySelector(sel){if(!nodes.has(sel))nodes.set(sel,new FakeNode('div'));return nodes.get(sel)}
};
const window={
 FluxiaWalletAudit:wallet,localStorage:{getItem(){return null},setItem(){}},sessionStorage:{getItem(){return null}},scrollTo(){}
};
new Function('window','document','const localStorage=window.localStorage;'+js)(window,document);
const pages=['inicio','ingresos','fijos','variables','huchas','compartidos','financiaciones','efectivo','presupuestos','analisis','simulador','pagos','notificaciones','ajustes','ayuda'];
let passed=0;
for(const id of pages){
 window.__qa.go(id);
 assert(nodes.get('#content').children.length>0,'Empty screen '+id);
 console.log('PASS '+(++passed)+' '+id);
}
window.__qa.more();assert(nodes.get('#detailContent').children.length>0,'More menu empty');
console.log('PASS '+(++passed)+' More menu grouped');
window.__qa.logout();assert.equal(window.__qa.profile(),'','Profile leaked after logout');assert.equal(window.__qa.owner(),'','User leaked after logout');assert.equal(window.__qa.extras(),0,'Finance data leaked after logout');
console.log('PASS '+(++passed)+' no cross-account state after logout');
console.log('RESULT '+passed+' synthetic module smoke checks passed');
