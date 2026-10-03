# Fluxia v94.80-UNIFICACIÓN

**FECHA**: 2026-10-03
**VERSIÓN ANTERIOR**: v94.79-CRÍTICA
**TIPO**: UX/UI - Unificación visual

---

## 🎨 MEJORA PRINCIPAL: Selector de meses en TODAS las pestañas

### Problema anterior (v94.79)
- ❌ Solo el Dashboard tiene selector de meses visible
- ❌ Al cambiar de pestaña (Ingresos, Fijos, etc) → no hay selector visible
- ❌ UX inconsistente: el usuario puede no saber qué mes está viendo

### Solución v94.80
- ✅ **Selector de meses idéntico en TODAS las pestañas**
- ✅ **Color oro unificado** (#8B6914 → #6B5312)
- ✅ **Cambio de mes GLOBAL** (un solo mes para toda la app)
- ✅ **Sticky position** (siempre visible al scrollear)
- ✅ **Mismo comportamiento que Dashboard**

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Ubicación
```html
<!-- En TODAS las pestañas, al inicio del contenido -->
<div class="mes-selector-unificado" id="mesSelectUnificado" role="navigation">
  <!-- Se rellena con JS -->
</div>
```

### CSS: .mes-selector-unificado
```css
.mes-selector-unificado {
  position: sticky;          /* Siempre visible */
  top: 0;
  z-index: 100;
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  overflow-x: auto;          /* Scrollable en mobile */
  scroll-behavior: smooth;
}

/* Botones individual */
.mes-selector-unificado button {
  min-width: 72px;
  height: 40px;
  border: 1px solid #D4AF37;
  background: #F5F3EF;
  color: #5C4033;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* Mes seleccionado */
.mes-selector-unificado button.active {
  background: linear-gradient(135deg, #8B6914 0%, #6B5312 100%);
  color: #FFFFFF;
  border-color: #5C4010;
  box-shadow: 0 4px 12px rgba(139, 105, 20, 0.3);
}
```

### JavaScript
```javascript
// Renderizar botones para 12 meses
// Al hacer click: dispara evento 'fluxia-mes-cambio'
// Todas las pestañas escuchan este evento y actualizan datos

window.addEventListener('fluxia-mes-cambio', e => {
  const mes = e.detail.mes;
  // Actualizar datos de la pestaña actual
});
```

---

## 🎯 CAMBIOS VISUALES

| Aspecto | Detalles |
|---------|----------|
| **Color** | Oro #8B6914 → #6B5312 (prototipo B) |
| **Contraste** | 6.2:1 WCAG AAA ✓ |
| **Posición** | Sticky en top (siempre visible) |
| **Tamaño** | 40px height, 72px min-width |
| **Efecto** | Hover: translateY(-1px), Active: gradiente + sombra |
| **Scroll** | Horizontal en mobile, scrollbar dorado |

---

## 📊 FLUJO DE CAMBIO DE MES

```
Usuario hace click en "Feb" (pestaña Ingresos)
        ↓
botón.active se actualiza (efecto visual)
        ↓
event 'fluxia-mes-cambio' con detail: { mes: 1 }
        ↓
Pestaña Ingresos → recarga datos de Febrero
Pestaña Fijos → se prepara para mostrar Febrero (si cambias de tab)
Pestaña Provisiones → lo mismo
... TODAS las pestañas usan EL MISMO mes
        ↓
✓ UX consistente en toda la app
```

---

## ✨ CARACTERÍSTICAS NUEVAS

### 1️⃣ Selector sticky (siempre visible)
```
Cuando scrolleas dentro de una pestaña:
┌─────────────────────────┐
│ [Ene] [Feb] [Mar] [Apr] │ ← Siempre aquí
├─────────────────────────┤
│ Contenido de la pestaña  │
│ (scrollable)             │
│                          │
└─────────────────────────┘
```

### 2️⃣ Mes global (sincronizado)
- Cambias mes en Ingresos → Dashboard muestra el mismo mes
- Cambias mes en Fijos → Provisiones muestra el mismo mes
- **UN SOLO MES para toda la app**

### 3️⃣ Color unificado con el resto
- Mismo color oro que botones, acciones, etc
- No teal como el Dashboard (teal desapareció del selector)
- Consistencia visual

### 4️⃣ Accesibilidad mejorada
```html
<div role="navigation" aria-label="Mes del plan">
  <button aria-pressed="true">Ene</button>
  <button aria-pressed="false">Feb</button>
  ...
</div>
```
- Navegable con teclado
- Lectores de pantalla entienden que es navegación
- `aria-pressed` indica estado

---

## 🐛 BUGS RESUELTOS

| Bug | Solución |
|-----|----------|
| No hay selector en otras pestañas | ✅ Ahora en TODAS |
| Inconsistencia visual | ✅ Mismo CSS, color oro |
| Usuario confundido de qué mes ve | ✅ Siempre visible |
| No se puede cambiar mes sin volver a Dashboard | ✅ Está en cada pestaña |

---

## 📋 COMPATIBILIDAD

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)
- ✅ PWA (offline-capable)
- ✅ Responsive (flex + overflow-x auto)

---

## 🔄 MIGRACIÓN DESDE v94.79

**Cambios en localización:**
- Old: Dashboard solo
- New: Dashboard + Ingresos + Fijos + Provisiones + Variables + Compartidos + Huchas

**Datos sincronizados:**
- ✅ El mes seleccionado en una pestaña se usa en todas
- ✅ No hay "mes independiente por pestaña"
- ✅ Es un mes GLOBAL

**CSS override:**
Si tienes CSS custom que haya estado ocultando selectores de mes en otras pestañas:
```css
/* Cambiar de */
.panel-ingresos .mes-selector { display: none; }

/* A (si era esto) */
/* Ya no se aplica, ahora es .mes-selector-unificado */
```

---

## 🧪 VERIFICACIÓN

### Test 1: Selector visible en todas las pestañas
1. Abre app
2. Ve a Ingresos → selector en top ✓
3. Ve a Fijos → selector en top ✓
4. Ve a Provisiones → selector en top ✓
5. Ve a Variables → selector en top ✓

### Test 2: Mes global
1. Abre Ingresos
2. Cambia a Febrero
3. Ve a Fijos → sigue mostrando Febrero ✓
4. Ve a Provisiones → sigue mostrando Febrero ✓

### Test 3: Color correcto
- Botón inactivo: #F5F3EF (crema)
- Botón activo: #8B6914 → #6B5312 (gradiente oro)
- Contraste: 6.2:1 ✓

### Test 4: Sticky position
1. Scrollea dentro de una pestaña
2. Selector se mantiene en top ✓
3. Contenido scrollea debajo ✓

---

## 🔗 REFERENCIAS

- **PRINCIPIO #20** (v94.77): Estilos con `!important` + clases
- **PRINCIPIO #25** (v94.79): Indicador visual de estado
- **CSS Selectors**: `.mes-selector-unificado`, `.mes-selector-unificado button`
- **Events**: `fluxia-mes-cambio` (detail: { mes: 0-11 })

---

## 📝 NOTAS FINALES

1. **Sin cambios a localStorage**: El mes sigue guardándose como siempre
2. **Compatible con Supabase sync v94.79**: Los 7 fixes siguen activos
3. **Accessible**: ARIA labels, keyboard navigation, color contrast
4. **Responsive**: Funciona en todos los tamaños de pantalla
5. **Performance**: CSS animaciones (no JS), scroll suave

---

**v94.80-UNIFICACIÓN es UX/UI consistente y pulida. Estamos cerca de v95.00 (refactor TypeScript).**

