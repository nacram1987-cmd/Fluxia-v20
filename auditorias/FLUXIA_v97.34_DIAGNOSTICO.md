# Fluxia v97.34 — diagnóstico previo a implementación

## Evidencia inspeccionada en index.html de main
- `aplicarMovs` contiene una protección para movimientos bancarios existentes identificados por `bancoRef === m.id`, evitando reclasificación en reimportación.
- La misma ruta también procesa nuevos movimientos; si el proveedor devuelve otro ID para el mismo cargo, la protección por ID puede no bastar. Hipótesis pendiente de confirmar con trazas anonimizadas.
- `puentesConciliar()` se programa mediante `setTimeout(...,3300)` y recorre gastos/ingresos; merece perfilarse para descartar bloqueo en primera carga.
- El usuario informa primera entrada lenta en Bancos y Gastos Variables, y menú más lento en Variables; entradas posteriores mejoran.

## Correcciones que requieren implementación y prueba
1. Clave estable de movimiento por usuario, cuenta, ID de proveedor; fallback compuesto sólo si es inequívoco.
2. Persistencia nube de rechazo definitivo de asociación a lotería, sin suprimir el gasto normal de 14,99 €.
3. No disparar de nuevo pregunta cuando exista decisión o gasto reconciliado; no crear duplicados.
4. Perfilar primera carga con Performance API; aplazar trabajo no crítico sin modificar cálculos ni datos.
5. Preservar Disponible e Imprimir. Verificar menú y sincronización bancaria en Safari y PWA.

**Estado**: diagnóstico; no implementado ni publicado. No promover a main sin pruebas.