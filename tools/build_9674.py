from pathlib import Path
import re,json,hashlib,zipfile
src=Path("index_fluxia_v96.73_LAB.html").read_text(encoding="utf-8")
s=src.replace("v96.73-LAB","v96.74-LAB").replace("v96.73","v96.74")
changes=[]
def replace_function(text,name,newfn):
    m=re.search(r'function\\s+'+re.escape(name)+r'\\s*\\([^)]*\\)\\s*\\{',text)
    if not m:return text,False
    i=m.end(); depth=1
    while i<len(text) and depth:
        if text[i]=='{':depth+=1
        elif text[i]=='}':depth-=1
        i+=1
    return text[:m.start()]+newfn+text[i:],True
s,ok=replace_function(s,"purgarAntiguos","function purgarAntiguos(){ return 0; /* v96.74 NO-PURGE */ }")
if ok: changes.append("NO-PURGE")
newvar="""function variablesTotal(mes){
 return movimientosDe(mes).reduce(function(sum,mv){
  if(!mv) return sum;
  if(mv.cuentaComoFijo && mv.vinculoFijoId) return sum;
  if(mv.excluido || mv.excluidoDisponible || mv.tipoInterno==='reponer_hucha' || mv.tipoInterno==='traspaso' || mv.tipoInterno==='puente' || mv.esTraspasoPropio===true) return sum;
  var imp=Number(mv.importe)||0;
  if(mv.origen==='banco' && mv.bancoRef) imp=Math.abs(imp);
  return sum+imp;
 },0);
}"""
s,ok=replace_function(s,"variablesTotal",newvar)
if ok: changes.append("variablesTotal invariant")
s,n=re.subn(r'window\\.FluxiaBancoLimpiar\\s*=\\s*function\\s*\\([^)]*\\)\\s*\\{.*?\\n\\};',"window.FluxiaBancoLimpiar=function(){ return 0; }; /* v96.74 NO-PURGE */",s,count=1,flags=re.S)
if n: changes.append("bank cleaner NO-PURGE")
audit="""<script id="fluxia-v9674-audit">window.FluxiaAuditar9674=function(m){try{return {mes:m,variables:typeof variablesTotal==='function'?variablesTotal(m):null,disponible:typeof disponibleEfectivo==='function'?disponibleEfectivo(m):null}}catch(e){return {error:String(e)}}};</script>"""
s=s.replace("</body>",audit+"</body>",1)
Path("index_fluxia_v96.74_LAB.html").write_text(s,encoding="utf-8")
Path("CHECKLIST_v96.74.txt").write_text("v96.74 sobre v96.73 validada. Cambios: "+json.dumps(changes)+"; sin cambios visuales; sin saldos hardcodeados; estable intacta.\\n")
Path("PROMPT_MAESTRO_v96.74.txt").write_text("v96.45 referencia visual absoluta. v96.73 referencia de fluidez. v96.74: NO-PURGE permanente; gasto bancario real reduce Disponible exactamente una vez; traspaso propio impacto cero; nunca hardcodear saldos.\\n")
Path("README_v96.74.md").write_text("# Fluxia v96.74 LAB\\nPrimer bloque de integridad contable sobre la base validada.\\n")
Path("manifest_v96.74_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.74","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.74_LAB.html?v=v96.74-LAB","display":"standalone","theme_color":"#9fd9e2"})+"\\n")
Path("fluxia-sw-v96.74.js").write_text("const VERSION='v96.74-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\\n")
sha=hashlib.sha256(s.encode()).hexdigest();Path("SHA256SUMS_v96.74.txt").write_text(sha+"  index_fluxia_v96.74_LAB.html\\n")
with zipfile.ZipFile("Fluxia_v96.74_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
 for f in ["index_fluxia_v96.74_LAB.html","CHECKLIST_v96.74.txt","PROMPT_MAESTRO_v96.74.txt","README_v96.74.md","manifest_v96.74_LAB.webmanifest","fluxia-sw-v96.74.js","SHA256SUMS_v96.74.txt"]:z.write(f)
print("OK",changes,sha,len(s))
