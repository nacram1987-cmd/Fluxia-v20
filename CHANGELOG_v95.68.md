# Fluxia v95.68-LAB

## Corrección crítica de recuperación cloud
- Corregido el error mostrado en Safari: `FluxiaNube.sb is not a function`.
- La API pública de `FluxiaNube` exporta el cliente Supabase como `cliente`, no como `sb`.
- El flujo de recuperación usa ahora `await FluxiaNube.cliente()` para obtener la sesión autenticada y consultar exclusivamente `fluxia_datos` bajo RLS.
- Se mantiene el bloqueo del onboarding/tutorial durante recovery.
- No se modifica ni sobrescribe la v95.39 ESTABLE.
