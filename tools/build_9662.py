from pathlib import Path
import json,hashlib
SRC=Path("index_fluxia_v96.61_LAB.html"); DST=Path("index_fluxia_v96.62_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.61-LAB","v96.62-LAB").replace("v96.61","v96.62")
css=r'''
<style id="fluxia-v9662-visual-recovery-phase1">
:root{
 --fx-brand:#9fd9e2;--fx-brand-2:#dff3f6;--fx-ink:#173f48;--fx-muted:#6c7b80;
 --fx-gold:#b79a59;--fx-surface:#fff;--fx-bg:#f7f9f9;--fx-line:rgba(30,78,88,.10)
}
body{background:var(--fx-bg)!important;color:var(--fx-ink)!important}
header,.app-header,.topbar{background:rgba(255,255,255,.96)!important;border-bottom:1px solid var(--fx-line)!important;box-shadow:0 3px 16px rgba(20,60,70,.04)!important}
header .brand,.brand-wordmark,.fluxia-wordmark{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-weight:800!important;font-size:1.08rem!important;letter-spacing:-.035em!important;color:var(--fx-ink)!important}
header .beta,.beta-badge,[class*="beta"]{color:var(--fx-gold)!important;font-weight:800!important}
.mes-selector-unificado,.month-selector,.selector-mes{background:rgba(255,255,255,.94)!important;border:1px solid var(--fx-line)!important;border-radius:16px!important;box-shadow:0 3px 12px rgba(20,60,70,.035)!important}
.mes-selector-unificado button.active,.month-selector button.active,.selector-mes button.active{background:var(--fx-brand)!important;color:var(--fx-ink)!important;border-color:transparent!important;box-shadow:none!important}
#dashboard .hero-disponible,#dashboard .disponible-card,#dashboard [data-kpi="disponible"]{
 background:linear-gradient(145deg,#fbfeff 0%,#e6f6f9 100%)!important;
 border:1px solid rgba(71,151,165,.18)!important;border-radius:22px!important;
 box-shadow:0 10px 28px rgba(24,78,88,.065)!important;padding:20px!important
}
#dashboard .hero-disponible::before,#dashboard .disponible-card::before{content:"Disponible real";display:block;font-size:.78rem;font-weight:750;letter-spacing:.025em;color:#668087;margin-bottom:4px}
#dashboard .dashboard-grid,#dashboard .kpi-grid,#dashboard .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
#dashboard .card,#dashboard .kpi{background:#fff!important;border:1px solid var(--fx-line)!important;border-radius:17px!important;min-height:94px!important;padding:13px!important;box-shadow:0 4px 14px rgba(20,60,70,.045)!important}
#dashboard .card:nth-child(1)::after,#dashboard .kpi:nth-child(1)::after{content:"💰";float:right}
#dashboard .card:nth-child(2)::after,#dashboard .kpi:nth-child(2)::after{content:"📌";float:right}
#dashboard .card:nth-child(3)::after,#dashboard .kpi:nth-child(3)::after{content:"🐷";float:right}
#dashboard .card:nth-child(4)::after,#dashboard .kpi:nth-child(4)::after{content:"🧾";float:right}
.drawer,.side-menu,.menu-panel{background:#fff!important;box-shadow:12px 0 30px rgba(18,53,60,.10)!important}
.drawer a,.drawer button,.side-menu a,.side-menu button{border-radius:12px!important}
button,.btn{touch-action:manipulation}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.62_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.62","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.62_LAB.html?v=v96.62-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.62.js").write_text("const VERSION='v96.62-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.62.txt").write_text("""FLUXIA v96.62-LAB — RECUPERACIÓN VISUAL FASE 1

AÑADIDO
- Lenguaje visual Fluxia: azul hielo + tinta azul petróleo + oro BETA.
- Header blanco cálido y compacto; wordmark sans premium.
- Disponible real protagonista, ancho completo, azul hielo.
- Selector de mes integrado visualmente.
- Dashboard 2x2 compacto y jerarquía de módulos.
- Menú lateral visualmente limpio.

MODIFICADO
- CSS/estética principal exclusivamente.

ELIMINADO / CONSOLIDADO
- Sin nuevas capas JS de rendimiento.
- Sin observers, polling, timers o wrappers de render.

BLINDADO / NO TOCADO
- FAST-SAFE v96.58-v96.61.
- ESTABLE index.html.
- Ruta crítica de navegación.
- Motores funcionales de la base.

PRUEBAS
- Build desde v96.61.
- Cero JS nuevo.
- Identidad v96.62.
- Criterio: misma velocidad perceptible que v96.61.
""")
p=Path("PROMPT_MAESTRO_v96.61.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.61","PROMPT_MAESTRO_v96.62")
p+="""\n\nLEY v96.62 — RECUPERACIÓN VISUAL SIN COSTE DE RUNTIME\n- La identidad visual premium de Fluxia se recupera preferentemente con CSS y estructura existente.\n- Ninguna mejora estética puede añadir listeners, observers, polling o renders globales.\n- Header, Disponible, Dashboard, selector de mes y menú deben conservar el benchmark FAST-SAFE.\n"""
Path("PROMPT_MAESTRO_v96.62.txt").write_text(p,encoding="utf-8")
print(len(s),hashlib.sha256(s.encode()).hexdigest())
