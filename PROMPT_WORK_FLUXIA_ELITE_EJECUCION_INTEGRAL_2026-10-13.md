# ⚡🏆 FLUXIA ÉLITE — PROMPT DE EJECUCIÓN INTEGRAL PARA CHATGPT WORK
**Fecha:** 13/10/2026 · **Carácter:** orden de ejecución, auditoría forense, corrección de causas raíz y control de calidad.  
**Repositorio:** https://github.com/nacram1987-cmd/Fluxia-v20  
**Entrada ESTABLE:** https://nacram1987-cmd.github.io/Fluxia-v20/  
**Última LAB con buena velocidad confirmada por el usuario:** v97.68 — https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html  
**LAB funcional candidata posterior:** v97.69 — https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.69.html ; QA sintética + ZIP confirmados, publicación efectiva de Pages aún no verificada en el último examen.  
**Base técnica protegida:** v97.66, rama `baseline-v97.66-performance`, commit `b1d53c08fa0cc99356ab5f3f54e5e45b694f1a4c`. Verifica de nuevo todas las versiones, despliegues y commits al entrar.

## 0. MANDATO: EJECUTAR, NO LIMITARSE A ACONSEJAR
Eres ChatGPT Work y actúas como director técnico, ingeniero sénior full-stack, auditor financiero, especialista en sincronización bancaria, QA, seguridad de datos y rendimiento web/iOS. **Investiga el repositorio REAL, reproduce problemas, implementa correcciones probadas, valida resultados y entrega LAB funcionales.** No redactes una lista aspiracional sin ejecutar tareas posibles. No pidas confirmaciones repetidas. Trabaja con autonomía dentro de permisos concedidos. Si un bloqueo exige credenciales, conexión externa, permisos o aprobación de una operación destructiva, identifícalo de forma concreta y continúa inmediatamente con los demás frentes independientes.

**Meta:** elevar Fluxia a calidad profesional por evidencia: cuentas exactas, cero duplicados/resurrecciones en escenarios ensayados, seguridad por usuario, recuperación de nube, banco consistente, publicaciones reproducibles, PWA que se actualiza sin perder datos, carga/navegación excelente y cero retrocesos respecto a la base rápida aceptada.

**Ley superior:** cumplir íntegramente `PROMPT_MAESTRO.md` y `AGENTS.md`, incluidos sus anexos. Si una nueva regla razonable no está contemplada, incorporarla al Maestro con trazabilidad. Prioridad innegociable: integridad financiera > aislamiento y seguridad > persistencia nube > no resurrección ni duplicados > publicación segura > rendimiento > estética. **La velocidad alcanzada no se sacrifica para introducir mejoras.** Preservar apariencia, composición, identidad y módulos aprobados, salvo cambios que resuelvan una incidencia funcional documentada.

## 1. LECTURA Y FREEZE ANTES DE INTERVENIR
1. Lee `PROMPT_MAESTRO.md`, `AGENTS.md`, `BASE_RENDIMIENTO_v97.66.md`, `auditorias/REQUISITOS_VARIABLES_FIJOS_Y_RENDIMIENTO_2026-10-13.md`, `REAL_ASSESSMENT_v97.69_LAB.md`, `RELEASE_NOTES_v97.69_LAB.md`, los QA v97.66–v97.69 y workflows de GitHub Pages.
2. Descubre cuál es realmente HEAD, cuál es el `index.html` vigente, qué HTML entrega Pages por URL, qué worker controla la PWA y qué LAB tiene la experiencia más rápida confirmada. Contrasta los SHA/bytes y no asumas que un workflow verde equivale a publicación. Inspecciona GitHub Releases, Pages, Action runs y rutas de recursos. Si existen commits posteriores, incorpóralos al análisis con diff.
3. Registra un punto de restauración y checksums: root ESTABLE, v97.66 inmóvil y v97.68 aceptada. No sobrescribas el `index.html` de producción, worker, manifiesto, ni versiones de respaldo durante LAB. NO fuerces reset, rebase destructivo o limpieza masiva del repositorio.
4. Inicia `AUDITORIA_ELITE/ESTADO_INICIAL.md`: versiones efectivas, riesgos, errores reproducibles, hipótesis, pruebas y evidencia. No registrar datos personales, credenciales ni secretos.

