# 🚀 GUÍA DE DESPLIEGUE v94.80

**CRÍTICO**: Los archivos generados ESTÁN en `/outputs/` pero NO se suben a GitHub automáticamente.

El navegador carga desde: `https://nacram1987-cmd.github.io/Fluxia-v20/`  
Los archivos se generan en: Claude outputs (aquí)

**DEBES hacer manual `git push` para que se actualice.**

---

## ¿POR QUÉ NO SE ACTUALIZA AUTOMÁTICAMENTE?

```
Claude genera:           GitHub Pages carga desde:
  ✓ v94.80_LAB.zip  →  ? NO EN GITHUB
  ✓ index.html       →  ? NO EN GITHUB  
  ✓ manifest.json    →  ? NO EN GITHUB
  ✓ fluxia-canal.json→  ? NO EN GITHUB
  ✓ fluxia-sw.js     →  ? NO EN GITHUB

Usuario abre app:
  → Navegador busca en GitHub
  → Encuentra v94.78 antigua o v94.79
  → "No actualiza" ❌
```

---

## SOLUCIÓN: PASOS DE DESPLIEGUE MANUAL

### **PASO 1: Localizar tu repo de GitHub Fluxia**

```bash
# Tu repo es:
https://github.com/nacram1987/Fluxia-v20
# Rama principal: main o master

# Carpeta local en tu PC:
~/ruta/a/Fluxia-v20/
```

### **PASO 2: Copiar archivos de v94.80 a tu repo**

**Opción A: Copiar manualmente (visual)**
1. Abre `/mnt/user-data/outputs/` (aquí, en Claude outputs)
2. Descarga estos archivos:
   - `index_fluxia_v94.80_LAB.html`
   - `manifest.webmanifest`
   - `fluxia-canal.json`
   - `fluxia-sw.js`
3. En tu PC, abre `~/Fluxia-v20/`
4. Renombra `index_fluxia_v94.80_LAB.html` → `index.html`
5. Pega los 4 archivos en la raíz de Fluxia-v20

**Opción B: Copiar por terminal (más rápido)**
```bash
# En tu PC, dentro de ~/Fluxia-v20/

# Copiar index (renombrando)
cp ~/Downloads/index_fluxia_v94.80_LAB.html ./index.html

# Copiar los JSON y SW
cp ~/Downloads/manifest.webmanifest ./manifest.webmanifest
cp ~/Downloads/fluxia-canal.json ./fluxia-canal.json
cp ~/Downloads/fluxia-sw.js ./fluxia-sw.js

# Verificar que están
ls -la index.html manifest.webmanifest fluxia-canal.json fluxia-sw.js
# Resultado: 4 archivos listados ✓
```

### **PASO 3: Verificar cambios en Git**

```bash
# En ~/Fluxia-v20/
git status

# Resultado esperado:
# modified:   index.html
# modified:   manifest.webmanifest
# modified:   fluxia-canal.json
# modified:   fluxia-sw.js
```

### **PASO 4: Commit y Push a GitHub**

```bash
# Agregar cambios
git add index.html manifest.webmanifest fluxia-canal.json fluxia-sw.js

# Commit con descripción clara
git commit -m "v94.80-UNIFICACIÓN: Selector de meses en todas las pestañas + color oro"

# Push a GitHub
git push origin main
# (o "git push origin master" si tu rama se llama master)

# Resultado esperado:
# Counting objects: 4, done.
# Writing objects: 100% (4/4), ...
# remote: Resolving deltas: 100% (2/2), done.
# To github.com:nacram1987/Fluxia-v20.git
#    abc1234..def5678  main -> main ✓
```

### **PASO 5: Esperar deployment (30 segundos - 2 minutos)**

GitHub Pages automáticamente redeploya cuando hace push:
- GitHub detecta cambios
- Reconstruye el sitio
- Actualiza `https://nacram1987-cmd.github.io/Fluxia-v20/`

### **PASO 6: Verificar que se actualizó**

**En el navegador:**
```
1. Abre https://nacram1987-cmd.github.io/Fluxia-v20/index.html?v=v94.80-LAB
2. DevTools (F12) → Console
3. Busca: [Fluxia v94.80] (debería estar)
4. DevTools → Application → Manifest
5. Verifica: "name": "Fluxia BETA v94.80-LAB"
6. Abre en mobile y prueba el selector de meses ✓
```

**O:** Limpiar caché del navegador
```
Ctrl+Shift+Delete
→ "Hora: Todavía"
→ Marcar todo
→ Eliminar
→ Recargar página (F5)
```

---

## CHECKLIST DE DESPLIEGUE

