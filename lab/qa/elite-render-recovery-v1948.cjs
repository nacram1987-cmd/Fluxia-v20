'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const a=html.indexOf('function render(){'),b=html.indexOf("$('#close').onclick",a);
assert(a>=0&&b>a);
const root={children:[],replaceChildren(){this.children=[]},append(...x){this.children.push(...x)}};
const control={classList:{remove(){}}};
const context=vm.createContext({
 token:'authenticated',page:'inicio',search:'',period:'Todos',activeProfile:'profile',
 mods:[],loginScreen(){},renderNav(){},renderHome(){throw Error('simulated render failure')},renderList(){},renderLegacySection(){},
 $(key){return key==='#content'?root:control},
 el:(tag,cls,txt)=>({tag,cls,txt}),showLoading(){},hideLoading(){},async loadCanonicalProfile(){},status(){},
 console:{error(){}}
});
vm.runInContext(html.slice(a,b),context,{timeout:1000});
assert.doesNotThrow(()=>context.render());
assert(root.children.some(x=>String(x.txt).includes('recuperación de pantalla')));
assert(root.children.some(x=>String(x.txt).includes('Volver a Inicio')));
assert(root.children.some(x=>String(x.txt).includes('Reintentar esta pantalla')));
assert(root.children.some(x=>String(x.txt).includes('Recargar los datos')));
assert.equal(context.token,'authenticated');
assert(html.includes("const ELITE_SAFARI_VERSION='1.9.48'"));
for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1])new vm.Script(match[1]);
console.log('PASS v1.9.48: simulated dashboard exception displays recovery, preserves session, scripts parse');
