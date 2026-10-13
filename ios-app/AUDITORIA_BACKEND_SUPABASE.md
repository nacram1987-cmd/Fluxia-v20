# Auditoría de integración Supabase — Fluxia Élite LAB

## Evidencia encontrada en el repositorio
- `fluxia-cloud-config-v95.49.json` declara proveedor Supabase, proyecto público y tabla `fluxia_datos`. Es **configuración histórica**, no prueba de que sea el backend vigente.
- `fluxia-lazy-supabase-v44.js` contiene un cargador antiguo de Supabase; no debe reutilizarse como arquitectura nativa sin revisión.
- `AGENTS.md` exige preservar la base v97.66, rendimiento y aislamiento; no se ha modificado la PWA.

## Barreras antes de activar datos reales
1. Identificar la configuración de nube **vigente** de la rama PWA publicada, sin copiar secretos ni sesiones.
2. Inspeccionar esquema de `fluxia_datos`, claves primarias, propiedad por usuario y políticas RLS vigentes; **no inferir seguridad por el nombre de la tabla**.
3. Verificar que cada lectura queda limitada en el servidor por `auth.uid()` o mecanismo equivalente, nunca solo por un `userId` enviado por el cliente.
4. Determinar si la PWA almacena documentos JSON mensuales o un estado completo por usuario; no inventar endpoint de snapshot.
5. Verificar lectura de usuario nuevo vacío, usuario existente, dos cuentas alternadas, expiración de token y restauración de sesión.
6. Comparar importes y reglas contables contra PWA sin escribir, borrar, fusionar ni sincronizar datos bancarios.
7. No habilitar el transporte `src/readonly-transport.mjs` hasta disponer de un contrato servidor auditado y pruebas de autorización reales.

## Estado de implementación
- `src/readonly-finance.mjs`: validación local del contrato de solo lectura.
- `src/readonly-transport.mjs`: transporte HTTPS abstracto probado con respuestas simuladas.
- **No existe integración Supabase real en la app nativa todavía.**
- No se almacenan contraseñas, tokens ni claves privadas en estos módulos.
