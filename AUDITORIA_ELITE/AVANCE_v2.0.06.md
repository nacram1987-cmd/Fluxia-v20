# Fluxia Élite BETA v2.0.06 · prioridad del HTML para provisiones

15/10/2026. Rama `elite-v2.0.06-hucha-html-source-priority`. Base: v2.0.05, commit `60559be717d1e10560d157f8d2fdbae842929d0c`.

## Cambio aplicado

- Corrige `preferredHuchaUses()`: una copia HTML validada y cargada para el perfil activo prevalece sobre una colección Supabase no vacía.
- Si no hay copia HTML cargada, conserva Supabase como fuente alternativa de solo lectura.
- Una colección HTML explícitamente vacía sigue siendo una fuente existente; la ausencia de fuente continúa siendo distinta de un saldo de cero.
- Esto evita que datos de nube antiguos oculten un rescate recién anotado en el HTML.
- Se mantiene el cotejo de discrepancias por ID y campos. No se importan ni escriben movimientos.
- La operativa crear/editar/aportar/usar/rescatar permanece en el HTML original mientras la persistencia equivalente de Élite no esté certificada.

## Validación ejecutada

- Lógica real extraída de la candidata: HTML reciente frente a nube no vacía, fallback de nube, HTML vacío y ambas fuentes ausentes: **4/4 escenarios superados**.
- JavaScript inline de la página: análisis sintáctico superado.
- Se añadió regresión automatizada `lab/qa/elite-hucha-source-priority-v20006.cjs`.
- Se amplió el test de libro mayor para aceptar el número de versión 2.0.06.
- No se verificó Safari/PWA en iPhone, perfil real, persistencia remota ni publicación de GitHub Pages. No hay certificación de saldos ni de paridad HTML/nube.

## Protección

- Solo rama LAB: `elite-v2.0.06-hucha-html-source-priority`.
- PWA/ESTABLE no modificada.
- Rollback de código: `lab/versions/fluxia-elite-safari-v2.0.05.html`.
- La rama candidata aún no está publicada por Pages; no se anuncia como una URL de prueba operativa.
