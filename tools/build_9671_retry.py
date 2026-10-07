from pathlib import Path
import subprocess,re,json
fast=Path("index_fluxia_v96.67_LAB.html").read_text(encoding="utf-8")
ref=subprocess.check_output(["git","show","e59635eb5ff5d51b0e809b685470d8586e9f1900:index.html"],text=True)
pos=ref.find('class="fx30-dashboard')
start=ref.rfind("<div",0,pos)
tag=re.compile(r'<(/?)div\\b[^>]*>',re.I); depth=0; end=None
for m in tag.finditer(ref,start):
    depth += -1 if m.group(1) else 1
    if depth==0: end=m.end(); break
modern=ref[start:end]
modern=re.sub(r'<script\\b[^>]*>.*?</script>','',modern,flags=re.S|re.I)
p=fast.find('id="panel-resumen"'); oe=fast.find(">",p)+1
s=(fast[:oe]+"\n"+modern+"\n"+fast[oe:]).replace("v96.67-LAB","v96.71-LAB").replace("v96.67","v96.71")
s=s.replace("</body>",'<style id="fluxia-v9671-dashboard-component-port">#panel-resumen>.fx30-dashboard{display:block!important}</style></body>',1)
Path("index_fluxia_v96.71_LAB.html").write_text(s,encoding="utf-8")
Path("CHECKLIST_v96.71.txt").write_text("v96.71: componente real fx30-dashboard del index historico 06-10-2026 sobre FAST-SAFE v96.67; scripts historicos excluidos; estable intacta.\n")
Path("PROMPT_MAESTRO_v96.71.txt").write_text(Path("PROMPT_MAESTRO_v96.67.txt").read_text(encoding="utf-8")+"\nLEY v96.71: componente ausente se porta como markup real, nunca se simula con CSS.\n",encoding="utf-8")
Path("manifest_v96.71_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.71","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.71_LAB.html?v=v96.71-LAB","display":"standalone","theme_color":"#9fd9e2"})+"\n")
Path("fluxia-sw-v96.71.js").write_text("const VERSION='v96.71-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
print("OK",len(modern))
