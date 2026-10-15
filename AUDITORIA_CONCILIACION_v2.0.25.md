# AUDITORÍA DE CONCILIACIÓN · Fluxia Élite BETA v2.0.25
Fecha: 16/10/2026 (Europa/Madrid) · Alcance: Disponible de octubre de 2026 · Rama de trabajo: `elite-base` (desde `pages-v9731-real-final` @ 6394e5c)

## 0. Veredicto honesto
**El Disponible real de octubre NO está certificado. Estado correcto: PROVISIONAL / «No verificado».**
En esta sesión no existían credenciales de solo lectura de Supabase, ni la copia «Copia solo este perfil» del HTML, ni la exportación `fluxia-elite-cloud-readonly-v1`. Sin esas tres evidencias es imposible (y sería deshonesto) declarar Δ = 0,00 € frente al HTML. **No se ha comparado ningún importe real**; todas las cifras de este documento son de fixtures sintéticas. El fin del estado provisional queda **implementado y probado** (con datos sintéticos el motor alcanza VERIFICADO); su activación con datos reales depende de ejecutar la comparación privada (§6).

Tres indicadores, por separado:
| Indicador | Estado |
|---|---|
| Datos suficientes para calcular | **No verificado con datos reales** (la app los exige y lo indica) |
| Datos suficientes para certificar | **No** (falta copia del HTML del mismo perfil y nube completa del mismo corte) |
| Sincronización bancaria al día | **No verificado** (sin sincronización ni delimitación explícita consta como pendiente) |

## 1. Qué cambia en el producto
Ver `CHANGELOG_ELITE_v2.0.25.md`. Resumen: libro mayor en céntimos enteros, comparación HTML↔nube por ID, conciliación bancaria por IDs estables del proveedor, detección (sin fusionar) de duplicados, 8 criterios [a]–[h] sobre un corte común y panel/CLI para ejecutar la certificación.

## 2. Estado por módulo
| Módulo | Cálculo en Élite | Comparación vs HTML (datos reales) | Notas |
|---|---|---|---|
| Ingresos | Ledger; pensión no cobrada/futura fuera; duplicados banco↔manual señalados sin fusionar | **No verificado** | Ingresos sin marca de cobro cuentan por la regla del HTML y se informan (`unconfirmedCounted`) |
| Fijos | Un gasto por fijo; el cargo bancario ligado sustituye al previsto, sin duplicar en Variables | **No verificado** | Cargo ligado a fijo inexistente → incidencia que bloquea |
| Variables | Devoluciones restan; traspasos/retiradas de efectivo no son gasto; gasto en efectivo cuenta una vez | **No verificado** | Duplicados sospechosos (mismo día/importe/concepto sin ID bancario) bloquean hasta revisión explícita |
| Huchas | Previsión una vez; solo exceso reduce; aportación menor = pendiente sin subir Disponible | **No verificado** | Vinculación por ID = verificada; solo por nombre = PROVISIONAL |
| Usos/rescates | Rescate temporal suma saldo pendiente; reposición parcial/total; definitivo no suma; histórico conserva fecha | **No verificado** | Comparación de usos HTML↔nube por ID |
| Compartidos | Pago adelantado una vez por `gastoId` | **No verificado** | |
| Financiaciones | Cuota activa una vez; plan finalizado fuera; ID duplicado bloquea | **No verificado** | |
| Bancos | Conciliación por ID del proveedor, signo y fecha; tombstones; frescura de sincronización | **No verificado** (sin sincronización real en esta sesión) | Doble sincronización simulada: la 2.ª no añade nada ni resucita descartes |

## 3. Importes comparados (privado) y diferencias en céntimos
**Ninguno.** No se dispuso de fuente real. Tabla que debe rellenar la CLI privada (no se publica):
| Módulo | Δ HTML↔Élite (céntimos) | Registros solo en HTML | Solo en Élite | Campos distintos |
|---|---|---|---|---|
| (pendiente de ejecución privada) | — | — | — | — |

