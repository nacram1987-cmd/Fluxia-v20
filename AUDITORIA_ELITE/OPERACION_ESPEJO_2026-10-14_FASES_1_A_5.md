# OPERACIÓN ESPEJO 100 % — AUDITORÍA DE EJECUCIÓN 1→5
Fecha de corte: 2026-10-14 · Estado: BLOQUEADA PARA CERTIFICACIÓN FINANCIERA.
**Origen operativo autoritativo:** HTML/PWA estable vigente, no una copia parcial de Supabase ni la LAB Élite.
**Regla de aceptación:** 51 gastos variables en octubre 2026, según verificación del usuario en HTML; exigir igualdad por IDs, fechas, importes, categorías, estados y origen, no solo por cantidad.

## Fase 1 — Congelación y auditoría de la base madre
- REFERENCIAS SIN MODIFICAR: main/index.html SHA `9c9c0840aedba24119d9422684ebc4a7deea5e72`, tamaño 1.909.433 bytes; base de rendimiento `baseline-v97.66-performance` commit `b1d53c08fa0cc99356ab5f3f54e5e45b694f1a4c`; v97.68-LAB.
- Leídos `PROMPT_MAESTRO.md`, `AGENTS.md`, `BASE_RENDIMIENTO_v97.66.md`, `auditorias/REQUISITOS_VARIABLES_FIJOS_Y_RENDIMIENTO_2026-10-13.md`, pruebas v97.68.
- GitHub connector no transmite completo el HTML de 1,9 MB (la lectura de archivo devuelve vacío); clonación Git en entorno de trabajo falla por DNS. **Bloqueador P0:** hay que ejecutar extracción/chunking desde GitHub Actions o acceder con el ordenador/navegador de Work, SIN editar el HTML madre. No se certificará fidelidad sin parseo completo de `index.html` y de todos los scripts bancarios.

## Fase 2 — Auditoría de Élite / modelo de datos
- Élite Safari v1.6.0: interfaz genuina, selector fecha, historial, read-only. Ediciones son borradores en memoria. El Disponible está intencionadamente sin conciliar. La integración bancaria es informativa; NO ejecuta el workflow real.
- La LAB consultaba 6 claves `p_usr-<perfil>__planRescate_v2_<módulo>` del mismo usuario autenticado. Esta muestra NO equivale al estado operativo del HTML.
- Tablas con RLS enabled: `fluxia_datos`, `banco_bandeja`, `eb_conexiones`. Políticas propias de lectura/escritura comprobadas en `fluxia_datos` con `auth.uid()=user_id`. No se hallaron políticas directas en `banco_bandeja` para rol authenticated: se accede por Edge, no crear SELECT público para paliar la ausencia de datos.
- Función `Fluxia-banco-lab9770` desplegada v3, verify_jwt=false, autentica explícitamente Authorization Bearer en `userFromReq` mediante `sb.auth.getUser` antes de despachar acciones; toda ruta individual debe verificarse por identidad y permisos. No se cambia configuración ni se activan llamadas desde la LAB.
- Hay 3 funciones Edge bancarias ACTIVE: `Fluxia-banco`, `Fluxia-banco-lab9755`, `Fluxia-banco-lab9770`. No conectarlas indistintamente ni crear sesiones de banco duplicadas.

## Fase 3 — Reconciliación de datos reales (lecturas SQL, no escrituras)
- Colección `planRescate_v2_movimientos`: 323 movimientos, 11 fechados octubre 2026.
- Colección `v2_movimientos`: 323 movimientos, 14 fechados octubre 2026. Comparación por ID: 3 presentes solo en segunda fuente y cero diferencias de fecha/importe entre los octubre compartidos.
- `planRescate_v2_fijos`: 98 filas, 15 etiquetadas `mes=octubre` sin año; `v2_fijos`: 153 filas, 14 de octubre, ninguno con ID nuevo frente a canónica. No duplicar.
- `planRescate_v2_ingresos`: 41 registros; 5 con `mes=octubre` sin año.
- `planRescate_v2_compartidos`: 12 registros; 1 con fecha octubre.
- `banco_bandeja`: 39 registros (39 IDs únicos), **0 de octubre**, 8 marcados pendientes; última fecha 28/09/2026. Las 2 entradas `eb_conexiones` tenían permiso aún vigente al consultar, lo que NO demuestra que su sync contable actual esté operando.
- Claves financieras antiguas `__planRescate_v2_movimientos` / `__v2_movimientos` fueron actualizadas 05/10/2026; actividad de identidad bancaria sí continúa hasta el 14/10/2026 en claves tipo `profile:...:v2_bank_identity_checkpoint9770_...`. Esa actividad NO implica 51 cargos procesados.
- **GAP P0:** 51 movimientos variables actuales del HTML no reproducibles desde estas tres fuentes. Se desconoce todavía el origen operativo exacto de los 51: no insertar sintéticamente, no unir copias/archivos/bandejas como si fueran gastos auténticos y no inferir saldos.
- Comparación final necesaria: snapshot simultáneo HTML ↔ Élite con el MISMO perfil, mes, zona horaria, estados, archivos, conciliaciones y fecha de corte. Debe producir `missing_ids`, `extra_ids`, `value_mismatches`, `duplicate_ids` y diferencias de saldo en céntimos.

