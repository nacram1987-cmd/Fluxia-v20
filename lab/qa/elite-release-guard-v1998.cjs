const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const historical=read('AUDITORIA_ELITE/PROTECTED_SHA256.txt').trim().split('\n');
const current=read('AUDITORIA_ELITE/STABLE_AT_v1.9.98_SHA256.txt').trim();
assert.equal(historical.length,7);
assert.notEqual(historical[0].split(/\s+/)[0],current.split(/\s+/)[0], 'Historical and current stable must be independently tracked');
for(const entry of [...historical.slice(1),current]){
 const match=entry.match(/^([0-9a-f]{64})\s+([^\s]+)$/);
 assert(match,`Malformed SHA entry: ${entry}`);
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,match[2]))).digest('hex');
 assert.equal(actual,match[1],`Protected asset changed: ${match[2]}`);
}
const workflow=read('.github/workflows/fluxia-elite-pages.yml');
assert(workflow.includes('sha256sum -c AUDITORIA_ELITE/STABLE_AT_v1.9.98_SHA256.txt'));
assert(!workflow.includes('gh release upload v97.73-LAB'));
const html=read('lab/fluxia-elite-safari-datos-reales.html');
assert.match(html,/const ELITE_SAFARI_VERSION='(?:1\.9\.(?:98|99)|2\.0\.(?:00|01|02|03|04))'/);
assert(html.includes('aria-label\',\'Abrir notificaciones'));
assert(html.includes('bell.innerHTML=\'<svg'));
assert(!html.includes('.eliteHeader #eliteNotifications:after'));
console.log('PASS v1.9.98 historical/current stable gates and honest notification icon');
