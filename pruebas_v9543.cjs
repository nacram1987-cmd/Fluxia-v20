
const fs=require('fs');
const h=fs.readFileSync('index_fluxia_v95.43_LAB.html','utf8');
function ok(c,m){if(!c){console.error('FAIL',m);process.exitCode=1}else console.log('OK',m)}
ok(h.includes('v95.43-LAB'),'version LAB');
ok(h.includes('fluxia_zero_profile_init_'),'zero namespace marker');
ok(h.includes("function restoreWaterOnce(){/* v95.43: RETIRADO"),'water restorer retired');
ok(!h.includes("setTimeout(function(){restoreWaterOnce();resume();},700)"),'water not auto-run');
ok(h.includes('REBASE AUTOMÁTICO RETIRADO DEFINITIVAMENTE'),'rebase auto retired');
ok(h.includes("k !== 'fluxia_pre_import_v1_'+_rid"),'backup exact-profile only');
ok(h.includes('fx-v9543-layout-security-final'),'final visual gate');
ok(h.includes('fx30-monthctl .current small'),'month selector date CSS');
ok(h.includes("version: 'v95.43-LAB'"),'checklist version');
if(!process.exitCode) console.log('ALL OK');