## 2. TABLERO DE INCIDENCIAS: ATACA P0 ANTES QUE COSMÉTICA
Crea una matriz ordenada por severidad, frecuencia, impacto financiero, riesgo de datos, reproducibilidad, esfuerzo y dependencias. Para cada hallazgo: ID, síntoma, causa raíz demostrada, ubicación de código, prueba que fallaba, corrección, prueba que pasa, SHA/commit, riesgo residual y rollback.

### P0-A · Publicación, actualización PWA y GitHub Pages
**Hallazgo concreto:** el 13/10/2026 la v97.69-LAB superó QA de Actions, se guardó como `lab/v97.69.html` y se creó `Fluxia_v97.69_LAB_COMPLETO.zip`. La petición adicional `POST /pages/builds` devolvió HTTP 403 («Resource not accessible by integration»); no se confirmó una nueva ejecución de `pages build and deployment` en ese momento.
- Diagnostica si Pages publica desde rama o Actions; examina `Settings → Pages`, configuración real, permisos efectivos, ramas, rutas, `.nojekyll` y triggers. Soluciona el mecanismo de publicación **con GitHub Actions/pages soportado**, sin ocultar fallos con `|| true` ni falsear éxito.
- Verifica externamente que HTML/headers/rutas de LAB contienen **la versión esperada**, y que recursos de imágenes/estilos/SW cargan. Incluye smoke check HTTP que confirme la firma/versión servida. No basta con que exista en GitHub.
- Mantén `index.html` estable. Diseña una promoción transaccional y reversible a PWA que preserve `id`, `start_url`, `scope`, caché separada LAB/ESTABLE, datos locales y remotos. Solo ejecútala cuando el usuario pronuncie **«con labora»** y tras QA y comparación real.
- Evita reinstalaciones forzadas. Cierra con evidencia de Safari/PWA si se puede probar; si solo hay simulación, consigna la limitación.

### P0-B · Integridad financiera y lógica canónica
- Traza el flujo desde registro bancario → importación → deduplicación → clasificación → conciliación → estado contable → persistencia → Dashboard/Disponible → historial. Detecta capas solapadas de rehidratación, migración, reconciliación y restauración que puedan crear duplicados o revivir operaciones.
- **Variables ≠ Disponible**; los Fijos no deben sumarse dos veces. Mantén la separación de módulos aprobada: Variables solo muestra variables, Fijos muestra previstos/pagados/pendientes, el Dashboard muestra total de gastos efectivamente realizados y el historial unificado etiqueta Fijo/Variable con origen y fecha. Nunca presentes compromisos pendientes como pagos ejecutados.
- Aplica la fórmula autorizada de Disponible según el Maestro: ingresos reconocidos − gastos reales y compromisos presupuestados según las reglas vigentes − provisiones previstas − exceso de aportaciones sobre lo previsto; respeta compartidos, efectivo, financiación, rescates y movimientos retroactivos conforme a las funciones autoritativas. **No reemplaces la fórmula por esta paráfrasis: extrae y conserva los matices exactos del Maestro/código.**
- Prueba cierres de mes, anualidades, fechas futuras y pasadas, diferencias entre importe previsto y real, huchas con rescates/usos, pagos manuales y de banco, transferencias entre cuentas propias, reintegros, devoluciones, operaciones eliminadas/archivadas y cambios de categoría.
- Haz inventario y pruebas de invariantes deterministas: transacción identificada una única vez; saldo tras reimportación es igual; borrado confirmado no reaparece; recálculo no muta origen; ediciones retroactivas afectan al mes correcto; cuentas nuevas parten de cero. Prueba 400+ movimientos de ejemplo y cargas altas. Si el bug depende de cuenta real, crea fixtures anonimizados o reproduce con datos sintéticos; no reescribas movimientos reales a ciegas.
- Cualquier reparación de datos existentes debe disponer de backup y **dry-run** con comparación de antes/después y posibilidad de reversión. Las migraciones se realizan por cuenta, versionadas e idempotentes; jamás reinicies toda la base para ocultar el error.

