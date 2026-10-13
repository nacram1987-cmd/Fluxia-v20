# Fluxia v97.69-LAB · Totales correctos y trazabilidad de gastos realizados

**Origen:** v97.68-LAB, que el usuario ha confirmado que percibe muy fluida. Canal PWA ESTABLE no se toca.

## Cambios
1. **Gastos Variables:** «Variables del mes · incluye cartera» continúa excluyendo Fijos y otros movimientos no contables. El indicador antiguo «Total del plan» se aclara como «Variables de todo el plan» y su cálculo deja de sumar transferencias, gastos fijos vinculados, retiradas de efectivo y registros excluidos.
2. **Dashboard:** añade una franja compacta «Gasto realizado · variables + fijos/cuotas pagados» con el importe conjunto. Desglosa fijos/cuotas pagados y compromisos pendientes; separa ejecución de previsión. No modifica Disponible ni sus reglas.
3. **Historial conjunto desplegable:** desde el Dashboard, sin crear otra pestaña. Solo al abrirlo reúne movimientos variables visibles y compromisos fijos/cuotas marcados como pagados; indica origen bancario o pago registrado. Los pendientes no se inventan como cargos bancarios; se reflejan en el resumen de pendientes.
4. **Sin duplicidades:** los cargos vinculados a Fijos no aparecen como Variables ni crean transacciones nuevas. El historial es 100 % derivado, solo de lectura. Paginación de presentación de 40 elementos cuando se abre.

## Límites y precauciones
- Total realizado **solo** comprende Variables + Fijos/cuotas marcados como pagados; no incluye aportaciones a huchas, repartos de Compartidos ni todas las clases de movimientos financieros. Su etiqueta debe interpretarse literalmente.
- Estado de «pagado» obedece al estado canónico de Fijos y cuotas, no a coincidencias heurísticas. Las diferencias entre importes programados y bancarios se muestran usando el movimiento vinculado prioritario igual que el cálculo de gastos fijos disponible.
- La app histórica mantiene fijos con estados por mes y pagos manuales; sin información bancaria de origen se muestra «Registrado como pagado», no se afirma verificación bancaria.
- No se modifica la sincronización bancaria, scripts bancarios, APIs, autenticación, nube, cálculos del saldo ni PWA.
- Las pruebas automatizadas son estructurales y sintéticas en JSDOM. No equivalen a pruebas bancarias reales ni a mediciones de Safari iOS.

## Calidad requerida
`node auditorias/qa-v97.66/verify-baseline.cjs`
`npm --prefix auditorias/qa-v97.66 test`
`node auditorias/qa-v97.69/regression-lab.cjs`
Ver `auditorias/REQUISITOS_VARIABLES_FIJOS_Y_RENDIMIENTO_2026-10-13.md`.

## Enlaces
LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.69.html
ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/
BASE de rendimiento anterior: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html
