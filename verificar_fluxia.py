#!/usr/bin/env python3
"""Verificador FINAL para Fluxia v93.5+"""
import sys, re, json
from pathlib import Path

def extract_version_from_file(path):
    m = re.search(r'v(\d+(?:\.\d+)?)', path)
    return f'v{m.group(1)}' if m else None

def main():
    if len(sys.argv) < 2:
        print("Uso: verificar_fluxia.py <html> [manifest.webmanifest] [fluxia-canal.json] [index.html]")
        sys.exit(1)
    
    html_file = sys.argv[1]
    manifest_file = sys.argv[2] if len(sys.argv) > 2 else 'manifest.webmanifest'
    canal_file = sys.argv[3] if len(sys.argv) > 3 else 'fluxia-canal.json'
    index_file = sys.argv[4] if len(sys.argv) > 4 else 'index.html'
    
    if not Path(html_file).exists():
        print(f"❌ No existe {html_file}")
        sys.exit(1)
    
    file_ver = extract_version_from_file(html_file)
    if not file_ver:
        print(f"❌ No se puede extraer versión de {html_file}")
        sys.exit(1)
    
    html_name = Path(html_file).name
    version_num = file_ver.replace('v', '')
    
    issues = []
    
    with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
        html_text = f.read()
    
    print(f"\n🔍 VERIFICANDO {html_file} ({file_ver})\n")
    
    # 1. Title
    title_match = re.search(r'<title>([^<]*)</title>', html_text)
    if title_match and file_ver in title_match.group(1):
        print(f"   ✅ Title OK")
    else:
        title_content = title_match.group(1) if title_match else "NO ENCONTRADO"
        issue = f"❌ Title no contiene {file_ver}: '{title_content[:50]}'"
        print(f"   {issue}")
        issues.append(issue)
    
    # 2. Meta fluxia-version (buscar solo en HEAD)
    head_match = re.search(r'<head[^>]*>(.*?)</head>', html_text, re.DOTALL)
    if head_match:
        head = head_match.group(1)
        if 'fluxia-version' in head and file_ver in head:
            print(f"   ✅ Meta fluxia-version OK")
        else:
            issue = f"❌ Meta fluxia-version no tiene {file_ver}"
            print(f"   {issue}")
            issues.append(issue)
    
    # 3. window.FLUXIA_VERSION
    if re.search(rf'window\.FLUXIA_VERSION\s*=\s*["\']({re.escape(file_ver)})["\']', html_text):
        print(f"   ✅ window.FLUXIA_VERSION OK")
    else:
        issue = f"❌ window.FLUXIA_VERSION no es {file_ver}"
        print(f"   {issue}")
        issues.append(issue)
    
    # 4. Manifest
    try:
        with open(manifest_file, 'r') as f:
            manifest = json.load(f)
        if html_name in manifest.get('start_url', ''):
            print(f"   ✅ Manifest start_url OK")
        else:
            issue = f"❌ Manifest start_url no contiene {html_name}"
            print(f"   {issue}")
            issues.append(issue)
    except Exception as e:
        issue = f"❌ Error en Manifest: {e}"
        print(f"   {issue}")
        issues.append(issue)
    
    # 5. Canal
    try:
        with open(canal_file, 'r') as f:
            canal = json.load(f)
        errors = []
        if canal.get('version') != version_num:
            errors.append(f"version='{canal.get('version')}' ≠ {version_num}")
        if canal.get('lab') != html_name:
            errors.append(f"lab='{canal.get('lab')}' ≠ {html_name}")
        if canal.get('lab_version') != file_ver:
            errors.append(f"lab_version='{canal.get('lab_version')}' ≠ {file_ver}")
        
        if errors:
            for err in errors:
                issue = f"❌ Canal: {err}"
                print(f"   {issue}")
                issues.append(issue)
        else:
            print(f"   ✅ Canal OK")
    except Exception as e:
        issue = f"❌ Error en Canal: {e}"
        print(f"   {issue}")
        issues.append(issue)
    
    # 6. Index.html
    if Path(index_file).exists():
        with open(index_file, 'r') as f:
            index_text = f.read()
        if f"var FALLBACK = '{html_name}'" in index_text and '/v92' in index_text:
            print(f"   ✅ Index.html OK")
        else:
            print(f"   ⚠️ Index.html: revisar FALLBACK y bloqueos v92")
    else:
        issue = f"❌ Falta {index_file}"
        print(f"   {issue}")
        issues.append(issue)
    
    # RESULTADO
    print("\n" + "="*70)
    critical = [i for i in issues if i.startswith('❌')]
    
    if critical:
        print(f"🚫 NO SE ENTREGA ({len(critical)} errores críticos)\n")
        for c in critical:
            print(f"   {c}")
        sys.exit(1)
    else:
        print(f"✅ VERIFICACIÓN OK — Se puede entregar")
        sys.exit(0)

if __name__ == '__main__':
    main()
