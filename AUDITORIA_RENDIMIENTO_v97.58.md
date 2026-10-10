# Auditoría de rendimiento v97.58 LAB — 10 octubre 2026

## Alcance y método
Comparación con v97.57: arranque, botón de menú, 12 pestañas, cambio rápido entre 5 pestañas, tareas diferidas y panel Análisis. Se ejecutaron pruebas JSDOM con IndexedDB simulado y 1.500 movimientos ficticios, además de Chrome remoto con un fixture separado y almacenamiento aislado. Las pruebas no usan cuentas bancarias reales. Los tiempos JSDOM miden ejecución del entorno de pruebas, no pintura ni latencia táctil de Safari. Los intervalos entre fotogramas de Chrome remoto estuvieron distorsionados por throttling; se descartan como medida de experiencia real.

## Hallazgos y correcciones
| Área | Hallazgo | Cambio v97.58 |
|---|---|---|
| Navegación | Cinco cambios rápidos ejecutaban cinco renderizados, cuatro sobre paneles ya abandonados | Una cola canónica cancelable: solo se renderiza la última pestaña visible |
| Menú | Trabajo pendiente competía con la apertura; transición CSS añadía demora visual | Apertura por pointerdown, fallback accesible por click, sin transición; pausa renderizados pendientes |
| Extensiones de navegación | Seis capas envolvían goToTab con tareas posteriores sin cancelación común | Registro idempotente de hooks, una tarea por turno y descarte por perfil/pestaña |
| Análisis | Resumen, gráfico, consejos e informe se construían en la misma llamada | Resumen primero; seis trabajos separados y cancelables para el resto |
| Accesibilidad | Barridos de todos los paneles y consultas repetidas de etiquetas | Barrido limitado al panel activo, índice de etiquetas reutilizado dentro de cada pasada |
| Fuentes | CSS de Google Fonts podía bloquear el primer dibujo | Carga no bloqueante con fuente de respaldo |
| Avisos secundarios | Lecturas de estilos calculados en comprobaciones periódicas | Comprobación de estado sin forzar estilos calculados |

## Evidencia funcional
Pasaron: cancelación de cuatro paneles abandonados; pausa/reanudación por menú; rechazo de trabajo pendiente tras cambio de perfil; destino inválido conserva la vista; apertura mediante teclado; cancelación de hooks obsoletos; selector de mes conserva sus nodos; cambio de mes reconstruye correctamente; render conserva 1.500 movimientos e importes; edición/gestos/modales pausan tareas secundarias. Siete secciones de Análisis, incluido el SVG, coinciden con la versión anterior tras completar las tareas diferidas. Se cancela el gráfico si se abandona Análisis.

Las comparaciones AST conservan 13 funciones financieras/de persistencia y cuatro rutinas bancarias. Los 167 bloques JavaScript compilan. La minificación solo elimina espacios y comentarios: no altera nombres ni comprime expresiones.

## Tamaño y cuellos de botella pendientes
HTML actual: 1.916.308 bytes sin compresión HTTP frente a 2.322.295 en la base v97.55 (aprox. 17,5 % menos). Este ahorro procede principalmente de la minificación anterior; v97.58 prioriza reducir trabajo durante la interacción. Continúan 167 scripts y CSS heredado: el arranque aún tiene margen y no se afirma velocidad máxima ni ausencia de bloqueos. Variables y Resumen siguen calculando datos al entrar; Compartidos tuvo costes altos en JSDOM que no se reprodujeron de forma equivalente en Chrome. No se debe presentar una mejora uniforme de cada rutina: las muestras fluctúan.

## Sincronización bancaria y protección de datos
Se conservan las optimizaciones bancarias de las LAB previas y el servidor LAB separado. Esta revisión modifica la planificación de interfaz; no acredita menor tiempo de entrega del proveedor. No hay prueba de webhook real, cargos con app cerrada, cuenta autenticada ni flujo completo nube/outbox. No modifica cálculos de Disponible, categorías, deduplicación, borrados ni aislamiento entre perfiles.

## Qué queda por verificar
Safari iPhone y PWA: arranque frío/caliente, primer toque, navegación repetida, listas extensas y memoria. Dos perfiles autenticados: sincronización, cola offline, recuperación y eventos bancarios reales. No se promueve v97.58 a estable sin esa validación. La estable v97.46 permanece intacta.

## Reproducción
En auditoria/ se incluyen los scripts y muestras JSON. Requieren Node, jsdom 26.1, fake-indexeddb 6.2 y terser 5.44 bajo test-runtime/node_modules. Ejecutar desde la raíz del paquete. Las páginas lab/qa son fixtures explícitos: sin sesión ni red bancaria y sin registro del service worker. No sustituyen la app normal.
