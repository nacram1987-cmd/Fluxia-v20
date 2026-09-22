"""
Pruebas automáticas de Fluxia — ejecútalas antes de subir cualquier cambio.

    pip install playwright && playwright install chromium
    python tests/pruebas.py

Arrancan su propio servidor en una carpeta temporal: no tocan tus datos.
Cada prueba corresponde a un fallo real que ya tuvimos; si alguna falla, NO subas.
"""
import asyncio, json, os, shutil, subprocess, sys, tempfile, time, urllib.request, urllib.error
from pathlib import Path
from playwright.async_api import async_playwright

RAIZ = Path(__file__).resolve().parent.parent
PUERTO = 8911
B = f'http://127.0.0.1:{PUERTO}'
EMAIL = 'prueba@fluxia.test'
resultados = []

def ok(nombre, cond, detalle=''):
    resultados.append((nombre, bool(cond), detalle))
    print(('  ✅ ' if cond else '  ❌ ') + nombre + (f'  ({detalle})' if detalle and not cond else ''))

def api(ruta, datos=None, token=None, metodo=None):
    req = urllib.request.Request(B + ruta, data=json.dumps(datos).encode() if datos is not None else None,
                                 method=metodo or ('POST' if datos is not None else 'GET'))
    req.add_header('Content-Type', 'application/json')
    if token: req.add_header('Authorization', 'Bearer ' + token)
    try: return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e: return json.loads(e.read())

def fijos_en_servidor(token):
    r = api('/v1/snapshot', token=token)
    return [f['nombre'] for f in r['snapshot']['snapshot'].get('fijos', [])] if r.get('ok') else None

async def abrir(p, perfil, fecha=None, estado=None):
    P = dict({"name": "Prueba", "createdAt": 1}, **perfil)
    nav = await p.chromium.launch()
    ctx = await nav.new_context(viewport={'width': 390, 'height': 844}, storage_state=estado)
    await ctx.add_init_script(
        "localStorage.setItem('fluxia_profile_v2', %r); localStorage.setItem('fluxia_profiles_v2', %r);"
        "localStorage.setItem('fluxia_install_hint_v2','1');" % (json.dumps(P), json.dumps([P])))
    pg = await ctx.new_page(); errores = []
    pg.on('pageerror', lambda e: errores.append(str(e)))
    if fecha: await pg.clock.install(time=fecha)
    await pg.goto(B + '/', wait_until='domcontentloaded')
    if fecha: await pg.clock.run_for(2500)
    else: await pg.wait_for_timeout(2500)
    await pg.evaluate("(()=>{const b=document.getElementById('bloqueo'); if(b) b.remove();})()")
    entrar = pg.locator("button:has-text('Entrar a mi plan')")
    if await entrar.count() and await entrar.first.is_visible(): await entrar.first.click()
    return nav, ctx, pg, errores

async def iniciar_sesion(pg):
    await pg.evaluate("(e)=>{document.getElementById('cuentaEmail').value=e;document.getElementById('btnCuentaEnviarCodigo').click();}", EMAIL)
    await pg.wait_for_timeout(1200)
    pista = await pg.evaluate("document.getElementById('cuentaCodigoHint').innerText")
    codigo = ''.join(c for c in pista if c.isdigit())[:6]
    await pg.evaluate("(c)=>{document.getElementById('cuentaCodigo').value=c;document.getElementById('btnCuentaVerificar').click();}", codigo)
    await pg.wait_for_timeout(2500)
    return await pg.evaluate("(getCuentaFluxia()||{}).token")

async def elegir_archivo(pg, llamada, ruta):
    async with pg.expect_file_chooser() as fc:
        await pg.evaluate(llamada)
    await (await fc.value).set_files(ruta)
    await pg.wait_for_timeout(2500)

