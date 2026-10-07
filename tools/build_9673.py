from pathlib import Path
import re,json,hashlib,zipfile
UI=Path("index_fluxia_v96.45_LAB.html").read_text(encoding="utf-8")
s=UI.replace("v96.45-LAB","v96.73-LAB").replace("v96.45","v96.73")
ids=["fluxia-runtime-performance-v9607","fluxia-v9630-render-coalescer","fluxia-v9641-render-engine","fluxia-v9644-performance","fluxia-v9645-stable-performance"]
removed=[]
for ident in ids:
    pat=re.compile(r'<(?:script|style)[^>]*id=["\\\']'+re.escape(ident)+r'["\\\'][^>]*>.*?</(?:script|style)>',re.S|re.I)
    s,n=pat.subn('',s)
    if n: removed.append([ident,n])
for marker in ["v95.94 · MOTOR DE FLUIDEZ","v95.97 · Ciclo de vida PWA/iOS"]:
    i=s.find(marker)
    if i>=0:
        st=s.rfind("<script",0,i); en=s.find("</script>",i)
        if st>=0 and en>=0:
            s=s[:st]+s[en+9:]; removed.append([marker,1])
bridge="""<script id="fluxia-v9673-display-name">(function(){function c(v){v=String(v||'').trim();return v&&!v.includes('@')?v:''}function a(){var n='Nacho';try{['fluxia_display_name','displayName','nombreUsuario','userName','nombre'].some(function(k){var x=c(localStorage.getItem(k));if(x){n=x;return true}})}catch(e){}document.querySelectorAll('[data-user-name],.user-name,.profile-name,.account-name,.preferences-user-name').forEach(function(e){if((e.textContent||'').includes('@')||e.hasAttribute('data-user-name'))e.textContent=n})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',a,{once:true});else a()})();</script>"""
s=s.replace("</body>",bridge+"</body>",1)
Path("index_fluxia_v96.73_LAB.html").write_text(s,encoding="utf-8")
Path("manifest_v96.73_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.73","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.73_LAB.html?v=v96.73-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.73.js").write_text("const VERSION='v96.73-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.73.txt").write_text("FLUXIA v96.73 — fuente visual y funcional EXACTA v96.45; solo se retiran capas de rendimiento identificadas. Eliminadas: "+json.dumps(removed,ensure_ascii=False)+"\n")
Path("PROMPT_MAESTRO_v96.73.txt").write_text("LEY v96.73: v96.45 es referencia estética absoluta. Optimizar motor sin reconstruir UI. Prohibido mezclar componentes visuales de otras versiones. Éxito = visual/datos v96.45 + velocidad FAST-SAFE.\n")
sha=hashlib.sha256(s.encode()).hexdigest()
Path("SHA256SUMS_v96.73.txt").write_text(sha+"  index_fluxia_v96.73_LAB.html\n")
Path("README_v96.73.md").write_text("# Fluxia v96.73 LAB\nReferencia visual exacta v96.45; motor aligerado.\n")
with zipfile.ZipFile("Fluxia_v96.73_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
    for f in ["index_fluxia_v96.73_LAB.html","manifest_v96.73_LAB.webmanifest","fluxia-sw-v96.73.js","CHECKLIST_v96.73.txt","PROMPT_MAESTRO_v96.73.txt","SHA256SUMS_v96.73.txt","README_v96.73.md"]: z.write(f)
print("OK",removed,len(s),sha)
