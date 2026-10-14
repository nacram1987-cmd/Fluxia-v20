# Auditoría viva Supabase y rendimiento · Fluxia Élite

Fecha: 2026-10-15 · proyecto: `kylduzmrfbubeamfrbbr` · región: `eu-west-2`  
Rama: `pages-v9731-real-final` · entrega: v1.9.75

## Estado observado

- Supabase `ACTIVE_HEALTHY`, PostgreSQL 17.6.
- `public.fluxia_datos` tiene RLS activo, clave primaria `(user_id, clave)` y 763 filas.
- Las tablas expuestas consultadas tienen RLS activo.
- La aplicación Élite utiliza una clave publicable; no se ha expuesto `service_role`.
- No se han escrito, migrado, borrado ni normalizado datos financieros reales durante esta auditoría.

## Bloqueos de seguridad que impiden certificar

Los advisors de Supabase detectaron:

1. Siete tablas con RLS activo pero sin políticas: `accesos`, `banco_bandeja`, `conexiones_banco`, `eb_conexion`, `eb_conexiones`, `fluxia_banco_acceso` y `movimientos`.
2. `public.accept_invitation(token_input text, usuario_id uuid)` es `SECURITY DEFINER` y ejecutable por `authenticated`; requiere revisión de privilegios y de si debe seguir expuesta.
3. `public.calcular_gasto_categoria` y `public.generar_codigo_invitacion` tienen `search_path` mutable.
4. Protección de contraseñas filtradas desactivada.
5. Políticas permisivas duplicadas en varias tablas, especialmente sesiones bancarias, contactos y suscripciones push.
6. Advisors de rendimiento: reevaluación por fila de `auth.uid()` en políticas, dos claves foráneas sin índice y varios índices duplicados/no usados.

## Decisión aplicada

No se aplican cambios automáticos: falta copia/rollback y validación del modelo real de acceso bancario, familiar e invitaciones. La v1.9.75 incorpora un certificado del Disponible que permanece bloqueado hasta disponer de HTML del mismo perfil/corte, comparador sin diferencias críticas, fuente bancaria conciliada y motor contable certificado.

## Siguiente migración segura

Preparar en rama de desarrollo una migración reversible con:

- políticas explícitas `TO authenticated` y propiedad mediante `(select auth.uid())`;
- `USING` y `WITH CHECK` separados para operaciones de escritura;
- consolidación de políticas duplicadas, sin ampliar acceso;
- revisión de `accept_invitation` y revocación de `EXECUTE` si no es imprescindible;
- `SET search_path` fijo en funciones;
- índices únicamente después de medir consultas reales;
- advisors antes y después, más pruebas de aislamiento entre dos usuarios.

Esta auditoría no certifica aún la seguridad comercial completa ni la sincronización bancaria.
