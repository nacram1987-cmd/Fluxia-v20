#!/usr/bin/env python3
"""Pruebas de FLUJOS de Fluxia (con aserciones reales). Uso:  python3 qa_flujos.py index_fluxia_vXX.html
Requiere: pip install playwright && playwright install chromium.  Sale con código 1 si algo falla.
Cubre: instalación con usuario fantasma, protección antes de datos, PIN (PBKDF2 + bloqueo), papelera (borrar→recuperar),
cifras exactas de Compartidos, silencios de avisos, CSV de CaixaBank, Ajustes plegado, modo sin conexión y 0 errores de página."""
import sys, os, json, time, atexit, subprocess, urllib.parse
from playwright.sync_api import sync_playwright
FILE = os.path.abspath(sys.argv[1]); DIR = os.path.dirname(FILE); PORT = 8781
srv = subprocess.Popen(['python3', '-m', 'http.server', str(PORT), '--directory', DIR], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); atexit.register(srv.kill); time.sleep(1)
URL = 'http://localhost:%d/%s' % (PORT, os.path.basename(FILE))
SEED = """
(function(){ if(localStorage.getItem('__seeded')) return; localStorage.setItem('__seeded','1');
 var id='usr-abc', pr={id:id,name:'Nacho',legacy:false,principal:true,createdAt:1,onboardingPending:false,newUser:false,onboardingCompletedAt:5};
 localStorage.setItem('fluxia_profile_v2',JSON.stringify(pr)); localStorage.setItem('fluxia_profiles_v2',JSON.stringify([pr]));
 localStorage.setItem('fluxia_lock_mode_v1_usr-abc','ninguna'); localStorage.setItem('fluxia_tip_vista_completa_v1','1'); localStorage.setItem('fluxia_v69_onboarding_shown','1');
 var P='fluxia_user_'+id+'__', M=['julio','agosto','septiembre','octubre','noviembre','diciembre'];
 function S(k,v){localStorage.setItem(P+'planRescate_v2_'+k,JSON.stringify(v));}
 S('ingresos',[{id:'i1',concepto:'Nómina',importe:2000,tipo:'fijo',mes:'septiembre',meses:M},{id:'i2',concepto:'Extra',importe:150,tipo:'extra',mes:'septiembre',meses:['septiembre']}]);
 S('fijos',[{id:'f1',concepto:'Alquiler',importe:700,mes:'septiembre'},{id:'f2',concepto:'Luz',importe:60,mes:'septiembre'}]);
 S('provisiones',[]); S('financiaciones',[]);
 S('movimientos',[{id:'m1',concepto:'Mercadona parque',importe:12.5,mes:'septiembre',fecha:'2026-09-28',tipo:'variable',categoria:'Alimentación'},{id:'m2',concepto:'Rincon de arles',importe:8,mes:'septiembre',fecha:'2026-09-27',tipo:'variable'},{id:'m3',concepto:'Gasolina',importe:45,mes:'septiembre',fecha:'2026-09-20',tipo:'variable',categoria:'Transporte'}]);
 S('compartidos',[
  {id:'c1',grupo:'g1',concepto:'Mercadona',persona:'Ana',fecha:'2026-09-20',sentido:'me_deben',quienPago:'yo',tipo:'normal',importeInicial:15,total:30,reparto:'mitad',liquidaciones:[{id:'l1',importe:5,fecha:'2026-09-25',concepto:'Bizum'}]},
  {id:'c2',grupo:'g2',concepto:'Cena',persona:'Luis',fecha:'2026-09-21',sentido:'debo',quienPago:'otra',tipo:'normal',importeInicial:20,total:40,reparto:'mitad',liquidaciones:[]},
  {id:'c3',grupo:'g3',concepto:'Gasolina viaje',persona:'Ana',fecha:'2026-09-15',sentido:'me_deben',quienPago:'yo',tipo:'normal',importeInicial:22.5,total:45,reparto:'mitad',liquidaciones:[]},
  {id:'c4',grupo:'g4',concepto:'Pizza',persona:'Marta',fecha:'2026-09-10',sentido:'me_deben',quienPago:'yo',tipo:'normal',importeInicial:10,total:20,reparto:'mitad',liquidaciones:[{id:'l2',importe:10,fecha:'2026-09-12',concepto:'Bizum'}]}]);
})();"""
COOKIE = {'name': 'fxreg', 'value': urllib.parse.quote(json.dumps({'p': [{'id': 'usr-abc', 'name': 'Nacho', 'legacy': False, 'principal': True, 'createdAt': 1}], 'a': 'usr-abc', 't': 1})), 'domain': 'localhost', 'path': '/'}
res = []; errores_pagina = []
def check(nombre, ok, detalle=''):
    res.append((nombre, bool(ok), detalle)); print(('  ✔ ' if ok else '  ✘ ') + nombre + ((' — ' + str(detalle)) if (detalle and not ok) else ''))
