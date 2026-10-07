# Fluxia v96.93-LAB

Prueba visual basada en v96.92, preservada la lógica financiera de esa base.

- Cabecera: 53 px en viewport 390 px; símbolo 28 px; menú/campana 38 px.
- Fijos compactos: aproximadamente 107 px por tarjeta de muestra. Pendiente azul, pagado oro, mismo lenguaje de Huchas.
- Una familia tipográfica principal; resumen y controles compactos.
- Resolver compartido para Variables, Fijos y Financiaciones; activos locales y respaldo semántico.
- Retirado el observador global de logos que se realimentaba con sus propios cambios.
- Bancos: primer render con conexiones del perfil; LOADING, CONNECTED, EMPTY y ERROR separados. El formulario no se muestra antes de confirmar vacío. Opciones técnicas plegadas.

## Probar

Abrir el enlace LAB en Safari. No es necesario crear otra instalación para esta prueba. La migración de la entrada PWA permanente sigue pendiente; no se ha sustituido index.html ni la referencia estable.

El ZIP contiene todos los archivos de esta LAB. Si se sube manualmente a GitHub, mantener sus rutas. Ya se publica en main mediante archivos nuevos; no sustituir index.html.

## Límites reales

Se han probado sintaxis, estado visual con respuestas simuladas y tamaños 375/390/430. No se han hecho pagos ni alterado datos de cuentas reales. No equivale a prueba física en iPhone ni a certificación financiera completa.

Servidor observado: cron activo a las 05,11,17,23 UTC. No se ha identificado un receptor webhook ni envío push en la función bancaria examinada. Bank Live inmediato, notificación única de extremo a extremo y actualización permanente de PWA requieren trabajo funcional separado, sujeto al bloqueo del prompt. Esta entrega no declara esos puntos resueltos.
