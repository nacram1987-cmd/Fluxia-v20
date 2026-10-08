# Auditoría Fluxia v97.33 LAB — 2026-10-08

## Base protegida
v97.32 funciona fluidamente según prueba en iPhone. No modificar main hasta QA y aprobación. Preservar integridad financiera, separación usuarios, persistencia nube y rendimiento.

## Hallazgos verificables
- sw.js de main usa CACHE_VERSION='fluxia-shell-v97.20'; navegación cache-first con actualización diferida. Posible fuente de shell obsoleto.
- README.md aún describe v97.31.
- Capturas del usuario muestran etiqueta v97.28 LAB en pie y v97.32 en menú.
- Captura de bancos muestra modal con gran zona vacía y estado de sincronización pendiente.
- Disponible visible 223,59 EUR; no hay evidencia suficiente para confirmar inclusión de pensión.

## Criterios de aceptación
1. Único identificador de versión visible, derivado de una constante; no overlays heredados.
2. Pensión pendiente no computa en Disponible. Auditar con datos contables reales sin modificar registros históricos.
3. Sincronización bancaria no bloquea UI; timeout y errores recuperables; movimientos idempotentes; no duplicados.
4. Modal bancos sin scroll involuntario ni zona vacía; iOS Safari y PWA.
5. PWA carga release correcta sin reinstalación; actualización SW coordinada sin servir index obsoleto.
6. Comparación visual y pruebas de rendimiento contra v97.32.
7. No publicar en main ni etiquetar estable hasta verificar QA.

## Restricción técnica
El conector GitHub devolvió index.html con contenido vacío (aunque SHA presente), por lo que no es seguro editar ni afirmar que se ha reparado la lógica de la app. Ningún cambio de producción se ha aplicado.