Regla de aceptación: cualquier diferencia de 0,01 € sin explicar impide VERIFICADO (probado: `regresion 15`, `certificado f-ledger`, `integrado 0,01 €`).

## 4. Evidencia obtenida en esta sesión (solo sintética)
- 99/99 pruebas nuevas, 29/29 scripts de CI (incluye 16 regresiones de huchas/banco/sesión previas). Ver `INFORME_PRUEBAS_v2.0.25.md`.
- Los 15 casos de regresión obligatorios del encargo están cubiertos por fixtures sintéticas (el rescate «Tributos» de 150 € el 15/10 existe solo como fixture ficticia «Tributos de prueba»).
- El panel se cargó en Chromium headless sin errores de script (el módulo se registra como v1.0.0). **No** se verificó visualmente el panel completo con sesión real (la sesión requiere Supabase).

## 5. Incidencias detectadas en v2.0.24 (corregidas)
1. Devoluciones negativas sumadas en positivo en la pestaña Variables.
2. Cargos ligados a fijos inexistentes desaparecían del total sin aviso.
3. `adapter.stableId` caía al `id` interno → falsas conciliaciones bancarias.
4. Signo bancario invertido en la comparación (gasto positivo vs cargo negativo).
5. «Hoy» y año por defecto dependían del reloj del dispositivo.
6. Importes con fracción de céntimo y fechas UTC fuera de mes no se señalaban.
7. Financiaciones con ID duplicado podían contarse dos veces.
8. Etiqueta «CALCULADO» ambigua junto a PROVISIONAL.

## 6. Pendiente para cerrar el estado provisional (acción exacta)
1. En el HTML estable: «Copia solo este perfil» → `copia-html.json` (formato `fluxia-perfil-v1`).
2. En Élite (sesión del propio usuario): exportar la nube (`fluxia-elite-cloud-readonly-v1`).
3. Con ambas: `node lab/tools/elite-reconcile-cli.cjs --cloud export-nube.json --html copia-html.json --month 2026-10 --cutoff <ISO> --out ./privado` (`--bank-scope none` solo si de verdad no hubo movimientos bancarios). Código de salida 0 ⇔ VERIFICADO.
4. Si hay diferencias: `informe-privado.json` las lista por ID con causa/evidencia/acción. Resolver y repetir.
5. Sincronizar bancos y repetir con corte posterior para [d].
6. No subir `informe-privado.json` ni copias a GitHub.

## 7. Criterios [a]–[h]
| | Criterio | Implementado | Probado (sintético) | Real |
|---|---|---|---|---|
| a | Fuente canónica completa del mismo perfil | Sí | Sí | No verificado |
| b | Módulos vs HTML, Δ=0,00 € sin diferencias sin explicar | Sí | Sí | No verificado |
| c | Rescates/usos/reposiciones/aportaciones trazados | Sí | Sí | No verificado |
| d | Bancos con IDs estables o delimitación explícita | Sí | Sí | No verificado |
| e | Ingresos previstos/cobrados separados | Sí | Sí | No verificado |
| f | Céntimos exactos y reglas conservadas | Sí | Sí | No verificado |
| g | Persistencia multiusuario / sin resurrección | Sí | Sí (aislamiento, 2.º usuario vacío, doble sync, tombstones) | No verificado |
| h | Corte, origen y huella | Sí (SHA-256) | Sí | No verificado |

## 8. Seguridad y privacidad
Sin credenciales/tokens/PII en código ni informes públicos (prueba `privacidad`). El motor y el certificado no hacen escrituras de red (prueba estática). El informe público usa seudónimos por hash de `owner|id`. Las decisiones «distintos» se guardan solo localmente por cuenta y perfil. Limitación: el seudónimo de 10 hex es un identificador de correlación, no anonimato fuerte.

Ver valoración 0–100 en `VALORACION_v2.0.25.md`.
