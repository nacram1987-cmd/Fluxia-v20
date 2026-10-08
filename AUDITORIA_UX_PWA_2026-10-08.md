# Fluxia — auditoría UX/PWA 08-10-2026

Rama aislada de LAB. No modificar producción ni datos financieros.

## Hallazgos comprobados
- manifest.webmanifest: start_url ./index.html y scope ./ (correctos para la raíz).
- fluxia-sw.js: CACHE_VERSION fluxia-shell-v97.20, navegación con caché y carrera de red de 450 ms.
- El repositorio conserva numerosos SW y HTML históricos. Su presencia no prueba registros activos.
- README v97.16 declara index.html como entrada LAB canónica; el SW principal ya indica v97.20. Verificar versión realmente servida antes de editar.

## Pruebas obligatorias antes de cambios
1. Verificar registro activo, scope, manifest efectivo y respuesta HTTP de index.html en Safari y PWA.
2. Probar actualización con PWA abierta, cerrada, conexión lenta y sin conexión; no eliminar datos locales.
3. Verificar que no hay rehidratación que pise nube ni sesión cruzada.
4. Inspeccionar alineación de selector de meses y densidad de todas las pestañas en iPhone.
5. Verificar integridad de ingresos, gastos, huchas, compartidos y Disponible antes/después.
6. No promover a estable ni publicar nueva versión sin QA y ZIP completo.

## Diseño objetivo
- Encabezado y selector mensual alineados; tokens uniformes de espaciado, tipografía y radio.
- Disponible protagonista; tarjetas compactas y legibles; financiaciones dentro de fijos.
- Bancos/nube compactos con estados verídicos; iconos semánticos.
- Evitar rediseño disruptivo y cambios contables.

Estado: auditoría inicial; corrección PWA y QA funcional aún pendientes.

## Hallazgo de integración verificado en index.html principal
Lectura completa del HTML mediante GitHub: 2.241.056 caracteres. Existe registro canónico `navigator.serviceWorker.register('./fluxia-sw.js', {scope:'./',updateViaCache:'none'})` pero también aparecen registros `navigator.serviceWorker.register(URL.createObjectURL(blob))`, `navigator.serviceWorker.register(swUrl,{scope:'/'})` y `navigator.serviceWorker.register(url,{scope:'./'})` en bloques históricos. Algunos pueden estar inactivos por condiciones; hay que verificar control de flujo antes de retirarlos. NO basta con modificar fluxia-sw.js. Próxima intervención: neutralizar solo los registros activos redundantes tras análisis de bloques completos, preservar notificaciones y sincronización.
