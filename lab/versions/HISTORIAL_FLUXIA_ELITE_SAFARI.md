# Fluxia Élite BETA · Historial Safari (independiente de PWA HTML y SwiftUI)
Fecha: 2026-10-15

# Fluxia Élite BETA · Historial Safari (independiente de PWA HTML y SwiftUI)
Fecha: 2026-10-15

## v2.0.06 · cotejo de Dinero en mano y aislamiento de fuentes (15/10/2026)

**Qué cambia y dónde verlo**
- Dinero en mano → carga una copia privada del mismo perfil desde Ajustes del HTML. Élite coteja esa instantánea con la colección de nube autenticada.
- La tarjeta nueva muestra conteos solo HTML/solo nube, diferencias por ID/campos, IDs repetidos o ausentes y diferencia entre saldos históricos.
- Al haber diferencias por ID, muestra los valores del HTML y de la nube para facilitar la revisión.
- Detecta, por ejemplo, si movimientos de efectivo anotados en el HTML aún no aparecen en la copia de nube. No presupone importes ni registra los datos del usuario en el código.
- El cotejo es de solo lectura: no fusiona, repara, importa ni duplica movimientos; el HTML madre conserva las operaciones reales.
- Huchas: regresión añadida para demostrar que la vista HTML usa solo la copia exacta del perfil y la vista nube usa solo sus propios usos. No mezcla fuentes.
- El resumen reconstruido muestra «Pendiente de reponer» separado del saldo reservado; solo presenta el total cuando los retiros temporales y sus reposiciones se pueden verificar.
- Versión y copia anterior: v2.0.05 se conserva para rollback. PWA estable permanece intacta.

**Pruebas locales Node.js**
- Cartera: 27/27 invariantes, incluidos +20 € de entrada y −30 € de gasto como fixture sintética, discrepancia neta −10 €, discrepancias por ID, IDs duplicados y fuente ausente; snapshots idénticos con tipo o importe inválido no certifican paridad.
- Huchas: aislamiento exacto del perfil/vistas HTML-nube, reconstrucción del libro mayor y prueba de pendiente de reponer separada del saldo: superados.
- JavaScript inline: análisis sintáctico superado.
- No verificado en Safari/iPhone, con el perfil real del usuario ni tras publicación de GitHub Pages. El candidato sigue en rama LAB sin URL operativa publicada.

**Archivos:** `lab/fluxia-elite-safari-datos-reales.html`, `lab/js/fluxia-elite-wallet-v1.js`, `lab/qa/elite-wallet-regression.cjs`, `lab/qa/elite-hucha-source-priority-v20006.cjs`.
**Rollback:** `lab/versions/fluxia-elite-safari-v2.0.05.html`.
**PWA estable:** sin cambios.

## v1.9.1 · Importación privada de Dinero en mano del mismo perfil (14/10/2026)

**Nuevo en esta subversión y dónde verlo**
- Dinero en mano → «Seleccionar copia del perfil (.json)»: permite leer desde el dispositivo el archivo creado por «Ajustes → 💾 Copia solo este perfil» en el HTML BETA.
- Verifica tipo de exportación, identificación EXACTA de perfil y presencia de la clave de cartera de ese perfil. Una copia global, de otro usuario o con estructura incorrecta es rechazada.
- Extrae exclusivamente la cartera y el momento de exportación; no importa bancas, contraseñas ni resto del backup al estado de Élite. No llama a red y no guarda el archivo en disco, nube ni localStorage.
- El saldo mostrado será el **del instante de la copia exportada**, no un supuesto balance bancario en directo. La copia se elimina de la sesión al cerrar o cambiar de perfil.
- Mantiene las tres reglas contables del HTML: meter solo cartera; gastar carrito + variable único; pagar con provisión no descontar dos veces.
- Conserva anteriores mejoras v1.9.0: paneles de Efectivo, Presupuestos, Simular, Análisis, Pagos, Notificaciones, Ajustes y Ayuda y navegación compacta.
- Protección de cuenta y privacidad QA: 16/16 tests aislados de perfiles distintos, copias globales, campos ilegibles y formatos maliciosos, sin red.
- Copia de rollback v1.9.1: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.9.1.html
- Limitación: las operaciones de escritura real de cartera siguen en el HTML hasta validar 51/51 Variables y persistencia en nube.

