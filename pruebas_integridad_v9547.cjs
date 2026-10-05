const fs=require('fs'); const p='index_fluxia_v95.47_LAB.html'; const s=fs.readFileSync(p,'utf8');
function ok(c,m){if(!c){console.error('FAIL',m);process.exitCode=1}else console.log('OK',m)}
ok(s.includes('v95.47-LAB'),'version 95.47');
ok(s.includes('manifest_v95.47_LAB.webmanifest'),'manifest current');
ok(s.includes("fluxia-sw-v95.47.js"),'SW current');
ok(!s.includes("navigator.serviceWorker.register('./fluxia-sw-v95.44.js'"),'no old SW register');
ok(!s.includes('href="./manifest_v95.44_LAB.webmanifest"'),'no old manifest link');
ok(s.includes("fluxia_fijos_boot_recovery_v9547_"),'new fijos recovery marker');
ok(s.includes("k==='v2_fijos'" ) && s.includes("k==='planRescate_v2_fijos'"),'fixed source keys');
ok(s.includes('a.p-b.p') && !s.includes('if(b.a.length!==a.a.length)return b.a.length-a.a.length'),'no longest-list-wins in fijos recovery');
ok(s.includes('fx47-fijos-approved-ui'),'approved fijos design');
ok(s.includes('fx47-approved-shell'),'approved shell');
