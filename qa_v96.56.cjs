const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const base=__dirname;
const qaModules=process.env.FLUXIA_QA_MODULES || path.join(__dirname,'node_modules');
(async()=>{
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');if(u.pathname==='/repo/qa-empty'){res.end('<html><body>QA</body></html>');return;}if(u.pathname==='/repo/qa-stable-sw.js'){res.setHeader('Content-Type','text/javascript');res.end("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(clients.claim()));");return;}try{const file=path.join(base,u.pathname.replace(/^\/repo\//,''));res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.webmanifest')?'application/manifest+json':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end('missing');}});
await new Promise(r=>server.listen(8770,'127.0.0.1',r));
const b=await chromium.launch({executablePath:process.env.FLUXIA_QA_CHROMIUM,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'],headless:true});
const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.route('https://**/*',async route=>{const u=route.request().url();if(u.includes('chart.min.js'))return route.fulfill({path:path.join(qaModules,'chart.js/dist/chart.min.js'),contentType:'text/javascript'});if(u.includes('/supabase.js'))return route.fulfill({path:path.join(qaModules,'@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript'});if(u.includes('fonts.googleapis'))return route.fulfill({body:'',contentType:'text/css'});await route.abort();});
const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.stack));
await p.goto('http://127.0.0.1:8770/repo/qa-empty');
await p.evaluate(async()=>{await navigator.serviceWorker.register('./qa-stable-sw.js',{scope:'./'});await navigator.serviceWorker.ready;const c=await caches.open('fluxia-vSTABLE-test');await c.put('/stable-sentinel',new Response('intact'));});
await p.goto('http://127.0.0.1:8770/repo/index_fluxia_v96.56_LAB.html',{waitUntil:'load'});await p.waitForTimeout(5000);
const isolation=await p.evaluate(async()=>({title:document.title,version:window.FLUXIA_VERSION,cache:await (await caches.match('/stable-sentinel')).text(),regs:(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,url:r.active?.scriptURL})),controller:navigator.serviceWorker.controller?.scriptURL,registration:(await FluxiaSW.registrar()).scope,sdk:!!window.supabase}));
assert.equal(isolation.version,'v96.56-LAB');assert.equal(isolation.cache,'intact');assert.equal(isolation.regs.length,2);assert(isolation.regs.some(r=>r.url.endsWith('/qa-stable-sw.js')));assert(isolation.controller.endsWith('/fluxia-sw-v96.56.js'));assert(isolation.sdk);assert(isolation.registration.endsWith('/index_fluxia_v96.56_LAB.html'));
const financial=await p.evaluate(()=>{
const m=mesFromFechaISO('2026-10-07');const results={};
movimientos=[];gastosFijosItems=[];ingresosItems=[];provisiones=[];financiaciones=[];gastosCompartidos=[];
const base=disponibleEfectivo(m);
const g={id:'qa-bank-1',bancoRef:'qa-ref-1',origen:'banco',fecha:'2026-10-07',mes:m,concepto:'QA tienda',importe:-100};movimientos=[g];
results.purge=FluxiaBancoLimpiar({manual:true});results.purgeKept=movimientos.length;results.bankNegativeDelta=disponibleEfectivo(m)-base;g.importe=100;results.bankPositiveDelta=disponibleEfectivo(m)-base;
movimientos=[g,{...g,id:'qa-bank-copy'}];results.dedup=FluxiaSalud.limpiarDuplicadosBancoRef();results.afterDedup=disponibleEfectivo(m)-base;results.secondDedup=FluxiaSalud.limpiarDuplicadosBancoRef();
g.esTraspasoPropio=true;results.ownTransfer=disponibleEfectivo(m)-base;
movimientos=[];gastosFijosItems=[{id:'qa-fixed',mes:m,nombre:'Endesa',importe:100}];results.fixedBefore=disponibleEfectivo(m)-base;
const bankFixed={id:'qa-endesa',bancoRef:'qa-endesa-ref',origen:'banco',fecha:'2026-10-07',mes:m,concepto:'Endesa',importe:100};movimientos=[bankFixed];
const linked=FluxiaBancoFijos.procesarGastoBanco(bankFixed);results.linkedType=linked.tipo;results.linkedVariableTotal=variablesTotal(m);results.fixedAfter=disponibleEfectivo(m)-base;results.paid=!!fechaPago('fijo',gastosFijosItems[0],m);results.linkedId=bankFixed.vinculoFijoId;
movimientos=[];gastosFijosItems=[];return results;
});
assert.equal(financial.purge,0);assert.equal(financial.purgeKept,1);assert.equal(financial.bankNegativeDelta,-100);assert.equal(financial.bankPositiveDelta,-100);assert.equal(financial.afterDedup,-100);assert.equal(financial.dedup.quitados,1);assert.equal(financial.secondDedup.quitados,0);assert.equal(financial.ownTransfer,0);assert.equal(financial.linkedType,'auto');assert.equal(financial.linkedVariableTotal,0);assert.equal(financial.fixedAfter,-100);assert.equal(financial.fixedBefore,-100);assert.equal(financial.paid,true);
const tabs=[];
for(const tab of ['ingresos','fijos','gastos-variables','compartidos','provisiones','financiaciones','ajustes','ayuda','resumen']){await p.evaluate(t=>goToTab(t),tab);await p.waitForTimeout(250);tabs.push(await p.evaluate(()=>document.querySelector('.panel.active')?.id));assert.equal(tabs.at(-1),'panel-'+tab);}
const menu=await p.evaluate(()=>{openDrawer();const opened=document.getElementById('drawerMenu')?.className;closeDrawer();return {opened,closed:document.getElementById('drawerMenu')?.className};});
assert.deepEqual(errors,[]);
const result={isolation,financial,tabs,menu,errors,limitations:['Synthetic data only; no authenticated Supabase or real bank writes.','External SDK and Chart.js served from installed official npm packages; fonts omitted.','Chromium mobile viewport, not Safari/iOS.']};
console.log(JSON.stringify(result,null,2));
await b.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
