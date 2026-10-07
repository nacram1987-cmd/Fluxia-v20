from pathlib import Path
import subprocess, re, json, hashlib
# Use exact last known modern index.html from Oct 6 as UI source, but only extract its Dashboard CSS.
# Download via git history locally available in checkout when action runs.
FAST=Path("index_fluxia_v96.67_LAB.html"); DST=Path("index_fluxia_v96.70_LAB.html")
fast=FAST.read_text(encoding="utf-8")
ref=subprocess.check_output(["git","show","e59635eb5ff5d51b0e809b685470d8586e9f1900:index.html"],text=True)
# Extract CSS rules targeting actual modern dashboard selectors.
styles=re.findall(r'<style(?:\\s[^>]*)?>(.*?)</style>',ref,re.S|re.I)
rules=[]
for b in styles:
    for m in re.finditer(r'([^{}]+)\{([^{}]*)\}',b,re.S):
        sel,body=m.group(1).strip(),m.group(2)
        if any(k in sel for k in ("#panel-resumen",".fx30-",".fx-month-nav","#mesSelectGlobal","#fx34Context")):
            if not any(x in body.lower() for x in ("content-visibility","will-change")):
                rules.append(sel+"{"+body+"}")
modern="\n".join(rules)
s=fast.replace("v96.67-LAB","v96.70-LAB").replace("v96.67","v96.70")
s=s.replace("</body>",'<style id="fluxia-v9670-exact-modern-dashboard">\n'+modern+'\n</style>\n</body>',1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.70_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.70","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.70_LAB.html?v=v96.70-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.70.js").write_text("const VERSION='v96.70-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.70.txt").write_text(f"""FLUXIA v96.70-LAB — RECUPERACIÓN DESDE LA REFERENCIA REAL

CORRECCIÓN
- Se abandona v96.35 como referencia visual incorrecta.
- Referencia visual exacta: index.html del 06-10-2026, commit e59635e, última rama moderna del repositorio antes del trabajo de recovery.
- Runtime rápido: v96.67 validada.

APLICADO
- {len(rules)} reglas CSS extraídas específicamente de los selectores REALES del Dashboard moderno: #panel-resumen, .fx30-*, .fx-month-nav, #mesSelectGlobal y #fx34Context.
- Se mantiene identidad/nombre corregidos y diseño moderno ya validado en módulos.

NO IMPORTADO
- Ningún JavaScript del index moderno.
- Ningún observer/polling/timer/render engine.
- Ninguna regla content-visibility/will-change.

ACEPTACIÓN
- La referencia visual deja de ser inferida: procede del index real del 06-10.
- Debe conservar velocidad FAST-SAFE.
""")
p=Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.67","PROMPT_MAESTRO_v96.70")
p+="""\n\nLEY v96.70 — REFERENCIA VISUAL HISTÓRICA REAL\n- Para recuperar UI no se adivina por número de versión: se usa el index histórico exacto validado del repositorio.\n- Referencia actual: commit e59635e del 06-10-2026 para estética moderna; FAST-SAFE para runtime.\n- Prohibido declarar recuperación visual sin comprobar selectores reales de la referencia.\n"""
Path("PROMPT_MAESTRO_v96.70.txt").write_text(p,encoding="utf-8")
print("rules",len(rules),"modern_bytes",len(modern),"out",len(s),hashlib.sha256(s.encode()).hexdigest())
