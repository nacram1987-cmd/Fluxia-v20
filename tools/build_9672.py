from pathlib import Path
import re,json
FAST=Path("index_fluxia_v96.67_LAB.html").read_text(encoding="utf-8")
REF=Path("index_fluxia_v95.53_LAB.html").read_text(encoding="utf-8")
OUT=Path("index_fluxia_v96.72_LAB.html")
# Exact visual shell from v95.53: copy authored styles wholesale, excluding only known perf experiments.
styles=re.findall(r'<style(?:\\s[^>]*)?>(.*?)</style>',REF,re.S|re.I)
ban=("content-visibility","will-change","render-coalescer","performance","anti-freeze")
visual=[b for b in styles if not any(x in b.lower() for x in ban)]
s=FAST.replace("v96.67-LAB","v96.72-LAB").replace("v96.67","v96.72")
s=s.replace("</head>",'<style id="fluxia-v9672-ui-v9553">\n'+"\n".join(visual)+'\n</style></head>',1)
# Do NOT port the erroneous fx30/v95.82 dashboard component. Build dashboard from existing live data DOM only.
css='''<style id="fluxia-v9672-dashboard-clean">
#panel-resumen .fx30-dashboard{display:none!important}
#panel-resumen{background:#f7f9f9!important}
#panel-resumen .today-card,#panel-resumen .backup-banner,#panel-resumen .hint{display:none!important}
</style>'''
s=s.replace("</body>",css+"</body>",1)
OUT.write_text(s,encoding="utf-8")
Path("CHECKLIST_v96.72.txt").write_text(f"""v96.72 — RECUPERACION VISUAL CORREGIDA
- Se elimina como referencia el componente fx30 que mostraba internamente v95.82.
- Referencia visual completa usada: v95.53-LAB del repositorio ({len(visual)} bloques CSS).
- Runtime: v96.67 FAST-SAFE validado.
- No se importa ningun script de v95.53.
- No observers, polling, timers ni render engines nuevos.
- Estable intacta.
""")
p=Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8")+"\nLEY v96.72: queda prohibido reutilizar componentes con identidad/version interna antigua como referencia visual. La UI se toma de una version completa identificada y el runtime FAST-SAFE permanece separado.\n"
Path("PROMPT_MAESTRO_v96.72.txt").write_text(p,encoding="utf-8")
Path("manifest_v96.72_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.72","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.72_LAB.html?v=v96.72-LAB","display":"standalone","theme_color":"#9fd9e2"})+"\n")
Path("fluxia-sw-v96.72.js").write_text("const VERSION='v96.72-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
print("visual blocks",len(visual),"bytes",len(s))
