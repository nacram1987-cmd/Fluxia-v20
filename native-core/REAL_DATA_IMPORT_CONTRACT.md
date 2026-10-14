# Fluxia iOS — Contrato de lectura de datos reales (14/10/2026)

## Estado verificado
Proyecto Supabase activo. Tabla `public.fluxia_datos` con PK compuesta `(user_id, clave)`, campos `v` (texto), `t` y `updated_at`. Tabla `public.banco_bandeja` con PK `(user_id,mov_id)`. RLS habilitada en ambas. La tabla `public.movimientos` no contiene registros; NO usarla como origen de los movimientos de la PWA.

## Restricciones obligatorias
1. Primera fase: SOLO LECTURA. Nunca copiar registros de un usuario a otro, borrar claves, convertir snapshots históricos en movimientos activos ni escribir sobre la PWA.
2. Autenticación Supabase del usuario en el dispositivo; usar JWT de sesión y clave publicable. Prohibido incluir service_role en la app.
3. Consultar `fluxia_datos` filtrando por `user_id = auth.uid()`, paginar y validar RLS. Mantener el par `(user_id, clave)` como identidad de cada documento.
4. Las claves `backup:*`, `*backup*`, `*espejo*`, papelera, tombstones, listas de borrados y rechazos son evidencia/histórico: NO se importan como movimientos activos. No inferir registros activos de una simple coincidencia de texto; documentar el mapa exacto de claves vigentes.
5. `v` es texto legacy, no JSON garantizado: parseo tolerante, validación de esquema, y cuarentena de entradas inválidas; nunca reemplazar por arrays vacíos ante errores.
6. Para bancos, `banco_bandeja` no es gasto variable por defecto. La reconciliación debe consultar identidad del cargo, su clasificación, rechazo y vínculo con fijo antes de computarlo.
7. La proyección Swift `native-core/FluxiaLedger.swift` es un prototipo aislado, NO fuente contable de producción. Comparar contra cálculos existentes y cerrar brechas de semántica (planes, provisiones, estados, fijos y compartidos) antes de mostrar Disponible real.
8. Antes de habilitar escritura: respaldo verificable, migración idempotente, test de dos usuarios, dos meses, logout/login, reconexión, duplicados, tombstones y comparación exacta de saldos con PWA.
9. No registrar UUID de usuarios, tokens, datos bancarios, importes privados o `v` en logs ni commits.

## Puerta de aceptación para datos reales
- Login del titular probado en iPhone.
- Lectura de claves activas del titular y clasificación de documentos validada.
- Contadores y sumas por módulo reconciliados con PWA para al menos dos meses.
- Sincronización inicial reproducible sin cambios en base de datos.
- Solo entonces conectar las pantallas nativas a lectura real; la edición seguirá deshabilitada hasta superar auditoría de escritura.
