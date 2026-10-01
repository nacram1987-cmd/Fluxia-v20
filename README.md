# Fluxia BETA v94.7-LAB · Changelog

## ✅ Qué se ha arreglado en v94.7

### 🔴 CRÍTICO: Botón "Sin cuenta" funciona correctamente
- **Problema v94.6:** El botón "Sin cuenta" no hacía nada; el usuario veía los datos previos aunque clickease "sin cuenta".
- **Solución v94.7:** Nueva función `resetearTodoParaSinCuenta()` que:
  - Vacía TODOS los arrays de datos (ingresos, gastos, movimientos, etc.)
  - Guarda arrays vacíos en localStorage
  - Pone un flag en sessionStorage para evitar recargas accidentales
  - Se llama automáticamente cuando se clickea "Sin cuenta"

### 🔒 Flag de sesión para "Sin cuenta"
- Se utiliza `sessionStorage` en lugar de `localStorage`, lo que significa que:
  - Si el usuario selecciona "Sin cuenta" y cierra la app, al reabrirla se cargará normalmente (sin el flag)
  - Durante la misma sesión, los datos se mantienen limpios

### 🧪 Modificación de `cargarTodo()`
- Ahora verifica el flag de "sin cuenta" **ANTES** de cargar cualquier dato de localStorage
- Si está activo el flag, inicializa todo a arrays vacíos y sale
- Esto garantiza que no haya fugas de datos previos

---

## 📋 Cambios técnicos

### Nueva función en index.html (después de `cargarTodo()`):
```javascript
function resetearTodoParaSinCuenta(){
  // Vacía todos los arrays
  ingresosItems = [];
  gastosFijosItems = [];
  financiaciones = [];
  // ... etc
}
```

### Modificación de `skipPlan()` (línea ~2761):
Se llama `resetearTodoParaSinCuenta()` al clickear "Sin cuenta"

### Modificación de `cargarTodo()` (línea ~6316):
Chequea sessionStorage al inicio

---

## ✅ Pendiente a resolver (v94.8+)

1. **Huchas/disponible (NEUTRAL):** Pendiente implementar lógica de rescate + reposición
2. **Movimiento de tarjeta (15€):** Agregar detalles (banco, fecha)
3. **CaixaBank sin diagnóstico:** Edge Function debe retornar estado
4. **Ingresos futuros:** No contar hasta fecha de cobro real

---

## 🚀 Instalación

1. Descarga `fluxia_v94.7_LAB.zip`
2. Extrae y reemplaza archivos
3. Abre https://tu-dominio/index.html?v=v94.7-LAB

---

**v94.7-LAB** · 2026-10-01 18:45 UTC
