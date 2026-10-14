# Fluxia Élite — integración cloud LAB

## Código incorporado
- `src/supabase-cloud-reader.mjs`: GET de `fluxia_datos` y `planrescate_v2`, autenticación validada contra `/auth/v1/user`, separación por UUID y RLS existente.
- `src/cloud-status-ui.mjs` y `www/src/`: control de lectura desde Ajustes; no muestra valores ni objetos personales, solo número de registros.
- `src/audit-parity-adapter.mjs`: traduce instantánea financiera, pero bloquea certificación por campos no representados.
- `.github/workflows/fluxia-elite-readonly-bridge.yml`: pruebas en rama.

## Pendiente, bloqueo explícito
- La aplicación no tiene proveedor de sesión real conectado. `window.fluxiaEliteSessionProvider` debe venir de un host autenticado seguro y entregar credenciales efímeras; nunca insertar tokens en HTML o repositorio.
- Sin sesión, el botón no lee datos y presenta estado no conectado.
- La vista principal permanece ficticia: NO sustituir importes sin mapear y conciliar el modelo contable original.
- Los tests de GitHub Actions no se consideran superados hasta comprobar un run verde.
- La lectura cloud NO equivale a certificación de paridad ni a sincronización bancaria.
- No promover esta rama a PWA estable, no activar escrituras, ni afirmar validación en iPhone.

## Siguiente paso verificable
1. Integrar la sesión autenticada en runtime con configuración publicable (sin secretos).
2. Probar dos usuarios reales autorizados, cierre de sesión y expiración.
3. Construir snapshot canónico con perfiles y fechas desde el HTML y la nube.
4. Ejecutar auditoría y revisar discrepancias antes de presentar saldos reales.
