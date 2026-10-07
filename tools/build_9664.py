from pathlib import Path
import json,hashlib
SRC=Path("index_fluxia_v96.63_LAB.html"); DST=Path("index_fluxia_v96.64_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.63-LAB","v96.64-LAB").replace("v96.63","v96.64")
css=r'''
<style id="fluxia-v9664-premium-candidate">
/* Fase 3: pulido premium final, CSS-only, cero coste funcional */
:root{--fx-shadow:0 4px 16px rgba(20,60,70,.045);--fx-shadow-hero:0 12px 30px rgba(24,78,88,.065)}
html{-webkit-text-size-adjust:100%}
body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
header,.app-header,.topbar{min-height:58px!important;padding-top:max(8px,env(safe-area-inset-top))!important}
header img,.app-header img,.brand-logo{max-height:28px!important;width:auto!important}
header .brand,.brand-wordmark,.fluxia-wordmark{font-size:1rem!important}
#dashboard .hero-disponible,#dashboard .disponible-card,#dashboard [data-kpi="disponible"]{box-shadow:var(--fx-shadow-hero)!important}
.card,.item-card,.expense-card,.provision-card,.shared-card,.finance-card,.bank-card{box-shadow:var(--fx-shadow)!important}
.card:active,.item-card:active{transform:none!important}
button,.btn,a[role="button"]{min-height:40px;border-radius:12px;-webkit-tap-highlight-color:transparent}
.icon-btn,.menu-btn,.notification-btn{min-width:40px!important;min-height:40px!important;padding:8px!important}
input,select,textarea,button{font:inherit}
.section-title,.panel-title,h1,h2{letter-spacing:-.028em!important}
.subtitle,.muted,.secondary{color:#708187!important}
nav,.bottom-nav,.tabs{border-color:rgba(30,78,88,.08)!important}
.toast,.modal,.dialog{border-radius:18px!important;box-shadow:0 16px 42px rgba(18,53,60,.13)!important}
@media(max-width:430px){
 main,.main-content{padding-left:12px!important;padding-right:12px!important}
 #dashboard .dashboard-grid,#dashboard .kpi-grid,#dashboard .grid{gap:9px!important}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.64_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.64","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.64_LAB.html?v=v96.64-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.64.js").write_text("const VERSION='v96.64-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.64.txt").write_text("""FLUXIA v96.64-LAB — CANDIDATA VISUAL FAST-SAFE

AÑADIDO
- Pulido premium final de header, logo/wordmark, superficies, botones, iconos, modales y navegación.
- Safe-area iPhone y responsive <=430 px.
- Tipografía/espaciado coherentes y accesibilidad prefers-reduced-motion.

MODIFICADO
- Exclusivamente CSS de presentación sobre v96.63.

ELIMINADO / CONSOLIDADO
- Sin capas JS nuevas; sin animaciones táctiles pesadas.

BLINDADO / NO TOCADO
- Arquitectura FAST-SAFE validada por usuario v96.58-v96.63.
- ESTABLE index.html.
- Cero listeners, observers, polling, timers o wrappers de render nuevos.
- Datos/cálculos no se declaran validados en esta fase.

PRUEBAS
- Build determinista desde v96.63.
- Cero JS funcional nuevo.
- Identidad v96.64 consistente.
- Safari-first; PWA solo después de validar esta candidata.

SIGUIENTE FASE
- Recuperación financiera/cloud selectiva: Disponible, ingresos, variables, fijos, huchas, banco→fijo, bankRef, NO-PURGE y Supabase, sin degradar velocidad.
""")
p=Path("PROMPT_MAESTRO_v96.63.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.63","PROMPT_MAESTRO_v96.64")
p+="""\n\nLEY v96.64 — CIERRE VISUAL Y APERTURA FINANCIERA\n- v96.64 cierra la reconstrucción estética FAST-SAFE salvo ajustes visuales derivados de pruebas reales.\n- A partir de la siguiente fase, las incorporaciones prioritarias son integridad financiera y nube, portadas selectivamente sobre esta arquitectura.\n- Nunca se recuperará funcionalidad copiando en bloque capas de las versiones lentas.\n- Cada bloque financiero deberá superar invariantes contables y conservar la velocidad validada antes de incorporar el siguiente.\n"""
Path("PROMPT_MAESTRO_v96.64.txt").write_text(p,encoding="utf-8")
print("built",len(s),hashlib.sha256(s.encode()).hexdigest())
