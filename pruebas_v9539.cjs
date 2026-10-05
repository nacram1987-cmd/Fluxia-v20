
const fs=require('fs'); const p='index_fluxia_v95.39_LAB.html'; const s=fs.readFileSync(p,'utf8');
function ok(cond,msg){if(!cond){console.error('FAIL',msg);process.exitCode=1}else console.log('OK',msg)}
ok(s.includes('id="pvFechaMovimiento"'),'campo fecha del pago/rescate');
ok(s.includes("label:'Fecha real del pago'"),'fecha al convertir Era un pago');
ok(s.includes("mesFromFechaISO(fechaMovimiento)"),'mes derivado de fecha');
ok(s.includes('fluxia-v9539-render-coordinator'),'coordinador de render');
ok(s.includes('__fluxiaBootQuietUntil'),'ventana silenciosa de arranque');
ok(!s.includes('index_fluxia_v95.38_LAB.html?v=v95.38-LAB'),'sin entrada LAB antigua');
