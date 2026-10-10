# Rendimiento v97.59 LAB

## Cambios frente a v97.58

- El panel cambia inmediatamente y su renderizador se ejecuta fuera del callback de animación. El navegador tiene una oportunidad de pintar antes de construir contenidos. La tarea se cancela por menú, nueva pestaña o perfil. No garantiza pintura física ni un INP concreto.
- Variables conserva sus filas si el JSON completo de los movimientos filtrados y el perfil coinciden. Una edición intermedia invalida la reutilización. Las referencias de las acciones se actualizan incluso cuando se conservan nodos. Una lista interrumpida continúa; una lista terminada no se reconstruye.
- Resumen mantiene importes y avisos principales inmediatos. Consejero, informe semanal, badge de reposición y presupuesto detallado se completan en trabajos separados, cancelables por mes/pestaña/perfil. Los controles de gasto rápido y simulación se vinculan inmediatamente.
- La búsqueda de copias históricas de Compartidos se separa de la apertura. No se elimina el rescate ni se cambia su lógica financiera.
- Formateadores reutilizados sin alterar redondeo/texto. Altura de cabecera y textos principales no se escriben de nuevo cuando ya tienen el valor correcto.

## Pruebas

PASS: oportunidad de frame anterior al render; última pestaña; pausa/reanudación por menú; rechazo de otro perfil; teclado; destino inválido; hooks obsoletos; reutilización de filas; continuación de lista interrumpida; reconstrucción por edición/perfil; referencias actuales para acciones; conservación de 1.500 movimientos y totales; 12 secciones de Resumen y siete de Análisis coincidentes; formato numérico equivalente; selector idempotente y cambio de mes correcto.

AST: 13 funciones financieras/de persistencia y cuatro bancarias conservadas. Los 167 scripts compilan. Minificación solo de espacios/comentarios, sin renombrado ni compresión de expresiones.

## CPU, no latencia del iPhone

Comparación secuencial JSDOM, 1.500 movimientos ficticios, tres ejecuciones por rutina:

| Rutina síncrona | v97.58 (ms) | v97.59 (ms) |
|---|---|---|
| renderKPIs | 25 / 23 / 27 | 16 / 14 / 16 |
| renderDashboard | 26 / 23 / 28 | 14 / 15 / 10 |
| renderAll | 41 / 30 / 38 | 18 / 15 / 17 |

Muestra anterior al último ajuste idempotente de textos/altura. La reutilización de 80 filas tardó 0,33 ms en otra prueba y conservó el primer nodo. Son muestras, no garantías. Parte del trabajo de Resumen ahora ocurre después: la tabla mide respuesta síncrona, no coste total ni finalización. Pruebas generales concurrentes no mostraron mejora uniforme: Variables 34 vs 41 ms y Resumen 35 vs 44 ms en entradas concretas. No extrapolar porcentajes al móvil.

HTML: 1.917.769 bytes sin compresión HTTP, ligeramente mayor por las guardas. Esta versión no reduce peso de red ni demuestra mejor arranque frío. Prioriza interacción y reapertura. Persisten CSS heredado y 167 scripts.

## Límites

No validado: INP real, Safari iPhone, PWA instalada, memoria sostenida, dos perfiles autenticados, nube/outbox o entrega bancaria real con app cerrada. Backend y lógica bancaria sin cambios. Estable v97.46 intacta. No promover sin validación real.

ZIP con fuente legible, auditoría, prompt y pruebas. Las muestras históricas con rutas release58/release59 son evidencia del workspace original. Pruebas adaptadas: auditoria/REPRODUCIR_v97.59.md.
