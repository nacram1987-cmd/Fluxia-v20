# Fluxia v19 - Arreglos Críticos

## Lo que se corrigió

### 1. ✅ **Pestaña Ayuda ahora es visible**
**Antes:** Estaba oculta con CSS (`display:none`).  
**Ahora:** Disponible en el menú de la izquierda. Contiene "Cómo funciona tu plan" y Preguntas Frecuentes.

### 2. ✅ **Pestaña Datos ahora es visible**
**Antes:** Oculta (no se veía Descargar/Cargar copia).  
**Ahora:** Accesible desde el menú. Aquí están:
- 💾 Descargar copia
- 📥 Cargar copia
- 🕘 Ver versiones anteriores
- 📅 Cierre de mes

### 3. ✅ **Puedes desactivar Face ID**
**Antes:** Solo había botón "Activar", no había forma de quitarlo.  
**Ahora:** 
- En *Ajustes → Seguridad*, ves si está activado
- Si lo está: botón **❌ Desactivar Face ID**
- Si no lo está: botón **🔐 Activar Face ID**

### 4. ✅ **Face ID no aparece cuando configuras contraseña**
**Antes:** Si pulsabas "Necesito una clave", Face ID seguía apareciendo en el flujo.  
**Ahora:** Al cambiar a modo clave, Face ID desaparece. Solo ves el campo de 6 dígitos.

### 5. ✅ **Explicación: datos seguros si cambias GitHub**
**Pregunta:** "¿Si yo cambio el index, mi pareja pierde los datos?"  
**Respuesta:** **NO**. Los datos están en tres lugares independientes:
1. **localStorage del iPhone** — intacto siempre
2. **Servidor Render** — intacto siempre
3. **URL vieja de GitHub Pages** — intacto siempre

Cambiar el index es como rediseñar la interfaz de un banco: tu dinero sigue en la caja fuerte.

**Únicos casos de riesgo:** Cambiar las **claves de localStorage** (ej: `planRescate_v2_ingresos` → `planRescate_v3_ingresos`). Nunca hagas eso sin avisar a tu pareja y hacer copias de respaldo.

---

## Dónde están los cambios en el HTML

| Cambio | Línea | Qué hace |
|--------|-------|----------|
| Quitar `drawer-secondary-hidden` de Datos | ≈2260 | Muestra pestaña Datos |
| Quitar `drawer-secondary-hidden` de Ayuda | ≈2261 | Muestra pestaña Ayuda |
| Añadir `btnFaceIdDes` | ≈3536 | Botón desactivar |
| Actualizar modo clave | ≈2478 | Face ID desaparece en clave |

---

## Pruebas recomendadas

1. **Abre Ajustes** → Baja a "Seguridad" → Verifica que dice "Biometría activada" (o el estado que tengas)
2. **Menú ☰** → Ves "Ayuda" y "Datos" → Entra en Ayuda → Léelo
3. **En Ajustes** → Si Face ID está activo, hay botón ❌ para desactivarlo
4. **Crea una clave** → No debe aparecer Face ID en el flujo
5. **Tu pareja descarga el index de GitHub** → Abre la app → **Sus datos siguen ahí**

---

## Versión

**v19-fixes** (22 septiembre 2026)

Base: v18 (versiones, cierre de mes, provisiones corregidas, cambios de año)  
Añadidos: Visibilidad de Ayuda/Datos, control de Face ID, seguridad en GitHub
