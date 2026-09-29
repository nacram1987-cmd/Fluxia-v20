"""Auditoría de accesibilidad de Fluxia. Uso: python3 qa_a11y.py index_fluxia_vXX.html  (falla si hay botones sin nombre, campos sin etiqueta o zonas táctiles < 32 px).
También comprueba el contraste de los tokens de texto (WCAG AA 4,5:1)."""
import sys,re,subprocess,time,atexit,os,json
from playwright.sync_api import sync_playwright
FILE=os.path.abspath(sys.argv[1]); PORT=8783
srv=subprocess.Popen(['python3','-m','http.server',str(PORT),'--directory',os.path.dirname(FILE)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); atexit.register(srv.kill); time.sleep(1)
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'qa_flujos.py')).read(); SEED=src.split('SEED = """')[1].split('})();"""')[0]+'})();'
JS="""()=>{
 const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'&&e.closest('[aria-hidden="true"]')==null};
 const name=e=>((e.getAttribute('aria-label')||'')+(e.getAttribute('aria-labelledby')?'x':'')+(e.getAttribute('title')||'')+(e.innerText||e.textContent||'')).replace(/[\\s\\u200b]/g,'');
 const out={btnSinNombre:[],inputSinEtiqueta:[],imgSinAlt:[],tactilPequeno:[],sinLang:!document.documentElement.lang};
 document.querySelectorAll('button,[role=button],a[href]').forEach(b=>{if(!vis(b))return;if(!name(b))out.btnSinNombre.push((b.id||b.className||b.tagName).toString().slice(0,40));
   const r=b.getBoundingClientRect();if(Math.min(r.width,r.height)<32)out.tactilPequeno.push(((b.id||b.className||'')+'|'+(b.innerText||'').trim().slice(0,12)).slice(0,44)+' '+Math.round(r.width)+'x'+Math.round(r.height));});
 document.querySelectorAll('input,select,textarea').forEach(i=>{if(!vis(i)||i.type==='hidden'||i.type==='checkbox'&&false)return;const has=i.getAttribute('aria-label')||i.getAttribute('aria-labelledby')||i.title||(i.id&&document.querySelector('label[for="'+i.id+'"]'))||i.closest('label');if(!has)out.inputSinEtiqueta.push((i.id||i.name||i.className||i.type).toString().slice(0,40)+(i.placeholder?' ph='+i.placeholder.slice(0,20):''));});
 document.querySelectorAll('img').forEach(i=>{if(vis(i)&&!i.hasAttribute('alt'))out.imgSinAlt.push((i.src||'').slice(0,40));});
 return out;}"""
tot={}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}); ctx.add_init_script(SEED)
    pg=ctx.new_page(); pg.route('**/*',lambda r: r.continue_() if 'localhost' in r.request.url else r.abort()); pg.on('dialog',lambda d:d.dismiss())
    pg.goto(f'http://localhost:{PORT}/'+os.path.basename(FILE),wait_until='domcontentloaded'); pg.wait_for_timeout(4500)
    tabs=pg.evaluate("()=>[...document.querySelectorAll('section.panel')].map(s=>s.id.replace('panel-',''))")
    for t in tabs:
        pg.evaluate(f"()=>goToTab('{t}')"); pg.wait_for_timeout(500)
        r=pg.evaluate(JS)
        for k,v in r.items():
            if k=='sinLang': tot.setdefault(k,[]).append(v); continue
            for x in v: tot.setdefault(k,{}).setdefault(x,set()).add(t)
    b.close()
print('lang en <html>:', 'falta' if any(tot.get('sinLang',[False])) else 'ok')
for k in ('btnSinNombre','inputSinEtiqueta','imgSinAlt','tactilPequeno'):
    d=tot.get(k,{}); print(f'\n{k}: {len(d)} distintos'); 
    for x,ts in list(d.items())[:14]: print('   ',x,'·',','.join(sorted(ts))[:40])

def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a_,b_):
    la,lb=lum(a_),lum(b_); la,lb=(la,lb) if la>=lb else (lb,la); return (la+0.05)/(lb+0.05)
malos=[]
for n,fg,bg in (('texto',"#1A2433","#FFFFFF"),('muted/blanco',"#5C6B80","#FFFFFF"),('muted/surface-2',"#5C6B80","#EFF6FA"),('teal-ink/teal-soft',"#0B6577","#D9F0F5"),('teal/blanco',"#0E7C90","#FFFFFF"),('wine-ink/blanco',"#B23A32","#FFFFFF"),('wine-ink/wine-soft',"#B23A32","#FBDCD9"),('gold-ink/gold-soft',"#8A5A00","#FCEBC9"),('gold-ink/blanco',"#8A5A00","#FFFFFF"),('blanco/teal',"#FFFFFF","#0E7C90")):
    r=cr(fg,bg); print('contraste %-22s %.2f:1'%(n,r))
    if r<4.5: malos.append(n)
fallos=len(tot.get('btnSinNombre',{}))+len(tot.get('inputSinEtiqueta',{}))+len(tot.get('tactilPequeno',{}))+len(malos)
print('\nRESULTADO a11y:', 'OK ✔' if not fallos else 'FALLA ✘ (%d)'%fallos); sys.exit(1 if fallos else 0)