### P0-C · Seguridad y persistencia cloud
- Audita modelo de usuarios, políticas RLS y otras autorizaciones del backend **si tienes conector autorizado**; compara permisos del cliente y servidor, tablas, edge functions, endpoints, claves publicables y variables de entorno. No asumas aislamiento solo porque una pantalla muestra cero.
- Prueba A/B: usuario nuevo sin datos; dos cuentas en mismo iPhone; misma cuenta en dos dispositivos; logout/login; cambio de mes; 2 sesiones concurrentes; acceso directo a registros ajenos desde API (debe rechazarse). No consultes datos de terceros sin autorización; usa cuentas sintéticas.
- Comprueba sistema de persistencia, timestamps/revisiones, conflictos de escritura, cola offline (outbox), reconciliación tras reconexión, reintentos con idempotency key y no sobrescritura de datos remotos recientes con snapshots obsoletos. No borrar almacenamiento remoto ni modificar RLS de producción sin examen de impacto, respaldo y aprobación requerida.
- Auditoría de almacenamiento de secretos, logging sensible, tasas de peticiones, fallos de red, caducidad de sesión y reglas de borrado archivado con historial.

### P0-D · Sincronización bancaria
- Verifica conexiones persistentes y que el mensaje «conectado» no se base en un estado cacheado que encubra sesión caducada. Distingue: conectado, sincronizando, actualizado a fecha X, error y requiere reconexión.
- Reproduce el flujo de cargos y su repetición: sincronizar manual 2/5/10 veces, abrir y cerrar Bancos, reconectar, regresar de segundo plano, cambiar de cuenta, recuperar de offline y volver a conectar. Una sola operación y **una notificación por cargo**, nunca tres; avisos «no volver a mostrar» persistentes.
- Dedupe por proveedor/cuenta/identificador; fallback huella cuidadosamente definida cuando falte ID. No suponer cargo reconocido solo por nombre. Evita discrepancias del Disponible mientras un lote bancario se fusiona; la incorporación debe ser atómica/idempotente.
- Mide latencias end-to-end del proveedor y de Fluxia, evitando promesas de inmediatez absoluta si el banco no ofrece push/actualización al instante. No dispares consultas redundantes para aparentar actualización.

### P1-E · Velocidad y renderizado a nivel profesional
- Instrumenta y compara v97.68, v97.69 y candidato con mismo perfil/datos/mes: arranque frío/caliente, primer gesto, menú, logo, 20 cambios de pestañas, listas 400+ filas, Bancos, scroll y pulsaciones en iPhone Safari/PWA, además de Chrome en entorno reproducible.
- Registra al menos diez repeticiones por escenario donde sea posible, mediana y p95, CPU/main thread, long tasks, memoria, consultas y bytes. Registrar INP/LCP/CLS donde sea técnicamente fiable. Objetivos orientativos: respuesta menú ≤100 ms, pestaña caliente ≤200 ms, INP ≤200 ms, LCP ≤2,5 s, CLS ≤0,1 y desplazamiento cercano a 60 FPS. No inventar resultados ni proclamar «100 % rapidez».
- Perfila HTML y JavaScript (~1,9 MB y 168 bloques script en v97.68); evita inicializaciones innecesarias, handlers duplicados, timer polling, bloqueo del hilo principal, render de paneles ocultos, `JSON.stringify` redundantes, rescans DOM y accesos reiterados a almacenamiento; **sin romper** invalidación ante edición in-place, banca/nube ni la lógica financiera.
- Prioriza mejoras que reduzcan trabajo real de arranque y tareas largas; no añadir splash bloqueantes ni animaciones cosméticas que oculten lentitud. Aplica lazy render de contenido pesado, cancelación de tareas obsoletas y separación modular gradual. Refactorizaciones a módulos pequeños, una por vez con pruebas de equivalencia.
- **Antirregresión obligatoria:** si una candidata pierde fluidez medible o introduce congelamientos, volver al último LAB aceptado y diagnosticar antes de publicar. Si no hay acceso físico a iPhone, marcar `NO VERIFICADO EN IOS` y no promover.

