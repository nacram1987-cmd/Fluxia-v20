# Fluxia Élite BETA v2.0.52 — Inicio: «Así sale tu Disponible»

**Qué se añade:** tarjeta en Inicio, justo debajo del Disponible y de la barra de fuente, con las partes de la fórmula: ingresos (+), fijos/financiación/variables reales (−), provisiones previstas (−), exceso de aportaciones (− solo si no es cero) y Compartidos (±), con barras proporcionales a los ingresos y el Disponible al final.
**Comprobación visible:** la tarjeta suma las partes en céntimos enteros (BigInt) y muestra «✓ coincide al céntimo» o un aviso si no cuadra. Sin cálculo válido no aparece (nunca una cifra inventada). Los rescates temporales no figuran porque no suman.
**Solo presentación:** no cambia la fórmula (`fluxia-elite-financial-engine-v1.js` intacto), el Disponible, la nube, los bancos ni ningún dato. No escribe nada.
**Dónde probar:** Inicio, debajo de la cabecera «Disponible»; cambia de mes con el selector y comprueba que la suma coincide con la cifra grande (octubre 2026: −254,69 €).
**Prueba:** `lab/qa/elite-home-breakdown-v2052.cjs` (función real extraída del HTML; casos con y sin exceso, suma incoherente y sin cálculo).
**Rollback:** v2.0.51 en `lab/versions/fluxia-elite-safari-v2.0.51.html`.
**Pendiente (no incluido):** lista de variables, Huchas y aspecto general (se ofrecen como siguientes pasos).
