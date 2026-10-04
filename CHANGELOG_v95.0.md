# CHANGELOG v95.0-LAB

**Fecha:** 2026-10-04  
**Anterior:** v94.9.2-CORRECTO  
**Estado:** Arreglos finales + rollout a v95 series

---

## CAMBIOS PRINCIPALES

### 🔧 Sincronización de Borrados (CRÍTICO)
- **Problema:** Gasto fijo borrado reaparecía al reiniciar
- **Solución:** `planRescate_v2_borrados_blacklist` ahora en CRITICAS
- **Impacto:** Todos los borrados se sincronizan con Supabase

### 📐 Layout Dashboard
- **Antes:** Mes con selector, disponible desalineado
- **Ahora:** Mes centrado + disponible debajo, bien ordenado

### 🎨 Color Mes en otras Pestañas
- **Antes:** Dorado claro, inconsistente
- **Ahora:** Oro oscuro (#6B4A00) como en Dashboard

### ⬆️ Scroll Automático
- **Antes:** Al cambiar pestaña, quedabas en medio de la página
- **Ahora:** Scroll suave hacia arriba, ves el mes siempre

---

## DETALLES TÉCNICOS

| Aspecto | v94.9.2 | v95.0-LAB |
|---------|---------|----------|
| Borrados sync | NO | ✅ SÍ (blacklist) |
| Layout Dashboard | Parcial | ✅ CENTRADO |
| Color meses otras pestañas | Claro | ✅ OSCURO |
| Scroll al cambiar | NO | ✅ SÍ (smooth) |
| Nube (Supabase) | ✅ Sí | ✅ Sí (sin cambios) |

---

## VERIFICACIÓN

```bash
# Versión correcta
window.FLUXIA_VERSION === "v95.0-LAB"

# Manifest
manifest.webmanifest: name = "Fluxia BETA v95.0-LAB"

# Canal
fluxia-canal.json: lab_version = "v95.0-LAB"

# Service Worker
fluxia-sw.js: VERSION = 'v95.0-LAB'
```

---

## ROADMAP PRÓXIMAS VERSIONES

- **v95.1-LAB:** Offline mode 100%
- **v95.2-LAB:** Sincronización bidireccional en tiempo real
- **v96.0-LAB:** Refactor TypeScript + tests

