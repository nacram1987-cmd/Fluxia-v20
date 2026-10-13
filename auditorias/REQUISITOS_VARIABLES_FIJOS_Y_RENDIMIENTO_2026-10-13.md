# Fluxia · Regla de integridad: totales y trazabilidad de gastos fijos en el historial
Fecha: 13/10/2026. Baseline de rendimiento a preservar: v97.68-LAB, sobre base congelada v97.66. **Documento de requisitos; no modifica el ejecutable.**

## Hallazgos comprobados en lab/v97.68.html
- La UI ya incluye `gvStatMes` («Variables del mes · incluye cartera») y `gvStatTotal` («Total del plan»). Ambos son actualizados por `renderGastosVariables()`.
- `esMovimientoVariable()` excluye los movimientos con `cuentaComoFijo` o `vinculoFijoId`. Por eso los cargos bancarios conciliados como fijo no aparecen en el listado de Variables aunque el registro permanezca en `movimientos`.
- `resumenMovimientosVariables()` calcula `totalPlan` sumando `movimientos` indiscriminadamente; incluye incluso cargos vinculados a Fijos, transferencias y registros excluidos. Su etiqueta y semántica deben corregirse mediante la misma política de filtrado empleada por los totales de Variables, sin tocar Disponible.
- `aplicarVinculo()` ya marca `cuentaComoFijo`, `vinculoFijoId`, asigna categoría «Fijo (banco)» y vincula el pago. `gastosFijosDisponibleTotal()` incorpora el importe del cargo vinculado y `variablesTotal()` lo excluye. Nunca duplicar este impacto.

## Regla UX y contable exigida
1. Mostrar de manera diferenciada: **Variables del mes**, **Fijos pagados del mes**, **Total de gastos realizados del mes** y, si procede, **Fijos pendientes**. No confundir total gastado con gasto comprometido o presupuestado.
2. En el historial, permitir consultar también cargos bancarios vinculados a Fijos, señalados con «📌 Fijo · Pagado» y la fecha real; si están pendientes, mostrar «Pendiente» únicamente en referencia al fijo programado, sin inventar una transacción bancaria. Las fuentes deben identificarse («Banco», «Marcado manualmente», «Pendiente»).
3. Los registros de movimiento existentes se reutilizan por ID bancario/ID canónico, nunca se duplican ni se crea un nuevo movimiento variable. Un registro fijo presentado en vista unificada se trata como **solo lectura** y deriva a Fijos para corregirlo, sin acciones de borrado/edición de Variables.
4. La vista de Variables conserva su subtotal y dashboard exactamente según `variablesTotal(mes)`; los fijos enlazados no inflan ese subtotal. El total «gastado» se deriva una sola vez de variables reales más pagos fijos efectivos, sin dobles contabilizaciones ni movimientos excluidos. Diferenciar pagos manuales de cargos bancarios confirmados.
5. Una conciliación confirmada actualiza el estado del Fijo desde el modelo canónico. No se declara pagado únicamente por coincidencia de nombre; si hay ambigüedad, revisión explícita. No resucitar avisos descartados ni movimientos archivados.
6. Aplicar correctamente la fecha contable y el mes del cargo, incluso en periodos anteriores. La navegación entre meses no debe modificar los registros ni su estado.
7. Mantener saldos de cada usuario aislados; no persistir vistas derivadas como movimientos nuevos ni sobrescribir registros de nube con resultados parciales.

## QA y antirregresión obligatorios, ANTES de nueva LAB
- Congelar snapshot base actual; preservar `baseline-v97.66-performance` y `lab/v97.68.html`. No tocar `index.html`/PWA ni promocionar sin validación.
- Comparar funciones contables críticas antes/después: `variablesTotal`, `gastosFijosDisponibleTotal`, `disponibleEfectivo`, persistencia, conciliación y reglas de pago.
- Escenario A: Variable 30 € + fijo pagado y vinculado 70 € → variables 30 €, pagados 70 €, total gastado 100 €, Disponible idéntico antes/después.
- Escenario B: fijo 70 € pendiente + variable 30 € → realizados 30 €, fijo pendiente 70 €, no crear cargo ficticio, Disponible sin cambios.
- Escenario C: cargo bancario vinculado 73 € a fijo previsto 70 € → fijo realizado 73 €, no doble conteo; diferencias de importes tratadas según las reglas vigentes.
- Escenario D: repetición de sincronización y cambio de usuario/mes → un solo cargo, sin mezcla, sin resurrecciones, saldo invariado.
- Probar registros históricos, archivo/papelera, múltiples cargos candidatos al mismo fijo, pagos manuales y correcciones de estado.
- Medir menús, pestañas, Variables, Bancos, arranque frío/caliente, firmas/renderizados y scripts bancarios contra v97.68 bajo las mismas condiciones; rechazo obligatorio si existe regresión reproducible. Ninguna cifra de iPhone será certificada sin ensayo real.
- Toda release debe incluir ZIP, enlaces LAB y ESTABLE, PROMPT MAESTRO actualizado, diff auditado, logs QA, métricas antes/después y riesgos abiertos.

**Estado:** requisitos definidos; aún no implementados ni verificados funcionalmente en una LAB nueva.
