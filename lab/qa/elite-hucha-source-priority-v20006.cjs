'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
assert.match(html,/const ELITE_SAFARI_VERSION='2\.0\.(?:08|20)'/);
assert.match(html,/if\(backupReady&&listSourceMode==='html'\)\{renderHTMLPrimaryList\(m\);return\}/,'HTML mode must render the selected profile backup as its own source');
assert.match(html,/reconstructedHuchaLedger\(arr,huchaUsesFromSource\(false\)\)/,'cloud hucha balances must use cloud withdrawals only');
assert.match(html,/listSourceMode='html';/,'loading a private source selects the HTML comparison view');
const start=html.indexOf('function huchaUsesFromSource(isHtml){'),end=html.indexOf('\nfunction compareHuchaUseSources(',start);
assert(start>=0&&end>start,'source resolver must exist');
const ctx=vm.createContext({
 owner:'owner-A',activeProfile:'p_A__',
 backupFinance:{owner:'owner-A',profile:'p_A__',sources:{v2_usos:{value:[{id:'html-use'}]}}},
 extraFinance:{v2_usos:[{id:'cloud-use'}]}
});
vm.runInContext(html.slice(start,end),ctx);
assert.equal(ctx.huchaUsesFromSource(true)[0].id,'html-use');
assert.equal(ctx.huchaUsesFromSource(false)[0].id,'cloud-use');
ctx.backupFinance.profile='p_B__';
assert.equal(ctx.huchaUsesFromSource(true),null,'another profile backup must not leak into active source');
console.log('PASS v2.0.08 hucha source isolation, HTML/cloud mode routing, exact-profile backup gate');
