# Fluxia Élite BETA v2.0.05 · gestión de provisiones

15/10/2026. Rama `pages-v9731-real-final`. Punto anterior: v2.0.04, commit `8297831318fe136390e4f80cf102484b02e8d5bf`.

## Cambios

- Añadido panel de gestión de Huchas con «Crear nueva provisión».
- Añadido «Historial de esta provisión» en cada tarjeta, separado del botón de detalle.
- El historial por hucha conserva la aportación mensual y el acumulado por año/mes, además de usos, rescates, reposiciones, fechas, origen, ID y estado.
- La acción de creación abre el flujo operativo del HTML original, manteniendo la identidad, el calendario de meses, el guardado y las protecciones existentes mientras la escritura propia de Élite no esté certificada.
- Reutilizada la misma fuente de datos seleccionada: nube Supabase o copia HTML del mismo perfil, sin mezclar cuentas.

## Pruebas

- Regresión de aislamiento y reconstrucción de Huchas superada.
- Regresión de cabecera y versión superada.
- `git diff --check` superado.
- La estable no se modifica.

## Verificación en casa

Abrir Huchas, comprobar el botón «＋ Crear nueva provisión», abrir el historial individual de Mantenimiento césped y revisar septiembre/octubre. El botón de creación debe llevar al HTML original para registrar la provisión real. Tras volver a Élite, cargar de nuevo la nube o la copia HTML para comprobar que la nueva hucha aparece una sola vez.

Dinero en mano continúa en lectura auditada en esta entrega; su escritura operativa queda como el siguiente bloque para evitar crear movimientos que no tengan todavía persistencia idempotente y recuperación entre dispositivos.
