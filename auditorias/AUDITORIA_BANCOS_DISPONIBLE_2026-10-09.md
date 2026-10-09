# Auditoría bancaria — 9 octubre 2026

## Incidencia reproducible por inspección
En `index.html`, `FluxiaSalud.limpiarDuplicadosBancoRef` se invoca automáticamente después de sincronizar. Agrupa por `bancoRef` y elige el registro con mayor puntuación por división/categoría/estado. **No compara importe, fecha, mes, tipo ni efecto contable.** Posteriormente llama a `guardarMovimientos()` y `renderKPIs()`. El aviso `duplicado(s) fusionados` procede de esta ruta.

## Invariantes de aceptación
1. Dos operaciones con el mismo `bancoRef` pero distinto importe, fecha, tipo, usuario o cuenta NO se fusionan automáticamente; se marcan como conflicto.
2. Solo fusionar equivalentes verificados y mantener la versión contable canónica. No convertir gasto pagado en pendiente ni perder división/categoría.
3. Guardar auditoría previa con IDs, importe, fecha, referencia, motivo, huella y resultado, evitando datos personales innecesarios.
4. Una sincronización repetida sin novedades no modifica movimientos ni Disponible.
5. Una transferencia CaixaBank ↔ Revolut no genera ingresos/gastos externos dobles.
6. No borrar ni reescribir registros financieros en producción durante el diagnóstico.
7. Comparar Disponible antes/después de deduplicación; cualquier diferencia debe detener la operación y registrar conflicto.
8. Probar perfiles independientes y sincronización sin conexión.

## Causa y alcance
La función que muestra el aviso está localizada; **todavía no está demostrado que sea la única causa del descuadre**. La Edge Function bancaria devuelve movimientos y no calcula el Disponible. Revisar el flujo consumidor del frontend y el cálculo de KPIs antes de publicar.

## Publicación
No fusionar esta rama a main hasta contar con pruebas automatizadas, verificación de persistencia y comparación contable con copia aislada de datos. Mantener estable intacta.
