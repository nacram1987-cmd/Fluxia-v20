# Fluxia v96.95-LAB

Versión de prueba con tarjetas principales coherentes y acceso a financiaciones integrado en Gastos fijos.

- Las tarjetas principales comparten altura base, espaciado, borde, radio y sombra; cada sección conserva su acento.
- Se elimina la pestaña independiente Financiación. Gastos fijos conserva resumen y cuotas e incluye «Añadir financiación».
- Las rutas heredadas redirigen a Gastos fijos. Se mantienen datos, cálculos, pagos y edición.
- Chart.js usa `defer` para descargar en paralelo sin bloquear el parseo inicial.
- ESTABLE v95.25 queda sin cambios.

## LAB

https://nacram1987-cmd.github.io/Fluxia-v20/index_fluxia_v96.95_LAB.html?v=v96.95-LAB

La primera apertura puede tardar unos minutos después de publicarse en GitHub Pages.

## Probar en local

Descomprime este ZIP, abre una terminal en esa carpeta y ejecuta `python3 -m http.server 8000`. Luego abre `http://localhost:8000/index_fluxia_v96.95_LAB.html`.

## Verificación

151 bloques JavaScript inline pasan `node --check`; CSS, manifest y ZIP son válidos. La comprobación visual en GitHub Pages se realiza tras el despliegue. No se usaron datos financieros reales ni se probó en iPhone físico.
