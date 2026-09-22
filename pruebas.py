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
