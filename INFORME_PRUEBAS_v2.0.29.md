# Informe de pruebas · v2.0.29-LAB

Todas las pruebas son **sintéticas** (fixtures anonimizadas con la forma de los casos de octubre). No certifican importes reales.

| Conjunto | Resultado |
|---|---|
| `elite-bankref-hucha-v2029.cjs` (nuevo) | 22/22: cinco grupos repetidos (4 con evidencia de historial, 1 por regla), importe en juego en céntimos, paridad con el HTML (se cuentan todas las filas), referencia sintética / campos distintos, bandeja del proveedor, copia con dos filas, dos cargos legítimos, trío mezclado, certificado no VERIFICADO y «distintas» no desbloquea, reimportación idempotente sin resucitar descartes, pensión futura sin cobrar, rescates (ID, nombre exacto, normalizado, ambiguo, sin vínculo), CLI con `--history` y sin filtrar IDs |
| `elite-reconciliation-v2025.cjs` | 99/99 |
| `elite-integration-v2026.cjs` | 11/11 |
| Resto de la batería de CI (`runqa`) | ver ejecución en Actions del commit |

Pendiente de entorno real: GitHub Pages/smoke en el commit desplegado, Safari/iPhone, RLS con dos cuentas y conciliación con datos reales.
