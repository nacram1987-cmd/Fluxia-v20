#!/usr/bin/env python3
"""Complete deployable app/resources, protected references, audit and QA sources.
Obsolete release ZIPs/HTML experiments remain in Git; they are not required
dependencies of this installation and are not duplicated in a phone download.
"""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json,re,subprocess
files=subprocess.check_output(['git','ls-files','-z']).decode().split('\0')
required={'index.html','lab/index.html','v97.65.html','v97.66.html',
 'lab/v97.66.html','lab/v97.67.html','lab/v97.68.html','lab/v97.69.html',
 'index-v97.46.html','v97.46.html'}
selected=[]
for name in files:
 p=Path(name)
 if not p.is_file() or p.suffix.lower()=='.zip':continue
 if p.suffix.lower()=='.html' and name not in required and not name.startswith('auditorias/base-v97.66/'):continue
 selected.append(name)
for name in ['index.html','lab/v97.68.html','lab/v97.69.html','PROMPT_MAESTRO.md','AGENTS.md','fluxia-sw.js','manifest.webmanifest','AUDITORIA_ELITE/build-candidate.cjs']:
 if name not in selected:raise RuntimeError('Missing required deliverable '+name)
dst=Path('dist/Fluxia_ELITE_AUDITORIA_2026-10-13_COMPLETO.zip');dst.parent.mkdir(exist_ok=True)
hashes={name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in selected}
with ZipFile(dst,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for name in selected:z.write(name,name)
 z.writestr('SHA256_ARCHIVOS.json',json.dumps(hashes,indent=2))
 z.writestr('LEEME_PRIMERO.txt','AUDITORIA EJECUTADA, SIN PROMOCION.\n'
  'LAB publicada verificada: lab/v97.69.html\nReferencia de velocidad: lab/v97.68.html\n'
  'index.html y PWA conservan su version original. No sustituir la PWA por el candidato.\n'
  'v97.70 queda bloqueada: fallo de identidad bancaria entre bancos/cuentas.\n'
  'La correccion parcial se reproduce con AUDITORIA_ELITE/build-candidate.cjs; no esta aprobada.\n'
  'SQL seguridad NO aplicado; necesita autorizacion y ensayo en copia.\n'
  'Consultar AUDITORIA_ELITE/README.md para informes, pruebas y riesgos.\n'
  'Incluye app, recursos, referencias protegidas y QA. El resto del historial sigue en Git.\n')
with ZipFile(dst) as z:
 if z.testzip() is not None:raise RuntimeError('Corrupt ZIP')
Path('dist/SHA256SUMS.txt').write_text(hashlib.sha256(dst.read_bytes()).hexdigest()+'  '+dst.name+'\n')
print(json.dumps({'zip':str(dst),'bytes':dst.stat().st_size,'files':len(selected),'verified':True}))