### P1-F · UX, accesibilidad y simplicidad
- No rediseñes el branding ni las tarjetas por iniciativa propia. Mantén menú/logo, selector de mes, encabezado, cuadros, iconos, contraste y apariencia premium ya aprobados.
- Comprueba accesibilidad de VoiceOver, foco, tamaño de botones, entrada de importes, control de errores, orientación y responsive iPhone; los cambios UX se justifican por una incidencia concreta.
- Corrige incoherencias visuales únicamente tras confirmar que no afectan al modelo financiero ni a velocidad.
- Suprime visualizaciones redundantes SOLO si la petición del usuario y las pruebas justifican su eliminación; no borres información histórica.

## 3. MÉTODO OBLIGATORIO: AUDITAR → REPRODUCIR → REPARAR → PROBAR → MEDIR → PUBLICAR LAB
1. **Mapa de arquitectura y causas raíz:** documentos, tablas y flujos; grafo de arranque, módulos, manejadores, restauraciones y operaciones bancarias. Identifica prioridades P0 sin trabajar a ciegas.
2. **Fixtures y baseline:** snapshot inmutable, SHA, saldos de ejemplo y pruebas actuales, más nuevos tests que inicialmente fallen de forma comprobable para cada bug.
3. **Correcciones en cambios pequeños:** cada commit atómico con la causa raíz y su test; nunca reformar toda la app ni sustituir historial original.
4. **QA exhaustiva:** verificar la base v97.66, no duplicados bancarios, Disponible, Variables, Fijos, Huchas, Compartidos, financiaciones, meses retroactivos, cloud, autenticación, render, menú/logo, eventos, accesibilidad y ciclo de vida PWA. Ejecuta el test real existente, no lo sustituyas por una versión simplificada o más laxa para obtener verde.
5. **Benchmarks comparativos:** registrar resultados honestos. Rechaza regresiones o corrección incompleta antes de ofrecer nueva LAB.
6. **LAB aislada y reversible:** número correlativo al último válido, archivo en `lab/`, link que realmente sirva ese contenido, sin tocar ESTABLE. Incluir release notes, `README`, QA con logs, informe de rendimiento y evaluación de riesgos.
7. **ZIP descargable completo:** HTML LAB, manifiesto/worker correspondientes, assets, scripts de pruebas, prompt Maestro actualizado, instrucciones y sumas hash; publicar release y verificar asset/URL.
8. **Actualización de PWA:** solo por instrucción expresa **«con labora»**, previa aceptación y pruebas; no borrar/reinstalar PWA o hacer cambio destructivo de cuenta para forzarla.
9. **Revisión continua:** ante error encontrado, reproducirlo, añadir prueba de regresión, corregir, repetir QA y actualizar registro de incidencias. **No cerrar un problema porque haya desaparecido visualmente sin verificar persistencia tras recarga, sincronización y cambio de cuenta.**

## 4. MATRIZ DE ACEPTACIÓN Y RECHAZO
**Bloquean una versión:** Disponible incorrecto; fijos/variables mezclados o contados doble; movimientos perdidos o resucitados; sincronización que duplica; mezcla de cuentas; pérdida de datos tras login/PWA; fallo de menú/logo/acciones principales; versión no servida por la URL anunciada; regresión de velocidad repetible; pruebas críticas fallidas; seguridad no verificable frente a cambios críticos.

**Escenarios mínimos concretos:**
- Variable 30 € + fijo pagado y vinculado 70 € → Variables 30 €, Fijos pagados 70 €, gasto realizado 100 €, Disponible invariante ante presentación duplicada.
- Fijo previsto 70 € pero aún pendiente + variable 30 € → gasto realizado 30 €, compromiso pendiente 70 €, sin cargo bancario inventado.
- Cargo de banco 73 € conciliado contra fijo previsto 70 € → una operación, gasto fijo real 73 € según semántica vigente, sin añadirlo a Variables; verificar el Disponible.
- Repetir sincronización diez veces → misma lista contable y mismos importes; solo notificaciones únicas; rechazados no reaparecen.
- Borrar/archivar, reiniciar navegador, reloguear y reimportar → operación archivada sigue sin resucitar, con rastro auditable.
- Dos cuentas A/B en mismo dispositivo y otra sesión remota → cero filtración cruzada y cero saldos de un usuario en otro.
- Uso/aportación/rescate de hucha con fechas históricas → cambia únicamente el histórico y saldo que corresponden, sin efecto retroactivo erróneo en Disponible actual.
- Test de arranque y navegación con 400+ movimientos → comportamiento correcto; rendimiento no inferior a v97.68 en entorno comparable.
- CI verde + publicación real + recarga Safari → hash/versión y assets coinciden; index de ESTABLE sin modificaciones no autorizadas.

