# Fluxia BETA v97.53-LAB — Cabecera compacta y respuesta inicial

## Objetivo
Resolver la captura de iPhone con logo, menú y campana apilados y mantener las optimizaciones de v97.52-LAB.

## Cambios
- Cabecera de una fila permanente mediante CSS de arranque y normalización DOM.
- Solo se recolocan nodos existentes; listeners y navegación originales intactos.
- Contenedores de estado bancario y nube alineados debajo del header.
- Métrica de primer gesto sin registrar datos privados: `FluxiaTiempos9753.report()`.
- Sin cambios en los motores de importes, persistencia, banco ni conciliación.

## Qué verificar en Safari iPhone
- [ ] La cabecera se muestra en UNA fila: ☰ Fluxia BETA 🔔.
- [ ] El menú responde al primer toque inmediatamente y se cierra normalmente.
- [ ] La cabecera no deja una caja blanca grande.
- [ ] Bancos y Nube salen en una misma línea.
- [ ] Los cuatro cuadros del dashboard siguen correctos.
- [ ] Gastos variables aparece sin retrasos bloqueantes.
- [ ] Dashboard y disponible no cambian por abrir la app.
- [ ] Desde PWA no reaparece versión anterior.
- [ ] No reaparecen movimientos descartados ni se duplican cargos.
- [ ] Al cambiar de cuenta, los datos quedan aislados.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/
ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/

**QA web/PWA en iPhone pendiente.** No afirmar mejora temporal hasta medir arranque real.
