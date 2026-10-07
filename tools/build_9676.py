from pathlib import Path
import re,hashlib,json,zipfile
s=Path("index_fluxia_v96.74_LAB.html").read_text(encoding="utf-8")
removed=[]
i=s.find("v96.21-variable-regression")
if i>=0:
    st=s.rfind("<script",0,i); en=s.find("</script>",i)
    if st>=0 and en>=0:
        s=s[:st]+s[en+9:]; removed.append("v96.21-variable-regression")
m=re.search(r'function variablesTotal\\(mes\\)\\{',s)
if m:
    i=m.end(); d=1
    while i<len(s) and d:
        if s[i]=='{': d+=1
        elif s[i]=='}': d-=1
        i+=1
    new="function variablesTotal(mes){ return movimientosDe(mes).reduce(function(sum,mv){ if(!mv)return sum; if(mv.cuentaComoFijo&&mv.vinculoFijoId)return sum; if(mv.excluido||mv.excluidoDisponible||mv.tipoInterno==='reponer_hucha'||mv.tipoInterno==='traspaso'||mv.tipoInterno==='puente'||mv.esTraspasoPropio===true)return sum; var imp=Number(mv.importe)||0; if(mv.origen==='banco'&&mv.bancoRef)imp=Math.abs(imp); return sum+imp; },0); }"
    s=s[:m.start()]+new+s[i:]; removed.append("variablesTotal")
s=s.replace("</head>","<style id='fluxia-v9676-variables-contain'>#panel-gastos-variables{contain:layout style paint}</style></head>",1)
s=s.replace("v96.74-LAB","v96.76-LAB").replace("v96.74","v96.76")
Path("index_fluxia_v96.76_LAB.html").write_text(s,encoding="utf-8")
Path("CHECKLIST_v96.76.txt").write_text("v96.76: eliminado reparador hardcodeado v96.21 si existe; variablesTotal normaliza gasto bancario y excluye fijo vinculado/traspaso/puente/reposicion; containment CSS en Gastos Variables; UI v96.45 intacta; sin saldos objetivo. Cambios: "+json.dumps(removed)+"\\n")
Path("PROMPT_MAESTRO_v96.76.txt").write_text("v96.45 referencia visual absoluta. Prohibidos reparadores por cantidades objetivo. Contabilidad por invariantes reales. Gastos Variables debe abrir sin trabajo global bloqueante. NO-PURGE permanente.\\n")
Path("README_v96.76.md").write_text("# Fluxia v96.76 LAB\\nRecuperacion contable + optimizacion localizada de Gastos Variables.\\n")
Path("manifest_v96.76_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.76","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.76_LAB.html?v=v96.76-LAB","display":"standalone"})+"\\n")
Path("fluxia-sw-v96.76.js").write_text("const VERSION='v96.76-LAB';\\n")
sha=hashlib.sha256(s.encode()).hexdigest(); Path("SHA256SUMS_v96.76.txt").write_text(sha+"  index_fluxia_v96.76_LAB.html\\n")
with zipfile.ZipFile("Fluxia_v96.76_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
    for f in ["index_fluxia_v96.76_LAB.html","CHECKLIST_v96.76.txt","PROMPT_MAESTRO_v96.76.txt","README_v96.76.md","manifest_v96.76_LAB.webmanifest","fluxia-sw-v96.76.js","SHA256SUMS_v96.76.txt"]: z.write(f)
print("OK",removed,sha)