async def abrir_con_bloqueo(p, perfil, estado=None, init_extra=''):
    """Como abrir(), pero SIN quitar la pantalla de bloqueo (para probar la protección)."""
    P = dict({"name": "Prueba", "createdAt": 1}, **perfil)
    nav = await p.chromium.launch()
    ctx = await nav.new_context(viewport={'width': 390, 'height': 844}, storage_state=estado)
    await ctx.add_init_script(
        "localStorage.setItem('fluxia_profile_v2', %r); localStorage.setItem('fluxia_profiles_v2', %r);"
        "localStorage.setItem('fluxia_install_hint_v2','1');" % (json.dumps(P), json.dumps([P])) + init_extra)
    pg = await ctx.new_page(); errores = []
    pg.on('pageerror', lambda e: errores.append(str(e)))
    await pg.goto(B + '/', wait_until='domcontentloaded')
    await pg.wait_for_timeout(2500)
    return nav, ctx, pg, errores

async def main(tmp):
    copia = tmp / 'copia.json'
    copia_bom = tmp / 'copia-bom.json'
    datos = {"app": "FLUXIA", "version": "3.0", "claves": {
        "planRescate_v2_fijos": json.dumps([{"id": 1, "mes": "septiembre", "nombre": "Luz", "importe": 85.72},
                                            {"id": 2, "mes": "septiembre", "nombre": "Gimnasio", "importe": 34.95}]),
        "planRescate_v2_ingresos": json.dumps([{"id": 1, "mes": "septiembre", "concepto": "Nómina", "importe": 2690.99}])}}
    copia.write_text(json.dumps(datos))
    copia_bom.write_bytes(b'\xef\xbb\xbf' + copia.read_bytes())

    async with async_playwright() as p:
        print('\n▶ Servidor')
        h = api('/health')
        ok('responde /health', h.get('ok'))
        ok('lista blanca activa', h.get('privado') is True)
        ok('email no autorizado no recibe código', 'devCode' not in api('/auth/request-code', {'email': 'intruso@x.com'}))
        ok('sin sesión no se ve ningún plan', 'error' in api('/v1/snapshot'))
        try: urllib.request.urlopen(B + '/..%2fserver.js'); fuera = False
        except urllib.error.HTTPError as e: fuera = e.code in (400, 404)
        ok('no sirve archivos fuera de public/', fuera)

        print('\n▶ Pantalla principal (usuario sin metas)')
        nav, ctx, pg, err = await abrir(p, {"id": "nuevo", "onboardingSkipped": True, "newUser": False})
        r = await pg.evaluate("""(()=>({
            camino: getComputedStyle(document.getElementById('tmCamino')).display,
            pie: document.getElementById('tmPie').innerText,
            eslogan: document.querySelector('header').innerText,
            badgesMenu: [...document.querySelectorAll('.drawer-item .nav-badge')].filter(b=>b.offsetParent).length,
            campana: document.getElementById('headerNotificationsBadge') ? 'existe' : 'no existe'}))()""")
        ok('sin meta no aparece el camino al fondo', r['camino'] == 'none')
        ok('no dice «Fondo en 0 meses»', 'en 0 meses' not in r['pie'])
        ok('el eslogan no dice «HTML»', 'HTML' not in r['eslogan'])
        ok('el menú no muestra contadores', r['badgesMenu'] == 0)
        ok('la campana conserva su contador', r['campana'] == 'existe')

        print('\n▶ Importar copia')
        await elegir_archivo(pg, "importFile()", str(copia_bom))
        ok('importa un JSON con BOM (iCloud / Archivos)', await pg.evaluate("gastosFijosItems.map(f=>f.nombre).join()") == 'Luz,Gimnasio')
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_timeout(2500)
        ok('lo importado sobrevive a recargar', await pg.evaluate("gastosFijosItems.length") == 2)
        (tmp / 'malo.json').write_text('{"hola":1}')
        await pg.evaluate("(()=>{const b=document.getElementById('bloqueo'); if(b) b.remove();})()")
        await elegir_archivo(pg, "importFile()", str(tmp / 'malo.json'))
        ok('rechaza un archivo que no es de Fluxia', await pg.evaluate("document.body.innerText.includes('no contiene datos de Fluxia')"))
        ok('sin errores JavaScript', not err, '; '.join(err[:2]))
        await nav.close()

        print('\n▶ Cuenta, sincronización y versiones')
        nav, ctx, pg, err = await abrir(p, {"id": "movilA", "onboardingSkipped": True, "newUser": False})
        token = await iniciar_sesion(pg)
        ok('inicia sesión con código', bool(token))
        await elegir_archivo(pg, "importFile()", str(copia))
        ok('la importación sube sola al servidor', fijos_en_servidor(token) == ['Luz', 'Gimnasio'])
        await pg.evaluate("gastosFijosItems.push({id:9,mes:'septiembre',nombre:'Agua',importe:30}); guardarFijos();")
        await pg.wait_for_timeout(5500)
        ok('cada cambio se sube solo', fijos_en_servidor(token) == ['Luz', 'Gimnasio', 'Agua'])
        ok('se guardan versiones anteriores', len(api('/v1/snapshot/versions', token=token).get('versions', [])) >= 1)
        await pg.evaluate("abrirVersionesNube()"); await pg.wait_for_timeout(2000)
        ok('la pantalla de versiones lista las copias', await pg.locator("#modalHint button:has-text('Restaurar')").count() >= 1)
        await nav.close()

        nav, ctx, pg, err = await abrir(p, {"id": "movilB", "onboardingSkipped": True, "newUser": False})
        await pg.evaluate("gastosFijosItems.push({id:7,mes:'septiembre',nombre:'BASURA',importe:1}); guardarFijos();")
        await iniciar_sesion(pg)
        await pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); await pg.wait_for_timeout(5500)
        ok('un móvil nuevo NO pisa el plan del servidor', fijos_en_servidor(token) == ['Luz', 'Gimnasio', 'Agua'])
        await pg.locator("#modalSave:has-text('Cargar mi plan')").click(); await pg.wait_for_timeout(1500)
        ok('el móvil nuevo recupera el plan', await pg.evaluate("gastosFijosItems.map(f=>f.nombre).join()") == 'Luz,Gimnasio,Agua')
        ok('sin errores JavaScript', not err, '; '.join(err[:2]))
        await nav.close()

        print('\n▶ Cambio de año (datos del Excel)')
        consulta = """(()=>{const m=MES_ACTUAL_REAL; return {mes:m, anio:anioDeMesPlan(m),
            saldo:Math.round(provisiones.reduce((s,p)=>s+provisionAportadoAcumulado(p,m)-provisionUsadoAcumulado(p,m),0)*100)/100,
            activas:provisionesActivas(m).length, sepPasado:esMesPasado('septiembre')}})()"""
        base = None
        for fecha in ['2026-09-22T10:00:00', '2027-01-15T10:00:00', '2028-03-10T10:00:00']:
            nav, ctx, pg, err = await abrir(p, {"id": "legacy", "legacy": True}, fecha=fecha)
            r = await pg.evaluate(consulta)
            if base is None: base = r['saldo']
            ok(f'{fecha[:7]}: mes actual correcto', r['anio'] == int(fecha[:4]), str(r))
            ok(f'{fecha[:7]}: saldo de provisiones se conserva ({r["saldo"]} €)', r['saldo'] == base and r['activas'] > 0, str(r))
            await nav.close()

        print('\n▶ Cierre de mes')
        nav, ctx, pg, err = await abrir(p, {"id": "legacy2", "legacy": True}, fecha='2026-10-02T09:00:00')
        await pg.clock.run_for(4000)
        titulo = await pg.evaluate("document.getElementById('modalOverlay').classList.contains('open') ? document.getElementById('modalTitle').innerText : ''")
        ok('aparece solo el primer día del mes nuevo', 'Cierre de Septiembre' in titulo, titulo)
        estado = await ctx.storage_state(); await nav.close()
        nav, ctx, pg, err = await abrir(p, {"id": "legacy2", "legacy": True}, fecha='2026-10-03T09:00:00', estado=estado)
        await pg.clock.run_for(4000)
        ok('no vuelve a salir una vez visto', not await pg.evaluate("document.getElementById('modalOverlay').classList.contains('open')"))
        await nav.close()

        print('\n▶ Compartidos estilo Tricount')
        nav, ctx, pg, err = await abrir(p, {"id": "tricount", "name": "Nacho", "onboardingSkipped": True, "newUser": False}, fecha='2026-09-22T10:00:00')
        await pg.evaluate("goToTab('compartidos')")
        campos = await pg.evaluate("[...document.querySelectorAll('#tcGasto .tc-input, #compPersona')].filter(i=>i.offsetParent).map(i=>[i.id, i.offsetHeight, parseFloat(getComputedStyle(i).fontSize)])")
        ok('los campos del formulario son grandes (≥44 px, letra ≥16 px)', all(h >= 44 and f >= 16 for _, h, f in campos), str(campos))
        await pg.evaluate("""(()=>{const s=document.getElementById('compPersona'); s.value='__nueva__'; s.dispatchEvent(new Event('change'));
            const n=document.getElementById('compPersonaNueva'); n.value='Ana'; n.dispatchEvent(new Event('input'));})()""")
        opciones = await pg.evaluate("[...document.getElementById('compQuienPago').options].map(o=>o.text)")
        ok('«Pagado por» muestra los nombres', opciones == ['Nacho (yo)', 'Ana'], str(opciones))
        async def gasto(concepto, importe, paga, yo=True, otra=True):
            await pg.evaluate("""([c,i,p,yo,otra])=>{document.getElementById('compConcepto').value=c; const imp=document.getElementById('compImporte'); imp.value=i; imp.dispatchEvent(new Event('input'));
                const q=document.getElementById('compQuienPago'); q.value=p; q.dispatchEvent(new Event('change'));
                document.getElementById('tcPartYo').checked=yo; document.getElementById('tcPartOtra').checked=otra;
                document.getElementById('tcPartYo').dispatchEvent(new Event('change'));
                document.getElementById('btnAddCompartido').click();}""", [concepto, importe, paga, yo, otra])
            await pg.wait_for_timeout(300)
        async def reembolso(dir_, importe):
            await pg.evaluate("""([d,i])=>{tcModo('reembolso'); const r=document.getElementById('tcReemDir'); r.value=d;
                const imp=document.getElementById('tcReemImporte'); imp.value=i; document.getElementById('btnTcReembolso').click(); tcModo('gasto');}""", [dir_, importe])
            await pg.wait_for_timeout(300)
        neto = lambda: pg.evaluate("saldoNetoConPersona('Ana').neto")
        await gasto('Noodles', '22', 'yo')
        ok('gasto a medias pagado por mí → Ana me debe 11 €', await neto() == 11)
        await pg.wait_for_timeout(900)
        ok('añadir un gasto no muestra aviso emergente', await pg.evaluate("(()=>{const t=document.getElementById('toastGuardado'); return !t || t.style.opacity==='0';})()"))
        await gasto('Cena', '40', 'otra', yo=True, otra=False)
        ok('gasto que pagó Ana solo para mí → debo 40 € (saldo −29 €)', await neto() == -29)
        r = await pg.evaluate("[compartidosMeDebenPendiente(), compartidosDeboPendiente()]")
        ok('las deudas cruzadas se compensan (total: debes 29 €)', r == [0, 29], str(r))
        await reembolso('yo', '20')
        ok('reembolso de 20 € amortiza la deuda (saldo −9 €)', await neto() == -9)
        await reembolso('yo', '15')
        ok('pagar de más invierte el saldo (Ana me debe 6 €)', await neto() == 6)
        ok('el historial acaba en el saldo real', await pg.evaluate("(()=>{const e=tcEventosPersona('Ana'); return e[e.length-1].saldo;})()") == 6)
        ok('la caja solo cuenta dinero real (−35 €)', await pg.evaluate("liquidacionesImpactoMes('septiembre')") == -35)
        ok('la tarjeta muestra «Ana te debe 6,00 €»', await pg.evaluate("document.getElementById('compPendientesView').innerText.includes('Ana te debe 6,00')"))
        await pg.evaluate("""(()=>{const e=tcEventosPersona('Ana'); const i=e.length-1; document.querySelector('[data-tcdel="'+i+'"]').click();})()""")
        await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('modalConfirm') ? document.getElementById('modalConfirm').click() : null")
        await pg.evaluate("(()=>{const b=[...document.querySelectorAll('#modalOverlay button')].find(x=>/Borrar/.test(x.textContent)); if(b) b.click();})()")
        await pg.wait_for_timeout(300)
        ok('borrar un reembolso recalcula el saldo (−9 €)', await neto() == -9)
        ok('y la caja vuelve a −20 €', await pg.evaluate("liquidacionesImpactoMes('septiembre')") == -20)
        ok('sin errores JavaScript', not err, '; '.join(err[:2]))
        await nav.close()

        print('\n▶ Compartidos: gastos antiguos y rescate')
        viejos = [{"id": "v1", "concepto": "Costilla", "persona": "", "fecha": "2026-08-17", "sentido": "me_deben", "tipo": "normal", "importeInicial": 10, "liquidaciones": []}]
        perdido = [{"id": "p1", "concepto": "Cena perdida", "persona": "Ana", "fecha": "2026-09-10", "sentido": "me_deben", "tipo": "normal", "importeInicial": 25, "liquidaciones": []}]
        extra = ("if(!localStorage.getItem('__sembrado')){localStorage.setItem('__sembrado','1');"
                 "localStorage.setItem('fluxia_user_rescate__planRescate_v2_compartidos', %r);"
                 "localStorage.setItem('fluxia_cuenta_v1', JSON.stringify({email:'yo@x.com'}));"
                 "localStorage.setItem('fluxia_nube_snapshot_yo@x.com', %r);"
                 "localStorage.setItem('fluxia_nube_snapshot_otro@x.com', %r);}") % (
            json.dumps(viejos), json.dumps({"snapshot": {"compartidos": viejos + perdido}}),
            json.dumps({"snapshot": {"compartidos": [dict(perdido[0], id='ajeno', concepto='De otro')]}}))
        nav, ctx, pg, err = await abrir_con_bloqueo(p, {"id": "rescate", "name": "Nacho", "onboardingSkipped": True, "newUser": False}, init_extra=extra)
        await pg.evaluate("(()=>{const b=document.getElementById('bloqueo'); if(b) b.remove(); goToTab('compartidos');})()")
        await pg.wait_for_timeout(400)
        ok('un gasto sin persona sigue visible («Sin asignar»)', await pg.evaluate("tcEventosPersona('Sin asignar').length") == 1 and
           await pg.evaluate("document.getElementById('compPendientesView').innerText.includes('Sin asignar')"))
        ok('«Sin asignar» no sale en «Con quién»', await pg.evaluate("![...document.getElementById('compPersona').options].some(o=>o.text==='Sin asignar')"))
        ok('avisa de gastos que estaban en copias y ya no están', 'Hay 1 gasto' in await pg.evaluate("document.getElementById('tcAvisoRescate').innerText"))
        await pg.evaluate("abrirRescateCompartidos(false)"); await pg.wait_for_timeout(300)
        lista = await pg.evaluate("document.getElementById('tcRecLista') ? document.getElementById('tcRecLista').innerText : ''")
        ok('ofrece recuperar solo lo perdido de este usuario', 'Cena perdida' in lista and 'De otro' not in lista, lista)
        await pg.evaluate("tcRecuperarSeleccionados()"); await pg.wait_for_timeout(300)
        ok('recuperar devuelve el gasto y su saldo', await pg.evaluate("saldoNetoConPersona('Ana').neto") == 25)
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_timeout(2500)
        await pg.evaluate("(()=>{const b=document.getElementById('bloqueo'); if(b) b.remove(); goToTab('compartidos');})()")
        ok('lo recuperado sobrevive a recargar', await pg.evaluate("gastosCompartidos.some(g=>g.concepto==='Cena perdida')"))
        await pg.evaluate("""(()=>{const e=tcEventosPersona('Ana'); const i=e.findIndex(x=>x.tipo==='gasto'); document.querySelector('#compPendientesView [data-tcdel="'+i+'"]').click();})()""")
        await pg.wait_for_timeout(300)
        await pg.evaluate("(()=>{const b=[...document.querySelectorAll('#modalOverlay button')].find(x=>/Borrar/.test(x.textContent)); if(b) b.click();})()")
        await pg.wait_for_timeout(300)
        ok('un gasto borrado a propósito no se ofrece como perdido', await pg.evaluate("document.getElementById('tcAvisoRescate').innerText") == '')
        ok('sin errores JavaScript', not err, '; '.join(err[:2]))
        await nav.close()

        print('\n▶ Compartidos: varias personas, repartos y recordatorios')
        nav, ctx, pg, err = await abrir(p, {"id": "grupos", "name": "Nacho", "onboardingSkipped": True, "newUser": False}, fecha='2026-09-22T10:00:00')
        await pg.evaluate("goToTab('compartidos')")
        async def rellenar(persona, concepto, importe, paga='yo', modo='iguales', evento='', extras=(), valores=None):
            await pg.evaluate("""([per,c,i,p,m,e,ex,val])=>{const s=document.getElementById('compPersona');
                if([...s.options].some(o=>o.value===per)){s.value=per;} else {s.value='__nueva__'; s.dispatchEvent(new Event('change')); const x=document.getElementById('compPersonaNueva'); x.value=per; x.dispatchEvent(new Event('input'));}
                s.dispatchEvent(new Event('change')); ex.forEach(n=>tcAnadirFilaPersona(n));
                document.getElementById('compConcepto').value=c; const imp=document.getElementById('compImporte'); imp.value=i; imp.dispatchEvent(new Event('input'));
                const md=document.getElementById('tcModoReparto'); md.value=m; md.dispatchEvent(new Event('change'));
                if(val){ const v=[...document.querySelectorAll('#tcPartLista .tc-part-val')]; val.forEach((x,k)=>{ v[k].value=x; }); imp.dispatchEvent(new Event('input')); }
                const q=document.getElementById('compQuienPago'); q.value=p; q.dispatchEvent(new Event('change')); document.getElementById('tcEvento').value=e;}""",
                [persona, concepto, importe, paga, modo, evento, list(extras), valores])
        anadir = lambda: pg.evaluate("document.getElementById('btnAddCompartido').click()")
        neto = lambda n: pg.evaluate("(n)=>saldoNetoConPersona(n).neto", n)
        await rellenar('Ana', 'Hotel', '90', evento='Viaje', extras=['Marta']); await anadir()
        ok('pago yo 90 € entre 3 → Ana y Marta me deben 30 €', await neto('Ana') == 30 and await neto('Marta') == 30)
        await rellenar('Ana', 'Gasolina', '60', paga='x0', evento='Viaje', extras=['Marta']); await anadir()
        ok('pagó Marta 60 € entre 3 → yo le debo 20 € (saldo +10 €)', await neto('Marta') == 10 and await neto('Ana') == 30)
        await rellenar('Ana', 'Cena', '50', modo='importes', valores=['30', '15'])
        ok('por importes: avisa si no cuadra', 'Faltan 5,00' in await pg.evaluate("document.getElementById('compRepartoInfo').innerText"))
        n = await pg.evaluate("gastosCompartidos.length"); await anadir()
        ok('y no lo añade', await pg.evaluate("gastosCompartidos.length") == n)
        await rellenar('Ana', 'Cena', '50', modo='importes', valores=['35', '15']); await anadir()
        ok('por importes 35/15 → Ana +35 €', await neto('Ana') == 65)
        await rellenar('Ana', 'Compra', '100', modo='porcentaje', valores=['70', '30'])
        await pg.focus('#compImporte'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(200)
        ok('por porcentaje 70/30 e Intro para añadir → Ana +70 €', await neto('Ana') == 135)
        await pg.evaluate("document.querySelector('[data-tcchip=\"Viaje\"]').click()")
        r = await pg.evaluate("document.getElementById('tcEventoResumen').innerText")
        ok('el grupo resume 2 gastos, 150 € y lo que te deben', '2 gastos' in r and '150,00' in r and '40,00' in r, r)
        await pg.evaluate("document.querySelector('[data-tcchip=\"\"]').click()")
        await pg.evaluate("(()=>{const b=document.getElementById('tcBuscar'); b.value='gasolina'; b.dispatchEvent(new Event('input'));})()"); await pg.clock.run_for(300)
        t = await pg.evaluate("document.getElementById('compPendientesView').innerText")
        ok('la búsqueda filtra los gastos', 'Gasolina' in t and 'Hotel' not in t)
        await pg.evaluate("(()=>{const b=document.getElementById('tcBuscar'); b.value=''; b.dispatchEvent(new Event('input'));})()"); await pg.clock.run_for(300)
        await pg.evaluate("gastosCompartidos.push({id:'viejo',concepto:'Concierto',persona:'Pepe',fecha:'2026-08-20',sentido:'me_deben',tipo:'normal',importeInicial:40,liquidaciones:[]})")
        t = await pg.evaluate("datosNotificaciones().map(n=>n.titulo)")
        ok('avisa de cobros con más de 14 días (y no de los recientes)', any('Pepe te debe desde hace' in x for x in t) and not any('Ana te debe desde' in x for x in t), str(t))
        ok('el recordatorio lleva el total y Bizum', 'me debes 135,00' in await pg.evaluate("tcTextoRecordatorio('Ana')"))
        ok('sin errores JavaScript', not err, '; '.join(err[:2]))
        await nav.close()

        print('\n▶ Avisos')
        nav, ctx, pg, err = await abrir(p, {"id": "avisos", "onboardingSkipped": True, "newUser": False})
        tipos = await pg.evaluate("datosNotificaciones().map(n=>n.tipo)")
        ok('cuenta nueva: sin «Margen estrecho» ni déficit', 'margen' not in tipos and 'deficit' not in tipos, str(tipos))
        ok('cuenta nueva: el inicio no muestra el aviso de margen', not await pg.evaluate("document.getElementById('dashAlert') && document.getElementById('dashAlert').classList.contains('show')"))
        await pg.evaluate("registrarGastoVariable({concepto:'Café Mercadona', importe:2})")
        await pg.wait_for_timeout(1000)
        ok('registrar un gasto no muestra aviso emergente', await pg.evaluate("(()=>{const t=document.getElementById('toastGuardado'); return !t || t.style.opacity==='0';})()"))
        ok('sin errores JavaScript', not err, '; '.join(err[:2]))
        await nav.close()

        print('\n▶ Tutorial')
        nav, ctx, pg, err = await abrir(p, {"id": "tuto", "onboardingSkipped": True, "newUser": False})
        await pg.evaluate("abrirTutorial()")
        pasos_ok = True
        for i in range(1, 6):
            vis = await pg.evaluate("(()=>{const a=document.querySelector('#tutorialOverlay .tutorial-step.active'); return a && a.offsetHeight>50 ? a.dataset.tstep : null;})()")
            if vis != str(i): pasos_ok = False
            if i < 5: await pg.evaluate("avanzarTutorial()")
        ok('las 5 pantallas del tutorial se ven (ninguna en blanco)', pasos_ok)
        await pg.evaluate("retrocederTutorial()")
        ok('se puede volver atrás', await pg.evaluate("document.querySelector('#tutorialOverlay .tutorial-step.active').dataset.tstep") == '4')
        await pg.evaluate("cerrarTutorial()")
        ok('al cerrarlo la app vuelve a desplazarse', await pg.evaluate("!document.getElementById('tutorialOverlay').classList.contains('active') && document.body.style.overflow===''"))
        await nav.close()

        print('\n▶ Protección opcional')
        nav, ctx, pg, err = await abrir_con_bloqueo(p, {"id": "prot1", "onboardingSkipped": True, "newUser": False})
        ok('primera vez: se puede elegir «Continuar sin protección»', await pg.evaluate("document.getElementById('bloqueo').classList.contains('on') && document.getElementById('bqNone').offsetParent!==null"))
        await pg.click('#bqNone'); await pg.wait_for_timeout(400)
        estado = await ctx.storage_state(); await nav.close()
        nav, ctx, pg, err = await abrir_con_bloqueo(p, {"id": "prot1", "onboardingSkipped": True, "newUser": False}, estado=estado)
        ok('sin protección: se abre directamente', not await pg.evaluate("document.getElementById('bloqueo').classList.contains('on')"))
        await nav.close()
        nav, ctx, pg, err = await abrir_con_bloqueo(p, {"id": "prot2", "onboardingSkipped": True, "newUser": False})
        await pg.click('#bqSkip'); await pg.wait_for_timeout(200)
        await pg.fill('#bqPin1', '123456'); await pg.fill('#bqPin2', '123456'); await pg.click('#bqKeyConfirm'); await pg.wait_for_timeout(600)
        ok('se crea una clave y se entra', not await pg.evaluate("document.getElementById('bloqueo').classList.contains('on')"))
        estado = await ctx.storage_state(); await nav.close()
        nav, ctx, pg, err = await abrir_con_bloqueo(p, {"id": "prot2", "onboardingSkipped": True, "newUser": False}, estado=estado)
        r = await pg.evaluate("({on:document.getElementById('bloqueo').classList.contains('on'), sinPuerta:document.getElementById('bqNone').offsetParent===null, faceid:document.getElementById('bqBtn').offsetParent!==null})")
        ok('modo clave: pide la clave y no ofrece entrar sin ella', r['on'] and r['sinPuerta'] and not r['faceid'], str(r))
        await pg.fill('#bqPin1', '123456'); await pg.click('#bqKeyConfirm'); await pg.wait_for_timeout(600)
        ok('con la clave correcta se entra', not await pg.evaluate("document.getElementById('bloqueo').classList.contains('on')"))
        await nav.close()
        cuenta = ("window.__fidCalls=0; if(navigator.credentials){navigator.credentials.get=function(){window.__fidCalls++; return Promise.reject(Object.assign(new Error('cancel'),{name:'NotAllowedError'}));};}"
                  "if(window.PublicKeyCredential){PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable=()=>Promise.resolve(true);}"
                  "localStorage.setItem('faceid_lock_v2_prot3', JSON.stringify({id:'AAAA',t:1})); localStorage.setItem('fluxia_lock_mode_v1_prot3','bio');")
        nav, ctx, pg, err = await abrir_con_bloqueo(p, {"id": "prot3", "onboardingSkipped": True, "newUser": False}, init_extra=cuenta)
        await pg.wait_for_timeout(6000)
        n = await pg.evaluate("window.__fidCalls")
        ok('Face ID se pide una sola vez (sin repetirse solo)', n == 1, f'{n} veces')
        await nav.close()

if __name__ == '__main__':
    tmp = Path(tempfile.mkdtemp(prefix='fluxia-pruebas-'))
    entorno = dict(os.environ, PORT=str(PUERTO), DATA_DIR=str(tmp / 'data'), ALLOWED_EMAILS=EMAIL, CODE_COOLDOWN_MS='1', NODE_ENV='test')
    srv = subprocess.Popen(['node', str(RAIZ / 'server.js')], env=entorno, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(30):
            try: urllib.request.urlopen(B + '/health'); break
            except Exception: time.sleep(0.2)
        asyncio.run(main(tmp))
    finally:
        srv.terminate(); shutil.rmtree(tmp, ignore_errors=True)
    fallos = [r for r in resultados if not r[1]]
    print(f'\n{len(resultados) - len(fallos)}/{len(resultados)} pruebas correctas')
    if fallos:
        print('❌ NO SUBAS ESTA VERSIÓN. Fallan:'); [print('   · ' + f[0]) for f in fallos]
        sys.exit(1)
    print('✅ Todo correcto. Puedes subir.')