## v1.9.0 · Recuperación de módulos del HTML madre y cartera física (14/10/2026)

**Checklist y ubicación de mejoras**
- Inicio: sección compacta «Todo lo que tenías en Fluxia BETA» con Dinero en mano, Presupuestos, Análisis, Simular, Pagos y Bancos.
- Más: tres grupos —Tus finanzas, Planificación, Control y ayuda— con accesos a Ingresos, Compartidos, Financiaciones, Efectivo, Pagos, Presupuestos, Simulador, Análisis, Bancos, Notificaciones, Ajustes y Ayuda.
- Dinero en mano: lectura por perfil de v2_efectivo o planRescate_v2_efectivo, saldo histórico con fecha de copia, entradas, salidas, pago desde provisión e historial por mes. Nunca confundir saldo de cartera con Disponible.
- Dinero en mano: los controles Meter/Gastar/Provisión explican su efecto y derivan al HTML operativo mientras falte la escritura fiable de Élite; nunca crean gastos simulados en la nube.
- Presupuestos: límites por categoría y categorías originales, con comparación de CSV importado del mismo mes y perfil, sin sumar dos fuentes.
- Análisis: distribución por categorías exclusivamente del CSV exportado; no se inventa Disponible ni movimientos bancarios.
- Simular: calcula el impacto hipotético de ingresos, gastos y ahorro; sin saldo inicial ficticio ni persistencia.
- Pagos: histórico de v2_usos o planRescate_v2_usos; las copias no se suman.
- Notificaciones, Ajustes y Ayuda: estados de fuentes, protección de perfiles y enlaces a la operativa original.
- Sesión: al salir se limpian perfil, fuentes adicionales, CSV, comparaciones y datos cargados.
- Navegación inferior: continúa compacta con Inicio, Fijos, Variables, Huchas y Más.

**QA:** código JavaScript analizado; pruebas sintéticas de cartera 20/20, navegación 15 módulos + menú + logout 17/17, CSV 16/16, libro mayor 10/10: total 63/63. Sin certificación de Safari real, motor contable ni sincronización bancaria.
**Fuente monetaria verificada:** planRescate_v2_efectivo contiene un saldo histórico 0 y ningún movimiento, pero fue actualizada el 5/10/2026. No es prueba de que hoy el usuario tenga 0 € en mano; Élite lo etiqueta como copia antigua.
**P0 pendiente:** 51 Variables actuales de octubre, cargo adicional 7,50 €, saldos contables, operaciones de cartera/presupuestos/provisiones y banco.
**Protección:** no hay escrituras Supabase ni cambios en el index.html estable.
**Rollback inmutable:** https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.9.0.html

## v1.8.0 · Conciliación local de CSV original y variables por política HTML (14/10/2026)

**Novedades ejecutables y dónde comprobarlas**
- **Inicio → Espejo del HTML / Variables → Espejo del HTML:** Importar localmente el CSV real del mismo periodo desde Safari/iPhone sin enviar el fichero a Supabase ni guardar la información en localStorage.
- **Variables → Categorías del HTML:** filas completas agrupadas por categoría, subtotal exportado expresado en céntimos, fecha, concepto y coincidencia/no coincidencia por cinco campos (fecha, concepto, categoría, importe y origen).
- **Variables → Integridad:** filas sin coincidencia con la colección de nube del perfil autenticado; repeticiones exactas del CSV señaladas solo como posibles duplicidades, nunca eliminadas. El contador de 51 del HTML y 52 filas del CSV se muestran como discrepancia sin resolver.
- **Variables → 14/10:** alerta de cargo declarado de 7,50 € (gasolinera, categoría Tabaco) ausente del CSV, si efectivamente falta. No se crea una transacción sintética.
- **Variables → Listado del mes:** aplicación de filtros conocidos del motor original `esMovimientoVariable` (enlaces a Fijos, traspasos, efectivo, exclusiones). Los movimientos excluidos no se eliminan de la nube.
- **Checklist → Versiones:** solo novedades de v1.8.0 en checklist y enlaces a copias históricas; restaurada la copia v1.7.0 que faltaba.

