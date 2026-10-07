from pathlib import Path
import json,hashlib
SRC=Path("index_fluxia_v96.62_LAB.html"); DST=Path("index_fluxia_v96.63_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.62-LAB","v96.63-LAB").replace("v96.62","v96.63")
css=r'''
<style id="fluxia-v9663-visual-recovery-phase2">
/* Coherencia visual global. CSS-only: preserva FAST-SAFE */
main section:not(#dashboard),.panel:not(#dashboard),[data-panel]:not(#dashboard){
 --fx-card-radius:16px;
}
.card,.item-card,.expense-card,.provision-card,.shared-card,.finance-card,.bank-card{
 border-radius:var(--fx-card-radius,16px)!important;
 border:1px solid rgba(30,78,88,.09)!important;
 box-shadow:0 3px 12px rgba(20,60,70,.04)!important;
}
.item-card,.expense-card,.provision-card,.shared-card,.finance-card{padding:12px 13px!important;margin-bottom:8px!important}
.card h3,.item-card h3,.expense-card h3,.provision-card h3,.shared-card h3,.finance-card h3{letter-spacing:-.015em!important}
input,select,textarea{border-radius:12px!important;border:1px solid rgba(30,78,88,.14)!important;background:#fff!important;box-shadow:none!important}
select{min-height:42px!important}
.btn-primary,button.primary,[data-primary="true"]{background:#9fd9e2!important;color:#173f48!important;border-color:transparent!important;box-shadow:none!important;font-weight:750!important}
.badge,.chip,.pill{border-radius:999px!important}
.amount,.money,.importe{font-variant-numeric:tabular-nums!important}
#variables .card,#fijos .card,#financiaciones .card,#provisiones .card,#compartidos .card,
[data-panel="variables"] .card,[data-panel="fijos"] .card,[data-panel="financiaciones"] .card,[data-panel="provisiones"] .card,[data-panel="compartidos"] .card{
 min-height:unset!important;padding:12px 13px!important
}
#bancos .card,[data-panel="bancos"] .card{padding:12px 14px!important}
#bancos .sync-card,#bancos [class*="sync"],[data-panel="bancos"] [class*="sync"]{min-height:unset!important;padding:10px 14px!important;border-radius:14px!important}
.empty-state{background:rgba(223,243,246,.35)!important;border:1px dashed rgba(30,78,88,.16)!important;border-radius:16px!important}
.section-title,.panel-title{color:#173f48!important;letter-spacing:-.025em!important}
</style>
'''
s=s.replace("</body>",css+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.63_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.63","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.63_LAB.html?v=v96.63-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.63.js").write_text("const VERSION='v96.63-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.63.txt").write_text("""FLUXIA v96.63-LAB — RECUPERACIÓN VISUAL FASE 2

AÑADIDO
- Lenguaje visual del Dashboard extendido a módulos de la aplicación.
- Tarjetas compactas y coherentes en Variables, Fijos, Financiaciones, Provisiones/Huchas y Compartidos.
- Formularios, selectores, botones, badges e importes armonizados con marca Fluxia.
- Bancos compactado visualmente, incluida zona de sincronización.
- Estados vacíos y títulos de sección alineados con estética premium.

MODIFICADO
- CSS visual global exclusivamente.

ELIMINADO / CONSOLIDADO
- Ninguna capa JS añadida.
- Cero listeners/observers/polling/timers/render wrappers nuevos.

BLINDADO / NO TOCADO
- FAST-SAFE validada hasta v96.62.
- ESTABLE index.html.
- Motores financieros, persistencia y navegación de la base.

PRUEBAS
- Build determinista desde v96.62.
- Cero JS nuevo.
- Identidad v96.63 consistente.
- Debe conservar fluidez perceptible de v96.62.

SIGUIENTE
- Fase 3: pulido premium final y candidata visual FAST-SAFE.
""")
p=Path("PROMPT_MAESTRO_v96.62.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.62","PROMPT_MAESTRO_v96.63")
p+="""\n\nLEY v96.63 — COHERENCIA VISUAL GLOBAL FAST-SAFE\n- Todos los módulos deben compartir densidad, radios, tipografía, controles y jerarquía visual del Dashboard.\n- Fijos y Financiaciones nunca serán más voluminosos que Huchas/Compartidos sin necesidad funcional.\n- Bancos mantiene sincronización visual compacta.\n- Coherencia estética se resuelve sin añadir trabajo global al runtime.\n"""
Path("PROMPT_MAESTRO_v96.63.txt").write_text(p,encoding="utf-8")
print("built",len(s),hashlib.sha256(s.encode()).hexdigest())
