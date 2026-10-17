#!/usr/bin/env python3
"""Verifies bytes served by Pages, not just existence of a repository file."""
import argparse,hashlib,json,urllib.request,urllib.parse,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--base',default='https://nacram1987-cmd.github.io/Fluxia-v20/');p.add_argument('--attempts',type=int,default=1);args=p.parse_args()
files=['index.html','fluxia-sw.js','sw.js','manifest.webmanifest','lab/v97.68.html','lab/v97.69.html','lab/fluxia-sw.js','lab/manifest.webmanifest','lab/v97.70.html','lab/v97.70/index.html','lab/v97.70/fluxia-sw.js','lab/v97.70/manifest.webmanifest','lab/v97.71.html','lab/v97.71/index.html','lab/v97.71/fluxia-sw.js','lab/v97.71/manifest.webmanifest','lab/v97.72.html','lab/v97.72/index.html','lab/v97.72/fluxia-sw.js','lab/v97.72/manifest.webmanifest','lab/v97.73.html','lab/v97.73/index.html','lab/v97.73/fluxia-sw.js','lab/v97.73/manifest.webmanifest',
 # Élite LAB: página, todos sus scripts, manifiesto e iconos; y la LAB HTML v97.77 (publicación verificada por bytes, no solo por commit).
 'lab/fluxia-elite-safari-datos-reales.html','lab/js/fluxia-elite-backup-v1.js','lab/js/fluxia-elite-bank-adapter-v1.js','lab/js/fluxia-elite-bank-connector-v1.js','lab/js/fluxia-elite-financial-engine-v1.js','lab/js/fluxia-elite-passkey-v1.js','lab/js/fluxia-elite-reconciliation-v1.js','lab/js/fluxia-elite-wallet-v1.js','lab/js/fluxia-espejo-csv-v1.js','lab/fluxia-elite.webmanifest','lab/fluxia-icon-192.png','lab/fluxia-icon-512.png','lab/versions/fluxia-elite-safari-v2.0.59.html','lab/v97.77.html']
for attempt in range(args.attempts):
 try:
  result=[]
  for name in files:
   with urllib.request.urlopen(urllib.request.Request(args.base+name,headers={'Cache-Control':'no-cache'}),timeout=20) as r:
    body=r.read();expected=Path(name).read_bytes()
    if r.status!=200 or body!=expected:raise RuntimeError('Deployed bytes mismatch: '+name)
    result.append({'path':name,'status':r.status,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'etag':r.headers.get('ETag')})
  # Installed manifest's icon paths must resolve to real image bytes.
  for name in ['manifest.webmanifest','lab/manifest.webmanifest','lab/v97.70/manifest.webmanifest','lab/v97.71/manifest.webmanifest','lab/v97.72/manifest.webmanifest','lab/v97.73/manifest.webmanifest','lab/fluxia-elite.webmanifest']:
   m=json.loads(Path(name).read_text())
   for icon in m.get('icons',[]):
    url=urllib.parse.urljoin(args.base+name,icon['src'])
    with urllib.request.urlopen(url,timeout=20) as r:
     b=r.read()
     if r.status!=200 or not b.startswith(b'\x89PNG'):raise RuntimeError('Invalid icon '+url)
     result.append({'asset':url,'status':r.status,'bytes':len(b)})
  print(json.dumps({'pass':True,'files':result},indent=2));break
 except Exception:
  if attempt+1==args.attempts:raise
  time.sleep(5)
