from pathlib import Path
import subprocess,re,json,hashlib
FAST=Path("index_fluxia_v96.67_LAB.html"); DST=Path("index_fluxia_v96.71_LAB.html")
fast=FAST.read_text(encoding="utf-8")
ref=subprocess.check_output(["git","show","e59635eb5ff5d51b0e809b685470d8586e9f1900:index.html"],text=True)
# Extract exact modern dashboard component markup by fx30-dashboard container using balanced div scan.
pos=ref.find('class="fx30-dashboard')
if pos<0: pos=ref.find("class='fx30-dashboard")
if pos<0: raise SystemExit("fx30-dashboard not found")
start=ref.rfind("<div",0,pos)
tag=re.compile(r'<(/?)div\b[^>]*>',re.I)
depth=0; end=None
for m in tag.finditer(ref,start):
    if m.group(1): depth-=1
    else: depth+=1
    if depth==0:
        end=m.end(); break
if end is None: raise SystemExit("unbalanced dashboard")
modern_markup=ref[start:end]
modern_markup=re.sub(r'<script\b[^>]*>.*?</script>','',modern_markup,flags=re.S|re.I)
# Locate real summary panel in fast DOM and insert modern component at top; hide only known legacy summary containers.
panelpos=fast.find('id="panel-resumen"')
if panelpos<0: raise SystemExit("panel-resumen missing in fast")
open_end=fast.find(">",panelpos)+1
s=fast[:open_end]+"\n"+modern_markup+"\n"+fast[open_end:]
s=s.replace("v96.67-LAB","v96.71-LAB").replace("v96.67","v96.71")
css=r'''
<style id="fluxia-v9671-dashboard-component-port">
#panel-resumen>.dashboard-legacy-summary,#panel-resumen>#dashboardVisualV801,#panel-resumen>#dashInformeSemana,#panel-resumen>#tuMes,#panel-resumen>.hint{display:none!important}
#panel-resumen>.fx30-dashboard{display:block!important}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.71_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.71","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.71_LAB.html?v=v96.71-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.71.js").write_text("const VERSION='v96.71-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.71.txt").write_text(f"""FLUXIA v96.71-LAB — PORT REAL DEL COMPONENTE DASHBOARD

CORRECCIÓN
- CSS no podía recuperar un componente que no existía en el DOM FAST-SAFE.
- Se porta ahora el markup REAL .fx30-dashboard desde index.html histórico commit e59635e (06-10-2026).

APLICADO
- Componente .fx30-dashboard real insertado dentro de #panel-resumen.
- Longitud markup portado: {len(modern_markup)} caracteres.
- Contenedores legacy conocidos del resumen ocultos cuando son hijos directos.
- Diseño moderno de módulos e identidad v96.67 preservados.

NO IMPORTADO
- Ningún <script> del componente histórico.
- Ningún runtime global de la rama lenta.
- Cero observers, polling, intervals o timers añadidos.

BLINDADO
- Motor FAST-SAFE v96.67.
- ESTABLE index.html intacta.
- Si algún dato del componente requiere binding, se conectará después a funciones existentes sin importar renderAll histórico.
""")
p=Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.67","PROMPT_MAESTRO_v96.71")
p+="""\n\nLEY v96.71 — COMPONENTE AUSENTE = PORTAR MARKUP, NO SEGUIR PARCHEANDO CSS\n- Si la UI objetivo no existe en el DOM FAST-SAFE, CSS no puede recuperarla.\n- Se porta el markup exacto del componente validado y se conecta a handlers rápidos existentes.\n- Nunca se importan scripts globales de la rama lenta para recuperar presentación.\n"""
Path("PROMPT_MAESTRO_v96.71.txt").write_text(p,encoding="utf-8")
print("markup",len(modern_markup),"out",len(s),hashlib.sha256(s.encode()).hexdigest())
