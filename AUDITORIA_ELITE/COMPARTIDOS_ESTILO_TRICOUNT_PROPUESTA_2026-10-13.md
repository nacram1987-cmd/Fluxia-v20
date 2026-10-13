# Compartidos en Fluxia — propuesta funcional inspirada en Tricount (13/10/2026)

**Estado:** especificación, no implementada ni aprobada como versión productiva. Respeta PROMPT_MAESTRO.md y AGENTS.md. Preserva la versión v97.66 y los datos reales.

## Experiencia objetivo
- **Grupos** (Casa, Viajes, Boda…), participantes por grupo, nombre, moneda y rango temporal.
- **Gastos** cronológicos: importe real, concepto, fecha, pagador, participantes, reparto exacto por partes iguales, porcentajes o importes, y adjunto opcional.
- **Saldos netos** por participante: sumas pagadas − su propia parte, con presentación de deudas y «saldar» mediante reembolso rastreable.
- **Historial auditable**: edición, correcciones y reversión sin borrado físico ni resurrección.
- **Integración Fluxia**: solo el desembolso bancario personal afecta una vez a gastos reales; la parte de otra persona genera derecho de cobro según las reglas actuales. Liquidar deuda no genera un segundo gasto. El cálculo de Disponible, el tratamiento de los pagos compartidos y la fórmula canónica se validarán con fixtures antes de modificar comportamiento.
- **UX premium**: tarjetas compactas, filtros por persona/grupo, lista por fecha, saldos y ficha de reparto, sin copiar marca, recursos gráficos ni interfaz propietaria de terceros.
- **Multicuenta**: aislamiento de usuarios y persistencia en nube, sin «mezclar» participantes con perfiles de login.
- **Migración segura**: estudiar el modelo actual «gastosCompartidos» con evento/grupo/persona/sentido/reembolsos, nunca reconvertir los datos del usuario sin backup, dry-run, equivalencia y rollback.

## Secuencia de aceptación
1. Cerrar P0: conciliación de fijos bancarios (Apple), Papelera y cero duplicados, y mostrar gasto real mensual en Variables.
2. Capturar snapshot contable y ensayar las reglas existentes de Compartidos (reembolsos y Disponible incluidos).
3. Desarrollar grupos, detalle de gasto y reparto en LAB aislada y reversible. No sustituir la PWA estable.
4. Probar grupos de 2, 3 y 5 miembros, cambios de pagador, reparto personalizado, pagos parciales y liquidaciones; testear cambio de usuario, histórico, sincronización repetida y fallo de red.
5. Solo entonces valorar beta instalable (Capacitor/PWA empaquetada) y TestFlight con dispositivos iPhone físicos, sin prometer rendimiento nativo no medido.

**Nota:** «Tricount» es una referencia de metodología; no copiar identidad visual, pantallas pixel a pixel ni marca.
