from pathlib import Path
import re, json, hashlib
SRC=Path("index_fluxia_v96.58_LAB.html")
DST=Path("index_fluxia_v96.59_LAB.html")
s=SRC.read_text(encoding="utf-8").replace("v96.58-LAB","v96.59-LAB").replace("v96.58","v96.59")

# Safety bridge: disable destructive legacy cleanup if present. Zero timers/listeners added.
patterns=[
 r'function\s+purgarAntiguos\s*\([^)]*\)\s*\{.*?\n\}',
 r'window\.FluxiaBancoLimpiar\s*=\s*function\s*\([^)]*\)\s*\{.*?\n\};'
]
# Only replace when exact legacy symbols exist; otherwise leave fast baseline untouched.
m=re.search(patterns[0],s,re.S)
if m:
    s=s[:m.start()]+"function purgarAntiguos(){ /* v96.59 NO-PURGE */ return 0; }"+s[m.end():]
m=re.search(patterns[1],s,re.S)
if m:
    s=s[:m.start()]+"window.FluxiaBancoLimpiar=function(){ /* v96.59 NO-PURGE */ return 0; };"+s[m.end():]

# Version badge
s=s.replace("v96.58 · RECOVERY","v96.59 · FAST-SAFE")
DST.write_text(s,encoding="utf-8")
Path("manifest_v96.59_LAB.webmanifest").write_text(json.dumps({"name":"Fluxia BETA v96.59","short_name":"Fluxia BETA","start_url":"./index_fluxia_v96.59_LAB.html?v=v96.59-LAB","display":"standalone","theme_color":"#0E7C90"},indent=2)+"\n")
Path("fluxia-sw-v96.59.js").write_text("const VERSION='v96.59-LAB'; self.addEventListener('install',()=>self.skipWaiting()); self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n")
Path("CHECKLIST_v96.59.txt").write_text("""FLUXIA v96.59-LAB — FAST-SAFE BASE

AÑADIDO
- Primera base de trabajo derivada de la v96.58 validada como ultrarrápida.
- Blindaje NO-PURGE aplicado únicamente si los símbolos legacy existen, sin añadir listeners/timers/observers.

MODIFICADO
- Identidad v96.59-LAB / FAST-SAFE.

ELIMINADO / CONSOLIDADO
- Ninguna capa moderna de v96.57 se reintroduce en bloque.

BLINDADO / NO TOCADO
- Arquitectura de navegación v94.80/v96.58.
- index.html ESTABLE.
- Cero nuevos listeners, observers, polling o render wrappers.

PRUEBAS DE BUILD
- Fuente v96.58 -> v96.59 generada sin reconstruir navegación.
- Build determinista y publicación automática.
- La validación funcional real de datos/cloud/bancos sigue siendo obligatoria antes de promover.

SIGUIENTE PORTABILIDAD
- Persistencia cloud e integridad financiera moderna, por bloques pequeños y medibles.
""")
print("built",len(s),hashlib.sha256(s.encode()).hexdigest())