def nueva(p, seed=SEED, cookie=None, offline_ctx=False):
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='allow')
    if cookie: ctx.add_cookies([cookie])
    if seed: ctx.add_init_script(seed)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errores_pagina.append(str(e)[:160])); pg.on('dialog', lambda d: d.dismiss())
    pg.route('**/*', lambda r: r.continue_() if 'localhost' in r.request.url else r.abort())
    return b, ctx, pg
def abrir(pg, ms=4500): pg.goto(URL, wait_until='domcontentloaded'); pg.wait_for_timeout(ms)
with sync_playwright() as p:
    print('1) Instalación con usuario fantasma (cookie sin datos)')
    b, ctx, pg = nueva(p, seed=None, cookie=COOKIE); abrir(pg)
    r = pg.evaluate("()=>({onb:document.getElementById('fluxiaNewUserOnboarding').classList.contains('on'),gate:document.getElementById('fluxiaProfileGate').classList.contains('on'),email:!!document.getElementById('nubeSbEmail'),pass:localStorage.getItem('fluxia_remember_password')})")
    check('abre el paso de credenciales (no el dashboard a 0)', r['onb'] and r['email'], r); check('no muestra la puerta', not r['gate']); check('no guarda contraseña', r['pass'] is None); b.close()

    print('2) Protección antes de los datos + PIN')
    b, ctx, pg = nueva(p); abrir(pg, 3500)
    pg.evaluate("()=>Bloqueo.usarClave()"); pg.wait_for_timeout(800)
    pg.fill('#bqPin1', '123456'); pg.fill('#bqPin2', '123456'); pg.click('#bqKeyConfirm'); pg.wait_for_timeout(1500)
    d = pg.evaluate("()=>{var k=Object.keys(localStorage).find(k=>k.indexOf('fluxia_access_pin_v2_')===0);return k?JSON.parse(localStorage.getItem(k)):null}")
    check('PIN guardado con PBKDF2 (v2, 150000)', d and d.get('v') == 2 and d.get('it') == 150000, d)
    pg.evaluate("()=>localStorage.setItem('fluxia_lock_mode_v1_usr-abc','clave')")
    pg.add_init_script("window.__t0=performance.now();")
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(900)
    r = pg.evaluate("()=>({lock:document.getElementById('bloqueo').classList.contains('on'),splash:!!document.getElementById('splashCarga'),keybox:document.getElementById('bqKeyBox').classList.contains('on')})")
    check('la protección aparece antes de terminar el splash', r['lock'] and r['keybox'], r)
    for i in range(5):
        pg.fill('#bqPin1', '000000'); pg.click('#bqKeyConfirm'); pg.wait_for_timeout(900)
    msg = pg.evaluate("()=>document.getElementById('bqMsg').textContent")
    check('5 fallos → bloqueo con espera', 'Espera' in msg, msg)
    pg.fill('#bqPin1', '123456'); pg.click('#bqKeyConfirm'); pg.wait_for_timeout(900)
    check('bloqueado: ni el PIN correcto entra durante la espera', pg.evaluate("()=>document.getElementById('bloqueo').classList.contains('on')"))
    pg.evaluate("()=>{Object.keys(localStorage).filter(k=>k.indexOf('fluxia_pin_fail')===0).forEach(k=>localStorage.removeItem(k))}")
    pg.fill('#bqPin1', '123456'); pg.click('#bqKeyConfirm'); pg.wait_for_timeout(1200)
    check('PIN correcto desbloquea', not pg.evaluate("()=>document.getElementById('bloqueo').classList.contains('on')")); b.close()

    print('3) PIN antiguo (SHA-256) sigue entrando y se actualiza')
    LEG = SEED.replace("localStorage.setItem('fluxia_lock_mode_v1_usr-abc','ninguna');", "localStorage.setItem('fluxia_lock_mode_v1_usr-abc','clave');")
    b, ctx, pg = nueva(p, seed=LEG); pg.goto(URL, wait_until='domcontentloaded'); pg.wait_for_timeout(300)
    h = pg.evaluate("""async()=>{const salt='abc';const enc=new TextEncoder();const dig=await crypto.subtle.digest('SHA-256',enc.encode('654321:'+salt));let s='';new Uint8Array(dig).forEach(x=>s+=String.fromCharCode(x));localStorage.setItem('fluxia_access_pin_v2_usr-abc',JSON.stringify({salt:salt,hash:btoa(s).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,''),createdAt:1}));return true}""")
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(2500)
    pg.fill('#bqPin1', '654321'); pg.click('#bqKeyConfirm'); pg.wait_for_timeout(1500)
    d = pg.evaluate("()=>JSON.parse(localStorage.getItem('fluxia_access_pin_v2_usr-abc'))")
    check('PIN antiguo entra', not pg.evaluate("()=>document.getElementById('bloqueo').classList.contains('on')")); check('y se actualiza a PBKDF2', d.get('v') == 2, d); b.close()

    print('4) Cifras exactas (Compartidos y plan)')
    b, ctx, pg = nueva(p); abrir(pg)
    r = pg.evaluate("""()=>({ana:saldoNetoConPersona('Ana').neto,luis:saldoNetoConPersona('Luis').neto,marta:saldoNetoConPersona('Marta').neto,
      meDeben:compartidosMeDebenPendiente(),debo:compartidosDeboPendiente(),
      ing:ingresosTotal('septiembre'),fij:gastosFijosTotal('septiembre'),vars:gastoVariableTotal('septiembre'),
      disp:disponibleEfectivo('septiembre'),caja:impactoCajaCompartidosMes('septiembre'),variables:variablesTotal('septiembre')})""")
    check('Ana te debe 32,50 (15−5 + 22,50)', abs(r['ana'] - 32.5) < 0.005, r['ana']); check('Luis: le debes 20,00', abs(r['luis'] + 20) < 0.005, r['luis']); check('Marta: en paz', abs(r['marta']) < 0.005, r['marta'])
    check('totales: te deben 32,50 · debes 20,00', abs(r['meDeben'] - 32.5) < 0.005 and abs(r['debo'] - 20) < 0.005, r)
    check('ingresos 2150 · fijos 760 · variables 65,50', abs(r['ing'] - 2150) < 0.005 and abs(r['fij'] - 760) < 0.005 and abs(r['vars'] - 65.5) < 0.005, r)
    check('identidad: disponible = ing − fijos − prov − variables + caja', abs(r['disp'] - (r['ing'] - r['fij'] - 0 - r['variables'] + r['caja'])) < 0.005, r)
    pg.evaluate("()=>goToTab('compartidos')"); pg.wait_for_timeout(900)
    pg.evaluate("()=>document.getElementById('tcBtnNuevoPago').click()"); pg.wait_for_timeout(600)
    ok_hoja = pg.evaluate("()=>!!document.querySelector('.tc-sheet.open')"); check('«Registrar pago» abre su hoja', ok_hoja)
    pg.evaluate("()=>{var s=document.querySelector('.tc-sheet.open .tc-sheet-x');if(s)s.click();}")
    pg.evaluate("()=>document.getElementById('tcBtnNuevoGasto').click()"); pg.wait_for_timeout(600)
    check('«Añadir gasto» abre su hoja', pg.evaluate("()=>!!document.querySelector('.tc-sheet.open')"))
    pg.evaluate("()=>{var s=document.querySelector('.tc-sheet.open .tc-sheet-x');if(s)s.click();}")
    r = pg.evaluate("()=>({heroes:document.querySelectorAll('#compSaldoCard').length,filas:document.querySelectorAll('#compListaGrupos .comp-grupo-card').length,segmentado:!!document.getElementById('compVistaSeg')})")
    check('un solo saldo, lista y segmentado', r['heroes'] == 1 and r['filas'] >= 3 and r['segmentado'], r)
    pg.evaluate("()=>document.querySelector('[data-cvvista=gastos]').click()"); pg.wait_for_timeout(500)
    check('feed de gastos con filas', pg.evaluate("()=>document.querySelectorAll('#compGastosFeed .cv-row').length") >= 5); b.close()

    print('5) Papelera: borrar → recuperar (gasto, ingreso, pago compartido)')
    b, ctx, pg = nueva(p); abrir(pg)
    r = pg.evaluate("""()=>{const o={};movimientos=movimientos.filter(m=>m.id!=='m2');guardarMovimientos();o.a=FluxiaPapelera.listar().map(x=>x.tipo);
      let e=FluxiaPapelera.listar()[0];FluxiaPapelera.recuperar(e.id);o.movs=movimientos.length;
      ingresosItems=ingresosItems.filter(i=>i.id!=='i2');guardarIngresos();o.b=FluxiaPapelera.listar().map(x=>x.tipo);e=FluxiaPapelera.listar()[0];FluxiaPapelera.recuperar(e.id);o.ings=ingresosItems.length;
      gastosCompartidos.find(x=>x.id==='c1').liquidaciones=[];guardarCompartidos();o.c=FluxiaPapelera.listar().map(x=>x.tipo);e=FluxiaPapelera.listar()[0];FluxiaPapelera.recuperar(e.id);o.liqs=gastosCompartidos.find(x=>x.id==='c1').liquidaciones.length;
      o.resto=FluxiaPapelera.listar().length;return o}""")
    check('gasto borrado va a papelera y vuelve', r['a'] == ['movimiento'] and r['movs'] == 3, r); check('ingreso borrado va y vuelve', r['b'] == ['ingreso'] and r['ings'] == 2, r)
    check('pago compartido borrado va y vuelve', r['c'] == ['liquidacion'] and r['liqs'] == 1 and r['resto'] == 0, r)
    pg.evaluate("()=>{movimientos=movimientos.filter(m=>m.id!=='m3');guardarMovimientos();goToTab('ajustes')}"); pg.wait_for_timeout(1500)
    pg.evaluate("()=>document.getElementById('fxPapeleraBtn').click()"); pg.wait_for_timeout(500)
    check('la hoja de papelera lista el elemento', pg.evaluate("()=>document.querySelectorAll('#fxPapeleraSheet [data-rec]').length") == 1)
    pg.evaluate("()=>document.querySelector('#fxPapeleraSheet [data-rec]').click()"); pg.wait_for_timeout(600)
    check('y «Recuperar» lo devuelve', pg.evaluate("()=>movimientos.length") == 3); b.close()

    print('6) Avisos: silencios por días, persistentes')
    b, ctx, pg = nueva(p); abrir(pg)
    pg.evaluate("()=>{ocultarNotificacionDefinitiva('fijos');ocultarNotificacionDefinitiva('deficit')}")
    r = pg.evaluate("()=>{var g=JSON.parse(localStorage.getItem('fluxia_notif_sil_g_v2'));return {f:Math.round((g.fijos-Date.now())/86400000),d:Math.round((g.deficit-Date.now())/86400000)}}")
    check('«fijos» 7 días · «déficit» 1 día', r == {'f': 7, 'd': 1}, r)
    pg.evaluate("()=>{var p=JSON.parse(localStorage.getItem('fluxia_profile_v2'));p.id='usr-otro';localStorage.setItem('fluxia_profile_v2',JSON.stringify(p))}")
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(3500)
    check('sigue silenciado tras recargar y cambiar de perfil/versión', pg.evaluate("()=>notifSilenciada('fijos')")); b.close()

    print('7) CSV de CaixaBank (formato real)')
    b, ctx, pg = nueva(p); abrir(pg)
    CSV = "\ufeffCuenta;ES1234\r\n\r\nFecha;Fecha valor;Movimiento;Más datos;Importe;Saldo\r\n28/09/2026;28/09/2026;Compra con tarjeta;MERCADONA PARQUE AIR;-12,50 EUR;1.500,00 EUR\r\n27/09/2026;27/09/2026;Recibo;ENDESA ENERGIA, S.A.;-1.234,56 EUR;1.512,50 EUR\r\n26/09/2026;26/09/2026;Transferencia recibida;NOMINA;2.000,00 EUR;2.747,06 EUR\r\n"
    r = pg.evaluate("""(csv)=>{const f=detectarFormatoCSV(csv);const m=parsearCaixaV2CSV(csv);return {f:f,n:m.length,imps:m.map(x=>x.importe),fechas:m.map(x=>x.fecha),conc:m.map(x=>x.concepto),omit:window._fxCsvOmitidos}}""", CSV)
    check('formato detectado caixa_v2', r['f'] == 'caixa_v2', r); check('2 cargos (abono omitido)', r['n'] == 2 and r['omit']['ingresos'] == 1, r)
    check('importes 12,50 y 1234,56; fechas ISO', r['imps'] == [12.5, 1234.56] and r['fechas'] == ['2026-09-28', '2026-09-27'], r)
    check('concepto con «Más datos» y coma entre comillas', 'MERCADONA' in r['conc'][0], r['conc']); b.close()

    print('8) Ajustes plegado, Ayuda solo con esta versión, informe sin datos')
    b, ctx, pg = nueva(p); abrir(pg)
    pg.evaluate("()=>goToTab('ajustes')"); pg.wait_for_timeout(1500)
    check('Ajustes: 0 bloques abiertos', pg.evaluate("()=>document.querySelectorAll('#panel-ajustes details[open]').length") == 0)
    pg.evaluate("()=>goToTab('ayuda')"); pg.wait_for_timeout(800)
    r = pg.evaluate("()=>({t:(document.querySelector('#ayudaChecklistActual div div')||{}).innerText,old:document.querySelectorAll('#panel-ayuda details[id^=ayudaChecklist]').length,btn:!!document.getElementById('fxInformeBtn'),priv:!!document.getElementById('fxPrivacidad')})")
    check('checklist de la versión instalada', 'Checklist v93' in (r['t'] or ''), r); check('sin checklists antiguos', r['old'] == 0); check('botón de informe y privacidad presentes', r['btn'] and r['priv'])
    inf = pg.evaluate("()=>FluxiaInforme.texto('prueba')")
    check('informe sin importes ni conceptos ni email', all(x not in inf for x in ('Mercadona', 'Nómina', '2000', '2150', 'Ana', '@')), inf[:200]); b.close()

    print('10) Copia cifrada: ida y vuelta, contraseña mala, archivo manipulado')
    b, ctx, pg = nueva(p); abrir(pg)
    r = pg.evaluate("""async()=>{
      const o={}; const antes={m:movimientos.length,i:ingresosItems.length,c:gastosCompartidos.length};
      const txt=await FluxiaCopiaCifrada.crear('clave-larga-123'); o.esJson=!!JSON.parse(txt).ct; o.sinTextoPlano=!/Mercadona|Nómina|Ana/.test(txt);
      try{await FluxiaCopiaCifrada.crear('corta');o.corta='NO falló'}catch(e){o.corta=e.message}
      try{await FluxiaCopiaCifrada.abrir(txt,'clave-equivocada');o.mala='NO falló'}catch(e){o.mala=e.message}
      const j=JSON.parse(txt); const b=atob(j.ct).split(''); b[10]=String.fromCharCode((b[10].charCodeAt(0)+1)%256); j.ct=btoa(b.join(''));
      try{await FluxiaCopiaCifrada.abrir(JSON.stringify(j),'clave-larga-123');o.manip='NO falló'}catch(e){o.manip=e.message}
      try{await FluxiaCopiaCifrada.abrir('esto no es json','x');o.basura='NO falló'}catch(e){o.basura=e.message}
      // borrar datos y restaurar
      movimientos=[];window._FLUXIA_PERMITIR_VACIADO_MOVIMIENTOS=true;guardarMovimientos();window._FLUXIA_PERMITIR_VACIADO_MOVIMIENTOS=false;
      Almacen.setItem('planRescate_v2_ingresos','[]'); Almacen.setItem('planRescate_v2_compartidos','[]');
      const d=await FluxiaCopiaCifrada.abrir(txt,'clave-larga-123'); o.resumen=FluxiaCopiaCifrada.resumen(d.claves);
      const n=await FluxiaCopiaCifrada.restaurar(d,{sinRecarga:true}); o.n=n;
      o.movs=JSON.parse(Almacen.getItem('planRescate_v2_movimientos')).length; o.ings=JSON.parse(Almacen.getItem('planRescate_v2_ingresos')).length; o.comps=JSON.parse(Almacen.getItem('planRescate_v2_compartidos')).length;
      o.antes=antes; o.hayPrevio=!!localStorage.getItem('fluxia_pre_import_v1_usr-abc');
      return o}""")
    check('la copia es JSON cifrado y no contiene texto legible', r['esJson'] and r['sinTextoPlano'], r)
    check('contraseña corta rechazada', 'al menos 8' in r['corta'], r['corta']); check('contraseña errónea rechazada', 'incorrecta' in r['mala'], r['mala'])
    check('archivo manipulado rechazado (AES-GCM detecta cambios)', 'incorrecta' in r['manip'] or 'dañado' in r['manip'], r['manip']); check('basura rechazada', 'no es una copia' in r['basura'], r['basura'])
    check('restaurar devuelve gastos, ingresos y compartidos', r['movs'] == 3 and r['ings'] == 2 and r['comps'] == 4, r)
    check('se guardó una copia previa para deshacer', r['hayPrevio'])
    pg.evaluate("()=>goToTab('ajustes')"); pg.wait_for_timeout(1500)
    check('la tarjeta «Copia cifrada» está en Ajustes → Datos y copias', pg.evaluate("()=>!!document.getElementById('fxCopiaCifradaCard')")); b.close()

    print('11) Avisos propios, contraste y etiquetas')
    b, ctx, pg = nueva(p); abrir(pg)
    pg.evaluate("()=>alert('Prueba de aviso')"); pg.wait_for_timeout(300)
    check('alert() abre el aviso de Fluxia (no el del navegador)', pg.evaluate("()=>!!document.getElementById('fxAvisoOverlay')"))
    pg.evaluate("()=>goToTab('gastos-variables')"); pg.wait_for_timeout(1200)
    r = pg.evaluate("()=>({sinEtiqueta:[...document.querySelectorAll('#panel-gastos-variables input,#panel-gastos-variables select')].filter(i=>i.offsetParent&&!i.getAttribute('aria-label')&&!(i.id&&document.querySelector('label[for=\"'+i.id+'\"]'))&&!i.closest('label')).length, wine:getComputedStyle(document.documentElement).getPropertyValue('--wine-ink').trim()})")
    check('campos de Gastos variables con etiqueta accesible', r['sinEtiqueta'] == 0, r); check('token de texto --wine-ink definido (#B23A32)', r['wine'].lower() == '#b23a32', r); b.close()

    print('9) Modo sin conexión (Service Worker real)')
    b, ctx, pg = nueva(p); abrir(pg, 5000)
    pg.wait_for_timeout(2500)
    est = pg.evaluate("()=>FluxiaSW.estado()"); check('Service Worker listo', est == 'listo', est)
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(2500)
    ctx.set_offline(True)
    try:
        pg.reload(wait_until='domcontentloaded'); pg.wait_for_timeout(3500)
        r = pg.evaluate("()=>({titulo:document.title,datos:(typeof movimientos!=='undefined'?movimientos.length:-1)})")
        check('sin internet: la app abre con tus datos', 'Fluxia' in r['titulo'] and r['datos'] == 3, r)
    except Exception as e: check('sin internet: la app abre con tus datos', False, str(e)[:120])
    b.close()
print('\nErrores de página durante todas las pruebas: %d' % len(errores_pagina)); [print('  -', e) for e in sorted(set(errores_pagina))[:8]]
check('0 errores de página', len(errores_pagina) == 0)
fallos = [r for r in res if not r[1]]
print('\nRESULTADO: %d/%d comprobaciones OK' % (len(res) - len(fallos), len(res)) + ('  ✔' if not fallos else '  ✘'))
sys.exit(1 if fallos else 0)
