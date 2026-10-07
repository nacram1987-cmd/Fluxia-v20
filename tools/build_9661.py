from pathlib import Path
import re,json,hashlib
SRC=Path("index_fluxia_v96.60_LAB.html"); DST=Path("index_fluxia_v96.61_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.60-LAB","v96.61-LAB").replace("v96.60","v96.61")
# Dashboard completion is CSS-only to preserve validated FAST-SAFE interaction path.
css=r'''
<style id="fluxia-v9661-dashboard-complete">
/* v96.61: dashboard visual completion without JS/runtime work */
#dashboard{--fx-gap:10px}
#dashboard .dashboard-grid,#dashboard .kpi-grid,#dashboard .grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:var(--fx-gap)!important}
#dashboard .hero-disponible,#dashboard .disponible-card,#dashboard [data-kpi="disponible"]{grid-column:1/-1!important;min-height:128px!important;padding:18px!important;border-radius:20px!important}
#dashboard .card,#dashboard .kpi{min-height:96px!important;padding:13px!important}
#dashboard .label,#dashboard .kpi-label{font-size:.84rem!important;font-weight:700!important;letter-spacing:.01em!important}
#dashboard .value,#dashboard .kpi-value{font-variant-numeric:tabular-nums!important}
#dashboard .hero-disponible .value,#dashboard .disponible-card .value,#dashboard [data-kpi="disponible"] .value{font-size:clamp(2rem,9vw,3rem)!important;font-weight:800!important;letter-spacing:-.045em!important}
#dashboard button,#dashboard a{-webkit-tap-highlight-color:transparent}
@media(max-width:380px){#dashboard .card,#dashboard .kpi{padding:11px!important}}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.61_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.61","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.61_LAB.html?v=v96.61-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
# Keep LAB worker deliberately non-caching during Safari-first phase; no stable worker/cache interference.
Path("fluxia-sw-v96.61.js").write_text("const VERSION='v96.61-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.61.txt").write_text("""FLUXIA v96.61-LAB — DASHBOARD COMPLETO / FAST-SAFE

AÑADIDO
- Disponible a ancho completo y jerarquía visual principal.
- Rejilla 2x2 compacta para KPIs/módulos del Dashboard.
- Tipografía numérica estable y tamaños responsive.
- Ajuste táctil sin animaciones ni trabajo JS.

MODIFICADO
- Exclusivamente CSS de Dashboard sobre v96.60.

ELIMINADO / CONSOLIDADO
- Ninguna capa funcional añadida; no se reintroduce arquitectura lenta.

BLINDADO / NO TOCADO
- Ruta de interacción FAST-SAFE v96.58-v96.60.
- ESTABLE index.html.
- Cero listeners, observers, polling, timers o render wrappers nuevos.
- Motores de datos existentes de la base.

PRUEBAS DE BUILD
- Generación determinista desde v96.60.
- Sin JavaScript nuevo.
- Service worker LAB sin caché durante fase Safari-first.
- Identidad v96.61 consistente.

CRITERIO DE ACEPTACIÓN
- Debe conservar la misma fluidez perceptible de v96.59/v96.60.
- Cualquier regresión de menú, tabs, desplegables o scroll invalida esta versión.
""")
p=Path("PROMPT_MAESTRO_v96.60.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.60","PROMPT_MAESTRO_v96.61")
p+="""\n\nLEY v96.61 — PUERTA DE PROMOCIÓN FLUIDA\n- Ninguna candidata definitiva se promociona a ESTABLE hasta igualar el benchmark FAST-SAFE en Safari y después en PWA.\n- Dashboard y estética se implementan sin introducir trabajo JavaScript global cuando CSS sea suficiente.\n- La incorporación funcional posterior se hace módulo a módulo con rollback inmediato si aparece regresión de latencia.\n"""
Path("PROMPT_MAESTRO_v96.61.txt").write_text(p,encoding="utf-8")
print("built",len(s),hashlib.sha256(s.encode()).hexdigest())
