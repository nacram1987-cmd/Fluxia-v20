# v94.49-LAB · Sin cuenta de verdad + 2/3/6

## Sin cuenta (crítico)
**Causa:** `fxConfirmar` abría el modal de Fluxia **detrás** del onboarding (z-index 50k vs modal más bajo) → en iPhone parecía que el botón no hacía nada.

**Solución:** `window.confirm()` nativo del sistema (siempre encima) → plan a 0 + cierra wizard.

## 2 · Gastos variables
Bloque al final: «Gastos del banco descartados» con **Recuperar solo este**.

## 3 · Onboarding 5 min
- Sin cuenta → ya dentro a cero  
- O email+pass en el paso 0  

## 6 · QA
`FluxiaQA_v49.run()` en consola.

## ESTABLE
Sigue v94.46 hasta que valides Sin cuenta en iPhone.
