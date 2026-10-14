# Auditoría real Supabase — 2026-10-14

Estado: comprobación de metadatos mediante conector Supabase; **sin lecturas de valores financieros, sin escrituras ni migraciones**.

## Proyecto
- Fluxia, proyecto `kylduzmrfbubeamfrbbr`, estado ACTIVE_HEALTHY, región eu-west-2.
- `public.fluxia_datos`: `user_id uuid`, `clave text`, `v text`, `t bigint`, `updated_at timestamptz`.
- `public.planrescate_v2`: `id uuid`, `user_id uuid`, `clave text`, `v jsonb`, `t bigint`, `created_at timestamptz`, `updated_at timestamptz`.
- El lector `src/supabase-cloud-reader.mjs` solicita columnas existentes, pero **no demuestra** que seleccione claves canónicas ni que represente todos los módulos.

## Alertas actuales del advisor de seguridad
- Siete tablas RLS activado sin políticas: `accesos`, `banco_bandeja`, `conexiones_banco`, `eb_conexion`, `eb_conexiones`, `fluxia_banco_acceso`, `movimientos`. Determinar si son tablas deliberadamente cerradas antes de añadir políticas.
- Dos funciones con search_path mutable: `calcular_gasto_categoria`, `generar_codigo_invitacion`.
- Extensión `pg_net` en public.
- `accept_invitation(token_input text, usuario_id uuid)` SECURITY DEFINER ejecutable por authenticated: revisar lógica y autorización antes de modificar privilegios.
- Protección de contraseñas filtradas desactivada.

## Bloqueos de producción
1. Falta proveedor de sesión real autenticada para Élite.
2. Falta mapear el documento clave/valor a un snapshot canónico completo (incluye efectivo, fijos pagados, compartidos, histórico y movimientos retroactivos).
3. Faltan pruebas reales de RLS con dos usuarios y validación del comportamiento al cerrar sesión.
4. La vista principal aún es sintética: no exponerla como datos reales.
5. No se han ejecutado en esta auditoría pruebas automatizadas ni despliegues.

## Decisión
Mantener lectura financiera de Élite bloqueada para presentación de saldos hasta paridad demostrada; conservar HTML/PWA ESTABLE sin cambios. La auditoría de advisor detecta alertas, **no certifica explotación ni implica aplicar políticas permisivas**.

Referencias: https://supabase.com/docs/guides/database/postgres/row-level-security y https://supabase.com/docs/guides/database/database-linter.
