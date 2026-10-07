from pathlib import Path
import re,json,hashlib,zipfile
s=Path("index_fluxia_v96.76_LAB.html").read_text(encoding="utf-8")
new=Path("tools/renderGastosVariables_9677.txt").read_text(encoding="utf-8")
st=s.index("function renderGastosVariables(){"); en=s.index("\nfunction ",st+30)
s=s[:st]+new+s[en:]
# remove v96.76 containment because v96.42 active-panel CSS forces contain:none anyway; avoid dead layer
s=re.sub(r"<style id=['\"]fluxia-v9676-variables-contain['\"]>.*?</style>","",s,count=1,flags=re.S)
s=s.replace("v96.76-LAB","v96.77-LAB").replace("v96.76","v96.77")
Path("index_fluxia_v96.77_LAB.html").write_text(s,encoding="utf-8")
Path("CHECKLIST_v96.77.txt").write_text("v96.77: Gastos Variables ya NO ejecuta FluxiaGVBorrados.purgarListaLocal al entrar. movimientosDe(mes) se calcula una sola vez por render en vez de repetirse. La vista Por categoria no se construye mientras esta oculta: se renderiza solo al abrirla. Retirada capa CSS v96.76 inefectiva. Sin cambios visuales. Contabilidad v96.76 preservada.\n")
Path("PROMPT_MAESTRO_v96.77.txt").write_text("v96.45 referencia visual absoluta. Gastos Variables: entrada inmediata, NO-PURGE, no construir vistas ocultas, una sola derivacion mensual por render. Contabilidad por invariantes; prohibidos saldos hardcodeados.\n")
Path("README_v96.77.md").write_text("# Fluxia v96.77 LAB\nOptimización estructural real de Gastos Variables.\n")
Path("manifest_v96.77_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.77","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.77_LAB.html?v=v96.77-LAB","display":"standalone"})+"\n")
Path("fluxia-sw-v96.77.js").write_text("const VERSION='v96.77-LAB';\n")
sha=hashlib.sha256(s.encode()).hexdigest();Path("SHA256SUMS_v96.77.txt").write_text(sha+"  index_fluxia_v96.77_LAB.html\n")
with zipfile.ZipFile("Fluxia_v96.77_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
 for f in ["index_fluxia_v96.77_LAB.html","CHECKLIST_v96.77.txt","PROMPT_MAESTRO_v96.77.txt","README_v96.77.md","manifest_v96.77_LAB.webmanifest","fluxia-sw-v96.77.js","SHA256SUMS_v96.77.txt"]:z.write(f)
print("OK",sha,len(s))
