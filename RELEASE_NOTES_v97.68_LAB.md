# Fluxia v97.68-LAB — reducción de trabajo de navegación sin cambios de producto

**Base de partida:** v97.67-LAB, derivada de v97.66 aceptada. La base congelada y la PWA estable **no se modifican**.

## Cambios exactos (3, exclusivamente internos)
1. Se construye la lista de campos que participa en la firma de render en una sola llamada a `Array.from(NodeList, mapFn)`, evitando el array intermedio `Array.from(...).map(...)`. Conserva idénticos valores y orden.
2. Al navegar desde el menú, se evita el scroll de restauración inmediatamente anterior al scroll a la parte superior. Cierre manual del menú: **sin cambios**.
3. Al navegar desde el menú, no se agenda una reanudación diferida de lista de Variables que pertenece a la vista que se acaba de abandonar. En cierre manual, la reanudación sigue operativa.

## Condiciones de seguridad
No se modifica interfaz, estilos, texto, órdenes de navegación, lógica de Disponible, Gastos Variables, ingresos, huchas, conciliación, nube, autenticación, datos financieros o service worker. El módulo de bancos permanece byte a byte igual.

## Pruebas y métricas
- La comparación exacta de parche debe demostrar que solo se han aplicado estas tres transformaciones y las marcas de versión.
- Se ejecuta el test congelado v97.66, validación criptográfica, análisis de todos los scripts JS y regresión v97.68 con 400 movimientos sintéticos, modificación in-place, menú, totales y scroll.
- **Resultados estructurales esperados:** navegación desde menú: 2 scrolls síncronos → 1; tareas idle innecesarias de reanudación tras navegación: 1 → 0; arrays de la firma de elementos de formulario: 2 → 1. En cierre manual no cambia la restauración de scroll.
- **NO se afirma una reducción de milisegundos** sin benchmark repetido en dispositivo real, ni INP/LCP/FPS en iOS; el número de scrolls o arrays no sustituye una medición de tiempo real.
- No certificar como "100% máxima velocidad": esta métrica no existe como porcentaje técnico.

## Despliegue seguro
LAB: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.68.html
ESTABLE: https://nacram1987-cmd.github.io/Fluxia-v20/
BASE congelada: https://nacram1987-cmd.github.io/Fluxia-v20/lab/v97.66.html

No promover a PWA estable sin autorización explícita «con labora» y verificación de rendimiento en condiciones comparables.