## Fase 4 — Contrato de motor financiero compartido
**Diseño definido, despliegue aplazado por bloqueo de paridad.** Separar:
1. **Fuente bancaria**: proveedor→Edge existente autenticado→identificador estable→bandeja/importación idempotente. Nunca copiar claves secretas ni llamar a acciones de escritura durante auditoría.
2. **Registro canónico**: `user_id + profile_id + movement_id` inmutable; concepto, fecha operativa, importe en céntimos, estado, origen, vínculo fijo, archivado y causalidad del cambio. No fusionar usuarios ni usar el nombre para crear vínculo automáticamente.
3. **Proyección por periodo**: Variables excluye cargos con `cuentaComoFijo` o `vinculoFijoId`, pagos fijos no dobles, pendientes no son realizados, movimientos retroactivos afectan su mes, Disponible reutiliza EXACTAMENTE las funciones originales (`variablesTotal`, `gastosFijosDisponibleTotal`, `disponibleEfectivo`) tras extracción.
4. **Persistencia**: Cloud-first, RLS por usuario, upserts con IDs estables, archivado/tombstones, rechazo definitivo, validación optimista y rollback. Sin escribir agregados derivados como nuevos movimientos.
5. **Compatibilidad**: HTML ESTABLE sigue fuente operativa durante adopción. No activar escrituras Élite hasta igualdad 51/51 y QA multiusuario; si falta un registro, abortar publicación.

## Fase 5 — Pruebas y certificación
- Archivo: `lab/qa/fluxia-elite-paridad.test.cjs`. 10 escenarios sintéticos ejecutados con JS V8 y adaptador de assertions estilo Node: **10/10 aprobados**. Incluyen exactitud 51/51 por IDs y campos, deduplicación, 30 variable+70 fijo, pagos no confirmados, históricos, archivo, idempotencia y aislamiento.
- **NO** equivalen a auditoría real del HTML; pruebas reales 51/51: **NO SUPERADAS / bloqueadas**. No existe prueba de que los 51 tengan IDs/fechas/importes iguales en Élite.
- QA comparativa de arranque/navegación/bancos en iPhone, RLS con dos usuarios y cierre/apertura de PWA: **PENDIENTE**. No se inventan tiempos ni estabilidad.
- Seguridad: no se ha ejecutado ninguna escritura SQL, migración, despliegue Edge, nueva conexión bancaria, movimiento bancario, ni cambio a `index.html` / PWA estable.

## Semáforo de entrega
- Fase 1: **PARCIAL**, índice y SHAs congelados; extracción completa HTML bloqueada.
- Fase 2: **AUDITORÍA ESTÁTICA REALIZADA**, certificación funcional pendiente.
- Fase 3: **PARCIAL con hallazgo P0 confirmado**, 51 no reconciliados.
- Fase 4: **CONTRATO ESTABLECIDO**, implementación financiera aplazada por bloqueo P0.
- Fase 5: **10/10 sintéticas**, pruebas reales y promoción **NO APTAS**.

## Criterios vinculantes de aceptación
- Octubre HTML vs Élite: **51/51 registros por ID y mismo estado**, cero duplicados, cero ausentes y `0,00 €` diferencia en cada subtotal y Disponible, sin falsos ceros.
- Huchas: igual aportación, rescate, uso y saldo mensual/histórico; Fijos y Variables nunca duplicados; Compartidos y cuotas con sus estados y fechas.
- Banco: mismas conexiones por usuario, deduplicación persistente e idempotente, notificaciones sin reaparición, importación y marcado fijo con fecha real.
- Protección: auditorías green y rollback disponible, benchmarks contra v97.68, estabilidad y datos aislados, aceptación Safari antes de cualquier promoción.
- Última LAB independiente: https://nacram1987-cmd.github.io/Fluxia-v20/lab/fluxia-elite-safari-datos-reales.html
- HTML ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/

**Veredicto:** no afirmar fases 1-5 completadas al 100 %: se han ejecutado auditorías y QA seguras hasta el bloqueo P0. Continuar sobre extracción íntegra del HTML y fuente de 51, sin migración a ciegas.