**Fuentes comprobadas:** Archivo del usuario `fluxia-variables-Octubre.csv`: 52 filas, 811,39 €, seis filas extra sobre tuplas idénticas agrupadas en cinco grupos. No están confirmados duplicados por ID; la app no deduplica al contabilizar. Los importes en CSV son de origen, no el Disponible.

**QA:** 16/16 pruebas sintéticas del módulo JS `lab/qa/espejo-csv-regression.cjs` superadas, más pruebas previas 10/10 de invariantes del libro mayor. Nuevo workflow `.github/workflows/fluxia-elite-espejo-qa.yml` para ejecutar estas pruebas y verificar que el snapshot acompaña cada versión. Aún no certificada la ejecución de GitHub Actions en remoto ni Safari real.

**Rollback:** https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.8.0.html

**Pendiente P0:** igualdad 51/51 por ID/estado/importe, reconciliar exportación de 52 y movimiento de 7,50 €, integrar banco original sin segundo registro y certificar 0,00 € de diferencia. No se permiten escrituras financieras ni promoción de la HTML estable.

## v1.6.0 · Paridad bloqueada por fuente anticuada (14/10/2026)
- **Regla imperial y referencia de aceptación del usuario:** 51 gastos variables en octubre 2026, según HTML madre. La vista Élite actual no los reproduce. No se permite declarar 51/51 hasta reconciliación por ID, fecha, importe, estado y origen.
- **Hallazgo de raíz confirmado con SQL:** los registros de `p_usr-…__planRescate_v2_movimientos` y `p_usr-…__v2_movimientos`, y las dos familias de fijos, llevan `updated_at=2026-10-05`. Sus 11/14 cargos fechados en octubre son una instantánea anticuada. Supabase sí recibió cinco claves de actividad bancaria/identidad el 13–14 octubre, pero no son las colecciones de movimientos que usa Élite.
- **Dashboard y Variables:** alerta de desfase, número de cargos visibles en fuentes históricas, fecha real de actualización de datos y enlace directo a HTML estable.
- **Más → Bancos:** nueva pantalla informativa del estado de integración; no finge sincronización y permite abrir el HTML original para la operativa bancaria vigente.
- **Seguridad:** sin nueva conexión Open Banking, sin credenciales bancarias en el frontend, sin modificación de movimientos/saldos y sin migración de datos.
- **Copia archivada:** https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.6.0.html
- **Verificado:** sintaxis JavaScript, estructura del código, nombre y versión, separación por usuario en consultas y ausencia de escrituras financieras.
- **No verificado:** publicación efectiva de Pages, navegación Safari, UX del iPhone y reconciliación real de los 51. El HTML original gigante no pudo recuperarse entero usando la herramienta GitHub: pendiente de inspección íntegra con un mecanismo de transferencia apto.
- **Próxima fase P0:** localizar fuente operativa activa y banco original del HTML, contrato de autenticación y derivación contable; implementar lector de idénticos datos en Élite y comprobar exactamente 51/51 antes de activar edición.

