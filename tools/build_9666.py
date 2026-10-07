from pathlib import Path
import re,json,hashlib
FAST=Path("index_fluxia_v96.64_LAB.html")
# v96.35 is the latest pre-surgery UI branch before performance-only pruning; use as actual visual reference.
VIS=Path("index_fluxia_v96.35_LAB.html")
DST=Path("index_fluxia_v96.66_LAB.html")
fast=FAST.read_text(encoding="utf-8"); vis=VIS.read_text(encoding="utf-8")
styles=re.findall(r'<style(?:\\s[^>]*)?>(.*?)</style>',vis,flags=re.S|re.I)
# Keep design layers, reject known runtime/perf CSS experiments.
ban=("content-visibility","will-change","fluxia-v963","interaction-priority","performance","render-engine","anti-freeze")
keep=[b for b in styles if len(b.strip())>80 and not any(x in b.lower() for x in ban)]
# Use broad modern design set, preserving source order.
modern="\n".join(keep)
s=fast.replace("v96.64-LAB","v96.66-LAB").replace("v96.64","v96.66")
payload='<style id="fluxia-v9666-modern-design-reference">\n'+modern+'\n</style>\n'
s=s.replace("</body>",payload+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.66_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.66","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.66_LAB.html?v=v96.66-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.66.js").write_text("const VERSION='v96.66-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.66.txt").write_text(f"""FLUXIA v96.66-LAB — CORRECCIÓN DEL TRASPLANTE VISUAL

DIAGNÓSTICO
- v96.65 seguía mostrando la composición antigua. Portar CSS desde v96.56 no recuperó la estructura visual moderna.
- Se corrige la referencia: v96.35 contiene la rama visual completa previa a la poda estructural.

AÑADIDO
- Portado del conjunto de estilos de diseño de v96.35 sobre el motor FAST-SAFE v96.64.
- Se conserva el orden original de los estilos para respetar la cascada real.

EXCLUIDO
- Capas identificadas de performance/render/content-visibility/will-change e interacción experimental.
- Cero scripts de v96.35.

BLINDADO
- Runtime/navegación v96.64.
- Cero listeners, observers, polling, timers o wrappers nuevos.
- ESTABLE intacta.

CONTROL
- Styles detectados en referencia: {len(styles)}
- Styles de diseño portados: {len(keep)}
- Si la composición moderna requiere markup y no solo CSS, la siguiente iteración portará exclusivamente ese markup, manteniendo los handlers del motor rápido.
""")
p=Path("PROMPT_MAESTRO_v96.64.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.64","PROMPT_MAESTRO_v96.66")
p+="""\n\nLEY v96.66 — RECUPERACIÓN VISUAL VERIFICABLE\n- Una estética no se considera recuperada por portar CSS: debe coincidir visualmente en composición, jerarquía y estructura con la referencia moderna.\n- Si el cambio depende de markup, se porta markup de presentación y se enlaza a handlers FAST-SAFE; nunca scripts globales de la rama lenta.\n- La validación del usuario en captura real manda sobre inferencias estáticas.\n"""
Path("PROMPT_MAESTRO_v96.66.txt").write_text(p,encoding="utf-8")
print("styles",len(styles),"keep",len(keep),"bytes",len(s),hashlib.sha256(s.encode()).hexdigest())
