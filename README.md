# Fluxia v97.31-LAB · MENÚ ORIGINAL CORREGIDO

Recuperación de v97.31 con el botón canónico `#btnMenu` restaurado en la cabecera.

## Cambios
- Reubica el botón original en la cuadrícula del encabezado en Safari y PWA.
- Mantiene una única ruta de apertura del menú y conserva el manejador rápido existente.
- Retira los observadores de página completa que volvían a escribir clases/estilos y podían entrar en un ciclo de mutaciones, ralentizando la interfaz e impidiendo estabilizar el menú.
- Conserva el manifiesto «Fluxia BETA», su identidad de instalación y el service worker con nueva clave de caché para actualizar el index.
- No toca movimientos, importes, Disponible, huchas, gastos, ingresos ni sincronización financiera.

## Publicar
Sube a la raíz LAB: `index.html`, `manifest.webmanifest`, `fluxia-sw.js` y `fluxia-icon.png`.
En iPhone: abrir la puerta LAB en Safari → Compartir → Añadir a pantalla de inicio.
