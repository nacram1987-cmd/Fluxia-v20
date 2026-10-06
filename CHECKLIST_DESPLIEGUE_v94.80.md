# ✅ CHECKLIST DE DESPLIEGUE v94.80

**OBJETIVO**: Hacer que v94.80 se vea en `https://nacram1987-cmd.github.io/Fluxia-v20/`

**TIEMPO**: 5 minutos + 2 minutos espera = 7 minutos total

---

## PASO 1: VERIFICAR QUE LOS ARCHIVOS SON CORRECTOS

```bash
# En Claude outputs, verificar:

# 1a. index.html tiene versión v94.80?
grep -c 'v94.80-LAB' index_fluxia_v94.80_LAB.html
# Esperado: ≥7

# 1b. manifest tiene v94.80?
grep 'v94.80' manifest.webmanifest
# Esperado: sí, "name": "Fluxia BETA v94.80-LAB"

# 1c. canal tiene v94.80?
grep 'v94.80' fluxia-canal.json
# Esperado: sí, "lab_version": "v94.80-LAB"

# 1d. SW tiene v94.80?
grep 'v94.80' fluxia-sw.js
# Esperado: sí, const VERSION = 'v94.80-LAB'
```

**✅ Si todos pasan → continuar**  
**❌ Si algo falla → NO desplegar, avisar a Claude**

---

## PASO 2: DESCARGAR ARCHIVOS DE CLAUDE

**Descargar estos 4 archivos de `/mnt/user-data/outputs/`:**

```
□ index_fluxia_v94.80_LAB.html     (1.9 MB)
□ manifest.webmanifest              (773 bytes)
□ fluxia-canal.json                 (575 bytes)
□ fluxia-sw.js                      (2.3 KB)
```

**Guardar en carpeta temporal, ej: `~/Downloads/fluxia-v94.80/`**

---

## PASO 3: ABRIR TU REPO LOCAL DE FLUXIA

```bash
# Abrir terminal/cmd en tu PC

# Ir a tu repo
cd ~/Fluxia-v20
# O la ruta donde tengas el repo local

# Verificar que estés en la rama correcta
git branch
# Debe mostrar: * main  (o * master)
# Si no: git checkout main

# Asegurarse de que está al día
git pull origin main
```

---

## PASO 4: COPIAR ARCHIVOS AL REPO

### **Opción A: Visual (arrastra y suelta)**

1. Abre explorador de archivos
2. Navega a `~/Fluxia-v20/`
3. Abre otra ventana con `~/Downloads/fluxia-v94.80/`
4. Desde Downloads, arrastra:
   - `index_fluxia_v94.80_LAB.html` → Fluxia-v20 (carpeta raíz)
   - `manifest.webmanifest` → Fluxia-v20 (carpeta raíz)
   - `fluxia-canal.json` → Fluxia-v20 (carpeta raíz)
   - `fluxia-sw.js` → Fluxia-v20 (carpeta raíz)

5. En Fluxia-v20, renombra `index_fluxia_v94.80_LAB.html` → `index.html`
   (click derecho → Renombrar)

### **Opción B: Terminal (más rápido)**

```bash
# En ~/Fluxia-v20/

# Copiar y renombrar index
cp ~/Downloads/fluxia-v94.80/index_fluxia_v94.80_LAB.html ./index.html

# Copiar los demás
cp ~/Downloads/fluxia-v94.80/manifest.webmanifest ./manifest.webmanifest
cp ~/Downloads/fluxia-v94.80/fluxia-canal.json ./fluxia-canal.json
cp ~/Downloads/fluxia-v94.80/fluxia-sw.js ./fluxia-sw.js

# Verificar
ls -la index.html manifest.webmanifest fluxia-canal.json fluxia-sw.js
# Resultado: 4 archivos listados ✓
```

---

## PASO 5: VERIFICAR QUE GIT VE LOS CAMBIOS

```bash
# En terminal, en ~/Fluxia-v20/

git status

# Esperado:
# modified:   index.html
# modified:   manifest.webmanifest
# modified:   fluxia-canal.json
# modified:   fluxia-sw.js
```

**✅ Si ves 4 archivos "modified" → continuar**  
**❌ Si ves 0 cambios → los archivos no se copiaron correctamente**

---

## PASO 6: HACER COMMIT

```bash
# En ~/Fluxia-v20/

git add index.html manifest.webmanifest fluxia-canal.json fluxia-sw.js

# Verificar que está en staging
git status
# Debe mostrar: "Changes to be committed:" con 4 archivos

# Hacer commit
git commit -m "v94.80-UNIFICACIÓN: Selector de meses en todas las pestañas + color oro"

# Esperado:
# [main abc1234] v94.80-UNIFICACIÓN: ...
# 4 files changed, 500 insertions(+), 100 deletions(-)
```

---

## PASO 7: HACER PUSH A GITHUB

```bash
# En ~/Fluxia-v20/

git push origin main

# Esperado:
# Counting objects: 4, done.
# Delta compression using up to 8 threads.
# Compressing objects: 100% (3/3), done.
# Writing objects: 100% (4/4), ...
# remote: Resolving deltas: 100% (2/2), done.
# To github.com:nacram1987/Fluxia-v20.git
#    abc1234..def5678  main -> main
```

