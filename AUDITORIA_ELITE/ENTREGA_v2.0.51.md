# Fluxia Élite BETA v2.0.51 — Bancos: falsos conflictos de identidad

**Síntoma:** el preflight bancario mostraba «conflictos 116» y «duplicados 0», aunque los cargos ya estaban contabilizados.

**Causa (reproducida con la exportación real, solo lectura):** `same()` del adaptador comparaba el importe con signo (el libro guarda el gasto en positivo, el banco lo envía en negativo), el concepto literal y el rol/vínculo a fijo. Los 116 casos coinciden en referencia bancaria, fecha e importe absoluto; 74 solo difieren en mayúsculas/signo y 42 en concepto editado por el usuario.

**Cambio:** identidad = referencia bancaria estable + fecha + importe en valor absoluto. Importe o fecha distintos siguen siendo conflicto real.
**Resultado con datos reales:** 176 nuevas · 116 ya existentes · 0 conflictos · 0 inválidos. No se escribe nada y el Disponible no cambia.
**Prueba:** `lab/qa/elite-bank-sign-convention-v2051.cjs` (+ suite existente, incl. importe distinto = conflicto).
**Rollback:** v2.0.50 en `lab/versions/fluxia-elite-safari-v2.0.50.html`.
