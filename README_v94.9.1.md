# Fluxia v94.9.1-LAB

**Fecha:** 2026-10-04 (actualización final de v94.88.4)  
**Estado:** ✅ Confirmado que TODOS los movimientos se guardan en la nube

## Confirmación Crítica: Sincronización Nube ✅

**TODAS estos tipos de datos se guardan EN LA NUBE (Supabase):**
- ✅ Ingresos
- ✅ Gastos Variables
- ✅ Gastos Fijos
- ✅ Provisiones (Huchas)
- ✅ Usos de huchas
- ✅ Financiaciones

**Flujo:** Usuario agrega dato → `guardarLS()` → `Almacen.setItem()` → **Supabase (con verificación real de v94.88.4)**

Al cerrar sesión: datos YA están en la nube. Al volver a entrar: se restauran automáticamente desde Supabase.

---

## Cambios en v94.9.1

### ✅ Logo perfectamente centrado
- Flex layout correcto en contenedor

### ✅ Selector de meses centrado EN TODAS LAS PESTAÑAS
- Ahora con `justify-content:center` para alineación perfecta
- Márgenes simétricos (16px arriba/abajo)
- En Ingresos, Fijos, Variables, Provisiones, Compartidos, Banco, etc.

### ✅ Color oro más oscuro
- De #8B6914 → #5C4010 (sofisticado, mejor contraste)

---

## Instalación

**Desde iPhone:**
1. GitHub → tu repo
2. **Add file → Upload files**
3. Sube estos **4 archivos:**
   - `index.html`
   - `manifest.webmanifest`
   - `fluxia-sw.js`
   - `fluxia-canal.json`
4. **Commit directly to main**
5. Espera 2-3 minutos
6. Abre la app → verifica: **"Fluxia BETA v94.9.1-LAB"**

---

## Enlaces de Acceso

### 🧪 Versión LAB (últimas correcciones)
**Enlace:** https://nacram1987-cmd.github.io/Fluxia-v20/?v=v94.9.1-LAB

Úsalo para:
- Probar selector centrado perfecto
- Confirmar que datos se guardan en la nube
- Nuevas características

### 📦 Versión Estable (anterior)
**Enlace:** https://nacram1987-cmd.github.io/Fluxia-v20/?v=v94.88.4-LAB

Úsalo para:
- Si v94.9.1 tiene algún problema
- Revertir rápidamente a lo anterior

---

**Nota:** El navegador cachea la versión. Si v94.9.1 dice v94.88.4, haz:
- Mobile Safari: Ajustes → Safari → Historial → Borrar datos
- Chrome: Ctrl+Shift+Delete

---

**Retrocompatible:** v94.9.1 es 100% compatible con datos de v94.88.4. Sin cambios en lógica, solo visuales y centrado.
