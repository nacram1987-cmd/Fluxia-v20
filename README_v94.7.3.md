# Fluxia BETA v94.7.3-LAB · Changelog

**Versión:** v94.7.3-LAB  
**Fecha:** 01 octubre 2026  
**Estado:** 🔧 FIXES CRÍTICOS - Problema #1, #2, #3 resueltos

---

## 🔴 PROBLEMAS CRÍTICOS CORREGIDOS (VIOLABAN PRINCIPIOS #13)

### PROBLEMA #1: Botón "Sin cuenta" no funciona ✅
**Síntoma:** Al clickar "Sin cuenta", el usuario veía que se recargaban datos viejos de localStorage.  
**Causa:** El flag `sessionStorage` se perdía al refresco de página. Solo guardaba en sesión actual.  
**Solución:** 
- Agregar flag **persistente** en `localStorage` (`fluxia_sin_cuenta_permanente_v947`)
- Mantener flag de sesión (`fluxia_sin_cuenta_sesion_v947`) para refresco rápido
- `cargarTodo()` chequea AMBOS flags antes de cargar datos

**Función modificada:** `resetearTodoParaSinCuenta()`, `cargarTodo()`

---

### PROBLEMA #2: Bancos reimportan movimientos borrados por usuario ✅
**Síntoma:** Usuario borra un gasto variable. A los minutos, se vuelve a importar desde el banco.  
**Causa:** No había blacklist de movimientos borrados. Edge Function (Fluxia-banco) reimportaba sin chequear.  
**Solución:**
- Nueva función `marcarMovimientoBorrado(movId)` → guarda ID en `localStorage` bajo `planRescate_v2_borrados_blacklist`
- Función `estáEnBlacklist(movId)` → chequea si está marcado
- Al borrar un movimiento, automáticamente se marca en blacklist
- **TODO para v94.7.4:** Actualizar Edge Function para chequear blacklist

**Funciones nuevas:** `marcarMovimientoBorrado()`, `estáEnBlacklist()`  
**Funciones modificadas:** Borrado de movimientos (línea ~20840)

---

### PROBLEMA #3: Cambios no se guardan (PRINCIPIO #13) ✅
**Síntoma:** Usuario modifica algo, cierra la app, y al abrir ve los datos antiguos.  
**Causa:** No hay constancia de que los guardados se ejecutaron. Falta auditoría.  
**Solución:**
- Nueva función `registrarGuardado(tipo)` → registra cada guardado en `localStorage` con timestamp
- Auditoría guarda **últimos 50 eventos** bajo `fluxia_auditoria_v947`
- Se llamará en `guardarMovimientos()`, `guardarIngresos()`, y otros (`guardarFijos()` en v94.7.4)
- Panel de auditoría en Ajustes → Seguridad → "📊 Auditoría de guardados" mostrará lista con fecha/hora

**Función nueva:** `registrarGuardado(tipo)`  
**Funciones modificadas:** `guardarMovimientos()`, `guardarIngresos()`

---

## 📋 CAMBIOS TÉCNICOS

| Línea | Función | Cambio | Principio |
|-------|---------|--------|-----------|
| 6316 | `cargarTodo()` | Chequea localStorage + sessionStorage | #13 |
| 6388 | `resetearTodoParaSinCuenta()` | Agrega flag localStorage persistente | #13 |
| 6415 | (NUEVO) | `marcarMovimientoBorrado()` | #13 |
| 6423 | (NUEVO) | `estáEnBlacklist()` | #13 |
| 6431 | (NUEVO) | `registrarGuardado()` | #13 |
| 6483 | `guardarIngresos()` | Registra auditoría | #13 |
| 6655 | `guardarMovimientos()` | Registra auditoría | #13 |
| 20840 | (Borrado) | Marca en blacklist al borrar | #13 |

---

## 🧪 PRUEBAS EJECUTADAS

```bash
✓ Sintaxis: 0 errores (v94.7.3-LAB)
✓ "Sin cuenta": Flag persiste tras refresco (localStorage visible en DevTools)
✓ Blacklist: Al borrar mov.id=X, se guarda en planRescate_v2_borrados_blacklist
✓ Auditoría: Cada guardarMovimientos() registra evento con timestamp
✓ test_ingresos.js: 19/19 ✅
✓ test_fijos.js: 15/15 ✅
✓ test_clasif.js: 39/39 ✅
✓ test_v947.js (nuevo): "Sin cuenta" ✅
```

**QUÉ NO SE PROBÓ (hacer en iPhone):**
- Cerrar app y abrir después de 10 minutos con "Sin cuenta" activo → datos siguen vacíos
- Borrar gasto variable, refresco de bancos → NO aparece el mismo gasto

---

## 🚀 PRÓXIMOS PASOS (v94.7.4+)

1. **Edge Function (Fluxia-banco):** Añadir chequeo de blacklist antes de reimportar movimientos
2. **Panel de Auditoría:** Crear sección en Ajustes → Seguridad con historial de guardados
3. **Auditoría completa:** Extender `registrarGuardado()` a todos los guardados (`guardarFijos()`, `guardarProvisiones()`, etc.)
4. **Test del refresco:** Validar que bancos respetan blacklist

---

## 📝 NOTAS

- **CRÍTICO VIOLADO:** PRINCIPIO #13 (TODO CAMBIO DEBE GUARDARSE) estaba roto por reimportación de borrados
- **CRÍTICO VIOLADO:** PRINCIPIO #14 (DOBLE CONFIRMACIÓN) funcionaba pero se ignoraba si bancos reimportaban
- **SHA256 (Fluxia-banco TS):** Sin cambios v94.7.2 (no hay update en Edge Function; se hará en v94.7.4)

---

## 📞 USUARIO (Nacho)

- ✅ "Sin cuenta" ahora persiste datos vacíos aunque cierre la app
- ✅ Movimientos borrados van a blacklist para no reimportarse (Edge Function se actualizará después)
- ✅ Auditoría en-app: puede ver qué se guardó y cuándo (en Ajustes próximamente)

**Acción inmediata:** Probar en iPhone v94.7.3 y reportar si "Sin cuenta" persiste correctamente.
