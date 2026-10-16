# Fluxia Élite BETA v2.0.54 — Huchas e interacción, Variables como el HTML original

**Huchas**
- Cada hucha aparece **una sola vez**: la lista «Planes vigentes» que repetía los nombres bajo las tarjetas ya no se muestra. Siguen visibles los planes sin vigencia fechada.
- **Tocar la tarjeta abre su detalle** (también con teclado). El resumen financiero que antes colgaba de cada nombre (estado, saldo al cierre, pendiente de devolver) vive ahora en ese detalle, con aportaciones e historial.
- Las **aportaciones del mes** se despliegan en la propia tarjeta («2 aportaciones en octubre»), como en el HTML.
- Los paneles de auditoría (comparación de fuentes, libro reconstruido, aportado bruto, usos, reposiciones, saldos) pasan a un bloque plegado «🛡️ Auditoría de huchas». No se elimina ninguno.

**Variables**
- Resumen «Gastado en <mes>» con el total neto y el número de gastos (la misma cifra que ya mostraba la pestaña).
- Filas como el HTML: logo, concepto, `dd/mm · categoría · origen` e importe con signo (gasto en rojo con «−», devolución en verde con «+», fijo vinculado como referencia con la etiqueta «Fijo»). Toda la fila abre el detalle. La etiqueta de evidencia pasa al detalle.

**Inicio:** las filas de «Así sale tu Disponible» llevan a Ingresos, Huchas o Compartidos; la de gastos baja a «Gastos por pestaña».

**Solo presentación:** no cambia la fórmula, el Disponible, aportaciones, rescates, saldos ni datos, y no escribe en la nube.
**Dónde probar:** pestañas Huchas y Variables, y Inicio.
**Pruebas:** `lab/qa/elite-hucha-variables-interaction-v2054.cjs`; las de v2.0.50/52/53 se adaptan conservando todas sus comprobaciones de cifras.
**Rollback:** v2.0.53 en `lab/versions/fluxia-elite-safari-v2.0.53.html`.
**Limitación honesta:** Élite sigue sin escribir datos (aportar, usar, borrar, editar contra la nube) hasta validar las reglas contables; la edición de prueba del detalle no guarda nada.
