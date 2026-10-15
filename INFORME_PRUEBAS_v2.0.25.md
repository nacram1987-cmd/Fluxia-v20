# Informe de pruebas · Fluxia Élite v2.0.25 (16/10/2026)

## Diferenciación obligatoria
- **CI (sintético)**: todo lo de este informe. Demuestra reglas y criterios con fixtures inventadas.
- **Datos reales**: **0 pruebas ejecutadas** (sin credenciales ni copias en esta sesión). Resultado real: **No verificado**.

## Resultados
| Conjunto | Pruebas | OK | Fallos |
|---|---|---|---|
| `lab/qa/elite-reconciliation-v2025.cjs` (nuevo) | 99 | 99 | 0 |
| Scripts de CI de `fluxia-elite-espejo-qa.yml` (28 previos + el nuevo = 29 scripts) | 29 scripts | 29 | 0 |
| `elite-available-certification-v1975.cjs` (fuera de CI, ajustado) | 1 script | 1 | 0 |

Suite nueva por grupo: regresión 28 · céntimos 3 · libro mayor 5 · defectos v2.0.24 5 · comparación 5 · banco 10 · certificado [a]–[h] 22 · integrado (funciones reales del HTML) 11 · privacidad 4 · CLI 1 · entrega 5.

Incluye: propiedad con 200 escenarios aleatorios (semilla fija) donde el libro suma exactamente el resultado, 450 movimientos con invariancia al orden, cada criterio [a]–[h] fallando por separado, 0,01 € / 0,00 €, Madrid (31/10 23:30Z = 01/11; cambio de hora 25/10), doble sincronización sin resurrección, carga tardía de nube, cierre de sesión y 2.º usuario vacío, y SHA-256 contra `node:crypto`.

## Casos obligatorios del encargo → pruebas
pensión futura→cobrada una vez (01,01b,01c) · fijo pagado por banco sin duplicar (02) · dos cargos iguales en fechas distintas (03,03b,03c) · devolución negativa (04,04b) · retirada Revolut→efectivo (05) · hucha =/</> plan (06,06b,06c) · rescate parcial/total y reposición (07–07d) · rescate sintético 150 € el 15/10 (08) · uso histórico césped (09) · retroactivo no altera octubre (10) · Compartidos y financiación (11,11b) · carga tardía/logout/2.º usuario (12) · doble sync (13) · fechas Madrid (14–14c) · 0,01 € (15).

## Regresiones heredadas
Los 43 scripts antiguos de `lab/qa` que no están en CI **ya fallaban en la rama base**: el conjunto de fallos es idéntico antes y después de v2.0.25 (comprobado con diff). Muestra revisada: `elite-dashboard-provisional-available-v2019` exige `ELITE_SAFARI_VERSION=2.0.19` (marcador de versión antigua); la causa del resto no se investigó. `elite-available-certification-v1975` pasó (antes y ahora) tras actualizar la firma de `availableCalculationReport`. No se tocaron los demás.

## Límites
- Sin ejecución en Safari/iOS real; sin prueba de PWA/Service Worker reales; sin Supabase real.
- La comprobación visual del panel con sesión no se hizo (solo carga sin errores de script en Chromium headless).
- Un verde de esta suite **no** certifica ningún importe real.
