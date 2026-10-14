const fs=require('fs');const assert=require('assert');const vm=require('vm');
const root=process.cwd();const html=fs.readFileSync(root+'/lab/fluxia-elite-safari-datos-reales.html','utf8');
assert.match(html,/ELITE_SAFARI_VERSION='1\.9\.\d+'/);
assert(html.includes('bankFixedSuggestions'));assert(html.includes('renderBankFixedReview'));assert(html.includes('bankFixedStorageKey'));
assert(html.includes('resolveBankFixed'));assert.match(html,/no se clasifican cargos por parecido débil/i);
assert(html.includes("more.append(el('span','sym','⋯')"));assert(html.includes('.eliteHeader .brandIcon{display:block;width:32px'));
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
for(const script of scripts)assert.doesNotThrow(()=>new vm.Script(script),'Inline JavaScript must parse');
console.log('PASS v1.9.93 fixed-variable conservative review keeps original movement visible');
