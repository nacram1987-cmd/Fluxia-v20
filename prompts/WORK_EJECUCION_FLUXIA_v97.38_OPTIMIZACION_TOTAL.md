# PROMPT DE EJECUCIÓN PARA CHATGPT WORK — FLUXIA v97.38-LAB
## Auditoría de rendimiento, refactorización controlada y publicación real

**MISIÓN: EJECUTA, NO TE LIMITES A ANALIZAR.** Actúa como responsable técnico senior de frontend, PWA iOS Safari, persistencia cloud y auditoría contable. Debes estudiar, corregir, probar, versionar y publicar Fluxia. No solicites al usuario un ZIP ni le encargues subir archivos: tienes el repositorio conectado. Si una vía falla, utiliza las rutas alternativas de escritura de GitHub y valida el SHA del contenido antes de declarar éxito.

### Fuentes obligatorias y estado de partida
- Repositorio: https://github.com/nacram1987-cmd/Fluxia-v20
- **LEE COMPLETO** el `PROMPT_MAESTRO.md` vigente del repositorio. Sus reglas de integridad financiera, multiusuario, nube, estética y entrega tienen prioridad sobre cualquier optimización.
- Última prueba publicada: `lab-v97-37.html` (https://nacram1987-cmd.github.io/Fluxia-v20/lab-v97-37.html). La versión estable sigue en `index.html`. No sobrescribas la estable durante el diagnóstico.
- Preparar siguiente versión correlativa: **v97.38-LAB** o la que corresponda si existen cambios más recientes. Versiona título, metadatos, logs y README, **SIN etiquetas flotantes de versión**.
- El usuario confirmó que **Disponible e Imprimir están correctos**. No modificar su comportamiento ni su fórmula. Preservar absolutamente todos los movimientos, huchas, rescates, aportaciones, bancos, ingresos, fijos, variables y compartidos.
- Incidencia abierta: `Apple.com/bill · 14,99 €` reaparece preguntando si corresponde al fijo `Loterías`, incluso después de rechazarlo varias veces; ese fijo ya estaba pagado. Debe permanecer como gasto normal, sin nueva pregunta ni doble cargo.
- Otras incidencias: primera apertura lenta de **Gastos Variables** y **Bancos**; el menú desde Gastos Variables se ralentiza. Las entradas posteriores mejoran. La PWA puede cargar una versión antigua. El usuario exige cero franjas o indicadores flotantes con número de versión.

### Fase 1 — Auditoría forense de renderizado y arquitectura
1. Crea copia de seguridad inmutable y un inventario de módulos, rutas de sincronización, Service Workers, cálculos contables, listeners, timers y observers. Identifica fuentes de verdad: nube frente a caché local.
2. Instrumenta métricas de rendimiento con `performance.mark/measure`, Long Tasks donde esté soportado, contadores de renderizado y trazas de primera carga. Compara iPhone Safari (si está accesible) y WebKit/emulación sin confundirlos.
3. Mide arranque en frío y caliente, apertura/cierre del menú, entrada en Bancos, Gastos Variables, cambio de mes, inicio de sesión, scroll, importación y actualización PWA. Registra tiempos reales ANTES de modificar; no inventes cifras.
4. Localiza causas raíz: HTML de más de 2 MB, rehidrataciones y reconciliaciones duplicadas, renderizado completo de listas, consultas bancarias bloqueantes, handlers repetidos, `MutationObserver` global `subtree + attributes`, estilos heredados en conflicto, timers de reparación y carga de datos síncrona. Revisa especialmente los scripts de menú v97.27/v97.28/v97.31 y cualquier mecanismo solapado.

### Fase 2 — Optimización REAL de toda la aplicación
5. Consolida el menú en **un controlador canónico** con una única vinculación por elemento. Debe abrir/cerrar instantáneamente aunque Gastos Variables o Bancos sigan cargando. No introduzcas otro parche que compita con los anteriores. Evita observación global del DOM y listeners acumulativos; desmonta callbacks al salir.
6. Convierte las pantallas pesadas a renderizado incremental o listas virtualizadas si es seguro, usa selectores/memoización y actualizaciones selectivas, delegación de eventos, `requestAnimationFrame` y tareas diferidas. Preserva scroll, filtros, edición y accesibilidad. No renderices toda la aplicación cuando cambia un solo movimiento.
7. Para Bancos: muestra inmediatamente la estructura y el último estado conocido, rotulado con claridad como estado guardado si aún no se ha comprobado; sincroniza sin bloquear la UI y sin prometer conexión nueva antes de confirmarla. Deduplica solicitudes en vuelo, limita refrescos, aplica timeout/reintentos prudentes y evita triples notificaciones. Respeta PSD2 y credenciales.
8. Para Gastos Variables: elimina bloqueo de primera carga, cálculos O(n²) innecesarios y rerenderizados al cambiar pestaña/mes. La navegación debe seguir utilizable mientras la lista se prepara.
9. Unifica animaciones y densidad visual de cabeceras, selector mensual y tarjetas conforme al PROMPT MAESTRO. Elimina efectos costosos no esenciales. **No recrees elementos gráficos flotantes de versión**, barras de depuración ni superposiciones inferiores; guarda la versión en metadatos, GitHub y un apartado interno no intrusivo.
10. Evalúa dividir el monolito en módulos y carga diferida SOLO si la migración supera pruebas de regresión y no rompe GitHub Pages, autenticación, offline ni Safari. Prioridad al cambio mínimo seguro con mejora medible.

### Fase 3 — Persistencia financiera e incidencias concretas
11. Establece identidad estable de movimiento por usuario/cuenta/identificador bancario. Reimportar o sincronizar no debe crear duplicados, resucitar cargos eliminados ni volver a preguntar por decisiones definitivas. No combines movimientos distintos solo por importe.
12. Corrige **Apple.com/bill 14,99 € ≠ Loterías**. La coincidencia de importe no autoriza tratarlo como un fijo. No sugerir fijos ya pagados. Al pulsar `Es otro gasto`, guardar decisión definitiva por movimiento y usuario tanto en memoria local como en nube; limpiar la cola pendiente; el gasto debe seguir contabilizado **una sola vez**. Comprueba el resultado tras al menos cuatro sincronizaciones, recarga, nueva sesión y actualización PWA.
13. Garantiza separación total de usuarios, usuario nuevo con todo a cero, nube como fuente de verdad, operaciones de borrado con tombstones/histórico, ausencia de pérdida al reinstalar PWA o cambiar de dispositivo, y funcionamiento sin conexión con reconciliación segura. No migres ni transformes datos reales del usuario de forma destructiva.

### Fase 4 — PWA, QA y publicación
14. Revisa `sw.js`, `fluxia-sw.js`, `manifest.webmanifest` y la inscripción/activación de Service Workers. El `index.html` estable seguirá siendo canónico; las rutas `lab-v*.html` deben devolver su propio documento y jamás una copia cacheada de `index.html`. No obligues a reinstalar la PWA en cada versión.
15. Pruebas automatizadas: sintaxis y errores de consola; smoke tests de todas las pestañas; menús; autenticación; regresión de Disponible e Imprimir; conciliación bancaria y rechazo definitivo; huchas retroactivas; duplicados/resurrecciones; scroll móvil y primera carga. Prueba explícita de **cero elementos flotantes de versión en DOM y CSS**. Reporta resultados reales y fallos pendientes.
16. Repite exactamente las mediciones del paso 3 después de optimizar. Indica reducción de tiempo y bloqueo, y cualquier regresión o compromiso. Como objetivos orientativos (NO resultados supuestos): respuesta del menú perceptiblemente inmediata, reducción importante del tiempo de primera carga, ausencia de tareas largas evitables, scroll fluido y cero pantallas blancas.
17. Publica **directamente desde ChatGPT/Work a GitHub**, en LAB y sin tocar ESTABLE. Comprueba SHA, commit y contenido. Verifica la URL de GitHub Pages con una respuesta que contenga la versión correcta y, si es posible, carga real en Safari/WebKit. Si la herramienta solo verifica GitHub, reconoce esa limitación y NO afirmes que Safari está probado.
18. Entrega al usuario, sin pedirle subir archivos: **enlace directo de LAB en Safari, enlace ESTABLE, ZIP COMPLETO del proyecto, PROMPT MAESTRO actualizado, README, changelog, test de regresiones, mediciones antes/después y plan de reversión**. Indica qué se corrigió, qué quedó pendiente y valoración 0–100 basada en evidencia, no en marketing.

### Límites absolutos de seguridad
- Prioridades en este orden: **integridad financiera > separación de usuarios > persistencia real en nube > cero duplicados/resurrecciones > rendimiento > estética**.
- No tocar fórmula ni datos de Disponible ni Imprimir, confirmados correctos.
- No borrar repositorios, ramas estables, históricos ni registros bancarios. No hacer `force push` ni promocionar LAB sin permiso y pruebas. No introducir credenciales ni tokens en el frontend.
- No finalizar con un plan o informe solamente: **realiza modificaciones y publicación comprobada**. Si existe un bloqueo real, documenta la operación exacta, conserva el estado seguro y entrega resultados parciales comprobables.

**CRITERIO DE CIERRE:** Fluxia abre Bancos y Variables con fluidez, el menú responde siempre, Apple.com/bill deja de generar avisos erróneos, no existe ninguna franja flotante de versión y toda la lógica financiera sigue intacta; se entrega una LAB publicada, verificable y reversible.
