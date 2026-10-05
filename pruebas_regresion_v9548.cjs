const fs=require('fs'),crypto=require('crypto'),assert=require('assert');
const s=fs.readFileSync('index_fluxia_v95.49_LAB.html','utf8');
assert(s.includes('v95.49-LAB'));
assert(!/href="\.\/manifest_v95\.44_LAB\.webmanifest"/.test(s));
assert(!/navigator\.serviceWorker\.register\('\.\/fluxia-sw-v95\.44\.js'/.test(s));
assert(s.includes('fx47-fijos-approved-ui'));
assert(s.includes('fx47-approved-shell'));
assert(s.includes('Hoy · '));
console.log('OK v95.49 regression static');