**✅ Si ves "main -> main" al final → continuó correctamente**  
**❌ Si ves "ERROR" o "Rejected" → problema de permisos o rama**

---

## PASO 8: ESPERAR DESPLIEGUE DE GITHUB PAGES

**GitHub Pages tarda 1-2 minutos en actualizar**

```
T+0 min:  Push completado
T+1 min:  GitHub detecta cambios
T+1 min:  GitHub redeploy comienza
T+2 min:  Sitio actualizado en vivo
```

**Durante la espera:**
- Puedes verificar el estado en: `https://github.com/nacram1987/Fluxia-v20/deployments`
- O ir a: Settings → Pages → Build and deployment

---

## PASO 9: VERIFICAR EN NAVEGADOR

### **Test 1: Versión correcta en manifest**

1. Abre: `https://nacram1987-cmd.github.io/Fluxia-v20/`
2. DevTools (F12) → Application → Manifest
3. Busca: `"name":`
4. **✅ Debe decir**: `"Fluxia BETA v94.80-LAB"`
5. **❌ Si dice v94.79 o anterior**: caché antigua, limpiar

### **Test 2: Logs de v94.80 en Console**

1. DevTools (F12) → Console
2. Busca: `[Fluxia v94.80]`
3. **✅ Debe haber múltiples logs** como:
   ```
   [Fluxia v94.80] Inicializando SUPABASE SYNC FIX CRÍTICA
   [Fluxia v94.80] Listeners automáticos en localStorage
   [Fluxia v94.80] Renderizar selector de meses en TODAS las pestañas
   ```
4. **❌ Si ves [Fluxia v94.79] o anterior**: GitHub Pages no actualizó

### **Test 3: Selector de meses en todas las pestañas**

1. Navega a cada pestaña:
   - Dashboard → selector arriba ✅
   - Ingresos → selector arriba ✅
   - Fijos → selector arriba ✅
   - Provisiones → selector arriba ✅
   - Variables → selector arriba ✅
   - Compartidos → selector arriba ✅
   - Huchas → selector arriba ✅

2. Cambiar mes → debe cambiar en todas

### **Test 4: Color oro correcto**

1. DevTools (F12) → Elements
2. Inspeccionar botón del mes activo
3. En Styles, buscar: `.mes-selector-unificado button.active`
4. **✅ Debe tener**: `background: linear-gradient(135deg, #8B6914 0%, #6B5312 100%)`
5. **❌ Si es otro color**: CSS no se actualizó

---

## SI ALGO FALLA

### "Sigue mostrando v94.79 en Console"

**Causa 1: Caché del navegador**
```bash
# Limpiar caché (en navegador):
Ctrl+Shift+Delete
→ "Hora": "Todavía"
→ Marcar TODO
→ "Eliminar datos"
→ Recargar F5
```

**Causa 2: GitHub Pages no actualizó**
```bash
# Verificar estado en GitHub:
https://github.com/nacram1987/Fluxia-v20/deployments
# Debe tener un ✅ verde reciente

# O esperar 2 minutos más
```

**Causa 3: No se hizo push correctamente**
```bash
# Verificar commit en GitHub:
https://github.com/nacram1987/Fluxia-v20/commits/main
# El commit debe ser: "v94.80-UNIFICACIÓN..."
# Si no está → volver a hacer push
```

### "Selector de meses no aparece en pestañas"

**Verificar en Console:**
```javascript
// En DevTools Console, escribe:
document.querySelectorAll('.mes-selector-unificado').length
// Debe devolver: 7 (una por cada pestaña)
```

**Si devuelve 0:**
- CSS no se cargó correctamente
- Limpiar caché (Ctrl+Shift+Delete)
- Recargar (F5)

---

## CHECKLIST FINAL

```
☐ Archivos descargados de /outputs/
☐ Copiados a ~/Fluxia-v20/
☐ index.html renombrado correctamente
☐ git status muestra 4 archivos modified
☐ git commit hecho
☐ git push completado (sin errores)
☐ Esperé 2 minutos
☐ Navegador muestra [Fluxia v94.80] en Console
☐ Manifest muestra "Fluxia BETA v94.80-LAB"
☐ Selector aparece en Dashboard
☐ Selector aparece en Ingresos
☐ Selector aparece en Fijos
☐ Selector aparece en Provisiones
☐ Selector aparece en Variables
☐ Selector aparece en Compartidos
☐ Selector aparece en Huchas
☐ Color oro es correcto (#8B6914→#6B5312)
☐ Cambiar mes funciona en todas las pestañas
```

**Si TODOS están marcados → v94.80 está funcionando correctamente ✅**

---

## PARA FUTURAS VERSIONES (v94.81+)

**Objetivo: Automatizar esto**

Opciones:
1. **Script bash**: `./deploy.sh` (hace todo automático)
2. **GitHub Actions**: Push automático cuando Claude genera (requiere webhook)
3. **Documento claro**: Estos mismos pasos pero actualizados para v94.81
4. **ZIP listo**: Incluir ZIP precomprimido "listo para desplegar"

---

**ESTE CHECKLIST DEBE SEGUIRSE EXACTAMENTE PARA QUE v94.80 FUNCIONE.**

**SIN ESTOS PASOS: Los archivos se generan pero el navegador NO los ve.**

