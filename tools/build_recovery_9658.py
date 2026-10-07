from pathlib import Path
import re, json, hashlib
SRC=Path("index_fluxia_v94.80_LAB.html")
DST=Path("index_fluxia_v96.58_LAB.html")
s=SRC.read_text(encoding="utf-8")
# Version identity only; v94.80 is the user's proven-fast runtime baseline.
s=s.replace("v94.80-LAB","v96.58-LAB").replace("v94.80","v96.58")
# Keep this recovery build deliberately free of later global wrappers/observers/timers.
badge="""\n<style id="fluxia-v9658-recovery">
#fluxiaRecoveryBadge{position:fixed;right:10px;bottom:10px;z-index:99999;font:700 10px/1.2 system-ui;padding:5px 7px;border-radius:999px;background:#fff;border:1px solid #ddd;opacity:.72;pointer-events:none}
</style><div id="fluxiaRecoveryBadge">v96.58 · RECOVERY</div>\n"""
s=s.replace("</body>",badge+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.58_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.58","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.58_LAB.html?v=v96.58-LAB","display":"standalone","theme_color":"#0E7C90"},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
Path("fluxia-sw-v96.58.js").write_text("const VERSION='v96.58-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n",encoding="utf-8")
Path("CHECKLIST_v96.58.txt").write_text("""FLUXIA v96.58-LAB — RECOVERY DE RENDIMIENTO

CAMBIO DE ESTRATEGIA
- Se abandona v96.57 como base de navegación: el usuario reporta retardos cercanos a un minuto.
- v96.58 se reconstruye desde index_fluxia_v94.80_LAB.html, benchmark que el usuario validó expresamente como rápido.

AÑADIDO
- Identidad v96.58-LAB y distintivo RECOVERY para evitar confundirla con otras LAB.

ELIMINADO POR ARQUITECTURA
- No se arrastra ninguna capa global añadida entre v94.81 y v96.57.
- No se añaden nuevos observers, polling, wrappers de rendimiento ni listeners globales.

OBJETIVO DE ESTA LAB
- Aislar si la regresión extrema de menú/pestañas/scroll está en las capas acumuladas posteriores a v94.80.
- Recuperar navegación inmediata antes de portar, de forma selectiva, las funciones financieras modernas.

IMPORTANTE
- Esta LAB NO se promueve a estable.
- NO se usa todavía como fuente de verdad para introducir datos financieros nuevos hasta validar qué funciones modernas faltan respecto a v96.57.
- La estable index.html no se toca.

PRUEBA SOLICITADA
- Safari: login, Dashboard, menú, Dashboard→Variables→Fijos→Bancos, abrir/cerrar desplegables y scroll.
- La pregunta de esta LAB es una sola: ¿ha vuelto la velocidad de v94.80?
""",encoding="utf-8")
print(len(s),hashlib.sha256(s.encode()).hexdigest())
