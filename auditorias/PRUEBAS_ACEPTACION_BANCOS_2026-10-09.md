# Pruebas de aceptación — deduplicación bancaria y Disponible

Fecha: 2026-10-09
Estado: PENDIENTE DE EJECUCIÓN contra runtime real. Este documento NO certifica la corrección.

## Condiciones previas
- Trabajar únicamente en rama audit/banco-dedupe-disponible-20261009 y perfil de pruebas aislado.
- Exportar snapshot de movimientos, provisiones, fijos, variables, ingresos y saldos antes de la prueba.
- Registrar Disponible inicial, huella de registros y conteos por tipo. Nunca usar la cuenta real para ensayos destructivos.

## Casos obligatorios
| Caso | Entrada | Resultado exigido |
| --- | --- | --- |
| T01 | Sincronizar dos veces el mismo lote sin novedades | Misma huella de movimientos y mismo Disponible; segunda ejecución cero escrituras contables |
| T02 | Dos registros mismo bancoRef, diferente importe | Mantener ambos y registrar conflicto; ninguna fusión |
| T03 | Mismo bancoRef, diferente fecha o tipo | Conflicto, no fusión |
| T04 | Mismo bancoRef en cuentas o usuarios diferentes | Separación absoluta, no fusión |
| T05 | Mismo bancoRef, registros contablemente equivalentes | Consolidar solo si se demuestra equivalencia y se conserva categoría, división, pago e historial |
| T06 | Transferencia interna Revolut→Caixa | Movimiento bancario en ambas cuentas; impacto neto cero en ingresos/gastos externos y Disponible |
| T07 | Gasto fijo previamente pagado llega del banco | Vincular a fijo existente sin crear variable duplicado |
| T08 | Gasto de Dinero en mano vinculado a movimiento | No duplicar en variables |
| T09 | Sin conexión / timeout | Conservar último estado verificado; no mutar contabilidad |
| T10 | Repetición tras cierre, reapertura y recarga PWA | Sin resurrecciones, sin duplicados, sin cambio injustificado del Disponible |
| T11 | Movimiento legítimo nuevo | Una sola contabilización, variación explicable por asiento |
| T12 | Diferencia de Disponible antes/después de fusión | Abort, rollback y diagnóstico sin escrituras parciales |

## Instrumentación mínima
Para cada ejecución registrar: ID de corrida, usuario anonimizado, cuenta anonimizada, timestamp, cantidad recibida, nuevas altas, equivalentes confirmados, conflictos, escrituras, Disponible antes/después, huella de dataset antes/después. No incluir credenciales, tokens ni números completos de cuenta.

## Criterio de liberación
Todas las pruebas deben pasar con evidencias reproducibles. Si una falla, no publicar LAB ni fusionar a main. Añadir la regla verificada al PROMPT MAESTRO y entregar ZIP completo + enlaces LAB/ESTABLE únicamente tras validación de Safari/PWA.
