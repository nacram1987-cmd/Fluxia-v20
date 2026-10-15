# Fluxia Élite BETA v2.0.25 · Conciliación real del Disponible (16/10/2026)

Continuación de v2.0.24 (no rehace nada). Objetivo: dejar de mostrar «PROVISIONAL» **solo** cuando exista evidencia trazable y reproducible de cada componente del Disponible. Mientras falte algo se mantiene PROVISIONAL/PENDIENTE con causa exacta y acción. No se inventa ningún importe.

## Añadido
- `lab/js/fluxia-elite-reconciliation-v1.js` (nuevo, solo lectura, sin red): céntimos exactos (BigInt), fechas en Europa/Madrid, libro mayor, comparación HTML↔Élite por ID, conciliación bancaria, simulación de doble sincronización, SHA-256/JSON canónico, evaluación de los criterios [a]–[h] y informe público sin datos personales.
- Libro mayor por registro (`module, id, fecha, céntimos, naturaleza, estado, impacto, regla, banderas`). `verifyLedger` comprueba que la suma de impactos es **exactamente** el Disponible.
- Certificado del Disponible (panel): 8 criterios, tres indicadores separados («datos para calcular», «datos para certificar», «sincronización bancaria»), descomposición de la fórmula, tabla HTML↔Élite por módulo con Δ en céntimos y exportación de informes (privado local / público seudonimizado).
- `lab/tools/elite-reconcile-cli.cjs`: comparación privada local (export de nube + copia del HTML) con las mismas funciones del HTML. Sin red ni credenciales.
- `lab/qa/lib/elite-html-functions.cjs`: carga las funciones **reales** del HTML en un `vm` para las pruebas y la CLI.
- `lab/qa/elite-reconciliation-v2025.cjs`: 99 pruebas (fixtures sintéticas).

## Corregido
- Variables: las devoluciones (importes negativos) restan en la pestaña (antes se sumaban en positivo).
- Un cargo ligado a un fijo inexistente ya no desaparece en silencio: se señala y bloquea la certificación.
- Varios cargos ligados a un mismo fijo se señalan.
- Identidad bancaria = solo referencias del proveedor, nunca el `id` interno (evitaba falsas «conciliaciones»).
- Signo bancario: gasto positivo en libro ↔ cargo negativo en proveedor.
- «Hoy» del Disponible sale del corte común en Europa/Madrid, no del reloj del dispositivo; el año de meses sin año usa el año del corte.
- Fracciones de céntimo (p. ej. 1,005) y fechas UTC que en Madrid caen en otro mes se señalan.
- Financiación con ID duplicado bloquea el cálculo en lugar de contarse dos veces.
- La etiqueta ambigua «CALCULADO» desaparece: solo `✓ VERIFICADO`, `PROVISIONAL` o `PENDIENTE`.

## Reglas contables (sin cambios, ahora con pruebas)
Disponible = Ingresos − Gastos reales − Provisiones previstas − exceso de aportaciones + impacto neto de Compartidos + rescates temporales pendientes. Aportación ≤ previsión no reduce otra vez; solo el exceso. Aportación menor crea pendiente y no aumenta el Disponible. Rescate a Revolut = transferencia interna, no ingreso. Pensión no cobrada no es ingreso. Devoluciones conservan signo. Traspasos propios y retiradas de efectivo no son gasto nuevo. Efectivo ≠ Disponible. «Disponible verificado» ≠ «Saldo bancario verificado».

## Ajustes en pruebas heredadas (sin perder aserciones funcionales)
- `elite-banking-available-v2012`, `elite-dashboard-provisional-available-v2020`, `elite-available-certification-v1975`: la función `availableCalculationReport` ahora admite `options={}` (firma ampliada) y el cálculo vive en `availableComputeFrom`; se actualizaron los marcadores de corte/firma. Los importes esperados (200,00 / 250,00 / 225,00 €) y todas las reglas siguen afirmándose.
- Se conservan los literales «Disponible pendiente:» y «Bloqueos actuales:» en el panel.

## No cambia
HTML estable/PWA y v97.x intactos. Ninguna escritura en Supabase. Sin credenciales, tokens ni datos personales en el código ni en los informes públicos.
