# Evaluación honesta · v97.68-LAB

Se interviene solo en dos rutas críticas de UI: firma del renderizado y cierre de menú durante navegación.

| Operación | Antes v97.67 | Candidato v97.68 | Tipo de evidencia |
|---|---:|---:|---|
| Arrays creados por `Array.from(...).map(...)` de inputs | 2 | 1 | Cambio exacto de código |
| Scroll programático al navegar desde menú abierto | 2 | 1 | Inspección + regresión JSDOM |
| Reanudación idle de Variables al navegar desde menú | 1 | 0 | Cambio exacto de código |
| Scroll al cerrar manualmente menú | 1 | 1 | Regresión JSDOM |
| Scripts bancarios modificados | 0 | 0 | Igualdad textual del script |
| Cambios en cálculos financieros | 0 | 0 | Diff exacto + regresión sintética |

Estos conteos no demuestran un factor determinado de mejora de velocidad. Sin prueba en Safari/PWA iPhone con perfiles reales no existen cifras contrastadas de INP/LCP, FPS ni arranque. Faltan pruebas de red bancaria con proveedor real. Solo apto como LAB tras pasar el CI.

Riesgo estimado bajo por el alcance quirúrgico; regresiones imprevistas de eventos, webviews y flujos de datos deben invalidar cualquier promoción.
