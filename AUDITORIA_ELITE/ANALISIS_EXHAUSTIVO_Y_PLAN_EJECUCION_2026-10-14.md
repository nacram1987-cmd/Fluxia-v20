# Fluxia Élite · análisis exhaustivo y plan ejecutable

Fecha: 14/10/2026 · base Élite: v1.9.68 · estable protegida: v97.66/HTML madre

## Diagnóstico visual inmediato

La captura de v1.9.67 muestra una tarjeta de hucha técnicamente informativa pero incorrecta como pantalla de uso diario: demasiadas filas consecutivas, saldo sin suficiente protagonismo, etiqueta técnica de Supabase, detalle forense siempre abierto y repetición de información. El HTML madre utiliza una jerarquía más clara: nombre/estado, saldo acumulado, aportación mensual, barra de progreso y acciones; el detalle histórico queda secundario.

v1.9.68 corrige esta primera desviación: la tarjeta presenta ahora saldo, estado/fuente, aportación del mes frente a previsión y progreso; el desglose completo queda en «Ver detalle financiero». No se eliminan datos ni reglas: solo se cambia su prioridad visual.

## Estado real por área

| Área | Situación actual Élite | Riesgo | Siguiente ejecución |
|---|---|---|---|
| Autenticación/perfiles | Lectura por perfil y separación prevista; pruebas sintéticas parciales | P0: falta prueba A/B real con cuentas aisladas | Ensayar usuario nuevo, logout/login, dos perfiles y recuperación |
| Dashboard/Disponible | Disponible bloqueado si no existe motor conciliado | P0: no presentar cifra inventada | Extraer motor único del HTML y comparar al céntimo |
| Ingresos | Consulta de colecciones y estados de fuente | P1: CRUD/productivo no certificado | Paridad por ID, cobrado frente a previsto |
| Fijos | Consulta y diagnóstico de vínculos | P0: cargo bancario fijo/variable debe contarse una vez | Reproducir escenarios A–D y consolidar vínculo canónico |
| Variables | Consulta con filtros y comparación CSV/HTML | P0: 51 HTML vs 52 CSV no resuelto | Snapshot operativo del HTML, IDs y corte idéntico |
| Huchas | Ledger por hucha, aportes, usos, reposiciones y saldo individual; UI compactada en v1.9.68 | P0: rescates/operaciones anidadas y paridad real aún no certificadas | Resolver todas las estructuras originales y comparar por hucha |
| Compartidos | Lectura y auditoría | P1: liquidaciones reales no certificadas | Paridad de deuda, pagador, reembolso y estado |
| Financiaciones | Lectura de registros | P1: cuotas y pagos reales sin motor común | Extraer reglas de amortización y pagos |
| Dinero en mano | Lectura segura de v2_efectivo/backup | P0: saldo actual no verificado | Reconciliar cartera, variable vinculado y uso de hucha |
| Pagos/usos | Historial de fuentes | P1: no confundir uso de hucha con gasto | IDs, fecha real, reposición y no doble conteo |
| Presupuestos/simulador/análisis | Parcial/hipotético | P1: no mostrar Disponible inventado | Habilitar después del motor canónico |
| Bancos | Infraestructura visible, sin prueba real en esta rama | P0: sync, IDs, duplicados y avisos | Reutilizar integración original y probar idempotencia |
| Notificaciones/papelera | Inspección de estados y exclusiones | P0: no resurrección | Tombstones, rechazos persistentes y reimportación |
| Supabase/RLS | No auditado con proyecto autorizado en esta ejecución | P0 | Cuentas sintéticas, RLS, concurrencia y rollback |
| PWA/Pages | Rama actualizada por GitHub; Pages puede quedar en caché | P1 | Verificar bytes servidos, worker y actualización sin reinstalar |
| Rendimiento | Base v97.66/v97.68 protegida | P1 | Benchmark comparable de arranque, Variables y Bancos |
| iOS nativo | Arquitectura futura, no certificada | P2 hasta cerrar P0 | Contrato de motor/API compartido |

## Orden de ejecución recomendado

1. **P0 de datos:** obtener snapshot vivo del HTML madre y construir comparador por ID, perfil, mes, fecha, importe, categoría, estado y archivo.
2. **Motor canónico:** extraer políticas de Disponible, Variables, Fijos, Huchas, efectivo, compartidos y financiaciones; eliminar fórmulas paralelas.
3. **Huchas:** completar rescates, usos anidados, reposiciones, aportaciones retroactivas, meses/años, huchas duplicadas y estados individualizados.
4. **Fijos/bancos:** probar vínculo explícito, cargo real, rechazo, reimportación y notificación única sin duplicar Variables.
5. **Persistencia/seguridad:** validar Supabase, RLS, aislamiento y recuperación en cuentas sintéticas; preparar backup/dry-run/rollback.
6. **Paridad de módulos:** trasladar progresivamente Dinero en mano, Pagos, Compartidos, Financiaciones, Presupuestos y Análisis.
7. **UX HTML-parity:** aplicar la misma jerarquía compacta a todas las pestañas; mantener detalle técnico bajo demanda.
8. **Rendimiento:** comparar con v97.66/v97.68 sin sacrificar integridad ni consultas bancarias.
9. **QA y Pages:** ejecutar regresiones, verificar URL pública y generar ZIP; no promocionar estable sin «con labora» y certificación.

## Criterios de aceptación

- Cero movimientos ausentes o adicionales sin explicación.
- Cero diferencias de céntimos en módulos certificados.
- Una operación bancaria solo aparece una vez.
- Un fijo conciliado no reaparece como Variable.
- Una eliminación/rechazo no resucita después de recarga o sincronización.
- Dos perfiles no comparten datos.
- El detalle técnico no invade la vista diaria.
- Pages sirve exactamente los bytes de la versión anunciada.

## Bloqueos actuales que no deben ocultarse

- No existe snapshot vivo del mismo perfil/corte del HTML madre dentro de la ejecución.
- No se ha certificado acceso real a Supabase, bancos, Safari físico ni PWA instalada.
- La stable permanece deliberadamente intacta.
- La puntuación actual no es certificación comercial hasta cerrar los P0.
