# Fluxia Élite BETA v2.0.00 · avance y límites (15/10/2026)

## Base y protección

- Rama `pages-v9731-real-final`; punto de retorno previo `fed93e5ef7656da293be60e26e6e3bbf2c7ecfe1` (v1.9.99). Copia inmutable de entrega en `lab/versions/fluxia-elite-safari-v2.0.00.html`.
- `index.html`, Service Worker y manifiesto de la estable sin cambios. La referencia histórica v97.66 mantiene sus seis ficheros verificados.

## Cambios ejecutables

- La tarjeta de una hucha HTML utiliza sus usos HTML y la de una hucha Supabase sus usos Supabase. La procedencia se muestra en la tarjeta y su historial.
- Vínculo por ID original prioritario; nombre exacto normalizado únicamente si identifica una sola hucha y no contradice IDs. Esta asociación se muestra como provisional. Operaciones sin ID quedan visibles y provisionales.
- Conflictos de nombres, IDs repetidos, importes con precisión no expresable en céntimos, aportaciones defectuosas e historiales ocultos afectan la hucha implicada. Huchas ajenas conservan su inspección individual. El total global no se certifica con cualquier anomalía.
- Reposición temporal se coteja contra `reposiciones[]` y `repuesto`, sin sumar el resumen dos veces. El historial presenta uso, origen, estado y reposiciones individuales.
- Mejoras limitadas a lectura y presentación. No hay escritura de movimientos reales, ajuste de saldos, migración SQL ni integración bancaria activa.

## Comprobaciones reproducibles

`node lab/qa/elite-hucha-isolation-v20000.cjs` prueba fuentes, nombres únicos y ambiguos, duplicados, céntimos, retiros, reposiciones, meses y aislamiento por hucha. Se ejecutan también regresiones recientes de Huchas, Auth, bancos y cabecera; el workflow espejo incorpora una puerta de esos casos. `node auditorias/qa-v97.66/verify-baseline.cjs` y `npm test` dentro de `auditorias/qa-v97.66` protegen la base.

Las pruebas sintéticas y de código no sustituyen una comparación de registros con el HTML operativo, pruebas físicas iPhone/Safari, dos cuentas reales de QA, políticas RLS ejecutadas como usuarios distintos ni proveedor bancario en vivo. No se conocen aún los identificadores suficientes para resolver 51/52 variables de octubre y el cargo de 7,50 €; no se crea ni deduplica ninguna fila.

## Trabajo pendiente por prioridad

1. Captura/exportación verificable del mismo usuario, perfil, periodo, zona horaria y corte del HTML operativo; cotejo por ID, fechas, estado, importe y Disponible al céntimo.
2. Completar semántica original de Huchas: anulaciones/archivo, provisiones pagadas, rescates, efectivo, usos de nombre ambiguo y saldos contra HTML. Mantener los casos inciertos bloqueados.
3. Motor contable canónico para Ingresos, Fijos/Variables, Huchas, Compartidos, Financiaciones y Dinero en mano; evitar doble conteo de fijos bancarios y respetar regla de exceso de aportación del Disponible.
4. Validar recuperación, aislamiento de perfiles, RLS y concurrencia con dos cuentas de prueba, copia y rollback antes de cualquier escritura real.
5. Resolver conflictos de bankRef y tombstones; solo activar importación contable tras preflight completo y comparación operativa. Probar banco real con credenciales y permisos adecuados.
6. Medir rendimiento comparativo v97.66/v97.68/Élite en dispositivo equivalente; recorrido visual, Safari/iPhone, PWA y accesibilidad. Mantener identidad visual centrada y pestañas inferiores.

## Comprobación en casa

- Abrir Élite con `?v=2.0.00`; comprobar versión en cabecera, fuente indicada en cada hucha y que una hucha sin conflictos conserve su desglose aunque otra esté incompleta.
- Revisar una hucha con retiro temporal y reposición parcial: historial, pendiente de devolver y etiqueta provisional si el vínculo procede solo del nombre.
- Confirmar que el Disponible sigue sin certificarse y que los bancos no importan asientos nuevos. Compartir una exportación del HTML operativo al mismo corte para conciliar de forma privada, sin publicar datos en GitHub.

## Evaluación provisional /100

Integridad 57; seguridad 47; persistencia 48; paridad 42; banca 31; rendimiento 53; diseño 70; preparación iOS 35; preparación comercial 25. Son estimaciones de cobertura y riesgo, no certificaciones.
