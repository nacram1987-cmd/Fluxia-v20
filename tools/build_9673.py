from pathlib import Path
import re,json,hashlib,zipfile
UI=Path("index_fluxia_v96.45_LAB.html").read_text(encoding="utf-8")
FAST=Path("index_fluxia_v96.67_LAB.html").read_text(encoding="utf-8")
# v96.73: exact v96.45 UI/data structure as source of truth. Remove only identified performance layers and replace identity.
s=UI
s=s.replace("v96.45-LAB","v96.73-LAB").replace("v96.45","v96.73")
# Remove known performance experiment blocks by explicit ids/markers only.
ids=["fluxia-runtime-performance-v9607","fluxia-v9630-render-coalescer","fluxia-v9641-render-engine","fluxia-v9644-performance","fluxia-v9645-stable-performance"]
removed=[]
for ident in ids:
    pat=re.compile(r'<(?:script|style)[^>]*id=["\']'+re.escape(ident)+r'["\'][^>]*>.*?</(?:script|style)>',re.S|re.I)
    s,n=pat.subn('',s)
    if n: removed.append((ident,n))
# Remove known named historical speed script blocks conservatively.
for marker in ["v95.94 · MOTOR DE FLUIDEZ","v95.97 · Ciclo de vida PWA/iOS"]:
    i=s.find(marker)
    if i>=0:
        st=s.rfind("<script",0,i); en=s.find("</script>",i)
        if st>=0 and en>=0:
            s=s[:st]+s[en+9:]; removed.append((marker,1))
# Explicitly preserve v96.45 markup/styles/data logic; add only the already validated display-name visual bridge from fast line.
bridge=r'''<script id="fluxia-v9673-display-name">(function(){function c(v){v=String(v||'').trim();return v&&!v.includes('@')?v:''}function a(){var n='Nacho';try{['fluxia_display_name','displayName','nombreUsuario','userName','nombre'].some(function(k){var x=c(localStorage.getItem(k));if(x){n=x;return true}})}catch(e){}document.querySelectorAll('[data-user-name],.user-name,.profile-name,.account-name,.preferences-user-name').forEach(function(e){if((e.textContent||'').includes('@')||e.hasAttribute('data-user-name'))e.textContent=n})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',a,{once:true});else a()})();</script>'''
s=s.replace("</body>",bridge+"</body>",1)
OUT=Path("index_fluxia_v96.73_LAB.html"); OUT.write_text(s,encoding="utf-8")
manifest={"name":"Fluxia BETA v96.73","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.73_LAB.html?v=v96.73-LAB","display":"standalone","theme_color":"#9fd9e2"}
Path("manifest_v96.73_LAB.webmanifest").write_text(json.dumps(manifest,indent=2)+"\n")
Path("fluxia-sw-v96.73.js").write_text("const VERSION='v96.73-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
check=f"""FLUXIA v96.73-LAB — v96.45 EXACTA + CIRUGIA DE MOTOR

FUENTE DE VERDAD VISUAL/FUNCIONAL
- index_fluxia_v96.45_LAB.html SHA d54a83e5d208aef7d4ca283d6ff7ea185076175d.
- Markup, Dashboard, modulos, datos y estetica parten DIRECTAMENTE de v96.45.
- No se mezcla ningun Dashboard de v95.82, v96.35 ni recovery.

MOTOR
- Se eliminan solo capas de rendimiento identificadas por marcador/id.
- Eliminadas: {removed}
- No se hace poda masiva ni regex sobre listeners financieros.
- Se conserva la logica financiera/nube/bancos de v96.45 en esta fase para no alterar datos.
- Nombre visual: bridge minimo ya validado, un DOMContentLoaded once.

BLINDADO
- ESTABLE intacta.
- NO se importa markup de otra version.
- Cero observers/polling/timers nuevos.
- La aceptacion exige: aspecto/datos = v96.45 y velocidad = benchmark FAST-SAFE.
"""
Path("CHECKLIST_v96.73.txt").write_text(check)
p=Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8")+"\n\nLEY v96.73 — REFERENCIA ESTETICA ABSOLUTA v96.45\n- v96.45 es la fuente de verdad de interfaz, Dashboard, composicion y apariencia hasta nueva orden.\n- La optimizacion debe cambiar el motor, nunca reconstruir ni reinterpretar la UI.\n- Prohibido mezclar componentes visuales de otras versiones.\n- Criterio de exito: visual/datos v96.45 + velocidad FAST-SAFE validada.\n"
Path("PROMPT_MAESTRO_v96.73.txt").write_text(p,encoding="utf-8")
sha=hashlib.sha256(s.encode()).hexdigest()
Path("SHA256SUMS_v96.73.txt").write_text(f"{sha}  index_fluxia_v96.73_LAB.html\n")
Path("README_v96.73.md").write_text("# Fluxia v96.73 LAB\n\nReferencia visual exacta: v96.45. Objetivo: misma app, motor aligerado.\n")
with zipfile.ZipFile("Fluxia_v96.73_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
 for f in ["index_fluxia_v96.73_LAB.html","manifest_v96.73_LAB.webmanifest","fluxia-sw-v96.73.js","CHECKLIST_v96.73.txt","PROMPT_MAESTRO_v96.73.txt","SHA256SUMS_v96.73.txt","README_v96.73.md"]: z.write(f)
print("removed",removed,"bytes",len(s),"sha",sha)
