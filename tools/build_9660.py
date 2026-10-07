from pathlib import Path
import re,json,hashlib
SRC=Path("index_fluxia_v96.59_LAB.html"); DST=Path("index_fluxia_v96.60_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.59-LAB","v96.60-LAB").replace("v96.59","v96.60")
# Premium dashboard skin only: CSS, no JS, no listeners/timers/observers.
css=r'''
<style id="fluxia-v9660-dashboard-premium">
:root{--fx-brand:#9fd9e2;--fx-brand-ink:#174b55;--fx-gold:#b89a54;--fx-ice:#eef9fb}
#dashboard .card,#dashboard .kpi,#dashboard [class*="card"]{transition:none!important}
#dashboard .hero-disponible,#dashboard [data-kpi="disponible"],#dashboard .disponible-card{
 background:linear-gradient(145deg,#f8fdfe 0%,#eaf8fb 100%)!important;
 border:1px solid rgba(80,160,175,.20)!important;box-shadow:0 8px 24px rgba(27,75,84,.06)!important
}
#dashboard .hero-disponible .value,#dashboard [data-kpi="disponible"] .value,#dashboard .disponible-card .value{color:var(--fx-brand-ink)!important}
#dashboard .grid,#dashboard .kpi-grid,#dashboard .dashboard-grid{gap:10px!important}
#dashboard .card,#dashboard .kpi{border-radius:16px!important;box-shadow:0 4px 14px rgba(20,50,60,.055)!important}
header .brand,.brand-wordmark,.fluxia-wordmark{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-weight:800!important;letter-spacing:-.035em!important}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.60_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.60","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.60_LAB.html?v=v96.60-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.60.js").write_text("const VERSION='v96.60-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.60.txt").write_text("""FLUXIA v96.60-LAB — DASHBOARD + VELOCIDAD BLINDADA

AÑADIDO
- Dashboard visual premium sobre la base FAST-SAFE validada.
- Disponible en azul hielo muy claro, cálido y coherente con marca Fluxia.
- Wordmark sans premium/negrita y tarjetas más compactas.
- Nueva ley imperial: cualquier regresión perceptible respecto a v96.58/v96.59 invalida la versión.

MODIFICADO
- Solo CSS del Dashboard/branding. Sin modificar motores de datos.

ELIMINADO / CONSOLIDADO
- Ningún motor nuevo de rendimiento. Cero wrappers/observers/polling/timers añadidos.

BLINDADO / NO TOCADO
- Ruta de navegación rápida v96.58/v96.59.
- ESTABLE index.html.
- Datos financieros, Supabase existente, bancos y cálculos de la base.

PRUEBAS
- Build determinista desde v96.59.
- Sin JavaScript nuevo de interacción.
- Cero listeners/observers/timers nuevos por esta versión.

RESULTADO ESPERADO
- Misma fluidez de v96.59 con Dashboard visualmente alineado con Fluxia.
""")
# Prompt maestro actual
p=Path("PROMPT_MAESTRO_v96.58.txt").read_text(encoding="utf-8")
p=p.replace("PROMPT_MAESTRO_v96.58","PROMPT_MAESTRO_v96.60")
p+="""\n\nLEY IMPERIAL ABSOLUTA v96.60 — VELOCIDAD NO NEGOCIABLE\n- v96.58 y v96.59 han sido validadas por el usuario como funcionamiento correcto y ultrafluido.\n- Desde v96.60 queda PROHIBIDA cualquier regresión perceptible de velocidad.\n- Si menú, cambio de pestaña, desplegable, botón, entrada a Dashboard o scroll empeoran frente al benchmark, la versión queda RECHAZADA automáticamente.\n- Ninguna función nueva justifica lentitud: debe reescribirse o revertirse antes de continuar.\n- Funciones modernas se portan por bloques pequeños sobre FAST-SAFE; nunca se reincorpora en bloque la arquitectura lenta v94.81-v96.57.\n- Cero polling y cero capas globales de aceleración; rendimiento por arquitectura simple y eliminación de trabajo redundante.\n- Esta ley tiene la misma prioridad que integridad financiera y persistencia cloud: ambas deben coexistir.\n"""
Path("PROMPT_MAESTRO_v96.60.txt").write_text(p,encoding="utf-8")
print(len(s),hashlib.sha256(s.encode()).hexdigest())
