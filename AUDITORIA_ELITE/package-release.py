#!/usr/bin/env python3
"""Complete deployable app/resources, protected references, audit and QA sources.
Obsolete release ZIPs/HTML experiments remain in Git; they are not required
dependencies of this installation and are not duplicated in a phone download.
"""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import hashlib,json,re,subprocess,os
release=os.environ.get('FLUXIA_RELEASE_VERSION','v97.70')
tag=release.replace('.','')
files=subprocess.check_output(['git','ls-files','-z']).decode().split('\0')
required={'index.html','lab/index.html','v97.65.html','v97.66.html',
 'lab/v97.66.html','lab/v97.67.html','lab/v97.68.html','lab/v97.69.html','lab/v97.70.html','lab/v97.70/index.html',
 'lab/v97.71.html','lab/v97.71/index.html','lab/v97.72.html','lab/v97.72/index.html',
 f'lab/{release}.html',f'lab/{release}/index.html',f'lab/{release}/fluxia-sw.js',f'lab/{release}/manifest.webmanifest',
 'index-v97.46.html','v97.46.html'}
selected=[]
for name in files:
 p=Path(name)
 if not p.is_file() or p.suffix.lower()=='.zip':continue
 if p.suffix.lower()=='.html' and name not in required and not name.startswith('auditorias/base-v97.66/'):continue
 selected.append(name)
for name in ['index.html','lab/v97.68.html','lab/v97.69.html','PROMPT_MAESTRO.md','AGENTS.md','fluxia-sw.js','manifest.webmanifest','AUDITORIA_ELITE/build-candidate.cjs']:
 if name not in selected:raise RuntimeError('Missing required deliverable '+name)
dst=Path(f'dist/Fluxia_{release}_LAB_COMPLETO.zip');dst.parent.mkdir(exist_ok=True)
hashes={name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in selected}
with ZipFile(dst,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for name in selected:z.write(name,name)
 z.writestr('SHA256_ARCHIVOS.json',json.dumps(hashes,indent=2))
 z.writestr('LEEME_PRIMERO.txt',f'LAB {release} VALIDADA EN ENTORNOS SINTETICOS, SIN PROMOCION ESTABLE.\n'
  f'LAB publicada: lab/{release}.html; PWA LAB aislada: lab/{release}/index.html\nReferencia de velocidad: lab/v97.68.html\n'
  'index.html y PWA conservan su version original. No sustituir la PWA por el candidato.\n'
  'Las reglas de Papelera exigen accion explicita; los archivos antiguos permanecen para revision manual.\n'
  'Correccion reproducible: AUDITORIA_ELITE/build-candidate-v9772.cjs, fijo-reconciliation-regression-v9772.cjs y v97.71 conservada.\n'
  'RLS/RPC de contactos aplicada con autorizacion y nueve comprobaciones sinteticas.\n'
  'Consultar AUDITORIA_ELITE/README.md para informes, pruebas y riesgos.\n'
  'Incluye app, recursos, referencias protegidas y QA. El resto del historial sigue en Git.\n')
with ZipFile(dst) as z:
 if z.testzip() is not None:raise RuntimeError('Corrupt ZIP')
Path('dist/SHA256SUMS.txt').write_text(hashlib.sha256(dst.read_bytes()).hexdigest()+'  '+dst.name+'\n')
print(json.dumps({'zip':str(dst),'bytes':dst.stat().st_size,'files':len(selected),'verified':True}))
