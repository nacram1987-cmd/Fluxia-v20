from pathlib import Path
import re,json,hashlib,zipfile
s=Path("index_fluxia_v96.74_LAB.html").read_text(encoding="utf-8")
names=re.findall(r'function\s+([A-Za-z_$][\w$]*)\s*\(',s)
report={k:[n for n in names if k in n.lower()][:80] for k in ["dispon","variable","movim","ingres","fijo","provision","hucha","banco","saldo"]}
for pat in ["movimientos.filter","movimientos.reduce","importe","cuentaComoFijo","vinculoFijoId","tipoInterno","bancoRef","renderAll","Almacen.flush"]: report[pat]=s.count(pat)
Path("AUDITORIA_FUNCIONES_v96.75.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
out=s.replace("v96.74-LAB","v96.75-LAB").replace("v96.74","v96.75")
Path("index_fluxia_v96.75_LAB.html").write_text(out,encoding="utf-8")
Path("CHECKLIST_v96.75.txt").write_text("v96.75: inventario estructural real del motor financiero activo; sin alterar cálculos; UI v96.45 y fluidez preservadas.\n")
Path("PROMPT_MAESTRO_v96.75.txt").write_text("v96.45 referencia visual absoluta. Regla: auditar símbolos reales antes de modificar contabilidad; prohibido inventar nombres o hardcodear saldos.\n")
Path("README_v96.75.md").write_text("# Fluxia v96.75 LAB\nInventario del motor financiero activo.\n")
Path("manifest_v96.75_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.75","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.75_LAB.html?v=v96.75-LAB","display":"standalone"})+"\n")
Path("fluxia-sw-v96.75.js").write_text("const VERSION='v96.75-LAB';\n")
sha=hashlib.sha256(out.encode()).hexdigest(); Path("SHA256SUMS_v96.75.txt").write_text(sha+"  index_fluxia_v96.75_LAB.html\n")
with zipfile.ZipFile("Fluxia_v96.75_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
 for f in ["index_fluxia_v96.75_LAB.html","CHECKLIST_v96.75.txt","PROMPT_MAESTRO_v96.75.txt","README_v96.75.md","manifest_v96.75_LAB.webmanifest","fluxia-sw-v96.75.js","SHA256SUMS_v96.75.txt","AUDITORIA_FUNCIONES_v96.75.json"]: z.write(f)
print(json.dumps(report,ensure_ascii=False)[:10000])
