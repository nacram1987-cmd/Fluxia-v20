from pathlib import Path
import re,json,hashlib
FAST=Path("index_fluxia_v96.64_LAB.html")
VIS=Path("index_fluxia_v96.56_LAB.html")
DST=Path("index_fluxia_v96.65_LAB.html")
fast=FAST.read_text(encoding="utf-8")
vis=VIS.read_text(encoding="utf-8")
# Extract authored CSS blocks from modern visual reference, but never scripts/runtime.
styles=re.findall(r'<style(?:\\s[^>]*)?>(.*?)</style>',vis,flags=re.S|re.I)
# Prefer later visual layers; filter obvious performance/runtime style blocks.
keep=[]
ban=("performance","render","content-visibility","will-change","v9641","v9645","v9646","v9647","v9648","anti-freeze")
for block in styles:
    low=block.lower()
    if any(x in low for x in ban): continue
    if len(block.strip())<80: continue
    keep.append(block)
# Modern CSS is appended before our FAST-SAFE v96.62-64 overrides, then a precise bridge.
modern="\n".join(keep[-28:])
bridge=r'''
<style id="fluxia-v9665-modern-ui-bridge">
:root{--brand:#9fd9e2!important;--accent:#9fd9e2!important}
body{background:#f7f9f9!important}
#dashboard .hero-disponible,#dashboard .disponible-card,#dashboard [data-kpi="disponible"]{
 background:linear-gradient(145deg,#fbfeff,#e6f6f9)!important;color:#173f48!important
}
.pv-card,.fx30-card,.fluxia-card,.card{border-radius:16px!important}
header .brand,.brand-wordmark,.fluxia-wordmark{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-weight:800!important}
</style>
'''
s=fast.replace("v96.64-LAB","v96.65-LAB").replace("v96.64","v96.65")
payload="<style id=\"fluxia-v9665-modern-ui-port\">\n"+modern+"\n</style>\n"+bridge
s=s.replace("</body>",payload+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.65_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.65","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.65_LAB.html?v=v96.65-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.65.js").write_text("const VERSION='v96.65-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.65.txt").write_text(f"""FLUXIA v96.65-LAB — TRASPLANTE DE ESTÉTICA MODERNA

FUENTES
- Motor/interacción: v96.64 FAST-SAFE validada por usuario.
- Referencia visual moderna: v96.56-LAB, última arquitectura moderna completa previa al recovery.

AÑADIDO
- Trasplante CSS de las capas visuales modernas sobre el motor rápido.
- Bridge final Fluxia para branding azul hielo, Disponible y wordmark.

MODIFICADO
- Presentación únicamente.

ELIMINADO / CONSOLIDADO
- Se excluyen explícitamente capas CSS identificadas como performance/render/content-visibility/will-change.
- No se trasplanta ningún script de v96.56.

BLINDADO / NO TOCADO
- Navegación y runtime v96.64.
- Cero JS moderno importado.
- Cero listeners, observers, polling, timers o render wrappers añadidos.
- ESTABLE index.html intacto.

CONTROL
- Bloques style fuente encontrados: {len(styles)}
- Bloques visuales portados: {len(keep[-28:])}
- La aceptación exige conservar velocidad v96.64 y recuperar visualmente la Fluxia moderna.
""")
p=Path("PROMPT_MAESTRO_v96.64.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.64","PROMPT_MAESTRO_v96.65")
p+="""\n\nLEY v96.65 — DOBLE REFERENCIA DE RECUPERACIÓN\n- Motor y velocidad: FAST-SAFE v96.58-v96.64.\n- Estética moderna: interfaz previa al recovery, portada como presentación sin sus capas runtime lentas.\n- Prohibido confundir modernización de la UI antigua con recuperación de la UI actual.\n- Los trasplantes visuales se realizan sin scripts, listeners, observers, polling ni wrappers de render de la rama lenta.\n"""
Path("PROMPT_MAESTRO_v96.65.txt").write_text(p,encoding="utf-8")
print("styles",len(styles),"ported",len(keep[-28:]),"bytes",len(s),hashlib.sha256(s.encode()).hexdigest())
