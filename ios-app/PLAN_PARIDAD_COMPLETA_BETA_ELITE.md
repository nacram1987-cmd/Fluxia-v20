# Fluxia Élite — contrato de paridad funcional con Fluxia BETA

Fecha: 2026-10-14. Estado: plan de ingeniería; NO certifica implementación ni publicación.

## Regla de producto
Élite es una evolución del sistema financiero BETA, no una demo ni una base independiente. HTML/PWA ESTABLE permanece intacta. Nunca mostrar cifras sintéticas como reales.

## Matriz de cobertura obligatoria
Dashboard; ingresos; gastos fijos; variables; provisiones/huchas; compartidos; financiaciones; bancos; dinero en mano; pagos; presupuestos; simulador; análisis/estadísticas; notificaciones; ajustes/sesiones. Para cada módulo registrar: origen HTML, clave(s) cloud canónicas, contrato de datos, UI, lectura, escritura, pruebas, estado de conciliación. No declarar completo hasta verificar todos.

## Puertas de seguridad
1. Leer y comparar HEAD remoto antes de cada cambio; preservar commits ajenos.
2. Identificar sesión real y contrato vigente de Supabase. Validar RLS con dos cuentas reales de prueba y sesión caducada; nunca tokens en GitHub.
3. Reconstruir por usuario, perfil y período desde registros canónicos. Distinguir backups/espejos/archivados; no importar indiscriminadamente claves de fluxia_datos.
4. Verificar identidad estable, idempotencia, no-resurrección y auditoría de movimientos; no borrar registros para cuadrar.
5. Conciliar cada módulo con HTML usando misma fecha de corte y misma cuenta. No sustituir null por 0 ni calcular saldos a partir de instantáneas incompletas.
6. Disponible = ingresos - gastos - provisiones previstas - max(0, aportaciones reales - previstas). Aportes hasta previsto no descuentan doble. Retroactivos impactan su período.
7. Bancos: cargo vinculado a fijo se muestra como fijo pagado, no variable adicional; notificación única por identidad de transacción; rechazos persistentes.
8. Activar escrituras financieras únicamente tras aprobar conciliación, rollback, multiusuario, reinstalación y sincronización concurrente.
9. Restaurar identidad visual original (logo oficial, claro navy/oro, tarjetas compactas) y medir velocidad contra referencia estable sin regresiones.
10. LAB Élite en URL independiente, build SHA rastreable, verificación HTTP y navegación Safari; nunca cambiar index.html de ESTABLE por defecto.

## Evidencia conocida del repositorio
- ios-app/INTEGRACION_CLOUD_ESTADO.md reconoce falta de proveedor de sesión autenticada real.
- ios-app/src/audit-parity-adapter.mjs bloquea paridad por libro contable incompleto.
- ios-app/AUDITORIA_BACKEND_SUPABASE.md identifica tabla clave-valor y riesgos de selección de claves.
- La existencia de tests no equivale a ejecución verde; cada release debe guardar run y resultados.

## Criterio de salida
Para cada entrega: versión real, SHA, rama, pruebas efectivamente ejecutadas, URL LAB comprobada, referencia ESTABLE independiente, ZIP completo, evaluación crítica 0–100 y bloqueos. Si no hay publicación verificable, declarar NO PUBLICADA.
