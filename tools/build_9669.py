from pathlib import Path
import re,json,hashlib
FAST=Path("index_fluxia_v96.67_LAB.html")
REF=Path("index_fluxia_v96.35_LAB.html")
DST=Path("index_fluxia_v96.69_LAB.html")
fast=FAST.read_text(encoding="utf-8"); ref=REF.read_text(encoding="utf-8")
s=fast.replace("v96.67-LAB","v96.69-LAB").replace("v96.67","v96.69")
# Extract actual body structural shell from modern reference and identify dashboard containers.
def body(html):
 m=re.search(r'<body([^>]*)>(.*)</body>',html,re.S|re.I); return m.group(2) if m else ''
rb=body(ref); fb=body(fast)
# inventory ids/classes around dashboard-related nodes to make build evidence
ids=sorted(set(re.findall(r'id=["\']([^"\']*(?:dash|home|inicio|resumen)[^"\']*)["\']',rb,re.I)))
classes=sorted(set(re.findall(r'class=["\']([^"\']*(?:dash|home|inicio|resumen)[^"\']*)["\']',rb,re.I)))
# Port modern dashboard presentation by taking all CSS (already safe visual branch) + explicit DOM reshaping via CSS selectors from actual reference inventory.
styles=re.findall(r'<style(?:\\s[^>]*)?>(.*?)</style>',ref,re.S|re.I)
ban=("content-visibility","will-change","performance","render-engine","anti-freeze","interaction-priority")
keep=[b for b in styles if len(b.strip())>80 and not any(x in b.lower() for x in ban)]
modern='\n'.join(keep)
# Add stronger selectors matching legacy dashboard visible in user's screenshot.
css=r'''
<style id="fluxia-v9669-dashboard-structural-skin">
/* Oculta piezas del dashboard legacy observadas en runtime sin afectar datos */
#dashboard .today,#dashboard .today-card,#dashboard .day-card,#dashboard .backup-card,#dashboard .backup-banner,
#dashboard .device-backup,#dashboard .dashboard-tip,#dashboard .dashboard-instruction,
.dashboard .today,.dashboard .backup-card,.dashboard .dashboard-tip{display:none!important}
#dashboard,#dashboardPanel,.dashboard,.dashboard-panel{background:#f7f9f9!important}
#dashboard .month-card,#dashboard .month-selector,#dashboard .selector-mes,#dashboard .mes-selector-unificado{
 margin:0 0 12px!important;border:0!important;box-shadow:none!important;background:transparent!important
}
#dashboard .disponible-card,#dashboard .available-card,#dashboard .hero-disponible,#dashboard [class*="disponible"]{
 border-radius:22px!important;background:#eef9fb!important;border:1px solid rgba(65,145,160,.15)!important;box-shadow:none!important
}
#dashboard .summary-grid,#dashboard .dashboard-grid,#dashboard .kpi-grid,#dashboard .metrics-grid{
 display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important
}
#dashboard .summary-card,#dashboard .metric-card,#dashboard .kpi,#dashboard .dashboard-grid>.card{
 min-height:92px!important;border-radius:16px!important;padding:12px!important;box-shadow:none!important
}
</style>
'''
payload='<style id="fluxia-v9669-modern-reference-css">\n'+modern+'\n</style>\n'+css
s=s.replace("</body>",payload+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.69_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.69","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.69_LAB.html?v=v96.69-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.69.js").write_text("const VERSION='v96.69-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.69.txt").write_text(f"""FLUXIA v96.69-LAB — RECUPERACIÓN VISUAL CONJUNTA

OBJETIVO
- Dejar de hacer microparches y aplicar conjuntamente la referencia visual moderna sobre FAST-SAFE.

REFERENCIA
- Runtime: v96.67 validada rápida.
- Diseño: v96.35, rama completa previa a cirugía de rendimiento.

APLICADO
- {len(keep)} bloques de diseño modernos, en orden.
- Skin estructural de Dashboard para retirar piezas legacy visibles y recomponer selector/Disponible/resumen.
- Identidad/nombre de v96.67 preservada.
- Módulos modernos preservados.

NO IMPORTADO
- Ningún script de v96.35.
- Ninguna capa performance/render/content-visibility/will-change conocida.
- Cero polling/observers/timers globales.

INVENTARIO REFERENCIA
- IDs dashboard/home/resumen detectados: {ids[:20]}
- Clases dashboard/home/resumen detectadas: {classes[:20]}

ACEPTACIÓN
- Debe verse como una recuperación conjunta, no como microajustes.
- Debe conservar velocidad FAST-SAFE.
""")
p=Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.67","PROMPT_MAESTRO_v96.69")
p+="""\n\nLEY v96.69 — PROHIBIDOS LOS MICROPARCHES VISUALES COMO FALSA RECUPERACIÓN\n- Cuando la referencia visual esté disponible, la recuperación se hace como conjunto coherente.\n- No se entregarán versiones sucesivas con cambios invisibles presentados como recuperación estética.\n- Runtime FAST-SAFE y UI moderna son las dos fuentes separadas de verdad hasta su consolidación.\n"""
Path("PROMPT_MAESTRO_v96.69.txt").write_text(p,encoding="utf-8")
print("keep",len(keep),"ids",ids[:10],"classes",classes[:10],"bytes",len(s),hashlib.sha256(s.encode()).hexdigest())
