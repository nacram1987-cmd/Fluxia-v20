from pathlib import Path
import re, json, hashlib

SRC=Path("index_fluxia_v96.56_LAB.html")
DST=Path("index_fluxia_v96.57_LAB.html")
s=SRC.read_text(encoding="utf-8")
original=s

# Identidad de versión LAB, sin tocar index.html estable.
s=s.replace("v96.56-LAB","v96.57-LAB").replace("v96.56","v96.57")

# Poda segura: diagnóstico legacy que despertaba 1.8 s después de cada carga.
s=re.sub(r'<script id="fluxia-v95-75-namespace-recovery-diag">.*?</script>\s*', '', s, flags=re.S)

# Poda segura: la nota de pensión es texto estático; no necesita listener global
# visibilitychange en cada retorno a Safari/PWA.
old="""  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(clean,0)},{once:true});else setTimeout(clean,0);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(clean,80)});
"""
new="""  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
"""
s=s.replace(old,new)

# Evita animaciones costosas mientras Safari está desplazando; no añade listeners.
perf="""\n<style id="fluxia-v9657-safari-stability">
@media (max-width: 820px){
  html body .panel,html body .fluxia-card,html body .pv-card,html body .fx30-card{will-change:auto!important}
  html body *{scroll-behavior:auto!important}
  html body .wrap{-webkit-overflow-scrolling:touch}
}
@media (prefers-reduced-motion: reduce){
  html body *,html body *::before,html body *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
</style>\n"""
s=s.replace("</body>",perf+"</body>",1)

if s==original:
    raise SystemExit("No se aplicaron cambios")
if "window.FLUXIA_ARCH_VERSION='v96.57-LAB'" not in s:
    raise SystemExit("Identidad v96.57 no encontrada")
for invariant in ["function purgarAntiguos()","FluxiaBancoLimpiar","bancoRef","disponibleEfectivo"]:
    if invariant not in s:
        raise SystemExit("Invariante ausente: "+invariant)

DST.write_text(s,encoding="utf-8")

manifest={"name":"Fluxia BETA","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.57_LAB.html?v=v96.57-LAB","display":"standalone","background_color":"#F7F9F9","theme_color":"#157F87"}
Path("manifest_v96.57_LAB.webmanifest").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
sw="""const CACHE='fluxia-lab-v96.57';\nconst START='./index_fluxia_v96.57_LAB.html?v=v96.57-LAB';\nself.addEventListener('install',e=>self.skipWaiting());\nself.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\nself.addEventListener('fetch',()=>{});\n"""
Path("fluxia-sw-v96.57.js").write_text(sw,encoding="utf-8")
check="""FLUXIA v96.57-LAB — CAMBIOS REALES

AÑADIDO
- Capa CSS móvil de estabilidad Safari sin listeners, observers ni polling.
- Flujo de publicación automática desde GitHub Actions para las siguientes LAB.

MODIFICADO
- Nota de pensión: inicialización directa; eliminado setTimeout innecesario en arranque.
- Identidad completa de versión a v96.57-LAB.

ELIMINADO / CONSOLIDADO
- Listener legacy de diagnóstico namespace que despertaba 1,8 s tras cada carga.
- Listener global visibilitychange dedicado únicamente a repintar un texto estático.
- Timer de 80 ms asociado a ese listener.

BLINDADO / NO TOCADO
- index.html ESTABLE.
- Supabase y persistencia cloud.
- NO-PURGE.
- bankRef/bancoRef y banco→fijo.
- Corrección contable v96.49 y motor Disponible.
- Módulo Bancos y Gastos validado.

PRUEBAS AUTOMÁTICAS DEL BUILD
- Identidad v96.57-LAB presente.
- Invariantes purgarAntiguos, FluxiaBancoLimpiar, bancoRef y disponibleEfectivo presentes.
- Build falla si desaparece cualquiera de esos invariantes.

PENDIENTE DE VALIDACIÓN REAL
- Fluidez en Safari/iPhone: entrada, menú, desplegables, pestañas y scroll.
- Solo después de validar Safari se prueba como PWA en pantalla de inicio.

SIGUIENTE FASE TRAS FLUIDEZ
- Perfil cloud: mostrar Nacho y deduplicar shells sin tocar datos financieros.
- Fecha/hora bancaria real cuando exista; nunca inventar hora.
- Motor local de identidad/logos de comercios.
- Traspasos propios inteligentes y ordenación de Variables.
"""
Path("CHECKLIST_v96.57.txt").write_text(check,encoding="utf-8")
print("v96.57 generada",len(s),hashlib.sha256(s.encode()).hexdigest())