## v1.5.0 · Día visible y auditoría real de octubre frente a dos colecciones del HTML (14/10/2026)
- **Dónde mirar:** selector en Inicio y módulos: ahora muestra día de la semana, día del mes, mes y año. Pulsar abre desplegable de día/mes/año. Elegir un día NO recorta silenciosamente el listado mensual; selecciona referencia visual mientras los cargos se siguen consultando por mes.
- **Dónde mirar:** Inicio y Variables, «Datos adicionales del HTML pendientes de conciliación»: compara colección canónica `planRescate_v2_movimientos` con `v2_movimientos` del mismo perfil autenticado por ID, fecha e importe, y muestra registros divergentes sin sumarlos al saldo.
- **Evidencia SQL 14/10:** colección canónica 323 movimientos (11 octubre con fecha real); segunda fuente `v2_movimientos` 323 movimientos (14 octubre); exactamente tres IDs nuevos de octubre en fuente v2, cero importe/fecha modificados para los otros 11. Segunda colección `v2_fijos` tiene 14 de octubre, todos presentes por ID e importe en canónica de fijos (15); no añadirlos de nuevo.
- **Seguridad:** las dos nuevas fuentes se solicitan únicamente con `user_id=auth.uid()` y prefijo validado de perfil, sin exposición entre perfiles. No hay nuevos posts financieros ni actualizaciones de saldos.
- **Limitaciones importantes:** otras claves del HTML (bancos, estados, notificaciones y espejos), reglas de historial y motor contable original todavía requieren auditoría de paridad completa. GitHub no permitió extraer el enorme `index.html` original por la herramienta de archivo; esta fase se apoya en las claves/nombres y en una comparación de datos SQL de solo lectura. No declarar que ya sea 100% igual al HTML.
- **Copia congelada:** https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.5.0.html
- **QA:** sintaxis JavaScript, lectura de solo consulta, manifiesto separado y mecanismos de diferencia de fuentes comprobados a nivel código. Pendiente: Safari real, Pages efectiva, RLS multiusuario con cuentas de ensayo, regresión contable, benchmark real.

## v1.4.0 · Octubre completo, control mensual y PWA Élite (14/10/2026)
- **Selector mensual:** eliminado input month circular de iOS; la cabecera muestra mes/año, flechas y un selector desplegable separado. Dónde mirar: Inicio, Fijos, Variables, Huchas, Ingresos, Compartidos.
- **Cobertura de octubre de 2026 comprobada mediante SQL de solo lectura:** movimientos 11 con fecha exacta, fijos 15 marcados `mes=octubre` sin año, ingresos 5 `mes=octubre` sin año, compartidos 1 con fecha exacta. No atribuir año inventado a fijos/ingresos históricos.
- **Dashboard y listados:** muestra recuento visible combinado de fechas exactas y registros por nombre de mes; los distingue en bloques de "fecha/periodo confirmado" y "mes sin año" para no computar doble ni atribuir saldo. No equivale aún a paridad total con todos los subsistemas HTML/bancos.
- **Barra inferior:** cinco accesos: Inicio, Fijos, Variables, Huchas y Más; Más ofrece Ingresos, Compartidos, Financiaciones y checklist. Tarjetas de Inicio siguen dando acceso directo a los seis módulos.
- **PWA independiente:** manifest exclusivo `lab/fluxia-elite.webmanifest`, inicio en LAB Safari, icono oficial, display standalone. No se ha añadido service worker offline ni se ha alterado `index.html`/service worker estable. Requiere internet y acceso autenticado.
- **Copia versionada:** https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.4.0.html
- **QA:** sintaxis JavaScript y estructura de versión/cabecera, selector, menú e histórico revisados. **Pendiente:** comprobar efectividad de GitHub Pages (acceso externo no confirmado), Safari real, instalación PWA desde Safari y regresión de rendimiento.
- **No finalizado:** conciliación contable HTML ↔ Élite, persistencia de operaciones reales, banco, permisos y auditoría de integridad completa. No anunciar perfección financiera sin esas pruebas.

