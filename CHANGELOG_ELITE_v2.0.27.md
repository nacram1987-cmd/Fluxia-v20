# Fluxia Élite BETA v2.0.27-LAB · 16/10/2026

## Cambio funcional

La CLI privada de conciliación ahora bloquea la generación de informes cuando las evidencias no representan un mismo periodo y corte:

- El mes contable declarado en la exportación de nube debe coincidir con `--month`.
- `--cutoff`, `exported_at` de nube y, si se acepta, la fecha de la copia HTML deben incluir zona horaria y estar a no más de una hora entre sí.
- Una discrepancia detiene la CLI con un error claro antes de escribir informes. Antes solo se mostraba un aviso y el proceso podía continuar.
- La aplicación visual de Élite muestra v2.0.27. No cambia los cálculos ni la persistencia; no escribe a Supabase.

## Verificación

- `node lab/qa/elite-evidence-cut-guard-v2027.cjs`: 10/10.
- Suites completas v2.0.25 y v2.0.26: estado pendiente de ejecución en este paquete.
- Sin exports del usuario: conciliación real y Disponible real permanecen NO VERIFICADOS / PROVISIONALES.
- No hay commit remoto, Actions ni URL publicada verificada. El bundle recibido referencia un commit padre ausente y no puede convertirse en checkout conectado.

## Rollback

Para volver a v2.0.26, restaurar `lab/fluxia-elite-safari-datos-reales.html` y `lab/tools/elite-reconcile-cli.cjs` de la versión previa y retirar `lab/tools/elite-evidence-cut-guard.cjs` y su test. No hay migración ni escrituras financieras que revertir.
