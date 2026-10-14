# CONTRATO DE PARIDAD — HTML MADRE → FLUXIA ÉLITE
**Vigencia:** 14/10/2026 · **Estado:** VINCULANTE / NO CERTIFICADO
**Aplica a:** HTML/PWA LAB, Safari Élite, app SwiftUI, APIs, Edge bancario y cualquier cliente futuro.
**Fuente de verdad para aceptación:** ejecución real del HTML vigente, MISMO usuario, perfil, mes, zona horaria y corte temporal. **No usar datos de respaldo como si fuesen actuales.**

## 0. Regla de no desviación
La nueva aplicación es Fluxia HTML evolucionado. Pueden mejorar presentación, rendimiento y modularidad, pero **NINGÚN** módulo, cargo, estado, función, categoría, cálculo, notificación o relación bancaria puede perderse. Hasta certificar un motor compartido, cualquier diferencia respecto al HTML se trata como DEFECTO P0. Los módulos que no estén listos aparecerán como incompletos, no como operativos.

## 1. Inventario de equivalencia funcional

| Área HTML obligatoria | Semántica innegociable | Prueba de paridad |
|---|---|---|
| Autenticación / perfiles | Login, logout, recuperación, nuevo perfil vacío, aislamiento y persistencia por perfil | A/B usuarios y dispositivos, ningún dato cruzado ni resurrección |
| Dashboard | Mes y fecha visibles, Disponible, Ingresos, Fijos, Variables, Huchas, Compartidos, totales reales | Mismas cifras en céntimos, fuentes y estados |
| Variables | Misma colección OPERATIVA, fechas/mes contable, filtro, categorías y descartes | IDs/importe/fecha/estado uno por uno y total exacto |
| Fijos | Previsto/pendiente/pagado, banco vinculado, pagos manuales y vencimientos | Pendiente no es realizado, cargo vinculado contado una vez |
| Huchas / provisiones | Aportes, usos, rescates, histórico y provisión prevista/extra | Saldo por mes y Disponible idénticos |
| Ingresos | Previstos frente a reales, nóminas/pensiones y conciliación | No contabilizar previsiones como recibidas |
| Compartidos | Persona, pagador, gasto único, deuda, reembolso, liquidación | Mismas deudas y mismos cambios al liquidar |
| Financiaciones | Cuotas, pagos reales, pendientes y amortización | Histórico y saldos exactos |
| Bancos | Conexiones existentes, permisos, sync, IDs estables, clasificación, propuesta fijo y descarte | Reconexión sin duplicar, 1 aviso por cargo, sin resurrecciones |
| Notificaciones / papelera | Descartes definitivos, archivo lógico, trazabilidad | No recuperar pagos descartados o borrados |
| Gráficos / presupuestos | Misma semántica de cada agregación y periodo | Totales idénticos y etiquetas exactas |
| UX / PWA | Selector temporal coherente, navegación, Safari/PWA, imagen comercial fiable | Accesible, rápida y sin pérdida al instalar/actualizar |

## 2. Hallazgos de octubre: 51 vs 52 vs cargo nuevo
- **Referencia del usuario:** 51 gastos variables mostrados en HTML el 14/10/2026, en el momento de comprobarlo.
- **CSV adjuntado** `fluxia-variables-Octubre.csv` (lectura local, separado por punto y coma): **52 filas, 811,39 €** de suma simple de los importes exportados.
- **Repeticiones exactas por cinco columnas** (fecha, concepto, categoría, importe y origen): 6 filas adicionales sobre sus combinaciones únicas, agrupadas en 5 conjuntos. **NO son prueba de transacciones bancarias duplicadas**: CSV no incluye ID de proveedor ni ID canónico.
- **14/10/2026**: CSV muestra un único gasto ese día, concepto `Insurama broker online`, **19,99 €**. No figura el gasto informado de **7,50 € en gasolinera, compra Tabaco**, que debe investigarse en banco/bandeja/histórico antes de crear o clasificar, respetando fecha de operación/contabilización.
- Sí figura otro gasto **7,50 € clasificado Tabaco del 04/10**, concepto `E s vistagiralda`, que NO es el nuevo movimiento de 14/10.
- El recuento de 51 en HTML, las 52 filas CSV y el gasto ausente son **TRES observaciones a reconciliar, no bases para generar movimientos sintéticos**.
- Aceptación: mismo corte temporal, mismos filtros originales `mes`/origen/exclusiones, mismos IDs y importes; nadie deduplica por mero mismo texto/importe/fecha.

