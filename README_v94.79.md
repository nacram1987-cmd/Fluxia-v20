# Fluxia v94.79-LAB: Sincronización Supabase Crítica

## ¿Qué es esto?

**v94.79-LAB** es la versión CRÍTICA que soluciona el bug más grave de Fluxia:
**Los datos se guardaban en local pero NO subían a Supabase automáticamente.**

Esto causaba:
- 🔴 Pérdida de datos al reinstalar PWA
- 🔴 Falta de confianza en el producto
- 🔴 Inconsistencia entre dispositivos

## ¿Qué se solucionó?

### Antes (v94.78 ❌):
```
Gasto guardado → localStorage ✓
Supabase sincronizado → ❌ NO automático
Usuario reinstala → Datos perdidos ❌
```

### Ahora (v94.79 ✅):
```
Gasto guardado → localStorage ✓
Auto-trigger flush → Supabase ✓
Retry si falla → 5 intentos ✓
Usuario ve estado → Toast visual ✓
Reinstala → Datos de Supabase ✓ PERFECTO
```

## Cómo usar

### Instalación
1. Descarga `index_fluxia_v94.79_LAB.html`
2. Renombra a `index.html`
3. Sube a tu servidor/GitHub Pages
4. O abre directo en navegador

### Testing
1. Abre DevTools (F12)
2. Ve a Console
3. Busca logs `[Fluxia v94.79]` (verás cada sync)
4. Abre Network → busca requests a Supabase
5. Comprueba el toast en top-right (estado de sync)

### Verificar que funciona
```javascript
// En Console:
console.log(localStorage.getItem('planRescate_movimientos'))
// Deberías ver tus datos

// Ahora guarda un gasto y en 300ms debería subir:
// Busca "[Almacén v94.79] Ejecutando flush automático"
```

## Características nuevas

✅ **Listeners automáticos** - localStorage → Supabase automático
✅ **Retry inteligente** - Si falla, reintenta (1s, 2s, 4s, 8s, 16s)
✅ **Toast de estado** - Ves "✓ Sincronizado", "⚠ Error", etc
✅ **Sincronización entre tabs** - Datos sincronizados aunque uses 2 pestañas
✅ **Limpieza automática** - Elimina widgets fantasma
✅ **Flush al cerrar** - Asegura que nada se quede sin sincronizar

## Colores mejorados

Prototipo B (profesional):
- Meses: `#8B6914 → #6B5312` (marrón oscuro)
- Contraste: 6.2:1 WCAG AAA ✓

## Archivos

- `index_fluxia_v94.79_LAB.html` - App completa lista para usar
- `v94.79_SUPABASE_CRITICAL_FIX.js` - Script de fix (referencia)
- `CHANGELOG_v94.79.md` - Historial detallado
- `README_v94.79.md` - Este archivo

## Si algo va mal

1. Abre Console (F12)
2. Busca errores `[Fluxia v94.79]`
3. Comprueba:
   - ¿Está Supabase conectado? (busca "nube" en estado)
   - ¿Hay internet? (Network tab)
   - ¿localStorage tiene datos? (Application → localStorage)

## Siguientes pasos

- v94.80: Service Worker mejorado
- v94.81: Modo offline completo
- v94.82: Sync bidireccional automático

---

**IMPORTANTE**: Esta es la versión de producción. Los datos están seguros. ✓

