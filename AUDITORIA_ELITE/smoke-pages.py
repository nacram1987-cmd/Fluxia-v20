#!/usr/bin/env python3
"""Verifies bytes served by Pages, not just existence of a repository file."""
import argparse,hashlib,json,urllib.request,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--base',default='https://nacram1987-cmd.github.io/Fluxia-v20/');p.add_argument('--attempts',type=int,default=1);args=p.parse_args()
files=['index.html','fluxia-sw.js','sw.js','manifest.webmanifest','lab/v97.68.html','lab/v97.69.html','lab/fluxia-sw.js','lab/manifest.webmanifest']
for attempt in range(args.attempts):
 try:
  result=[]
  for name in files:
   with urllib.request.urlopen(urllib.request.Request(args.base+name,headers={'Cache-Control':'no-cache'}),timeout=20) as r:
    body=r.read();expected=Path(name).read_bytes()
    if r.status!=200 or body!=expected:raise RuntimeError('Deployed bytes mismatch: '+name)
    result.append({'path':name,'status':r.status,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest(),'etag':r.headers.get('ETag')})
  # Installed manifest's icon paths must resolve to real image bytes.
  for name in ['manifest.webmanifest','lab/manifest.webmanifest']:
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
