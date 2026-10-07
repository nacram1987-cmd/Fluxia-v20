from pathlib import Path
import re,json,hashlib
SRC=Path("index_fluxia_v96.66_LAB.html"); REF=Path("index_fluxia_v96.35_LAB.html"); DST=Path("index_fluxia_v96.67_LAB.html")
s=SRC.read_text(encoding="utf-8"); ref=REF.read_text(encoding="utf-8")
s=s.replace("v96.66-LAB","v96.67-LAB").replace("v96.66","v96.67")
# Extract dashboard markup from modern ref by stable section id/class candidates.
def extract(html):
    candidates=[r'(<section[^>]+id=["\']dashboard["\'][^>]*>.*?</section>)',r'(<div[^>]+id=["\']dashboard["\'][^>]*>.*?</div>\s*</div>)']
    for p in candidates:
        m=re.search(p,html,re.S|re.I)
        if m:return m.group(1)
    return None
modern=extract(ref); old=extract(s)
ported=False
if modern and old:
    # Strip inline scripts defensively; markup presentation only.
    modern=re.sub(r'<script\b[^>]*>.*?</script>','',modern,flags=re.S|re.I)
    s=s.replace(old,modern,1); ported=True
# Identity: display name bridge, no email as UI name. Use existing profile/name fields if available, fallback Nacho.
# One-shot only at load; no global observers/timers.
bridge=r'''
<script id="fluxia-v9667-display-name">
(function(){
 function clean(v){v=String(v||'').trim();return v&&!v.includes('@')?v:''}
 function pick(){
   var vals=[];
   try{
    var keys=['fluxia_display_name','displayName','nombreUsuario','userName','nombre'];
    keys.forEach(function(k){vals.push(localStorage.getItem(k))});
   }catch(e){}
   vals.push(window.FLUXIA_DISPLAY_NAME);
   for(var i=0;i<vals.length;i++){var x=clean(vals[i]);if(x)return x}
   return 'Nacho';
 }
 function apply(){
   var n=pick();
   document.querySelectorAll('[data-user-name],.user-name,.profile-name,.account-name,.preferences-user-name').forEach(function(el){
     if((el.textContent||'').includes('@')||el.hasAttribute('data-user-name')) el.textContent=n;
   });
   document.querySelectorAll('.user-email,.profile-email,.account-email').forEach(function(el){el.style.display='none'});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
</script>
'''
s=s.replace("</body>",bridge+"</body>",1)
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.67_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.67","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.67_LAB.html?v=v96.67-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.67.js").write_text("const VERSION='v96.67-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.67.txt").write_text(f"""FLUXIA v96.67-LAB — DASHBOARD MODERNO + IDENTIDAD

AÑADIDO
- Intento de trasplante estructural del Dashboard moderno desde v96.35: {'APLICADO' if ported else 'NO ENCONTRADO; se conserva estructura FAST-SAFE'}.
- Bridge de nombre visible: la interfaz no usa el correo como nombre; prioriza nombre/displayName existente y usa Nacho como fallback visual.
- Email oculto en posiciones de identidad visual cuando existe selector específico.

BLINDADO
- Sin scripts de runtime de v96.35.
- Un único DOMContentLoaded once para identidad; cero observers, polling, intervals o timers.
- FAST-SAFE v96.64/66 y ESTABLE intactas.

PRUEBA
- Debe conservar fluidez v96.66.
- Verificar Dashboard y menú/Preferencias: nombre visible, no correo como identidad.
""")
p=Path("PROMPT_MAESTRO_v96.66.txt").read_text(encoding="utf-8").replace("PROMPT_MAESTRO_v96.66","PROMPT_MAESTRO_v96.67")
p+="""\n\nLEY v96.67 — IDENTIDAD DE USUARIO\n- El correo es credencial, no nombre de presentación.\n- Header, menú, Preferencias y cuentas mostrarán display_name de perfil cloud cuando exista.\n- Nunca fusionar o borrar datos financieros por coincidencia de nombres/correos.\n- El fallback visual no sustituye la futura persistencia cloud del perfil.\n"""
Path("PROMPT_MAESTRO_v96.67.txt").write_text(p,encoding="utf-8")
print("dashboard_ported",ported,"modern",bool(modern),"old",bool(old),"bytes",len(s),hashlib.sha256(s.encode()).hexdigest())