```
ANTES DE HACER GIT PUSH:

☐ 1. Los 8 puntos de versión están en v94.80?
     grep v94.80-LAB index.html | wc -l
     # Resultado: ≥7

☐ 2. manifest.webmanifest tiene v94.80?
     grep v94.80 manifest.webmanifest
     # Resultado: sí

☐ 3. fluxia-canal.json tiene v94.80?
     grep v94.80 fluxia-canal.json
     # Resultado: sí

☐ 4. fluxia-sw.js tiene v94.80?
     grep v94.80 fluxia-sw.js
     # Resultado: sí

☐ 5. index.html ≡ index_fluxia_v94.80_LAB.html?
     cmp index.html index_fluxia_v94.80_LAB.html
     # Resultado: nada (iguales)

DESPUÉS DE HACER GIT PUSH:

☐ 6. GitHub muestra nuevo commit?
     https://github.com/nacram1987/Fluxia-v20/commits/main
     # Resultado: "v94.80-UNIFICACIÓN" en top

☐ 7. GitHub Pages está siendo actualizado?
     https://github.com/nacram1987/Fluxia-v20/deployments
     # Resultado: "Active" con ✓ verde

☐ 8. Versión nueva en vivo?
     Abre https://nacram1987-cmd.github.io/Fluxia-v20/
     Console → [Fluxia v94.80]
     # Resultado: SÍ

☐ 9. DevTools → Manifest → v94.80?
     # Resultado: SÍ

☐ 10. Selector de meses en TODAS las pestañas?
      # Resultado: SÍ
```

---

## PROBLEMAS COMUNES

### "Sigue mostrando la versión vieja"

**Causas:**
1. ❌ No hiciste `git push`
2. ❌ Hiciste push a rama incorrecta (e.g., `develop` en lugar de `main`)
3. ❌ GitHub Pages aún no redeploy (esperar 2 min)
4. ❌ Caché del navegador no actualizada

**Solución:**
```bash
# Verificar qué rama tienes
git branch -a

# Si estás en rama incorrecta:
git checkout main
git merge tu-rama-actual

# Hacer push correcto
git push origin main

# En navegador: Ctrl+Shift+Delete (limpiar caché)
```

### "Git dice 'Rejected'"

**Causa:** GitHub rechaza el push (permisos o conflicto)

**Solución:**
```bash
# Primero, traer cambios remotos
git pull origin main

# Si hay conflictos:
git status
# Verás archivos con <<< >>>

# Resolver manualmente los conflictos, luego:
git add .
git commit -m "Merge con cambios remotos"
git push origin main
```

### "Deployment fallido" (badge rojo en GitHub)

**Causa:** GitHub Pages no puede construir el sitio

**Solución:**
1. Ve a: `https://github.com/nacram1987/Fluxia-v20`
2. Settings → Pages
3. Busca "Build and deployment" → log de error
4. Generalmente: archivo HTML malformado o ruta incorrecta
5. Verifica que `index.html` está en raíz (no en subcarpeta)

---

## PARA FUTURAS VERSIONES (v94.81+)

### **Automatizar esto en PROMPT_MAESTRO**

Agregar sección DESPLIEGUE que diga:

```
PRINCIPIO #27: DESPLIEGUE A GITHUB PAGES

Después de generar v94.X:

1. Copiar a tu repo ~/Fluxia-v20/:
   - index_fluxia_vX.X_LAB.html → index.html
   - manifest.webmanifest
   - fluxia-canal.json
   - fluxia-sw.js

2. Hacer git commit:
   git add .
   git commit -m "vX.X-DESCRIPCIÓN"
   git push origin main

3. Esperar 2 minutos
4. Verificar en navegador: Console → [Fluxia vX.X]
5. Limpiar caché si es necesario: Ctrl+Shift+Delete
```

### **Crear script de despliegue**

```bash
#!/bin/bash
# deploy.sh - Script automático de despliegue

# Verificar que archivos existen
[ -f index.html ] || { echo "❌ index.html no encontrado"; exit 1; }
[ -f manifest.webmanifest ] || { echo "❌ manifest no encontrado"; exit 1; }

# Verificar versión
VERSION=$(grep -o 'v[0-9][0-9]\.[0-9]-LAB' index.html | head -1)
echo "📦 Desplegando $VERSION..."

# Hacer commit
git add index.html manifest.webmanifest fluxia-canal.json fluxia-sw.js
git commit -m "Deploy: $VERSION"

# Push
git push origin main

echo "✅ Despliegue completado"
echo "Espera 2 minutos y verifica en:"
echo "https://nacram1987-cmd.github.io/Fluxia-v20/"
```

---

## RESUMEN: PARA QUE FUNCIONE v94.80

**Lo que yo hago:**
✅ Generar archivos con versión correcta
✅ Empaquetar ZIP
✅ Crear documentación
✅ Verificar 8 puntos

**Lo que TÚ debes hacer (CRÍTICO):**
1. Descargar archivos de `/outputs/`
2. Copiar a tu repo `~/Fluxia-v20/`
3. `git add . && git commit && git push origin main`
4. Esperar 2 minutos
5. Verificar en navegador

**Sin paso 2-4: El navegador NO ve la actualización.**

---

**PARA v94.81+: Automatizar esto o crear un script de despliegue en el repo.**

