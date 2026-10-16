# Informe de pruebas · v2.0.28-LAB

## Pruebas añadidas/actualizadas

La suite `lab/qa/elite-reconciliation-v2025.cjs` cubre:
- Rescate temporal de hucha sin incremento del Disponible.
- Trazabilidad del saldo pendiente en el reporte, sin impacto contable.
- Reposición parcial y total sin modificar Disponible.
- Rescate parcial/total sin ingreso ficticio.
- Uso definitivo e impacto histórico según periodo.
- Pensión pendiente excluida por el motor del HTML.

## Estado al preparar el commit

Las pruebas locales se ejecutarán tras dejar el cambio en el repositorio conectado. Las fixtures son sintéticas; no equivalen a conciliación real. No se alteran datos de Supabase ni el HTML estable. Pages/URL no se consideran publicados hasta que la acción de GitHub complete y la URL sirva v2.0.28.
