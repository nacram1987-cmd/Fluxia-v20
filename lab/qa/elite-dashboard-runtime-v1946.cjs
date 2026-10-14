'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const a=html.indexOf('function renderHome(){'),b=html.indexOf('function comparePrivateModuleRows(',a);
assert(a>=0&&b>a);
const mods=['ingresos','fijos','variables','huchas','compartidos','financiaciones'].map(id=>({id,key:'planRescate_v2_'+id,title:id}));
const el=(tag,cls,txt)=>({tag,cls,txt,children:[],dataset:{},append(...x){this.children.push(...x)},setAttribute(){}});
const root=el('div');
const context=vm.createContext({
 renderMonthSelector(){},$(){return root},el,monthTitle(){return 'octubre 2026'},
 selectedMonth:'2026-10',owner:'test',activeProfile:'profile',backupFinance:null,mods,
 canon(){return []},monthRecords(){return []},datedRows(){return []},monthStatus(){return 'match'},
 navigateElite(){},recordAmount(){return 0},field(){return null},chargeMark(){return el('span')},
 money(){return '0 €'},showVersionHistory(){},ELITE_SAFARI_VERSION:'1.9.46',render(){},
 openDetail(){},page:'inicio',search:'',period:'Todos'
});
vm.runInContext(html.slice(a,b),context,{timeout:1000});assert.doesNotThrow(()=>context.renderHome());
const grid=root.children.find(x=>x.cls==='grid');assert.equal(grid.children.length,4);
assert(JSON.stringify(root).includes('Safari v1.9.46'));
assert(!html.slice(a,b).includes('modArr'));
for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1])new vm.Script(match[1]);
console.log('PASS v1.9.46: full Dashboard render, four tiles, no undefined modArr');
