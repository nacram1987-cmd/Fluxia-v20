# Fluxia BETA v94.14-LAB

## Causa de que volvieran los cargos borrados
Se llamaba a `FluxiaGVBorrados.debeIgnorarBanco()` pero **el módulo no existía**.
La blacklist parcial por id no bastaba cuando el banco devolvía otro id.

## Solución v94.14
1. **FluxiaGVBorrados real** (única fuente de verdad)
2. Al borrar: guarda id, bancoRef, fecha+importe+concepto normalizado, huella
3. Al recibir del banco: filtra en `call()` y **primera línea** de `aplicarMovs`
4. Al arrancar: purga de localStorage los que ya estaban vetados
5. HUB046: sigue como en v94.13 (límite diario ≠ reconectar)

## Cómo validar
1. Borra un cargo del banco en Gastos variables
2. Sincroniza 2–3 veces / espera sync automática
3. No debe reaparecer
4. Si algo viejo había vuelto: al cargar v94.14 se purga solo
