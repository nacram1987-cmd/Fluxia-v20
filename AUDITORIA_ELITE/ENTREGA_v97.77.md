# Fluxia HTML LAB v97.77 — reglas de clasificación bancaria

**Archivo:** `lab/v97.77.html` (LAB). Parte de `lab/v97.73.html` (la LAB más reciente, con la identidad bancaria `fxbank9770` que ya usan tus datos). **No toca `index.html` (estable) ni la v97.73.**

## Problema
Al responder «Puente» o «Traspaso» a una pregunta del banco, la regla se guardaba para **entradas y salidas**. Marcar como puente una entrada de «Ana María Sánchez» silenciaba también cualquier pago a «Ana María». Además no había forma de ver ni quitar esas reglas, y una regla posterior más corta no podía vencer a otra más larga ya guardada.

## Cambios (solo `lab/v97.77.html`, +24/−3 líneas respecto a v97.73)
1. **Puente por dirección:** una regla «puente» nueva recuerda si nació de una entrada o de una salida. «Traspaso propio» sigue valiendo en ambas direcciones (los dos lados de un traspaso propio deben seguir sin contar). «Cuenta» (real) no cambia.
2. **Una regla nueva sustituye a la anterior** con las mismas palabras (`sup:true`; gana la de fecha más nueva) y existe «olvidar» para quitarla. Sustituir en lugar de borrar es necesario porque al abrir la app el móvil y la nube **se fusionan por unión de listas**: un borrado simple resucitaría. Las reglas antiguas no se tocan ni se reescriben.
3. **Pantalla nueva** en Ajustes → Bancos: «🌉 N reglas de clasificación · Gestionar». Lista cada regla con su tipo y dirección y permite «Pasar a solo entradas / solo salidas / entradas y salidas» y «Quitar regla».
4. `window.FluxiaCls` expone `regla`, `reglas`, `guardarReglas`, `reglasEfectivas`, `resolver`, `refrescar` (la pantalla los necesita; la lógica vive dentro de una función cerrada).

## Qué no cambia
Contabilidad, Disponible, conciliación, identidad bancaria, nube, autenticación y rendimiento. Sin reglas nuevas el comportamiento es **idéntico** a v97.73 (prueba de paridad con las reglas reales).

## Datos (opción 2)
Se añade a la nube la regla `{ana maría sánchez, puente, solo entradas, sup:true}`. En el HTML actual es inerte (no entiende `sup`); en la v97.77 hace que los pagos a Ana María dejen de descartarse: <20 € cuentan solos y ≥20 € te preguntan; las entradas de Ana María siguen siendo puente. Copia previa en `backup:pre-regla-ana-…`.

## Pruebas
`lab/qa/cls-rules-v9777.cjs` (lógica real extraída del HTML, paridad con v97.73, sustitución, olvidar, convivencia de reglas, dirección al crear) y `lab/qa/cls-rules-browser-v9777.cjs` (página completa en JSDOM: abrir la pantalla, limitar a «solo entradas», quitar, datos conservados, sin errores de JavaScript). Además: verificación v97.66 y su suite.

## Cómo probar (iPhone)
Abre `/Fluxia-v20/lab/v97.77.html` → Ajustes → Bancos → «Gestionar» reglas. Verás «Ana Maria Sanchez · Puente · solo entradas». Un nuevo pago a Ana María ya debe aparecer en Variables.
**Aviso:** LAB y producción comparten el almacenamiento del navegador en `github.io`. La v97.77 lee y escribe los mismos datos.

## Rollback
No usar `lab/v97.77.html`; volver a `lab/v97.73.html`. Para deshacer la regla de datos: restaurar `backup:pre-regla-ana-…` o «Pasar a entradas y salidas» en la pantalla.

## Promoción
Solo con tu orden exacta «con labora» y tras probarla. Esta entrega no la solicita.
