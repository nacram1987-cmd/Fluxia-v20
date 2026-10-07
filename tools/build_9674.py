from pathlib import Path
import re,json,hashlib,zipfile
SRC=Path("index_fluxia_v96.73_LAB.html"); OUT=Path("index_fluxia_v96.74_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.73-LAB","v96.74-LAB").replace("v96.73","v96.74")
changes=[]
# 1 NO-PURGE: exact function body replacement, only if present.
m=re.search(r'function\s+purgarAntiguos\s*\([^)]*\)\s*\{',s)
if m:
    st=m.start(); i=m.end(); depth=1
    while i<len(s) and depth:
        if s[i]=='{': depth+=1
        elif s[i]=='}': depth-=1
        i+=1
    s=s[:st]+"function purgarAntiguos(){ return 0; /* v96.74 NO-PURGE */ }"+s[i:]
    changes.append("purgarAntiguos NO-PURGE")
# 2 Disable legacy bank cleaner if assignment exists, targeted statement.
s,n=re.subn(r'window\.FluxiaBancoLimpiar\s*=\s*function\s*\([^)]*\)\s*\{.*?\n\};',
             "window.FluxiaBancoLimpiar=function(){ return 0; }; /* v96.74 NO-PURGE */",s,count=1,flags=re.S)
if n: changes.append("FluxiaBancoLimpiar NO-PURGE")
# 3 Replace variablesTotal with validated accounting invariant if function exists.
m=re.search(r'function\s+variablesTotal\s*\(mes\)\s*\{',s)
if m:
    st=m.start(); i=m.end(); depth=1
    while i<len(s) and depth:
        if s[i]=='{': depth+=1
        elif s[i]=='}': depth-=1
        i+=1
    fn="""function variablesTotal(mes){
  return movimientosDe(mes).reduce(function(sum,mv){
    if(!mv) return sum;
    if(mv.cuentaComoFijo && mv.vinculoFijoId) return sum;
    if(mv.excluido || mv.excluidoDisponible || mv.tipoInterno==='reponer_hucha' || mv.tipoInterno==='traspaso' || mv.tipoInterno==='puente' || mv.esTraspasoPropio===true) return sum;
    var imp=Number(mv.importe)||0;
    if(mv.origen==='banco' && mv.bancoRef) imp=Math.abs(imp);
    return sum+imp;
  },0);
}"""
    s=s[:st]+fn+s[i:]; changes.append("variablesTotal normalización bancaria + exclusiones")
# 4 Inject a one-shot audit API only, no listener/timer.
audit="""<script id="fluxia-v9674-auditoria-contable">
window.FluxiaAuditar9674=function(mes){
 try{
  var m=mes||(typeof mesActual==='function'?mesActual():null);
  return {mes:m,variables:typeof variablesTotal==='function'?variablesTotal(m):null,disponible:typeof disponibleEfectivo==='function'?disponibleEfectivo(m):null,noPurge:typeof purgarAntiguos==='function'};
 }catch(e){return {error:String(e&&e.message||e)}}
};
</script>"""
s=s.replace("</body>",audit+"</body>",1)
OUT.write_text(s,encoding="utf-8")
Path("manifest_v96.74_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.74","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.74_LAB.html?v=v96.74-LAB","display":"standalone","theme_color":"#9fd9e2"},indent=2)+"\n")
Path("fluxia-sw-v96.74.js").write_text("const VERSION='v96.74-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.74.txt").write_text("""FLUXIA v96.74-LAB — PRIMER BLOQUE DE RECUPERACION DE DATOS
BASE
- v96.73 validada por usuario: estética v96.45 correcta y bastante fluida.

CAMBIOS
- NO-PURGE: purgarAntiguos queda no-op si existe.
- Limpieza bancaria destructiva queda no-op si existe.
- Variables: gasto bancario real se contabiliza por magnitud positiva; un cargo negativo del banco no puede aumentar Disponible.
- Exclusiones: fijo vinculado, reponer_hucha, traspaso, puente, esTraspasoPropio y excluidoDisponible no duplican impacto.
- Auditoría manual FluxiaAuditar9674(), sin timers/listeners.

NO TOCADO
- Dashboard, estética, navegación y estructura v96.45.
- Sin hardcodear saldos.
- Sin migraciones destructivas.
- ESTABLE intacta.

ACEPTACION
- Mantener fluidez v96.73.
- Recuperar cálculo desde datos reales; siguientes bloques: nube/idempotencia banco→fijo/huchas/ingresos.
""")
Path("PROMPT_MAESTRO_v96.74.txt").write_text(Path("PROMPT_MAESTRO_v96.73.txt").read_text(encoding="utf-8")+"\nLEY v96.74 — RECUPERACION CONTABLE POR INVARIANTES, NUNCA POR SALDOS HARDCODEADOS. Todo cargo bancario real reduce Disponible exactamente una vez; traspasos propios impacto cero; NO-PURGE permanente.\n",encoding="utf-8")
Path("README_v96.74.md").write_text("# Fluxia v96.74 LAB\nPrimer bloque contable sobre v96.73 validada.\n")
sha=hashlib.sha256(s.encode()).hexdigest(); Path("SHA256SUMS_v96.74.txt").write_text(sha+"  index_fluxia_v96.74_LAB.html\n")
with zipfile.ZipFile("Fluxia_v96.74_LAB.zip","w",zipfile.ZIP_DEFLATED) as z:
 for f in ["index_fluxia_v96.74_LAB.html","manifest_v96.74_LAB.webmanifest","fluxia-sw-v96.74.js","CHECKLIST_v96.74.txt","PROMPT_MAESTRO_v96.74.txt","README_v96.74.md","SHA256SUMS_v96.74.txt"]: z.write(f)
print("changes",changes,"sha",sha,"bytes",len(s))
