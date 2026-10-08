# Fluxia v97.32 · FINAL

Versión final preparada sobre la rama oficial de GitHub Pages, conservando el `index.html` v97.31 que ya se había publicado y corrigiendo el arranque del menú/PWA.

## Cambios
- Menú original abre y cierra mediante una sola ruta.
- La X y el fondo cierran el menú; el cierre limpia todos los estados incluso si estaban desincronizados.
- El menú inicia cerrado al entrar y al volver desde segundo plano.
- Eliminadas las reparaciones duplicadas del menú, el observador del encabezado y la desregistración/recarga forzada del service worker.
- Actualizados la versión visible, el manifiesto y el caché del service worker.
- Sin cambios en datos, cuentas, nube ni cálculos financieros.

## Publicación
Entrada: https://nacram1987-cmd.github.io/Fluxia-v20/
Rama oficial de Pages: `pages-v9731-real-final` (se conserva como rama de publicación).

En iPhone: abrir el enlace en Safari. La PWA instalada mantiene su identidad y recibe la nueva versión por el service worker.

## Verificación pendiente de dispositivo
El paquete y la rama se validan desde el entorno de build. El último toque real en Safari/iPhone debe confirmar que el menú aparece cerrado y que la X lo cierra.