## v1.3.0 · Recuperación de navegación mensual de Fluxia HTML (14/10/2026)
- **Dónde probar:** Inicio, Ingresos, Fijos, Variables, Huchas, Compartidos y Financiaciones; selector de mes con flechas y selector de año/mes. La barra inferior ahora incluye Compartidos.
- **Listas:** movimientos con fecha completa agrupados estrictamente por `AAAA-MM`; registros `mes: "julio"` sin año se muestran en bloque histórico, distinguidos para no inventar 2026/2027. Búsqueda y filtro por categoría mantienen un máximo inicial de 80 elementos por bloque.
- **Dashboard:** recuentos del mes elegido, recientes fechados de ese mes, y tarjetas de módulos. No se calculan saldos Disponible ni totales financieros arbitrarios.
- **Planes:** huchas y financiaciones con `inicio`/`fin` en formato ISO se incluyen cuando vigentes en el mes; los que carecen de fechas normalizables se muestran separados para revisión.
- **Datos:** lectura autenticada y segmentada por perfil; ninguna operación PATCH/PUT/DELETE sobre cuentas reales. PWA HTML ESTABLE y código SwiftUI sin cambios.
- **Pruebas en código:** análisis de sintaxis JavaScript y revisión de estructura, no equivalen a QA funcional completa. **Pendiente:** pruebas en Safari, selección histórica correcta según el motor HTML para gastos sin año, conciliación de pagos, estados y cálculos de Disponible, pruebas de velocidad reproducibles.
- **Copia:** https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.3.0.html

## v1.2.0 · Logos comerciales y checklist navegable (14/10/2026)
- Dónde comprobar: entrar en cualquier módulo, consultar cargos visibles de comercios reconocibles. Prioridad: logotipo comercial vía búsqueda pública (Wikidata, identificador P154). Si no existe o falla, icono genérico por concepto. Logos Apple/Amazon reconocidos previamente.
- Dónde comprobar: Inicio → 📋 Checklist y versiones. Checklist con secciones, comprobaciones visuales y explicación de cada nueva función.
- Velocidad: lazy lookup mediante IntersectionObserver, máximo dos búsquedas simultáneas, resultados deduplicados y cacheados en memoria por nombre de comercio. Sin nuevas librerías.
- Privacidad: se transmite al buscador solo nombre de comercio sanitizado; se excluyen conceptos típicamente sensibles como transferencias, IBAN, nómina. Las búsquedas son a terceros y requieren internet.
- Datos: NO se modifican importes, fechas, cargos, cuentas o estados. No se activa persistencia de ediciones.
- Copia inmutable: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.2.0.html
- QA local en código: sintaxis JS válida y comprobación estructural de activación de búsqueda en red, caché y checklist. NO medido todavía en Safari real. La publicación de Pages no está verificada externamente.
- Pendiente: catálogo completo de logos comerciales originales HTML, autorización/licencia de uso según proveedor y origen, motor financiero, escrituras persistentes, benchmark Safari y errores reales de red.

## v1.1.0 · Corrección CRÍTICA de carga real (14/10/2026)
- Hallazgo contrastado con esquema y consulta SQL de sólo lectura: 762 filas de nube, 1 cuenta autenticada; las colecciones canónicas se almacenan con la forma `p_usr-<perfil>__planRescate_v2_<módulo>`, no con los nombres sin prefijo que usaba v1.0.0.
- Se identificó 1 perfil canónico completo con seis colecciones: movimientos 323, ingresos 41, fijos 98, provisiones 7, financiaciones 8 y compartidos 12 en el instante del análisis. Las cantidades son instantáneas y sólo confirman forma de los datos, no balance.
- El cliente detecta prefijos sólo entre claves pertenecientes a la cuenta autenticada, selecciona sin mezclar perfiles y lee las seis colecciones exactas. Si faltan datos, indica error; nunca sustituye por arrays vacíos.
- Recuperación del logo Apple local cacheable y logo Amazon con carga diferida; iconografía semántica con ⚡ para luz y 💰 en lugar de animales decorativos. Si falta un logo, se usa símbolo genérico.
- Dashboard y módulos existentes pasan a poder mostrar los registros reales de la nube: fechas, importes de origen, últimos movimientos. No hay agregados contables hasta reconciliar.
- Copia congelada: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.1.0.html
- Comprobado: JavaScript parseable, referencia de marca, separación por prefijo, lectura en modo solo consulta, sin métodos PATCH/PUT/DELETE en cliente.
- Sin certificar: descarga pública GitHub Pages, login de usuario y experiencia Safari real, tiempos en dispositivo, paridad contable y persistencia de edición.

