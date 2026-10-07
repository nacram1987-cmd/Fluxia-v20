# Fluxia v96.94-LAB

Versión de prueba con el ajuste solicitado en Gastos fijos.

- El resumen inicial ahora comparte el tratamiento visual del bloque destacado de Gastos variables.
- Las tarjetas de gastos fijos y financiación aumentan ligeramente de tamaño y tienen más separación.
- Se conserva la lógica y los datos de la versión base.
- Se mantiene la referencia estable histórica v95.25.

## Probar

Abre la [versión LAB](https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v96.94_LAB.html?v=v96.94-LAB). El paquete incluye HTML, hoja de estilos, manifest, service worker, iconos de marcas y el prompt maestro.

## Revisión del informe de Cloud

El informe indica que su lectura de v96.93 fue estática y que las mediciones de arquitectura, memoria y persistencia proceden de v95.2.3; tampoco verificó Supabase ni el JavaScript actual. Sus recomendaciones de IndexedDB, sincronización por elemento, deduplicación bancaria de servidor, RLS y borrado de cuenta requieren una auditoría funcional separada. No se aplicaron en este cambio visual.

## Verificación

Validación sintáctica de 151 scripts inline, CSS y manifest; smoke test en la URL publicada confirmó título v96.94 y estilos cargados (resumen: 16 px de padding y radio de 18 px). No se introdujeron datos financieros para probar las tarjetas. Sin operaciones bancarias ni prueba en iPhone físico.
