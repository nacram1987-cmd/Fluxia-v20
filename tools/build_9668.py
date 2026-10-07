from pathlib import Path
import json,hashlib
SRC=Path("index_fluxia_v96.67_LAB.html"); DST=Path("index_fluxia_v96.68_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.67-LAB","v96.68-LAB").replace("v96.67","v96.68")
# Recompose dashboard visually using existing DOM only: no new JS/runtime.
css=r'''
<style id="fluxia-v9668-dashboard-modern-recompose">
/* Dashboard moderno sobre DOM FAST-SAFE */
#dashboard,.dashboard-view,[data-view="dashboard"]{padding-top:8px!important}
#dashboard .today-card,#dashboard .today-banner,#dashboard [class*="today"],
#dashboard .backup-banner,#dashboard [class*="backup"],
#dashboard .dashboard-help,#dashboard .helper-text{display:none!important}
#dashboard .month-selector,#dashboard .selector-mes,#dashboard .mes-selector-unificado{
 order:-2!important;margin:4px 0 12px!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important
}
#dashboard .hero-disponible,#dashboard .disponible-card,#dashboard [data-kpi="disponible"]{
 order:-1!important;min-height:150px!important;border-radius:24px!important;padding:22px 18px!important;
 background:linear-gradient(145deg,#f7fdfe,#dff3f6)!important;border:1px solid rgba(61,139,153,.16)!important;
 box-shadow:0 10px 30px rgba(26,77,87,.065)!important
}
#dashboard .hero-disponible .label,#dashboard .disponible-card .label,#dashboard [data-kpi="disponible"] .label{
 text-transform:none!important;letter-spacing:-.01em!important;font-size:.92rem!important;font-weight:750!important
}
#dashboard .hero-disponible .value,#dashboard .disponible-card .value,#dashboard [data-kpi="disponible"] .value{
 font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;font-size:2.65rem!important;font-weight:850!important;letter-spacing:-.055em!important
}
#dashboard .dashboard-grid,#dashboard .kpi-grid,#dashboard .grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
#dashboard .card,#dashboard .kpi{min-height:104px!important;padding:14px!important;border-radius:18px!important;background:#fff!important}
#dashboard .card .value,#dashboard .kpi .value{font-size:1.28rem!important;font-weight:800!important;letter-spacing:-.035em!important}
#dashboard .card .label,#dashboard .kpi .label{font-size:.82rem!important;font-weight:720!important}
#dashboard .card:nth-child(1){background:linear-gradient(145deg,#f8ffff,#eaf8f8)!important}
#dashboard .card:nth-child(2){background:linear-gradient(145deg,#fffdfa,#f8f2e9)!important}
#dashboard .card:nth-child(3){background:linear-gradient(145deg,#fffdf7,#fbf1d8)!important}
#dashboard .card:nth-child(4){background:linear-gradient(145deg,#fdfbff,#f3eef9)!important}
@media(max-width:430px){#dashboard{padding-left:0!important;padding-right:0!important}#dashboard .dashboard-grid,#dashboard .kpi-grid,#dashboard .grid{gap:9px!important}}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.68_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.68","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.68_LAB.html?v=v96.68-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.68.js").write_text("const VERSION='v96.68-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.68.txt").write_text("""FLUXIA v96.68-LAB — DASHBOARD MODERNO FAST-SAFE

AÑADIDO
- Recomposición visual del Dashboard usando exclusivamente el DOM existente.
- Disponible protagonista en azul hielo.
- Selector de mes simplificado visualmente.
- Grid compacto 2x2 con superficies diferenciadas.
- Se ocultan en Dashboard elementos legacy de fecha/backup/ayuda cuando existen.

MODIFICADO
- Solo CSS del Dashboard.

BLINDADO
- Identidad v96.67 preservada.
- Diseño moderno de módulos v96.66 preservado.
- Cero JS nuevo, listeners, observers, polling, timers o render wrappers.
- ESTABLE intacta.

CRITERIO
- Dashboard debe dar un salto visual sin perder la velocidad validada.
""")
p=Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.67","PROMPT_MAESTRO_v96.68")
p+="""\n\nLEY v96.68 — DASHBOARD FAST-SAFE\n- El Dashboard moderno se recompone sobre DOM existente antes de introducir markup o JavaScript adicional.\n- Elementos legacy puramente informativos pueden ocultarse por CSS si no participan en contabilidad ni navegación.\n- Disponible y módulos mantienen jerarquía moderna sin coste de runtime.\n"""
Path("PROMPT_MAESTRO_v96.68.txt").write_text(p,encoding="utf-8")
print(len(s),hashlib.sha256(s.encode()).hexdigest())