## v1.0.0 · Primera versión formal
- Dashboard con conteo de registros reales y número de colecciones obtenidas de Supabase Auth con control de usuario.
- Tarjetas por módulo con último registro que tenga fecha exacta parseable, importe original sin sumarlo como subtotal contable.
- Sección de hasta ocho registros recientes entre módulos, ordenados por fechas efectivamente presentes y con acceso al detalle.
- Versión visible en cabecera, dashboard y diálogo de historial.
- Preservación de copia versionada y copia anterior al sistema de versionado.
- Cero modificaciones a datos de producción, cero cifras inventadas de Disponible.

Entradas:
- LAB actual: https://nacram1987-cmd.github.io/Fluxia-v20/lab/fluxia-elite-safari-datos-reales.html
- Copia v1.0.0: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-v1.0.0.html
- Copia anterior: https://nacram1987-cmd.github.io/Fluxia-v20/lab/versions/fluxia-elite-safari-pre-versionado-20261014.html
- ESTABLE HTML sin cambios: https://nacram1987-cmd.github.io/Fluxia-v20/

## Contrato de numeración y entrega de Élite Safari
1. Todas las nuevas entregas incrementan la versión mostrada en cabecera y dashboard, e incorporan changelog propio.
2. Guardar una copia estática identificada de cada versión antes de modificar de nuevo la LAB.
3. Mantener la URL LAB constante para la última versión y enlazar las copias históricas.
3a. Mostrar siempre la versión en cabecera, dashboard, historial y resumen de cambios, sin prometer que Pages ha desplegado antes de probar la URL.
4. No mezclar numeración de Élite Safari con PWA HTML v97.x ni la de builds SwiftUI.
5. Aceptación requiere HTML y JavaScript válidos, pruebas funcionales en Safari, publicación efectiva comprobada y no regresión de rendimiento. El commit no demuestra esas comprobaciones.
6. No permitir escritura financiera hasta demostrar integridad, separación de usuarios, migraciones y pruebas de reversión.
7. Disponible se mantiene sin importe hasta confirmar paridad contable con HTML.


## v2.0.11 · bloqueo de referencias bancarias sintéticas (15/10/2026)

- El adaptador Élite reconoce el ID de respaldo que el conector bancario fabrica como `banco|fecha|importe|concepto` cuando el proveedor no entrega identificador de transacción.
- Esas filas quedan marcadas como `UNSTABLE_SYNTHETIC_BANK_REF` y no pueden entrar en el plan de conciliación. Se preservan para revisión; no se deduplican por similitud ni se escriben en el libro.
- Las referencias reales del proveedor y los IDs ausentes conservan sus rutas de validación propias.
- Regresión añadida para una referencia sintética, una real, una fila sin ID y dos movimientos ambiguos idénticos.
- El cambio solo afecta la auditoría LAB de Élite; no modifica HTML estable/PWA ni escribe en Supabase.
- Regresión local superada. Workflow de Pages, smoke HTTP y prueba Safari/iPhone quedan pendientes de ejecución.


## v2.0.28-LAB · 16/10/2026

- Paridad del Disponible con el HTML estable: los rescates temporales de hucha conservan trazabilidad, con impacto contable cero.
- La pensión pendiente sigue excluida del saldo disponible.
- Sin cambios al HTML estable ni a datos financieros en Supabase.
