"""Detecta onclick/onchange que llaman a funciones NO definidas (botones muertos). Uso: python3 qa_handlers.py ruta/index_fluxia_vXX.html"""
import sys,re,subprocess,time,atexit,json
from playwright.sync_api import sync_playwright
import os
FILE=os.path.abspath(sys.argv[1]); PORT=8771
srv=subprocess.Popen(['python3','-m','http.server',str(PORT),'--directory',FILE.rsplit('/',1)[0]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); atexit.register(srv.kill); time.sleep(1)
URL=f'http://localhost:{PORT}/'+FILE.rsplit('/',1)[1]
SEED=open('/home/claude/crawl.py').read().split('SEED="""')[1].split('""")')[0] if False else None
import os; src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'qa_crawl.py')).read(); SEED=src.split('SEED="""')[1].split('})();"""')[0]+'})();'
html=open(FILE,encoding='utf-8',errors='replace').read()
noscript=re.sub(r'<script.*?</script>','',html,flags=re.S)
handlers=re.findall(r'\son(?:click|change|input|submit)="([^"]+)"',noscript)
fns=set()
for h in handlers:
    for m in re.finditer(r'(?<![\w$.])([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\(',h):
        n=m.group(1)
        if n in ('if','function','return','setTimeout','confirm','alert','event','this.value.trim','this.select') or n.startswith(('document.','window.','this.','event.','Math.','JSON.','localStorage.','navigator.','location.','history.','console.')): 
            if not n.startswith('window.'): continue
        fns.add(n)
jsids=set(re.findall(r"getElementById\('([A-Za-z0-9_\-]+)'\)",html))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}); ctx.add_init_script(SEED)
    pg=ctx.new_page(); pg.route('**/*',lambda r: r.continue_() if 'localhost' in r.request.url else r.abort()); pg.on('dialog',lambda d:d.dismiss())
    pg.goto(URL,wait_until='domcontentloaded'); pg.wait_for_timeout(4500)
    bad=pg.evaluate("""(fns)=>fns.filter(n=>{try{var r=n.replace(/^window\\./,'');var parts=r.split('.');var o=window[parts[0]];if(o===undefined){try{o=eval(parts[0])}catch(e){return true}}for(var i=1;i<parts.length;i++){if(o==null||o[parts[i]]===undefined)return true;o=o[parts[i]]}return typeof o!=='function'}catch(e){return true}})""",sorted(fns))
    miss=pg.evaluate("""(ids)=>ids.filter(i=>!document.getElementById(i))""",sorted(jsids))
    print('handlers inline evaluados:',len(fns)); print('FUNCIONES DE onclick/onchange NO DEFINIDAS:',bad)
    print('ids referenciados por getElementById que no existen ahora en el DOM (muchos son dinámicos):',len(miss)); print(miss[:60])
    b.close()
