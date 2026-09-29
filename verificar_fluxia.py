#!/usr/bin/env python3
"""Verificación obligatoria ANTES de entregar cualquier versión de Fluxia.
Uso:  python3 verificar_fluxia.py index_fluxia_v93.1.html [fluxia-canal.json]
Comprueba: sintaxis de TODOS los scripts inline, coherencia de versión, IDs duplicados,
módulo bancario sin cambios (hash) y coherencia del canal.  Sale con código 1 si algo falla.
Requiere: python3 y node en el PATH."""
import re, sys, os, json, hashlib, subprocess, tempfile
ruta = sys.argv[1]; canal = sys.argv[2] if len(sys.argv) > 2 else None
s = open(ruta, encoding='utf-8', errors='replace').read()
fallos, avisos = [], []

# 1) Sintaxis de todos los scripts inline
n = 0
for m in re.finditer(r'<script([^>]*)>(.*?)</script>', s, re.S):
    at, body = m.group(1), m.group(2)
    if 'src=' in at or not body.strip(): continue
    n += 1
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(body); p = f.name
    r = subprocess.run(['node', '--check', p], capture_output=True, text=True); os.unlink(p)
    if r.returncode: fallos.append('Script con error de sintaxis (línea %d): %s' % (s[:m.start()].count('\n') + 1, r.stderr.strip().split('\n')[-1][:120]))
print('scripts inline comprobados:', n)

# 2) Texto suelto tras </html> o «</html>» dentro de JS (síntoma del fallo v93)
fuera = re.sub(r'<script.*?</script>', '', s, flags=re.S)   # </html> dentro de un string JS es legítimo
if fuera.count('</html>') != 1: fallos.append('Hay %d etiquetas </html> fuera de scripts (debe ser 1)' % fuera.count('</html>'))
if fuera.rstrip().split('</html>')[-1].strip(): fallos.append('Hay contenido después de </html>')

# 3) Versión coherente
base = os.path.basename(ruta); mv = re.match(r'index_fluxia_(v[\d.]+)\.html$', base)
ver = mv.group(1) if mv else None
t = re.search(r'<title>Fluxia BETA (v[\d.]+)</title>', s); me = re.search(r'name="fluxia-version"|<meta content="(v[\d.]+)" name="fluxia-version"', s)
me = re.search(r'<meta content="(v[\d.]+)" name="fluxia-version"', s)
js = re.search(r'window\.FLUXIA_VERSION = "(v[\d.]+)"', s); ck = re.search(r"window\.FLUXIA_CHECKLIST = \{\s*version: '(v[\d.]+)'", s)
vals = {'archivo': ver, 'title': t and t.group(1), 'meta': me and me.group(1), 'FLUXIA_VERSION': js and js.group(1), 'checklist': ck and ck.group(1)}
print('versiones:', vals)
if len(set(vals.values())) != 1 or None in vals.values(): fallos.append('Versión incoherente: %s' % vals)

# 4) IDs duplicados (aviso)
ids = re.findall(r'\sid="([^"]+)"', re.sub(r'<script.*?</script>', '', s, flags=re.S))
dup = sorted({i for i in ids if ids.count(i) > 1})
if dup: avisos.append('IDs duplicados en el HTML: %s' % ', '.join(dup[:15]))

# 5) Módulo bancario intocable (hash del cliente bancario)
try:
    a = s.index("const CX_KEY='fluxia_banco_conexiones_v1'"); b = s.index('</script>', s.index('window.abrirConexionBancaria=async function(){'))
    h = hashlib.sha256(s[a:b].encode('utf-8')).hexdigest()
    hp = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'BANCO_SHA256.txt')
    if '--guardar-hash-banco' in sys.argv: open(hp, 'w').write(h + '\n'); print('hash banco guardado')
    elif os.path.exists(hp):
        if open(hp).read().strip() != h: fallos.append('El módulo BANCARIO ha cambiado (hash distinto). Prohibido salvo permiso explícito del propietario.')
        else: print('módulo bancario: idéntico ✔')
    else: avisos.append('No hay BANCO_SHA256.txt (ejecuta con --guardar-hash-banco una vez)')
except ValueError: fallos.append('No se encuentra el módulo bancario en el HTML')

# 5b) Rutas absolutas «/…» (en GitHub Pages con subcarpeta /Fluxia-v20/ dan 404) — aviso
abs_ = sorted(set(re.findall(r'(?:src|href)="(/[^/"][^"]*)"', fuera)) | set(re.findall(r"serviceWorker\.register\('(/[^']+)'", s)))
if abs_: avisos.append('Rutas absolutas que darán 404 bajo subcarpeta: %s' % ', '.join(abs_[:6]))

# 5c) Archivos que deben ir JUNTO al HTML (offline/PWA)
d = os.path.dirname(os.path.abspath(ruta))
if "register('./fluxia-sw.js'" in s:
    for f_ in ('fluxia-sw.js', 'manifest.webmanifest', 'fluxia-icon.svg', 'fluxia-icon-192.png', 'fluxia-icon-512.png'):
        if not os.path.exists(os.path.join(d, f_)): fallos.append('Falta %s junto al HTML (sin él no hay modo sin conexión)' % f_)
    if os.path.exists(os.path.join(d, 'fluxia-sw.js')):
        m_ = re.search(r"const VERSION = '(v[\d.]+)'", open(os.path.join(d, 'fluxia-sw.js'), encoding='utf-8').read())
        if not m_ or m_.group(1) != ver: fallos.append('fluxia-sw.js VERSION (%s) ≠ versión del HTML (%s)' % (m_ and m_.group(1), ver))

# 6) Canal
if canal:
    c = json.load(open(canal, encoding='utf-8'))
    for k in ('estable', 'lab', 'estable_version', 'lab_version'):
        if k not in c: fallos.append('fluxia-canal.json sin campo «%s»' % k)
    if c.get('lab') != base: fallos.append('canal.lab (%s) ≠ archivo (%s)' % (c.get('lab'), base))

for a_ in avisos: print('AVISO:', a_)
for f_ in fallos: print('FALLO:', f_)
print('RESULTADO:', 'OK ✔' if not fallos else 'FALLA ✘'); sys.exit(1 if fallos else 0)
