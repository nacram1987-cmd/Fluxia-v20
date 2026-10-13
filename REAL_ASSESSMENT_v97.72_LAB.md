# Valoración crítica — v97.72-LAB

**Estado:** pendiente de ejecución de workflow en el commit de publicación. No se certifica desde esta ficha una prueba iPhone o banco reales.

- **Incidencia reproducida:** v97.71 oculta las propuestas por importe (2,99 € de Apple.com/bill) antes de mostrarlas y bloquea reexamen de transacciones solo marcadas técnicamente «revisadas».
- **Alcance candidato:** propuesta conservada si un único fijo pendiente coincide por mes e importe, reexamen restringido sin ignorar rechazos, confirmación vía estado contable autoritativo. Solo bloque bancario/fijos alterado; fórmulas no tocadas.
- **QA exigido:** compilación de 168 scripts, regresión de 97.66–97.71, casos de fijo visible/confirmado, ambigüedad, rechazo «Nunca más», benchmark comparativo 10 rondas y smoke de bytes HTTP de Pages. Cualquier fallo impide aprobación.
- **Riesgos abiertos:** conciliación con fijo previamente pagado a mano; cuenta bancaria real/PSD2; Safari/PWA física; duplicados históricos Valkiria sin ID de proveedor. No afirmar que el libro real está reparado.
- **Rollback:** v97.71 LAB o v97.68 rápida; ESTABLE permanece sin modificar.
