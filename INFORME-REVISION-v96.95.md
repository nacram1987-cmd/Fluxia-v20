# Revisión v96.95-LAB

- Tarjetas principales con altura mínima de 176 px, padding, radio, borde y sombra comunes; cada módulo mantiene su acento.
- Financiación sale del menú, sus rutas antiguas van a Gastos fijos, y allí está «Añadir financiación».
- Se conservan datos, pagos, edición, cálculos y persistencia de financiación. Sin cambios en lógica financiera/cloud.
- Chart.js usa `defer` para descargar en paralelo sin bloquear el parseo HTML.

## Validaciones

- 151 bloques JavaScript inline pasan `node --check`.
- CSS parseado por tinycss2 sin errores; manifest válido.
- Entrada LAB y entrada heredada idénticas; ZIP verificado íntegro.
- Prueba visual tras completar GitHub Pages.
- Sin datos reales ni prueba física en iPhone.
