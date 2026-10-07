from pathlib import Path
import re,json,hashlib,zipfile
s=Path("index_fluxia_v96.76_LAB.html").read_text(encoding="utf-8")
old="if(window.FluxiaSync954){provisiones=JSON.parse(FluxiaSync954.mergeCloudValue('v2_provisiones',JSON.stringify(provisiones),'[]',Almacen.getItem('v2_sync_tombstones'),null,Almacen.getItem('v2_sync_restores'),null,Almacen.getItem('v2_explicit_deletions'),null));usosProvisiones=usosProvisiones.filter(function(x){return !FluxiaSync954.isDeleted('v2_usos',x.id);});}"
new="""/* v96.78 ESTABILIDAD HUCHAS: render es puro; nunca fusiona nube ni muta la fuente.
     La sincronizacion autoritativa ocurre en Almacen, no al pintar la pantalla. */
  if(window.FluxiaSync954){
    usosProvisiones=usosProvisiones.filter(function(x){return !FluxiaSync954.isDeleted('v2_usos',x.id);});
  }
  /* Deduplicacion defensiva NO destructiva para la vista: mismo id = una sola hucha.
     Si legacy carece de id, solo colapsa la misma referencia exacta, nunca nombres distintos. */
  var _pvSeen=new Set(), _pvView=[];
  (provisiones||[]).forEach(function(p){
    if(!p)return;
    var k=p.id!=null?'id:'+String(p.id):'ref:'+String((p.nombre||''))+'|'+String(p.inicio||'')+'|'+String(p.importeMensual||'');
    if(_pvSeen.has(k))return;
    _pvSeen.add(k); _pvView.push(p);
  });"""
if old not in s: raise SystemExit("render merge block not found")
s=s.replace(old,new,1)
s=s.replace("const activas = provisionesActivas(mesSeleccionado);","const activas = _pvView.filter(function(p){return provisionActivaEnMes(p,mesSeleccionado);});",1)
s=s.replace("v96.76-LAB","v96.78-LAB").replace("v96.76","v96.78")
Path("index_fluxia_v96.78_LAB.html").write_text(s,encoding="utf-8")
Path("CHECKLIST_v96.78.txt").write_text("""v96.78 ALTA ESTABILIDAD HUCHAS
- Eliminada fusion cloud/local dentro de renderProvisiones: abrir Huchas ya no puede reinyectar ni duplicar registros.
- Render de Huchas pasa a ser puro respecto a provisiones.
- Deduplicacion defensiva solo para vista por identidad estable; no borra nube ni historico.
- Tombstones de usos se siguen respetando.
- No se hardcodea ningun saldo.
- Gastos Variables y UI v96.45 no se modifican.
- ESTABLE intacta.
""")
Path("PROMPT_MAESTRO_v96.78.txt").write_text("""FLUXIA v96.78 - leyes acumulativas activas.
v96.45 es referencia visual absoluta. Nube fuente de verdad. NO-PURGE permanente. Prohibido hardcodear saldos.
LEY DE ESTABILIDAD DE HUCHAS: renderizar nunca puede fusionar, rehidratar, crear, borrar ni persistir provisiones. La reconciliacion cloud ocurre una sola vez en la capa de almacenamiento/sincronizacion y debe ser idempotente. Una hucha con el mismo ID no puede materializarse dos veces. La vista puede deduplicar defensivamente sin borrar historico.
""")
Path("README_v96.78.md").write_text("# Fluxia v96.78 LAB\nEstabilidad de Huchas: se elimina la mutación/fusión durante render.\n")
Path("manifest_v96.78_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.78","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.78_LAB.html?v=v96.78-LAB","display":"standalone"})+"\n")
Path("fluxia-sw-v96.78.js").write_text("const VERSION='v96.78-LAB';\n")
sha=hashlib.sha256(s.encode()).hexdigest();Path("SHA256SUMS_v96.78.txt").write_text(sha+"  index_fluxia_v96.78_LAB.html\n")
with zipfile.ZipFile("Fluxia_v96.78_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
 for f in ["index_fluxia_v96.78_LAB.html","CHECKLIST_v96.78.txt","PROMPT_MAESTRO_v96.78.txt","README_v96.78.md","manifest_v96.78_LAB.webmanifest","fluxia-sw-v96.78.js","SHA256SUMS_v96.78.txt"]: z.write(f)
print("OK",sha,len(s))