## 3. Comparación automática exigida antes de cualquier versión apta
Para cada movimiento del HTML vigente (no copias estáticas):
`user_id, profile_id, canonical_id, bank_identity, booking_date, operation_date, accounting_month, amount_cents, concept, category, origin, status, fixed_link, excluded, archived, tombstone_version`.
Generar:
- `missing_from_elite` / `unexpected_in_elite`
- `same_id_value_mismatch` (fecha, importe, categoría, estado, fijo, origen)
- `bank_identity_collisions`, `possible_csv_duplicates_without_id`
- `month_ledger_delta_cents` en Ingresos, Variables, Fijos, Huchas, Compartidos, Disponible.
No conformidad = diferencia no explicada. Cero líneas ausentes / cero diferencias en céntimos como criterio de cierre. La cuenta nueva sin credenciales nunca debe importar valores.

## 4. Contrato del motor y conexión bancaria
1. **Única semántica:** extraer las funciones originales `esMovimientoVariable`, `movimientosVariablesVisibles`, `variablesTotal`, `gastosFijosDisponibleTotal`, `disponibleEfectivo` y las reglas de provisiones/compartidos. Implementarlas en un módulo testeado, NO dos fórmulas independientes.
2. **Misma fuente operacional:** determinar si los 51 gastos viven en el almacenamiento del HTML, sincronización del servidor, bandeja o un estado local no enviado. Resolver el desfase antes de activar escrituras. Nunca interpretar el CSV como saldo.
3. **Bancos:** el conector original existente y su identidad estable son autoritativos. No abrir segunda sesión ni importar el mismo cargo dos veces. Operaciones de lectura por usuario autenticado; no tocar credenciales ni claves privadas.
4. **Persistencia:** escritura controlada con pruebas de concurrencia, RLS, archivado/tombstones, idempotencia y rollback; prohibido rehidratar fondos vacíos sobre datos reales.

## 5. QA y promoción
- Ejecutar 51/51 por ID y valores para el mismo momento de corte; **no basta que los contadores coincidan**.
- En octubre resolver explícitamente 52 CSV vs 51 HTML y el cargo 7,50 € informado, sin eliminar candidatos a duplicado.
- Casos A/B/C/D de requisitos Variables-Fijos, costes históricos, huchas, Compartidos, dos usuarios y cambio de dispositivo.
- Pruebas en Safari/PWA y nativa con cierre de sesión, actualización y redes variables.
- Regresión de velocidad comparativa contra la base aprobada HTML; no inventar tiempos ni una valoración optimista.
- **Promoción bloqueada** hasta certificación. PWA estable no se modifica sin autorización de promoción y pruebas correspondientes.
- Cada cambio ejecutable entregado con ZIP completo, enlace LAB + estable, versión visible, checklist de dónde mirar y rollback.
- **Situación al redactar:** el HTML sigue siendo más completo para operar; Élite Safari v1.7.0 no tiene escritura financiera real ni sincronización bancaria equivalente comprobada.

## Seguimiento
Primera acción: auditar el registro original vigente de 14/10 para reconocer los 51 gastos y el cargo de 7,50 €, obtener IDs (CSV no los contiene), y comparar resultados con el mismo perfil de Élite.
**No sustituir ni modificar la aplicación estable durante la auditoría.**

## 6. Dinero en mano, Presupuestos, Análisis y Simular (cobertura obligatoria)
- **Dinero en mano es dinero físico, no Disponible.** En el HTML la clave principal de cartera es v2_efectivo, con saldo y movimientos. Meter dinero aumenta solo cartera; gastar disminuye cartera y crea un gasto Variable con gastoId/efectivoId, sin doble contabilización; pagar desde provisión disminuye cartera y saldo de provisión sin segundo cargo en Disponible.
- La cartera exige edición/borrado reversible y con vínculo al Variable o al uso de provisión original; nunca deduplicar por solo concepto/fecha/importe.
- Las vistas Élite v1.9.x leen v2_efectivo o planRescate_v2_efectivo en modo seguro, **rotulando fecha y origen**. La copia cloud del 05/10 contiene saldo 0, pero eso **NO demuestra cartera actual a 14/10**.
- La importación opcional del backup «💾 Copia solo este perfil» verifica ID de perfil idéntico al de la cuenta Élite y acepta solo la clave exacta de cartera del perfil. Se procesa en memoria, sin nube, guardado ni mezcla de usuarios.
- Presupuestos: límites por categoría; análisis y estadísticas deben utilizar el motor original y no dar por conciliados los importes de CSV sin IDs.
- Simulador: no mostrar un Disponible inventado; hasta contar con Disponible validado, solo se permite un diferencial hipotético expresamente identificado como parcial.
- Menú y Dashboard: mantener Inicio, Ingresos, Fijos, Variables, Huchas, Compartidos, Financiaciones, Dinero en mano, Pagos, Presupuestos, Simulador, Análisis, Bancos, Notificaciones, Ajustes y Ayuda, con navegación visual compacta.
- Ninguna pantalla de lectura de estos módulos equivale a CRUD de producción. Falta QA transaccional antes de habilitar operaciones definitivas.

