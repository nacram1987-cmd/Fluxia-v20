# Fluxia BETA v97.54-LAB — arranque no bloqueante

Base: v97.53-LAB, cabecera corregida conservada.

## Cambios
- Eliminar segunda espera de autenticación y reconexión antes de pintar.
- Espera durable del outbox para evitar escritura antes de reconstruir pendientes.
- Si se requiere reconexión, ejecutarla en segundo plano, sin duplicar conexión ya existente.
- Reducir tareas visuales no esenciales del primer fotograma.
- Medidas de tiempos: FluxiaTiempos9754.report() (sin movimientos ni datos personales).

## Invariantes
No cambios en motores de importes, usuario, cloud RLS, huchas, deduplicación bancaria, papelera ni tombstones. La raíz ESTABLE sigue sin cambios.

## QA pendiente en iPhone
- [ ] Arranque frío: tiempo desde abrir hasta menú funcional y dashboard.
- [ ] Arranque caliente y PWA actualizada.
- [ ] Cabecera compacta, sin saltos.
- [ ] Sin recarga repetida ni congelación de Gastos variables.
- [ ] Huchas, fijos, variables, ingresos y disponible iguales antes/después de sincronizar.
- [ ] Login y logout de dos cuentas sin mezclar datos.
- [ ] Offline y vuelta online, outbox durable.
- [ ] Gráficos, bancos y notificaciones al entrar en sus secciones.

LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.54.html

ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/
