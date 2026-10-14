# Fluxia Élite v1.9.97 · rectificación de auditoría y avance

Fecha: 15/10/2026 · rama `pages-v9731-real-final`. Solo lectura de catálogo y advisors de Supabase; sin SQL de escritura ni datos personales consultados.

## Corrección importante de v1.9.96

El informe anterior agrupó avisos del linter bajo “bloqueos de seguridad” sin distinguir su impacto. La verificación actual del catálogo muestra:

- `banco_bandeja`, `eb_conexion`, `eb_conexiones` y `movimientos` tienen RLS activo y cero políticas. Esto **deniega por defecto** el acceso directo de `anon`/`authenticated`; puede afectar a la disponibilidad si un cliente esperaba acceso directo, pero **no acredita una fuga**. Los accesos del Edge Function requieren revisión propia.
- `fluxia_datos` tiene RLS activo y cuatro políticas; `fluxia_contactos` tiene RLS activo y seis. No se han realizado tests con dos JWT distintos ni verificado exhaustivamente cada ruta.
- `accept_invitation` es `SECURITY DEFINER` y ejecutable por `authenticated`, pero no por `anon`. Su definición real usa `auth.uid()`, exige que coincida con el destinatario, limita la fila a `user_id_2` y fija `search_path`. El aviso del linter requiere revisión, **no demuestra por sí solo un bypass**.
- Permanecen avisos reales: dos funciones con `search_path` mutable, protección de contraseñas filtradas desactivada, políticas redundantes y recomendaciones de índices/RLS. No se han cambiado permisos ni políticas sin prueba/rollback.

Referencias de remediación: [RLS sin política](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [funciones privilegiadas](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Cambios ejecutables v1.9.97

1. Cabecera: una sola regla CSS consolidada; icono + nombre centrados; el botón Salir se retira visualmente y se ofrece en Ajustes. Notificaciones permanecen en el extremo derecho.
2. Sesión: la falta de red o un error 5xx/429 durante la renovación ya no borra el refresh token guardado. La identidad devuelta se coteja con la cuenta guardada. Un fallo al cargar colecciones mantiene la sesión autenticada y muestra la opción de reintento sin solicitar de nuevo la contraseña.
3. Al iniciar sesión en otra cuenta se limpia primero el estado privado anterior: copias, CSV, cartera, auditorías y colecciones en memoria.
4. Título, metadato, marca y runtime muestran v1.9.97.

**Límite de seguridad:** el cierre desde Ajustes elimina el estado local y el refresh token local, pero el código actual no revoca expresamente esa sesión en el servidor. No debe presentarse como revocación global. El token de acceso puede durar hasta su expiración. La persistencia en `localStorage` expone el refresh token ante XSS; una arquitectura con sesión de servidor/BFF y CSP efectiva sigue pendiente.

## Verificación

- Pages de v1.9.96: GET HTTP 200; SHA1 de bytes servidos `101870806bd53aa02ff2abdf8f58e4ce1e5ab0e3`, idéntico al archivo local. La captura anterior era de una versión distinta, no una prueba de fallo del despliegue actual.
- Pages de v1.9.97: el workflow nativo de Pages llegó a despliegue correcto. GET con parámetro `v=1.9.97&build=f020964da7b0`: HTTP 200, SHA1 `51588e5a04b8b954b82a6b3834ff50224eec2687`, idéntico al archivo local. La URL consultada antes del despliegue con solo `v=1.9.97` retuvo temporalmente bytes v1.9.96 por caché de 600 s; usar el enlace con `build` hasta que expire.
- **Puerta QA del workflow Élite: roja.** Falló `sha256sum -c AUDITORIA_ELITE/PROTECTED_SHA256.txt` porque el `index.html` vigente tiene SHA256 `9a3f0c37b07d4acb3d87ab5611817b36e0d500cf662ea3f2182eef22a45406f0`, diferente del hash protegido `9674829f…` registrado en 2026-10-13. Los seis restantes pasaron. La última modificación de `index.html` en el checkout está asociada al commit `145560c…`, anterior a esta entrega. No se ha modificado el HTML estable ni reescrito el hash protegido para fabricar un QA verde. El workflow nativo de Pages despliega aunque falle esta puerta: esto requiere una decisión separada sobre la base estable legítima y la política de publicación.
- Base v97.66: snapshot inmutable y regresión sintética superados (400 movimientos, 20 ciclos de menú). No equivale a benchmark iPhone.
- v1.9.97: tests de renovación offline, identidad cruzada, cabecera y sintaxis. Falta prueba física Safari autenticado.
- Paridad contable HTML ↔ Élite, seguridad multiusuario, escrituras bancarias e integración Face ID de servidor siguen sin certificar. Disponible permanece bloqueado.

## Próximo cierre P0/P1

1. Snapshot operativo privado del mismo usuario/perfil/mes/corte; comparación por ID y céntimo.
2. Cuentas sintéticas A/B para permisos, RLS, Edge bancario y recuperación entre dispositivos.
3. Resolver conflictos de banco con identidad estable y tombstones; no escribir hasta cerrar la conciliación.
4. Extraer sesión y motor de UI inline, fijar CSP, replantear almacenamiento del refresh token.
5. Medir Safari/iPhone y corregir las pruebas históricas que mezclan assertions de versión con lógica.

