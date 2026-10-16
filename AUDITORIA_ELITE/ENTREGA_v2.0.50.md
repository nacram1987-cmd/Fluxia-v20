# Fluxia Élite BETA v2.0.50 — Huchas: provisiones reales del mes

**Problema:** la pestaña Huchas mostraba el histórico total (saldos, aportaciones de todos los meses) pero no un resumen de las provisiones reales del mes.

**Cambio (solo presentación):** nuevo bloque «Provisiones reales · mes» encima del histórico, con previsto / aportado / pendiente por hucha vigente y total, más el exceso sobre lo previsto. Si alguna hucha no tiene plan o aportaciones fechadas verificables, no se suma el total.

**Sin cambios:** fórmula del Disponible, datos, Supabase, conciliación bancaria, HTML estable y PWA.
**Prueba:** `lab/qa/elite-hucha-month-provisions-v2050.cjs`.
**Rollback:** v2.0.49 en `lab/versions/fluxia-elite-safari-v2.0.49.html`.

Dato de Supabase (solo lectura) al 16/10: vínculo de rescate del 01/09 (240,48 €) añadido en `fluxia_rescue_links` con confirmación del usuario; se deshace borrando esa fila.
