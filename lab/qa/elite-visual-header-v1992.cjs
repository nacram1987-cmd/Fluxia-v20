const fs=require('fs');const assert=require('assert');const vm=require('vm');
const root=process.cwd();const html=fs.readFileSync(root+'/lab/fluxia-elite-safari-datos-reales.html','utf8');
assert.match(html,/ELITE_SAFARI_VERSION='1\.9\.(?:92|93|94|95)'/);
assert(html.includes('setupEliteHeader'));assert(html.includes('eliteMenu'));assert(html.includes('eliteNotifications'));
assert(html.includes('logo centrado'));assert(html.includes("const choices=['inicio','fijos','variables','huchas']"));
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
for(const script of scripts)assert.doesNotThrow(()=>new vm.Script(script),'Inline JavaScript must parse');
console.log('PASS v1.9.92 centered premium header and bottom-tab navigation contract');
