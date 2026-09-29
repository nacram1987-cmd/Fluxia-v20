import sys, json, re, subprocess, time, atexit
from playwright.sync_api import sync_playwright
"""QA de humo de Fluxia. Uso: python3 qa_crawl.py ruta/index_fluxia_vXX.html   (requiere: pip install playwright && playwright install chromium)
Abre todas las pestañas con datos de prueba, pulsa botones (sin borrar nada) y lista errores de página/consola, IDs duplicados y botones muertos.
OJO: revisa también CAPTURAS de lo que se ve; un rediseño sobre una lista oculta pasa este test sin que el usuario lo vea."""
import os
FILE=os.path.abspath(sys.argv[1]); PORT=8770
srv=subprocess.Popen(['python3','-m','http.server',str(PORT),'--directory',FILE.rsplit('/',1)[0]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); atexit.register(srv.kill); time.sleep(1)
URL=f'http://localhost:{PORT}/'+FILE.rsplit('/',1)[1]
SEED="""
(function(){ if(localStorage.getItem('__seeded')) return; localStorage.setItem('__seeded','1');
 var id='usr-abc', pr={id:id,name:'Nacho',legacy:false,principal:true,createdAt:1,onboardingPending:false,newUser:false,onboardingCompletedAt:5};
 localStorage.setItem('fluxia_profile_v2',JSON.stringify(pr)); localStorage.setItem('fluxia_profiles_v2',JSON.stringify([pr]));
 localStorage.setItem('fluxia_lock_mode_v1_usr-abc','ninguna'); localStorage.setItem('fluxia_tip_vista_completa_v1','1'); localStorage.setItem('fluxia_v69_onboarding_shown','1');
 var P='fluxia_user_'+id+'__', M=['julio','agosto','septiembre','octubre','noviembre','diciembre'];
 function S(k,v){localStorage.setItem(P+'planRescate_v2_'+k,JSON.stringify(v));}
 S('ingresos',[{id:'i1',concepto:'Nómina',importe:2000,tipo:'fijo',mes:'septiembre',meses:M},{id:'i2',concepto:'Extra',importe:150,tipo:'extra',mes:'septiembre',meses:['septiembre']}]);
 S('fijos',[{id:'f1',concepto:'Alquiler',importe:700,mes:'septiembre'},{id:'f2',concepto:'Luz',importe:60,mes:'septiembre'}]);
 S('provisiones',[{id:'p1',nombre:'Vacaciones',objetivo:1200,cuota:100,aportaciones:{septiembre:[{id:'a1',importe:100,fecha:'2026-09-02'}]},meses:M}]);
 S('financiaciones',[{id:'fi1',nombre:'Móvil',cuota:30,inicio:'2026-07',fin:'2027-06',origen:'manual'}]);
 S('movimientos',[{id:'m1',concepto:'Mercadona parque',importe:12.5,mes:'septiembre',fecha:'2026-09-28',tipo:'variable',categoria:'Alimentación'},{id:'m2',concepto:'Rincon de arles',importe:8,mes:'septiembre',fecha:'2026-09-27',tipo:'variable'},{id:'m3',concepto:'Gasolina',importe:45,mes:'septiembre',fecha:'2026-09-20',tipo:'variable',categoria:'Transporte'}]);
 S('compartidos',[
  {id:'c1',grupo:'g1',concepto:'Mercadona',persona:'Ana',fecha:'2026-09-20',sentido:'me_deben',quienPago:'yo',tipo:'normal',importeInicial:15,total:30,reparto:'mitad',liquidaciones:[{id:'l1',importe:5,fecha:'2026-09-25',concepto:'Bizum'}]},
  {id:'c2',grupo:'g2',concepto:'Cena',persona:'Luis',fecha:'2026-09-21',sentido:'debo',quienPago:'otra',tipo:'normal',importeInicial:20,total:40,reparto:'mitad',liquidaciones:[]},
  {id:'c3',grupo:'g3',concepto:'Gasolina viaje',persona:'Ana',fecha:'2026-09-15',sentido:'me_deben',quienPago:'yo',tipo:'normal',importeInicial:22.5,total:45,reparto:'mitad',evento:'Viaje Asturias',liquidaciones:[]},
  {id:'c4',grupo:'g4',concepto:'Pizza',persona:'Marta',fecha:'2026-09-10',sentido:'me_deben',quienPago:'yo',tipo:'normal',importeInicial:10,total:20,reparto:'mitad',liquidaciones:[{id:'l2',importe:10,fecha:'2026-09-12',concepto:'Bizum'}]}]);
 localStorage.setItem('fluxia_banco_conexiones_v1',JSON.stringify([{banco:'Revolut',_banco:'Revolut',cuentas:[{iban:'LT1'}],iban:'LT1'},{banco:'CaixaBank',_banco:'CaixaBank',cuentas:[{iban:'ES1'}],iban:'ES1',error:'HUB046'}]));
 localStorage.setItem('fluxia_banco_estado',JSON.stringify({conectado:true,banco:'2 bancos',bancos:['Revolut','CaixaBank'],nBancos:2,operativos:1,errorFondo:'CaixaBank: HUB046'}));
 localStorage.setItem('fluxia_banco_saldos_v67',JSON.stringify({saldos:[{banco:'Revolut',iban:'LT1',saldo:45.1,moneda:'EUR'}],total:{EUR:45.1},t:new Date().toISOString()}));
})();"""
res={'errors':[],'console':[]}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}); ctx.add_init_script(SEED)
    pg=ctx.new_page(); cur=['boot']
    pg.on('pageerror',lambda e:res['errors'].append((cur[0],str(e)[:220])))
    pg.on('console',lambda m: res['console'].append((cur[0],m.text[:220])) if m.type=='error' and 'Failed to load resource' not in m.text and 'net::ERR' not in m.text else None)
    pg.on('dialog',lambda d:d.dismiss())
    pg.route('**/*',lambda r: r.continue_() if 'localhost' in r.request.url else r.abort())
    pg.goto(URL,wait_until='domcontentloaded'); pg.wait_for_timeout(4500)
    tabs=pg.evaluate("()=>[...document.querySelectorAll('section.panel')].map(s=>s.id.replace('panel-',''))")
    print('paneles:',tabs)
    SKIP=re.compile(r'borrar|eliminar|vaciar|cerrar sesi|quitar|reset|restablec|olvidar|desconect|limpiar|reinicia|empezar desde cero|papelera|nuevo usuario|salir',re.I)
    for t in tabs:
        cur[0]='tab:'+t
        try: pg.evaluate(f"()=>goToTab('{t}')")
        except Exception as e: res['errors'].append((cur[0],'goToTab: '+str(e)[:120]))
        pg.wait_for_timeout(500)
        try: pg.evaluate("()=>{try{renderAll()}catch(e){throw e}}")
        except Exception as e: res['errors'].append((cur[0],'renderAll: '+str(e)[:160]))
        btns=pg.evaluate(f"""()=>[...document.querySelectorAll('#panel-{t} button, #panel-{t} .pv-btn')].filter(b=>b.offsetParent!==null&&!b.disabled).map((b,i)=>({{i:i,t:(b.innerText||b.title||b.id||'').trim().slice(0,40)}}))""")
        n=0
        for bt in btns[:40]:
            if SKIP.search(bt['t']): continue
            cur[0]=f"click:{t}:{bt['t']}"
            try:
                pg.evaluate(f"""()=>{{var bs=[...document.querySelectorAll('#panel-{t} button, #panel-{t} .pv-btn')].filter(b=>b.offsetParent!==null&&!b.disabled);var b=bs[{bt['i']}];if(b)b.click();}}""")
                pg.wait_for_timeout(120); n+=1
                pg.evaluate("""()=>{document.querySelectorAll('.modal-overlay.open,.tc-sheet.open,.fluxia-ritual.on').forEach(m=>{var c=m.querySelector('[data-tcsheet-close],.modal-btn-secondary,.tc-sheet-x,button');if(c)c.click();});document.querySelectorAll('#fxPapeleraOverlay,#fluxiaSeguridadOnboarding').forEach(x=>x.remove());}""")
            except Exception as e: res['errors'].append((cur[0],'click: '+str(e)[:120]))
        print(f'  {t}: {n} botones pulsados')
    cur[0]='drawer'
    try:
        pg.evaluate("()=>{var m=document.querySelector('.menu-btn');if(m)m.click();}"); pg.wait_for_timeout(500)
    except Exception as e: res['errors'].append(('drawer',str(e)[:120]))
    dup=pg.evaluate("()=>{var c={};document.querySelectorAll('[id]').forEach(e=>c[e.id]=(c[e.id]||0)+1);return Object.keys(c).filter(k=>c[k]>1)}")
    print('IDs duplicados en DOM:',dup)
    b.close()
seen=set()
print('\nERRORES DE PÁGINA:',len(res['errors']))
for c,e in res['errors']:
    k=e[:90]
    if k in seen: continue
    seen.add(k); print(' -',c,'|',e)
print('\nCONSOLE.ERROR:',len(res['console']))
for c,e in res['console']:
    k=e[:90]
    if k in seen: continue
    seen.add(k); print(' -',c,'|',e)
