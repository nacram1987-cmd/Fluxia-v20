# Fluxia v94.0-LAB

**Estado:** LAB (pruebas) · **Base:** v93.10-LAB (estable verificada)
**Servidor:** `Fluxia-banco-index.ts` = SIN CAMBIOS respecto a la versión ya desplegada (74/74 tests). No hace falta volver a desplegarlo.

## Cambios en v94.0

1. **Ingresos automáticos en todas las cuentas** (CaixaBank, Revolut…)
   - Se importan los ingresos desde el día 1 del mes anterior hasta hoy (antes: solo desde el primer día de uso y los ya vistos al conectar quedaban descartados).
   - Si ya lo habías apuntado (mismo mes, mismo importe) se enlaza; no se duplica.
   - Traspasos entre tus cuentas y recargas (top-up) NO cuentan como ingreso.
   - Un ingreso que borres no vuelve a aparecer.
2. **Gastos variables ↔ fijos**
   - Mismo importe que un fijo del mes y sin pista por nombre → pregunta: «Es el fijo» / «Es otro gasto» / «Duplicado».
   - Si el fijo ya estaba pagado solo ofrece «Otro gasto» / «Duplicado».
   - Si el nombre y el importe encajan, sigue enlazando solo.
3. Cola de preguntas: conserva las 30 más nuevas (antes descartaba las nuevas).

## Archivos
index_fluxia_v94.0_LAB.html (subir a GitHub como `index.html`), manifest.webmanifest, fluxia-sw.js, fluxia-canal.json, fluxia-icon-*.png, fluxia-icon.svg, Fluxia-banco-index.ts (referencia, sin cambios).
