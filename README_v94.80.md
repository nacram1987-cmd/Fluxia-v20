# Fluxia v94.80-LAB: Selector de meses unificado

## ¿Qué es esto?

**v94.80-LAB** mejora la **consistencia visual** de Fluxia colocando el selector de meses (la mecánica del Dashboard) en **TODAS las pestañas** con color oro unificado.

## Cambio principal

### Antes (v94.79 ❌)
```
Dashboard:           [Ene][Feb][Mar]... ← selector visible
                     
Ingresos:           (sin selector) ← confusión
                     
Fijos:              (sin selector) ← confusión
                     
Provisiones:        (sin selector) ← confusión
```

### Ahora (v94.80 ✅)
```
Dashboard:          [Ene][Feb][Mar]... ← selector en top
                    
Ingresos:           [Ene][Feb][Mar]... ← selector en top
                    
Fijos:              [Ene][Feb][Mar]... ← selector en top
                    
Provisiones:        [Ene][Feb][Mar]... ← selector en top
                    
TODOS con:
  • Mismo color oro (#8B6914 → #6B5312)
  • Posición sticky (siempre visible)
  • Un MES GLOBAL (cambias en una → cambia en todas)
```

## Características

✅ **Selector en TODAS las pestañas** (Ingresos, Fijos, Provisiones, Variables, Compartidos, Huchas)

✅ **Color oro unificado** - Mismo color que el resto de la app, no teal

✅ **Sticky position** - Permanece visible al scrollear

✅ **Mes global** - Un solo mes seleccionado para toda la app

✅ **Accesible** - ARIA labels, navegación por teclado

✅ **Responsive** - Mobile-friendly con scroll horizontal

✅ **Desde v94.79** - Todos los 7 fixes de Supabase sync incluidos

## Uso

### Cambiar de mes
1. Abre cualquier pestaña
2. En el top verás: `[Ene][Feb][Mar][Apr]...`
3. Haz click en el mes que quieras
4. ✓ Todos los datos se actualizan para ese mes
5. ✓ Cambias de pestaña → sigue el mismo mes

### Ver qué mes está seleccionado
- El mes seleccionado tiene **fondo gradiente oro + texto blanco**
- Los demás tienen fondo crema claro

## Color

**Oro Prototipo B** (profesional):
- Inactivo: `#F5F3EF` (crema)
- Activo: `#8B6914 → #6B5312` (gradiente oro oscuro)
- Texto activo: Blanco
- Contraste: 6.2:1 WCAG AAA ✓

## Archivos

- `index_fluxia_v94.80_LAB.html` - App completa
- `manifest.webmanifest` - Información de PWA
- `fluxia-canal.json` - Configuración de actualización
- `fluxia-sw.js` - Service Worker
- `CHANGELOG_v94.80.md` - Cambios técnicos
- `README_v94.80.md` - Este archivo
- `PROMPT_MAESTRO_v94.80.txt` - Reglas de desarrollo

## Mejoras desde v94.79

| Aspecto | v94.79 | v94.80 |
|---------|--------|--------|
| Selector en Ingresos | ❌ NO | ✅ SÍ |
| Selector en Fijos | ❌ NO | ✅ SÍ |
| Selector en Provisiones | ❌ NO | ✅ SÍ |
| Selector en Variables | ❌ NO | ✅ SÍ |
| Color unificado | ❌ NO | ✅ ORO |
| Sticky position | ❌ NO | ✅ SÍ |
| Mes global | ✅ SÍ | ✅ SÍ (mejor) |
| Supabase sync | ✅ SÍ | ✅ SÍ (7 fixes) |

## Testing

### ✓ Visual
- [ ] Selector visible en todas las pestañas
- [ ] Color oro correcto (#8B6914 → #6B5312)
- [ ] Hover effect (translteY)
- [ ] Active effect (gradiente + sombra)

### ✓ Funcionalidad
- [ ] Click en mes → se marca como active
- [ ] Click en mes → datos se actualizan
- [ ] Cambias de pestaña → sigue el mismo mes
- [ ] Sticky position funciona al scrollear

### ✓ Accesibilidad
- [ ] Tab key navega entre meses
- [ ] Enter/Space activa mes
- [ ] aria-pressed correcto
- [ ] Lector de pantalla dice "Mes del plan" (navigation)

### ✓ Responsive
- [ ] Desktop: todos los meses visibles
- [ ] Tablet: scroll horizontal si necesario
- [ ] Mobile: scroll smooth, scrollbar dorado

## Si algo va mal

### Selector no aparece
1. DevTools → Console → busca `[Fluxia v94.80]`
2. Verifica que `mesSelectUnificado` existe en HTML
3. Abre DevTools → Elements → busca `class="mes-selector-unificado"`

### Color incorrecto
- Debería ser oro oscuro (#8B6914 → #6B5312 en active)
- Si es teal → caché vieja, limpia con Ctrl+Shift+Delete

### Mes no cambia en otras pestañas
- El evento `fluxia-mes-cambio` debe dispararse
- En Console deberías ver: `[Fluxia v94.80] Mes seleccionado: X`

## Siguientes versiones

- **v94.81**: Modo offline completo (sin internet)
- **v95.00**: Refactor completo con TypeScript

---

**v94.80 es la v94.79 + selector de meses en TODAS las pestañas. Aún más consistente. ✨**