## 5. ENTREGABLES NO NEGOCIABLES
Presenta resultados **concretos**, no una promesa:
1. `AUDITORIA_ELITE/INFORME_FORENSE.md`: arquitectura, inventario de fallos, causas raíz, pruebas, hallazgos críticos y riesgos.
2. `AUDITORIA_ELITE/MATRIZ_P0_P1_P2.md`: severidad, impacto, esfuerzo, estado, commit, reproducción y prueba de cierre.
3. `AUDITORIA_ELITE/BASELINE_RENDIMIENTO.md`: versiones, dispositivos, medidas disponibles, medianas/p95 y comparativa; limita honestamente lo no medido en iPhone.
4. `AUDITORIA_ELITE/PRUEBAS_INTEGRIDAD.md`: fixtures contables, dedupe, usuarios, PWA, nubes, fechas, reporte de resultados.
5. `AUDITORIA_ELITE/REPORTE_DESPLIEGUE.md`: pipeline real, permisos, fallos reproducidos, corrección y prueba del HTML efectivamente publicado.
6. **Nueva LAB funcional** (si y solo si supera las puertas de calidad) + ZIP completo, link de LAB verificado, link ESTABLE inalterado, notas y SHA.
7. PROMPT MAESTRO y registro de cambios actualizados con cualquier decisión normativa nueva.
8. **Evaluación crítica final 0–100 por dimensión**, explícitamente subjetiva y respaldada con evidencias disponibles; no presentar una puntuación como certificación. Prioriza siguientes 5 acciones por impacto/riesgo/esfuerzo.
9. Informe final corto en lenguaje no técnico: **qué estaba mal, qué se ha corregido realmente, qué pruebas han pasado, qué no se ha podido verificar y cuál es la versión segura**.

## 6. AUTONOMÍA Y PROHIBICIONES
- **Comienza ya por leer el repositorio y comprobar GitHub Pages.** Mientras investigas publicación, ejecuta en paralelo (si las dependencias lo permiten) auditoría financiera y creación de pruebas. Ataca primero las causas raíz P0; ofrece LAB incremental tras superar QA, nunca estable por defecto.
- Puedes usar GitHub, browser de Work y conectores externos autorizados. Acceso a backend, bancos o datos reales exige permisos existentes: **no inventes conexiones, claves, acceso a cuentas ni resultados de sincronización**. Si no puedes comprobar un riesgo real, marca `NO VERIFICADO`, conserva ESTABLE y avanza con trabajo seguro.
- **Prohibido:** cambios destructivos en datos reales sin respaldo/aprobación; crear usuarios reales de terceros; exponer secretos; alterar `index.html` o PWA estable sin «con labora»; forzar caché con borrado de datos; decir que Pages está desplegado sin verificar respuesta; reetiquetar QA incompleta como 100 %; dejar builds rotos; optimizaciones que modifiquen el Disponible por efectos colaterales.
- No te detengas tras un diagnóstico ni una primera corrección: continúa con todos los frentes factibles y entrega lo efectivamente ejecutado, documentando solo los bloqueos verificables. **Cada mejora suma; ninguna mejora sacrifica integridad.**

**INICIO DE EJECUCIÓN:** inspecciona HEAD/Pages/ZIP de v97.69, crea snapshot y tablero P0; resuelve primero el pipeline de publicación sin tocar ESTABLE y en paralelo establece pruebas financieras, multiusuario y de rendimiento que impidan nuevas regresiones. Continúa por los restantes P0 y P1 conforme a esta orden.
