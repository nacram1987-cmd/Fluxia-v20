'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../fluxia-elite-safari-datos-reales.html'),'utf8');
const start=html.indexOf('function renderHome(){'),end=html.indexOf('function renderList(){',start);
assert(start>=0&&end>start,'Home section missing');
const home=html.slice(start,end),audit=html.slice(html.indexOf('function renderEliteAudit(){'),html.indexOf('function renderLegacySection(',html.indexOf('function renderEliteAudit(){')));
let n=0;function test(name,condition){assert(condition,name);console.log('PASS',name);n++}
test('Home has one way to open audit',home.includes("Ver auditoría y conciliación"));
test('Home does not run CSV audit',!home.includes('renderCSVAudit()'));
test('Home does not run ledger audit',!home.includes('renderLedgerSafetyAudit()'));
test('Home does not run source audit',!home.includes('renderSourceAudit()'));
test('All diagnostics remain in audit route',audit.includes('renderCSVAudit()')&&audit.includes('renderMotherComparison()')&&audit.includes('renderSourceAudit()')&&audit.includes('renderProvisionAudit()'));
test('Audit page accessible from More',html.includes("['auditoria','🛡️','Auditoría']"));
test('Route implemented',html.includes("if(id==='auditoria')return renderEliteAudit();"));
test('Authenticated load does not call deleted function',!html.includes('sourceDivergence=identifyUnmatchedOctober'));
test('Version correctly labeled',html.includes("const ELITE_SAFARI_VERSION='1.9.26'"));
for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(script[1])new vm.Script(script[1])}
test('All inline scripts parse',true);
console.log('RESULT',n,'dashboard audit separation regression checks passed');
