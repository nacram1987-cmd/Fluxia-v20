# Evaluación crítica v97.57 LAB
Se reduce trabajo innecesario sin maquillar esperas con un splash. Mantiene interfaz canónica y semántica financiera.

Evidencias: HTML 17,6 % más pequeño; sin cascada síncrona oculta de Hero/Metas/Análisis. Selector idempotente, tareas secundarias suspendidas durante interacción y pintura diferida de filas reales.

Comparación consecutiva JSDOM, 1.500 movimientos ficticios:
| Rutina | Base v97.55 (ms, 3 repeticiones) | v97.57 (ms, 3 repeticiones) |
|---|---|---|
| renderKPIs | 87 / 146 / 61 | 25 / 23 / 22 |
| renderDashboard | 41 / 31 / 63 | 22 / 20 / 20 |
| renderAll | 172 / 115 / 102 | 30 / 29 / 30 |

Otras ejecuciones variaron (base renderAll 50–52 ms, v97.56 17–22 ms). No extrapolar porcentajes/segundos al iPhone. JSDOM no pinta ni emula Safari; red bloqueada y sesión no autenticada.

Limitaciones: shell aún con 167 scripts y estilos heredados. Consolidarlos exige regresión completa; no eliminar funciones por tamaño. Sin prueba iPhone no se certifica que la lentitud real desapareciera. Sin webhook bancario no hay cargos instantáneos con app cerrada.

Pendiente: arranque frío/caliente Safari/PWA, primer toque, scroll, dos cuentas aisladas, nube/outbox, restauración y rechazo Apple.com/bill. No promover hasta validar.
